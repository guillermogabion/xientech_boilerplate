const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Safely generates the key from the secret.
 * This prevents crashes if the secret is too short or too long.
 */
const getSafeKey = () => {
    const secret = process.env.CRYPTO_SECRET || 'fallback-secret-at-least-32-chars!!';
    // This creates a 32-byte buffer regardless of secret length
    return crypto.createHash('sha256').update(String(secret)).digest();
};

exports.encrypt = (text) => {
    if (!text || typeof text !== 'string') return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, getSafeKey(), iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error("Encryption Error:", error);
        return text;
    }
};

exports.decrypt = (text) => {
    // If it's not a string or doesn't have the IV:Data format, return as is
    if (!text || typeof text !== 'string' || !text.includes(':')) return text;

    try {
        const [ivHex, encryptedText] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, getSafeKey(), iv);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error("Decryption Error (Likely bad key or corrupted data):", error.message);
        return text; // Return original text if decryption fails
    }
};