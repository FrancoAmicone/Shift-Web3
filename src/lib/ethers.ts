import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CHAIN_ID } from '@/constants/contract';

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getSigner = async () => {
  const provider = getProvider();
  if (!provider) throw new Error('No wallet found');
  return await provider.getSigner();
};

export const getContract = async (withSigner = false) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }
  
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  } else {
    const provider = getProvider();
    if (!provider) throw new Error('No provider available');
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }
};

export const formatTokenAmount = (amount: bigint, decimals: number = 18): string => {
  return ethers.formatUnits(amount, decimals);
};

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  return ethers.parseUnits(amount, decimals);
};

export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const checkNetwork = async (): Promise<boolean> => {
  const provider = getProvider();
  if (!provider) return false;
  
  try {
    const network = await provider.getNetwork();
    return Number(network.chainId) === SEPOLIA_CHAIN_ID;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

export const waitForTransaction = async (txHash: string) => {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available');
  
  return await provider.waitForTransaction(txHash);
};
