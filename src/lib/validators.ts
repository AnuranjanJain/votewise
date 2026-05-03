/**
 * @module lib/validators
 * @description Input validation and sanitization for VoteWise API routes.
 * Includes prototype pollution prevention, XSS sanitization, and
 * type-safe validation for all user-facing inputs.
 */

import {
  MAX_CHAT_MESSAGE_LENGTH,
  MAX_CHAT_HISTORY_MESSAGES,
  MAX_CHAT_HISTORY_PARTS,
  MAX_ANALYTICS_BATCH_SIZE,
  MAX_METADATA_KEYS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_SEARCH_QUERY_LENGTH,
  MAX_TTS_TEXT_LENGTH,
  PLACE_SEARCH_RADIUS,
  QUIZ_CONFIG,
  SUPPORTED_TTS_LANGUAGE_CODES,
  VALID_PLACE_TYPES,
  VALID_QUIZ_CATEGORIES,
  VALID_QUIZ_DIFFICULTIES,
  VALID_EVENT_TYPES,
} from './constants';

/** Result of a validation check */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const DISALLOWED_OBJECT_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function hasDisallowedKey(value: Record<string, unknown>): boolean {
  return Object.keys(value).some((key) => DISALLOWED_OBJECT_KEYS.has(key));
}

/**
 * Validates a chat message for length, content, and safety.
 */
export function validateChatMessage(message: unknown): ValidationResult {
  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
    return { valid: false, error: `Message exceeds maximum length of ${MAX_CHAT_MESSAGE_LENGTH} characters` };
  }
  return { valid: true };
}

/**
 * Validates Gemini-compatible chat history before forwarding it to the model.
 */
export function validateChatHistory(history: unknown): ValidationResult {
  if (history === undefined) {
    return { valid: true };
  }
  if (!Array.isArray(history)) {
    return { valid: false, error: 'History must be an array' };
  }
  if (history.length > MAX_CHAT_HISTORY_MESSAGES) {
    return { valid: false, error: `History exceeds ${MAX_CHAT_HISTORY_MESSAGES} messages` };
  }

  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `History item ${i} must be an object` };
    }
    const message = item as Record<string, unknown>;
    if (hasDisallowedKey(message)) {
      return { valid: false, error: `History item ${i} contains disallowed keys` };
    }
    if (message.role !== 'user' && message.role !== 'model') {
      return { valid: false, error: `History item ${i} has an invalid role` };
    }
    if (!Array.isArray(message.parts) || message.parts.length === 0 || message.parts.length > MAX_CHAT_HISTORY_PARTS) {
      return { valid: false, error: `History item ${i} has invalid parts` };
    }
    for (let partIndex = 0; partIndex < message.parts.length; partIndex++) {
      const part = message.parts[partIndex];
      if (!part || typeof part !== 'object') {
        return { valid: false, error: `History item ${i} part ${partIndex} must be an object` };
      }
      const textPart = part as Record<string, unknown>;
      if (hasDisallowedKey(textPart) || typeof textPart.text !== 'string') {
        return { valid: false, error: `History item ${i} part ${partIndex} is invalid` };
      }
      const validation = validateChatMessage(textPart.text);
      if (!validation.valid) {
        return { valid: false, error: `History item ${i} part ${partIndex}: ${validation.error}` };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates an analytics event object.
 */
export function validateAnalyticsEvent(event: unknown): ValidationResult {
  if (!event || typeof event !== 'object') {
    return { valid: false, error: 'Event must be a non-null object' };
  }
  const e = event as Record<string, unknown>;

  // Prototype pollution prevention
  if (hasDisallowedKey(e)) {
    return { valid: false, error: 'Event contains disallowed keys' };
  }
  if (!e.eventType || typeof e.eventType !== 'string') {
    return { valid: false, error: 'Event must have a string eventType' };
  }
  if (!VALID_EVENT_TYPES.includes(e.eventType as typeof VALID_EVENT_TYPES[number])) {
    return { valid: false, error: `Invalid eventType: ${e.eventType}` };
  }
  if (!e.source || typeof e.source !== 'string') {
    return { valid: false, error: 'Event must have a string source' };
  }
  if (e.source.length > 100) {
    return { valid: false, error: 'Event source exceeds 100 characters' };
  }
  if (e.metadata !== undefined) {
    if (typeof e.metadata !== 'object' || e.metadata === null) {
      return { valid: false, error: 'Metadata must be an object' };
    }
    const metadata = e.metadata as Record<string, unknown>;
    if (hasDisallowedKey(metadata)) {
      return { valid: false, error: 'Metadata contains disallowed keys' };
    }
    const keys = Object.keys(metadata);
    if (keys.length > MAX_METADATA_KEYS) {
      return { valid: false, error: `Metadata exceeds ${MAX_METADATA_KEYS} keys` };
    }
  }
  return { valid: true };
}

/**
 * Validates a batch of analytics events.
 */
export function validateAnalyticsBatch(events: unknown): ValidationResult {
  if (!Array.isArray(events)) {
    return { valid: false, error: 'Events must be an array' };
  }
  if (events.length === 0) {
    return { valid: false, error: 'Events array cannot be empty' };
  }
  if (events.length > MAX_ANALYTICS_BATCH_SIZE) {
    return { valid: false, error: `Batch exceeds maximum size of ${MAX_ANALYTICS_BATCH_SIZE} events` };
  }
  for (let i = 0; i < events.length; i++) {
    const result = validateAnalyticsEvent(events[i]);
    if (!result.valid) {
      return { valid: false, error: `Event at index ${i}: ${result.error}` };
    }
  }
  return { valid: true };
}

/**
 * Validates geographic coordinates.
 */
export function validateCoordinates(lat: unknown, lng: unknown): ValidationResult {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, error: 'Latitude and longitude must be numbers' };
  }
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { valid: false, error: 'Coordinates cannot be NaN' };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: `Latitude ${lat} is out of range [-90, 90]` };
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, error: `Longitude ${lng} is out of range [-180, 180]` };
  }
  return { valid: true };
}

