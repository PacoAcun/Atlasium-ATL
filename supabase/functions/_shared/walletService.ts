import { ethers } from 'https://esm.sh/ethers@6.13.0';
import { config } from './config.ts';

/**
 * Genera una nueva wallet Ethereum de forma aleatoria
 */
export async function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase || '',
  };
}

/**
 * Encripta una private key usando Web Crypto API (AES-GCM)
 */
export async function encryptPrivateKey(privateKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(privateKey);
  
  // Generar clave de encriptación desde el secret
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(config.encryption.secret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('atlasium-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  // Generar IV aleatorio
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encriptar
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Combinar IV + datos encriptados y convertir a hex
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return Array.from(combined)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Desencripta una private key
 */
export async function decryptPrivateKey(encryptedHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  // Convertir hex a bytes
  const combined = new Uint8Array(
    encryptedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  // Extraer IV y datos
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  // Generar clave de desencriptación
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(config.encryption.secret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('atlasium-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  // Desencriptar
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return decoder.decode(decrypted);
}

/**
 * Financia una wallet con ETH para gas (0.002 ETH)
 */
export async function fundWalletWithGas(toAddress: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider(config.sepolia.rpcUrl);
  const fundingWallet = new ethers.Wallet(config.funding.privateKey, provider);
  
  const tx = await fundingWallet.sendTransaction({
    to: toAddress,
    value: ethers.parseEther('0.002'), // 0.002 ETH para ~100 transacciones
  });
  
  await tx.wait();
  return tx.hash;
}

/**
 * Obtiene el balance de ETH de una wallet
 */
export async function getETHBalance(address: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider(config.sepolia.rpcUrl);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}
