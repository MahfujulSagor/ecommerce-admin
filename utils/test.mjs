import crypto from 'crypto';

// Secret key - can be any string, but will be hashed to 32 bytes for AES-256
const secretKey = 'mysecretkeymysecretkeymysecretkey12'; // Input key

// Hash the key to ensure it's 32 bytes
const key = crypto.createHash('sha256').update(secretKey, 'utf-8').digest();

// Initialization vector (IV) for encryption
const iv = crypto.randomBytes(16); // AES requires 16 bytes IV for AES-256-CBC

// Function to encrypt the text
function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

// Function to decrypt the text
function decrypt(encryptedData, ivHex) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

// Example usage
const text = "67d81d590039c9bedcbd";
console.log("Original text:", text);

// Encrypt the text
const { iv: ivHex, encryptedData } = encrypt(text);
console.log("Encrypted data:", encryptedData);
console.log("IV used:", ivHex);

// Decrypt the data back
const decryptedText = decrypt(encryptedData, ivHex);
console.log("Decrypted text:", decryptedText);

