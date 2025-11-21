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
  const apiKey = config.sepolia.rpcUrl.split('/').pop();
  const url = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [
          walletAddress,
          [config.sepolia.atlTokenAddress]
        ],
      }),
    });

    const data = await response.json();
    const hexBalance = data.result?.tokenBalances?.[0]?.tokenBalance;

    if (!hexBalance) return '0';

    // Convertir hex a decimal (asumiendo 18 decimales)
    // Usamos BigInt para manejar el hex y luego ethers.formatUnits o división manual
    const balanceBigInt = BigInt(hexBalance);
    return ethers.formatUnits(balanceBigInt, 18);
  } catch (error) {
    console.error('Error getting ATL balance via Alchemy:', error);
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

/**
 * Obtiene el historial de transferencias de ATL usando Alchemy API
 */
export async function getATLTransactions(walletAddress: string) {
  const apiKey = config.sepolia.rpcUrl.split('/').pop();
  const url = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;

  const fetchTransfers = async (params: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [params],
      }),
    });
    const data = await response.json();
    return data.result?.transfers || [];
  };

  try {
    const [sent, received] = await Promise.all([
      fetchTransfers({
        fromBlock: "0x0",
        toBlock: "latest",
        fromAddress: walletAddress,
        contractAddresses: [config.sepolia.atlTokenAddress],
        category: ["erc20"],
        withMetadata: true
      }),
      fetchTransfers({
        fromBlock: "0x0",
        toBlock: "latest",
        toAddress: walletAddress,
        contractAddresses: [config.sepolia.atlTokenAddress],
        category: ["erc20"],
        withMetadata: true
      })
    ]);

    // Combinar y ordenar por fecha (más reciente primero)
    const allTransfers = [...sent, ...received].sort((a, b) => {
      return new Date(b.metadata.blockTimestamp).getTime() - new Date(a.metadata.blockTimestamp).getTime();
    });

    return allTransfers;
  } catch (error) {
    console.error('Error fetching Alchemy transactions:', error);
    return [];
  }
}
