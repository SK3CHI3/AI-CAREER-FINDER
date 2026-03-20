import Cookies from 'js-cookie';

/**
 * Generates a stable fingerprint/hash of the user's current context
 * This is used to invalidate caches if the student's profile, grades, or interests change.
 */
export function generateContextHash(userId: string, profile: any, grades: any[]): string {
  const context = {
    userId,
    schoolLevel: profile?.school_level || '',
    grade: profile?.current_grade || '',
    interests: (profile?.career_interests || []).sort().join(','),
    goals: profile?.career_goals || '',
    // Use a simplified version of grades to ensure stability
    gradeSummary: (grades || [])
      .map(g => `${g.subject_name}:${g.grade_value}`)
      .sort()
      .join('|')
  };

  // Convert to a stable JSON string and Base64 it for a clean 'hash'
  try {
    const json = JSON.stringify(context);
    return btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    console.warn('Hash generation failed, falling back to timestamp', e);
    return Date.now().toString();
  }
}

const CACHE_COOKIE_PREFIX = 'ai_cache_fingerprint_';

export function getCacheFingerprint(userId: string): string | undefined {
  return Cookies.get(`${CACHE_COOKIE_PREFIX}${userId}`);
}

export function setCacheFingerprint(userId: string, hash: string): void {
  // Set cookie for 7 days
  Cookies.set(`${CACHE_COOKIE_PREFIX}${userId}`, hash, { expires: 7, sameSite: 'strict' });
}

export function clearCacheFingerprint(userId: string): void {
  Cookies.remove(`${CACHE_COOKIE_PREFIX}${userId}`);
}

/**
 * LocalStorage Helpers for L1 Cache
 */
const L1_CACHE_KEY = 'ai_local_cache_';

export function saveToL1(userId: string, type: string, data: any): void {
  try {
    const key = `${L1_CACHE_KEY}${userId}_${type}`;
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to save to L1 cache', e);
  }
}

export function getFromL1(userId: string, type: string): any | null {
  try {
    const key = `${L1_CACHE_KEY}${userId}_${type}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw);
    return parsed.data;
  } catch (e) {
    return null;
  }
}

export function clearL1(userId: string): void {
  const prefix = `${L1_CACHE_KEY}${userId}_`;
  Object.keys(localStorage)
    .filter(key => key.startsWith(prefix))
    .forEach(key => localStorage.removeItem(key));
}

/**
 * Session Metadata Cookies (Light Stuff)
 * Used to populate UI immediately on page load before Auth/DB sync.
 */
const SESSION_METADATA_KEY = 'cg_session_meta';

export interface SessionMetadata {
  name?: string;
  level?: string;
  score?: number;
  lastVisit?: string;
}

export function setSessionMetadata(meta: SessionMetadata): void {
  // Store for 30 days
  Cookies.set(SESSION_METADATA_KEY, JSON.stringify(meta), { expires: 30, SameSite: 'Strict' });
}

export function getSessionMetadata(): SessionMetadata | null {
  try {
    const raw = Cookies.get(SESSION_METADATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearSessionMetadata(): void {
  Cookies.remove(SESSION_METADATA_KEY);
}

/**
 * Cookie Consent (Funny Policy)
 */
const COOKIE_CONSENT_KEY = 'cg_cookie_consent';

export function setCookieConsent(accepted: boolean): void {
  Cookies.set(COOKIE_CONSENT_KEY, accepted ? 'true' : 'false', { expires: 365, SameSite: 'Strict' });
}

export function getCookieConsent(): boolean | null {
  const val = Cookies.get(COOKIE_CONSENT_KEY);
  if (val === 'true') return true;
  if (val === 'false') return false;
  return null;
}


