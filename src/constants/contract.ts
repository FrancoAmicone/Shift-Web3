import CONTRACT_ABI_JSON from './abi.json';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export const CONTRACT_ABI = CONTRACT_ABI_JSON;

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
