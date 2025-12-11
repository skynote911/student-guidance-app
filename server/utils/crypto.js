import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts text using AES-256-CBC
 * @param {string} text - Plain text to encrypt
 * @param {string} encryptionKey - Hex string of encryption key (32 bytes)
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
export function encrypt(text, encryptionKey) {
    if (!text) return null;

    const key = Buffer.from(encryptionKey, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV and encrypted data separated by colon
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts text encrypted with AES-256-CBC
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @param {string} encryptionKey - Hex string of encryption key (32 bytes)
 * @returns {string} - Decrypted plain text
 */
export function decrypt(encryptedText, encryptionKey) {
    if (!encryptedText) return null;

    const key = Buffer.from(encryptionKey, 'hex');
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Generates a random encryption key
 * @returns {string} - 32-byte hex string
 */
export function generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
}
