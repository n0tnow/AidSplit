import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { getNetwork } from './stacks';
import { APP_CONFIG } from './constants';

export interface ContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  network?: any;
  anchorMode?: AnchorMode;
  postConditionMode?: PostConditionMode;
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

export interface DevnetWallet {
  label: string;
  stxAddress: string;
  btcAddress?: string;
  mnemonic: string;
  index: number;
}

// Execute contract call for devnet (direct transaction)
export const executeContractCall = async (
  options: ContractCallOptions,
  wallet: DevnetWallet | null
): Promise<{ txid: string }> => {
  if (!wallet) {
    throw new Error('No wallet provided for devnet transaction');
  }

  // For devnet, we'd need to create and broadcast the transaction directly
  // This is a simplified implementation - in a real devnet environment,
  // you'd need to handle the private key and transaction creation properly
  
  // For now, return a mock transaction ID
  return { txid: `mock-txid-${Date.now()}` };
};

// Open contract call for testnet/mainnet (browser extension)
export const openContractCallTx = async (options: ContractCallOptions): Promise<void> => {
  await openContractCall({
    network: options.network || getNetwork(),
    contractAddress: options.contractAddress,
    contractName: options.contractName,
    functionName: options.functionName,
    functionArgs: options.functionArgs,
    anchorMode: options.anchorMode || AnchorMode.Any,
    postConditionMode: options.postConditionMode || PostConditionMode.Allow,
    appDetails: {
      name: APP_CONFIG.name,
      icon: APP_CONFIG.icon,
    },
    onFinish: options.onFinish || (() => {}),
    onCancel: options.onCancel || (() => {})
  });
};
