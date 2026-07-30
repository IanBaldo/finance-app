// src/utils/crypto.ts

const HEADER_PREFIX = '# FINANCE_APP_ENCRYPTED_V1\n';
const PBKDF2_ITERATIONS = 100000;

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Checks if raw file text is an encrypted finance app CSV payload.
 */
export function isEncryptedFile(content: string): boolean {
  return content.trimStart().startsWith('# FINANCE_APP_ENCRYPTED_V1');
}

/**
 * Encrypts raw CSV text using a user-provided password with AES-256-GCM.
 */
export async function encryptCsv(csvText: string, password: string): Promise<string> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encoder = new TextEncoder();
  const data = encoder.encode(csvText);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  const envelope = {
    version: 1,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertext)
  };

  return HEADER_PREFIX + JSON.stringify(envelope, null, 2);
}

/**
 * Decrypts encrypted CSV content using the provided password.
 * Throws an error if the password is wrong or file is tampered with.
 */
export async function decryptCsv(encryptedContent: string, password: string): Promise<string> {
  try {
    let cleanContent = encryptedContent.trimStart();
    if (cleanContent.startsWith(HEADER_PREFIX)) {
      cleanContent = cleanContent.slice(HEADER_PREFIX.length).trim();
    }

    const envelope = JSON.parse(cleanContent);
    if (!envelope.salt || !envelope.iv || !envelope.ciphertext) {
      throw new Error('Invalid encrypted file format.');
    }

    const salt = base64ToBuffer(envelope.salt);
    const iv = base64ToBuffer(envelope.iv);
    const ciphertext = base64ToBuffer(envelope.ciphertext);

    const key = await deriveKey(password, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      ciphertext as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err: any) {
    if (err.name === 'OperationError' || err.message?.includes('decrypt')) {
      throw new Error('Incorrect password. Failed to decrypt file.');
    }
    throw new Error(err.message || 'Failed to decrypt CSV file.');
  }
}
