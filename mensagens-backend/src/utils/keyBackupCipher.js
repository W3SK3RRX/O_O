import crypto from 'crypto';

const KEY_PREFIX = 'enc:v1:';
const IV_LENGTH = 12;

function getCipherKey() {
  const baseSecret = process.env.KEY_BACKUP_SECRET || process.env.JWT_SECRET;

  if (!baseSecret) {
    throw new Error('KEY_BACKUP_SECRET (ou JWT_SECRET) não configurado para cifrar backups de chave');
  }

  return crypto.createHash('sha256').update(baseSecret).digest();
}

export function encryptKeyBackup(plainText) {
  if (!plainText) {
    return null;
  }

  if (plainText.startsWith(KEY_PREFIX)) {
    return plainText;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', getCipherKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload = Buffer.concat([iv, authTag, encrypted]).toString('base64');
  return `${KEY_PREFIX}${payload}`;
}

export function decryptKeyBackup(cipherText) {
  if (!cipherText) {
    return null;
  }

  if (!cipherText.startsWith(KEY_PREFIX)) {
    return cipherText;
  }

  const payload = Buffer.from(cipherText.slice(KEY_PREFIX.length), 'base64');
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = payload.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', getCipherKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