/**
 * Validates base64-encoded image data for size limits.
 */
export function validateImageData(imageBase64: unknown): ValidationResult {
  if (typeof imageBase64 !== 'string') {
    return { valid: false, error: 'Image data must be a string' };
  }
  if (imageBase64.length === 0) {
    return { valid: false, error: 'Image data cannot be empty' };
  }
  const estimatedBytes = Math.ceil(imageBase64.length * 0.75);
  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Image exceeds maximum size of ${Math.round(MAX_IMAGE_SIZE_BYTES / 1024 / 1024)}MB` };
  }
  return { valid: true };
}

/**
 * Validates a quiz answer submission.
 */
export function validateQuizAnswer(answer: unknown): ValidationResult {
  if (typeof answer !== 'object' || answer === null) {
    return { valid: false, error: 'Answer must be a non-null object' };
  }
  const a = answer as Record<string, unknown>;

  // Prototype pollution prevention
  if (hasDisallowedKey(a)) {
    return { valid: false, error: 'Answer contains disallowed keys' };
  }
  if (typeof a.questionId !== 'string' || a.questionId.length === 0) {
    return { valid: false, error: 'Answer must have a valid questionId' };
  }
  if (typeof a.selectedOption !== 'number' || a.selectedOption < 0 || a.selectedOption > 3) {
    return { valid: false, error: 'selectedOption must be a number between 0 and 3' };
  }
  return { valid: true };
}

/**
 * Validates quiz generation request filters.
 */
export function validateQuizRequest(
  difficulty: unknown,
  category: unknown,
  count: unknown,
  topic: unknown,
  useAI: unknown
): ValidationResult {
  if (
    difficulty !== undefined &&
    !VALID_QUIZ_DIFFICULTIES.includes(difficulty as typeof VALID_QUIZ_DIFFICULTIES[number])
  ) {
    return { valid: false, error: 'Difficulty is not supported' };
  }
  if (
    category !== undefined &&
    !VALID_QUIZ_CATEGORIES.includes(category as typeof VALID_QUIZ_CATEGORIES[number])
  ) {
    return { valid: false, error: 'Category is not supported' };
  }
  if (
    count !== undefined &&
    (typeof count !== 'number' ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > QUIZ_CONFIG.MAX_QUESTIONS_PER_REQUEST)
  ) {
    return { valid: false, error: `Count must be an integer from 1 to ${QUIZ_CONFIG.MAX_QUESTIONS_PER_REQUEST}` };
  }
  if (useAI !== undefined && typeof useAI !== 'boolean') {
    return { valid: false, error: 'useAI must be a boolean' };
  }
  if (useAI === true) {
    const topicValidation = validateSearchQuery(topic);
    if (!topicValidation.valid) {
      return { valid: false, error: `Topic ${topicValidation.error?.toLowerCase()}` };
    }
  }
  return { valid: true };
}

/**
 * Validates polling-place search inputs.
 */
export function validatePlaceSearch(type: unknown, radius: unknown): ValidationResult {
  if (typeof type !== 'string' || type.trim().length === 0) {
    return { valid: false, error: 'Place type is required' };
  }
  if (!VALID_PLACE_TYPES.includes(type as typeof VALID_PLACE_TYPES[number])) {
    return { valid: false, error: 'Place type is not supported' };
  }
  if (radius !== undefined && (typeof radius !== 'number' || Number.isNaN(radius))) {
    return { valid: false, error: 'Radius must be a number' };
  }
  if (
    typeof radius === 'number' &&
    (radius < PLACE_SEARCH_RADIUS.MIN_METERS || radius > PLACE_SEARCH_RADIUS.MAX_METERS)
  ) {
    return {
      valid: false,
      error: `Radius must be between ${PLACE_SEARCH_RADIUS.MIN_METERS} and ${PLACE_SEARCH_RADIUS.MAX_METERS} meters`,
    };
  }
  return { valid: true };
}

/**
 * Validates text-to-speech request fields.
 */
export function validateTtsRequest(
  text: unknown,
  languageCode: unknown,
  gender: unknown,
  speakingRate: unknown
): ValidationResult {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { valid: false, error: 'Text is required' };
  }
  if (text.length > MAX_TTS_TEXT_LENGTH) {
    return { valid: false, error: `Text exceeds ${MAX_TTS_TEXT_LENGTH} character limit` };
  }
  if (
    languageCode !== undefined &&
    !SUPPORTED_TTS_LANGUAGE_CODES.includes(languageCode as typeof SUPPORTED_TTS_LANGUAGE_CODES[number])
  ) {
    return { valid: false, error: 'Language code is not supported' };
  }
  if (gender !== undefined && gender !== 'NEUTRAL' && gender !== 'MALE' && gender !== 'FEMALE') {
    return { valid: false, error: 'Voice gender is not supported' };
  }
  if (
    speakingRate !== undefined &&
    (typeof speakingRate !== 'number' || Number.isNaN(speakingRate) || speakingRate < 0.25 || speakingRate > 4.0)
  ) {
    return { valid: false, error: 'Speaking rate must be between 0.25 and 4.0' };
  }
  return { valid: true };
}

/**
 * Validates public search query text.
 */
export function validateSearchQuery(query: unknown): ValidationResult {
  if (typeof query !== 'string' || query.trim().length === 0) {
    return { valid: false, error: 'Query is required' };
  }
  if (query.length > MAX_SEARCH_QUERY_LENGTH) {
    return { valid: false, error: `Query exceeds ${MAX_SEARCH_QUERY_LENGTH} characters` };
  }
  return { valid: true };
}

/**
 * Strips potentially dangerous HTML/script content from user input.
 *
 * @param input - Raw user input string
 * @returns Sanitized string with HTML entities escaped
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validates a URL string for safety (no javascript: or data: schemes).
 *
 * @param url - The URL string to validate
 * @returns Validation result indicating if the URL is safe
 */
export function validateUrl(url: unknown): ValidationResult {
  if (typeof url !== 'string') {
    return { valid: false, error: 'URL must be a string' };
  }
  if (url.length === 0) {
    return { valid: false, error: 'URL cannot be empty' };
  }
  if (url.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length of 2048 characters' };
  }
  const lower = url.toLowerCase().trim();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return { valid: false, error: 'URL contains a disallowed scheme' };
  }
  return { valid: true };
}
