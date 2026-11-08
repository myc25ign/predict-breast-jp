const STORAGE_KEY = 'predict-breast-auth-v1';

/** SHA-256(trn07) */
const PASSWORD_HASH =
  '767d2655e5fc899d630984f5ed17ce9b88489ce15d4af7812215670253396676';

const SESSION_MARKER = 'eb6d8e4f2c1a9b3d7f0e5c8a4d2b6f1e';

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === SESSION_MARKER;
  } catch {
    return false;
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await sha256(password.trim());
  if (hash !== PASSWORD_HASH) return false;
  sessionStorage.setItem(STORAGE_KEY, SESSION_MARKER);
  return true;
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
