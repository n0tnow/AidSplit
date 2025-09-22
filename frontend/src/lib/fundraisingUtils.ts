import {
  makeContractCall,
  uintCV,
  principalCV,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { getNetwork } from './stacks';
import { CONTRACT_ADDRESS, CONTRACTS, NETWORK } from './constants';

export interface ContractCallOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  network: any;
  anchorMode: AnchorMode;
  postConditionMode: PostConditionMode;
}

// Get network string for contract calls
export const getStacksNetworkString = (): string => {
  return NETWORK;
};

// Check if we're in devnet environment
export const isDevnetEnvironment = (): boolean => {
  return NETWORK === 'devnet';
};

// Check if we're in testnet environment
export const isTestnetEnvironment = (): boolean => {
  return NETWORK === 'testnet';
};

// Create contract call transaction for STX donation
export const getContributeStxTx = (
  network: string,
  options: { address: string; amount: number }
): ContractCallOptions => {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.FUNDRAISING_CAMPAIGN,
    functionName: 'donate-stx',
    functionArgs: [uintCV(options.amount)],
    network: getNetwork(),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow
  };
};

// Create contract call transaction for sBTC donation
export const getContributeSbtcTx = (
  network: string,
  options: { address: string; amount: number }
): ContractCallOptions => {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.FUNDRAISING_CAMPAIGN,
    functionName: 'donate-sbtc',
    functionArgs: [uintCV(options.amount)],
    network: getNetwork(),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow
  };
};

// Initialize campaign transaction options
export const getInitializeCampaignTx = (
  goal: number,
  duration: number = 0
) => {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.FUNDRAISING_CAMPAIGN,
    functionName: 'initialize-campaign',
    functionArgs: [uintCV(goal), uintCV(duration)],
    network: getNetwork(),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow
  };
};