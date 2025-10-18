import CONTRACT_ABI_JSON from './abi.json';
import WALL_ABI_JSON from './wall-abi.json';

// ShiftERC20 Token Contract
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xa9283EDBf026689A5f5B6DF4c318E7b1934f5655';
export const CONTRACT_ABI = CONTRACT_ABI_JSON;

// ShiftWall Contract
export const WALL_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WALL_CONTRACT_ADDRESS || '0xcb2D4C1912a160A4097D9C4F988C7a8D1233c58c';
export const WALL_CONTRACT_ABI = WALL_ABI_JSON;

// Network Configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

// Estas constantes se obtienen del contrato dinámicamente
// export const CLAIM_AMOUNT = '100'; // Se obtiene de FAUCET_AMOUNT()
// export const CLAIM_COOLDOWN = 24 * 60 * 60; // Se obtiene de CLAIM_INTERVAL()
