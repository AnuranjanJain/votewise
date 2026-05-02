// ============================================================
// VoteWise — Input Validators & Sanitizers
// Validation and sanitization for API inputs and user data
// ============================================================

import {
  MAX_CHAT_MESSAGE_LENGTH,
  MAX_ANALYTICS_BATCH_SIZE,
  MAX_METADATA_KEYS,
  MAX_IMAGE_SIZE_BYTES,
  VALID_EVENT_TYPES,
} from './constants';

/** Result of a validation check */
export interface ValidationResult {
  valid: boolean;
  error?: string;
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
 * Validates an analytics event object.
 */
export function validateAnalyticsEvent(event: unknown): ValidationResult {
  if (!event || typeof event !== 'object') {
    return { valid: false, error: 'Event must be a non-null object' };
  }
  const e = event as Record<string, unknown>;
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
    const keys = Object.keys(e.metadata as object);
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
  if (typeof a.questionId !== 'string' || a.questionId.length === 0) {
    return { valid: false, error: 'Answer must have a valid questionId' };
  }
  if (typeof a.selectedOption !== 'number' || a.selectedOption < 0 || a.selectedOption > 3) {
    return { valid: false, error: 'selectedOption must be a number between 0 and 3' };
  }
  return { valid: true };
}

/**
 * Strips potentially dangerous HTML/script content from user input.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
