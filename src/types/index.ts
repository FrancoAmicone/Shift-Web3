export interface WalletState {
  account: string;
  isConnected: boolean;
  chainId: number | null;
}

export interface TokenBalance {
  balance: string;
  formatted: string;
}

export interface ClaimStatus {
  canClaim: boolean;
  timeUntilNextClaim: number;
  lastClaimed: number;
  claimInterval: number;
  faucetAmount: string;
}

export interface TransferFormData {
  to: string;
  amount: string;
}

export interface TransactionStatus {
  txHash?: string;
  status: 'idle' | 'pending' | 'mining' | 'success' | 'error';
  message?: string;
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
