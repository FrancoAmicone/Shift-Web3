import { ethers } from 'ethers';
import { WALL_CONTRACT_ADDRESS, WALL_CONTRACT_ABI, CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { WallMessage, UserStats, DailyReward } from '@/types';
import { getProvider, getSigner } from './ethers';

export const getWallContract = async (withSigner = false) => {
  if (!WALL_CONTRACT_ADDRESS) {
    throw new Error('Wall contract address not configured');
  }
  
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(WALL_CONTRACT_ADDRESS, WALL_CONTRACT_ABI, signer);
  } else {
    const provider = getProvider();
    if (!provider) throw new Error('No provider available');
    return new ethers.Contract(WALL_CONTRACT_ADDRESS, WALL_CONTRACT_ABI, provider);
  }
};

export const getTokenContract = async (withSigner = false) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Token contract address not configured');
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

export const getMessages = async (): Promise<WallMessage[]> => {
  try {
    const contract = await getWallContract();
    const count = await contract.getMessageCount();
    const messages: WallMessage[] = [];
    
    // Get all messages
    for (let i = 0; i < Number(count); i++) {
      const message = await contract.getMessage(i);
      messages.push({
        sender: message.sender,
        content: message.content,
        timestamp: Number(message.timestamp)
      });
    }
    
    // Return in reverse order (newest first)
    return messages.reverse();
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const getPostCost = async (): Promise<string> => {
  try {
    const contract = await getWallContract();
    const cost = await contract.postCost();
    return ethers.formatUnits(cost, 18);
  } catch (error) {
    console.error('Error getting post cost:', error);
    throw error;
  }
};

export const checkAllowance = async (ownerAddress: string): Promise<bigint> => {
  try {
    const tokenContract = await getTokenContract();
    const allowance = await tokenContract.allowance(ownerAddress, WALL_CONTRACT_ADDRESS);
    return allowance;
  } catch (error) {
    console.error('Error checking allowance:', error);
    throw error;
  }
};

export const approveTokens = async (amount: string) => {
  try {
    const tokenContract = await getTokenContract(true);
    const parsedAmount = ethers.parseUnits(amount, 18);
    const tx = await tokenContract.approve(WALL_CONTRACT_ADDRESS, parsedAmount);
    return tx;
  } catch (error) {
    console.error('Error approving tokens:', error);
    throw error;
  }
};

export const postMessage = async (content: string) => {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    
    if (content.length > 280) {
      throw new Error('Message is too long (max 280 characters)');
    }
    
    const contract = await getWallContract(true);
    const tx = await contract.postMessage(content);
    return tx;
  } catch (error) {
    console.error('Error posting message:', error);
    throw error;
  }
};

export const getMessageCount = async (): Promise<number> => {
  try {
    const contract = await getWallContract();
    const count = await contract.getMessageCount();
    return Number(count);
  } catch (error) {
    console.error('Error getting message count:', error);
    return 0;
  }
};

export const getUserStats = async (address: string): Promise<UserStats> => {
  try {
    const contract = await getWallContract();
    const [totalMessages, dailyMessages] = await Promise.all([
      contract.messageCount(address),
      contract.dailyMessageCount(address)
    ]);
    
    return {
      address,
      totalMessages: Number(totalMessages),
      dailyMessages: Number(dailyMessages)
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

export const listenToUserStatsUpdated = (callback: (stats: UserStats) => void) => {
  const handleEvent = (user: string, totalMessages: bigint, dailyMessages: bigint) => {
    callback({
      address: user,
      totalMessages: Number(totalMessages),
      dailyMessages: Number(dailyMessages)
    });
  };

  const setupListener = async () => {
    const contract = await getWallContract();
    contract.on('UserStatsUpdated', handleEvent);
  };

  setupListener();

  return () => {
    const removeListener = async () => {
      const contract = await getWallContract();
      contract.off('UserStatsUpdated', handleEvent);
    };
    removeListener();
  };
};

export const listenToDailyRewards = (callback: (reward: DailyReward) => void) => {
  const handleEvent = (user: string, amount: bigint, position: number) => {
    callback({
      user,
      amount: ethers.formatUnits(amount, 18),
      position
    });
  };

  const setupListener = async () => {
    const contract = await getWallContract();
    contract.on('DailyReward', handleEvent);
  };

  setupListener();

  return () => {
    const removeListener = async () => {
      const contract = await getWallContract();
      contract.off('DailyReward', handleEvent);
    };
    removeListener();
  };
};
