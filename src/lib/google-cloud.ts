/**
 * @module lib/google-cloud
 * @description Google Cloud service integrations for VoteWise.
 * Provides Text-to-Speech, Geocoding, Places, and Translation APIs
 * with LRU caching and deterministic fallbacks for offline mode.
 */

import { LRUCache } from './cache';
import { CACHE_TTL } from './constants';

const geocodeCache = new LRUCache<GeocodingResult>(100, CACHE_TTL.GEOCODE_RESULTS);
const placesCache = new LRUCache<NearbyPlace[]>(50, CACHE_TTL.PLACES_RESULTS);
const ttsCache = new LRUCache<TTSResult>(30, CACHE_TTL.TTS_RESULTS);

export interface TTSOptions {
  text: string;
  languageCode?: string;
  gender?: 'NEUTRAL' | 'MALE' | 'FEMALE';
  encoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
  speakingRate?: number;
}

export interface TTSResult {
  audioContent: string;
  source: 'google-cloud-tts' | 'fallback';
}

/** Synthesizes speech via Google Cloud TTS with caching. */
export async function synthesizeSpeech(options: TTSOptions): Promise<TTSResult> {
  const cacheKey = `tts:${options.text.substring(0, 100)}:${options.languageCode ?? 'en-IN'}:${options.gender ?? 'NEUTRAL'}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
  if (!apiKey || apiKey === 'your-tts-api-key') return generateFallbackTTS(options.text);

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: options.text },
          voice: { languageCode: options.languageCode || 'en-IN', ssmlGender: options.gender || 'NEUTRAL' },
          audioConfig: { audioEncoding: options.encoding || 'MP3', speakingRate: options.speakingRate || 1.0 },
        }),
      }
    );
    if (!response.ok) throw new Error(`TTS API returned ${response.status}`);
    const data = await response.json();
    const result: TTSResult = { audioContent: data.audioContent, source: 'google-cloud-tts' };
    ttsCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('[VoteWise] Cloud TTS unavailable:', error);
    return generateFallbackTTS(options.text);
  }
}

/**
 * Generates a fallback TTS result using Web Speech API metadata.
 * @param text - The text to synthesize
 * @returns A fallback TTS result with base64-encoded payload
 */
function generateFallbackTTS(text: string): TTSResult {
  const fallbackPayload = JSON.stringify({ fallback: true, text: text.substring(0, 200), engine: 'web-speech-api' });
  return { audioContent: Buffer.from(fallbackPayload).toString('base64'), source: 'fallback' };
}

export interface GeocodingResult {
  formattedAddress: string;
  components: { street?: string; area?: string; city?: string; state?: string; country?: string; postalCode?: string; };
  locationType: string;
  source: 'google-geocoding' | 'fallback';
}

/** Reverse geocodes coordinates with caching (4 decimal places ≈ 11m). */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  const cacheKey = `geo:${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your-google-maps-api-key') return getFallbackGeocode(lat, lng);

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
    if (!response.ok) throw new Error(`Geocoding API returned ${response.status}`);
    const data = await response.json();
    if (data.status !== 'OK' || !data.results?.[0]) return getFallbackGeocode(lat, lng);

    const result = data.results[0];
    const components: GeocodingResult['components'] = {};
    for (const component of result.address_components || []) {
      if (component.types.includes('route')) components.street = component.long_name;
      if (component.types.includes('sublocality')) components.area = component.long_name;
      if (component.types.includes('locality')) components.city = component.long_name;
      if (component.types.includes('administrative_area_level_1')) components.state = component.long_name;
      if (component.types.includes('country')) components.country = component.long_name;
      if (component.types.includes('postal_code')) components.postalCode = component.long_name;
    }
    const geocodeResult: GeocodingResult = { formattedAddress: result.formatted_address, components, locationType: result.geometry?.location_type || 'APPROXIMATE', source: 'google-geocoding' };
    geocodeCache.set(cacheKey, geocodeResult);
    return geocodeResult;
  } catch (error) {
    console.warn('[VoteWise] Geocoding unavailable:', error);
    return getFallbackGeocode(lat, lng);
  }
}

