import { getContract, formatTokenAmount, parseTokenAmount } from './ethers';
import { TokenBalance, ClaimStatus } from '@/types';

export const getTokenBalance = async (address: string): Promise<TokenBalance> => {
  try {
    const contract = await getContract();
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    
    return {
      balance: balance.toString(),
      formatted: formatTokenAmount(balance, decimals)
    };
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
};

export const getClaimStatus = async (address: string): Promise<ClaimStatus> => {
  try {
    const contract = await getContract();
    
    const [lastClaimed, claimInterval, faucetAmount] = await Promise.all([
      contract.lastClaimed(address),
      contract.CLAIM_INTERVAL(),
      contract.FAUCET_AMOUNT()
    ]);
    
    const now = Math.floor(Date.now() / 1000);
    const nextClaimTime = Number(lastClaimed) + Number(claimInterval);
    const canClaim = now >= nextClaimTime;
    const timeUntilNextClaim = canClaim ? 0 : nextClaimTime - now;
    
    const decimals = await contract.decimals();
    
    return {
      canClaim,
      timeUntilNextClaim,
      lastClaimed: Number(lastClaimed),
      claimInterval: Number(claimInterval),
      faucetAmount: formatTokenAmount(faucetAmount, decimals)
    };
  } catch (error) {
    console.error('Error getting claim status:', error);
    throw error;
  }
};

export const claimTokens = async () => {
  try {
    const contract = await getContract(true);
    const tx = await contract.claim();
    return tx;
  } catch (error) {
    console.error('Error claiming tokens:', error);
    throw error;
  }
};

export const transferTokens = async (to: string, amount: string) => {
  try {
    const contract = await getContract(true);
    const decimals = await contract.decimals();
    const parsedAmount = parseTokenAmount(amount, decimals);
    
    const tx = await contract.transfer(to, parsedAmount);
    return tx;
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
};

export const getTokenInfo = async () => {
  try {
    const contract = await getContract();
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);
    
    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: formatTokenAmount(totalSupply, decimals)
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    throw error;
  }
};
