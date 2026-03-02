// src/utils/crypto.ts
export async function generateClientHash(username: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  // Ensure "BARANGAY_SALT_FIXED" matches your backend OFFLINE_SALT exactly!
  const data = encoder.encode(username + "BARANGAY_SALT_FIXED"); 
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}