/**
 * Returns a fallback geocoding result centered on New Delhi.
 * @param lat - The original latitude
 * @param lng - The original longitude
 * @returns A static geocoding result for demo purposes
 */
function getFallbackGeocode(lat: number, lng: number): GeocodingResult {
  return {
    formattedAddress: `Nirvachan Sadan, Ashoka Road, New Delhi, Delhi 110001 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    components: { street: 'Ashoka Road', area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', country: 'India', postalCode: '110001' },
    locationType: 'APPROXIMATE', source: 'fallback',
  };
}

export interface NearbyPlace {
  name: string;
  type: string;
  distanceMeters: number;
  distanceFormatted: string;
  rating?: number;
  isOpen?: boolean;
  source: 'google-places' | 'fallback';
}

/** Searches nearby places with caching. */
export async function searchNearbyPlaces(lat: number, lng: number, type: string, radius: number = 2000): Promise<NearbyPlace[]> {
  const cacheKey = `places:${lat.toFixed(3)},${lng.toFixed(3)}:${type}:${radius}`;
  const cached = placesCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your-google-maps-api-key') return getFallbackPlaces(type);

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`);
    if (!response.ok) throw new Error(`Places API returned ${response.status}`);
    const data = await response.json();
    if (data.status !== 'OK' || !data.results) return getFallbackPlaces(type);

    const results = data.results.slice(0, 5).map((place: Record<string, unknown>) => {
      const placeLat = (place.geometry as Record<string, Record<string, number>>)?.location?.lat || lat;
      const placeLng = (place.geometry as Record<string, Record<string, number>>)?.location?.lng || lng;
      const distMeters = Math.round(haversineDistance(lat, lng, placeLat, placeLng));
      return {
        name: place.name as string, type, distanceMeters: distMeters,
        distanceFormatted: distMeters < 1000 ? `${distMeters}m` : `${(distMeters / 1000).toFixed(1)}km`,
        rating: place.rating as number | undefined,
        isOpen: (place.opening_hours as Record<string, boolean>)?.open_now,
        source: 'google-places' as const,
      };
    });
    placesCache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.warn('[VoteWise] Places API unavailable:', error);
    return getFallbackPlaces(type);
  }
}

/**
 * Returns fallback nearby places for demo/offline mode.
 * @param type - The requested place type
 * @returns An array of static place results
 */
function getFallbackPlaces(type: string): NearbyPlace[] {
  const fallback: Record<string, NearbyPlace[]> = {
    local_government_office: [
      { name: 'District Election Office', type: 'local_government_office', distanceMeters: 500, distanceFormatted: '500m', rating: 4.0, isOpen: true, source: 'fallback' },
      { name: 'Tehsildar Office', type: 'local_government_office', distanceMeters: 1200, distanceFormatted: '1.2km', rating: 3.8, isOpen: true, source: 'fallback' },
    ],
    post_office: [{ name: 'India Post - GPO', type: 'post_office', distanceMeters: 300, distanceFormatted: '300m', rating: 3.5, isOpen: true, source: 'fallback' }],
    library: [{ name: 'Central Public Library', type: 'library', distanceMeters: 800, distanceFormatted: '800m', rating: 4.2, isOpen: true, source: 'fallback' }],
  };
  return fallback[type] || [{ name: `Nearest ${type}`, type, distanceMeters: 500, distanceFormatted: '500m', isOpen: true, source: 'fallback' }];
}

/** Translates text via Google Cloud Translation API. */
export async function cloudTranslate(text: string, targetLang: string): Promise<{ translatedText: string; source: 'google-translate' | 'fallback' }> {
  const apiKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;
  if (!apiKey || apiKey === 'your-translation-api-key') {
    return { translatedText: `[${targetLang}] ${text}`, source: 'fallback' };
  }
  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target: targetLang, format: 'text' }),
    });
    if (!response.ok) throw new Error(`Translation API returned ${response.status}`);
    const data = await response.json();
    return { translatedText: data.data.translations[0].translatedText, source: 'google-translate' };
  } catch (error) {
    console.warn('[VoteWise] Translation API unavailable:', error);
    return { translatedText: `[${targetLang}] ${text}`, source: 'fallback' };
  }
}

/** Haversine formula for great-circle distance (meters). */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
