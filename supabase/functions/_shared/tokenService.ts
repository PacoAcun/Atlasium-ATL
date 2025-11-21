import { ethers } from 'https://esm.sh/ethers@6.13.0';
import { config } from './config.ts';

// ABI mínimo de ERC-20 para interactuar con el token ATL
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

/**
 * Obtiene el balance de tokens ATL de una dirección
 */
export async function getATLBalance(walletAddress: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(config.sepolia.rpcUrl);
    const contract = new ethers.Contract(
      config.sepolia.atlTokenAddress,
      ERC20_ABI,
      provider
    );
    
    const balance = await contract.balanceOf(walletAddress);
    // Asumiendo 18 decimales (estándar ERC-20)
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting ATL balance:', error);
    return '0';
  }
}

/**
 * Transfiere tokens ATL de una wallet a otra
 */
export async function transferATL(
  fromPrivateKey: string,
  toAddress: string,
  amount: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(config.sepolia.rpcUrl);
  const wallet = new ethers.Wallet(fromPrivateKey, provider);
  const contract = new ethers.Contract(
    config.sepolia.atlTokenAddress,
    ERC20_ABI,
    wallet
  );
  
  // Convertir amount a unidades del token (18 decimales)
  const amountInWei = ethers.parseUnits(amount, 18);
  
  const tx = await contract.transfer(toAddress, amountInWei);
  await tx.wait();
  
  return tx.hash;
}

/**
 * Obtiene información del token ATL
 */
export async function getATLTokenInfo() {
  try {
    const provider = new ethers.JsonRpcProvider(config.sepolia.rpcUrl);
    const contract = new ethers.Contract(
      config.sepolia.atlTokenAddress,
      ERC20_ABI,
      provider
    );
    
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);
    
    return { name, symbol, decimals: Number(decimals) };
  } catch (error) {
    console.error('Error getting token info:', error);
    return { name: 'Atlasium', symbol: 'ATL', decimals: 18 };
  }
}
