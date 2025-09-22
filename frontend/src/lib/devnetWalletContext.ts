import { createContext, useContext } from 'react';

export interface DevnetWallet {
  label: string;
  stxAddress: string;
  btcAddress?: string;
  mnemonic: string;
  index: number;
}

export interface DevnetWalletContextType {
  currentWallet: DevnetWallet | null;
  wallets: DevnetWallet[];
  setCurrentWallet: (wallet: DevnetWallet | null) => void;
}

// Mock devnet wallets for development
export const mockDevnetWallets: DevnetWallet[] = [
  {
    label: 'Wallet 1',
    stxAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    btcAddress: 'bc1q...',
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    index: 0
  },
  {
    label: 'Wallet 2', 
    stxAddress: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
    btcAddress: 'bc1q...',
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon',
    index: 1
  }
];

export const DevnetWalletContext = createContext<DevnetWalletContextType | undefined>(undefined);

export const useDevnetWallet = (): DevnetWalletContextType => {
  const context = useContext(DevnetWalletContext);
  if (context === undefined) {
    // Return mock implementation if context is not available
    return {
      currentWallet: mockDevnetWallets[0],
      wallets: mockDevnetWallets,
      setCurrentWallet: () => {}
    };
  }
  return context;
};
