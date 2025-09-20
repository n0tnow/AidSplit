import { 
  StacksTestnet, 
  StacksMainnet, 
  StacksDevnet 
} from '@stacks/network';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  listCV,
  tupleCV
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { 
  NETWORK, 
  NETWORK_URLS, 
  CONTRACT_ADDRESS, 
  CONTRACTS,
  APP_CONFIG 
} from './constants';

// Get network instance
export const getNetwork = () => {
  switch (NETWORK) {
    case 'mainnet':
      return new StacksMainnet({ url: NETWORK_URLS.mainnet });
    case 'testnet':
      return new StacksTestnet({ url: NETWORK_URLS.testnet });
    case 'devnet':
      return new StacksDevnet({ url: NETWORK_URLS.devnet });
    default:
      return new StacksTestnet({ url: NETWORK_URLS.testnet });
  }
};

// Contract call wrapper
export const callContract = async ({
  contractName,
  functionName,
  functionArgs = [],
  onFinish,
  onCancel
}: {
  contractName: string;
  functionName: string;
  functionArgs?: any[];
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}) => {
  try {
    await openContractCall({
      network: getNetwork(),
      contractAddress: CONTRACT_ADDRESS,
      contractName,
      functionName,
      functionArgs,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      appDetails: {
        name: APP_CONFIG.name,
        icon: APP_CONFIG.icon,
      },
      onFinish: (data) => {
        console.log('Transaction successful:', data);
        onFinish?.(data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        onCancel?.();
      }
    });
  } catch (error) {
    console.error('Contract call error:', error);
    throw error;
  }
};

// Helper functions for common contract calls

// Campaign Management
export const createCampaign = async (
  name: string,
  description: string,
  categoryType: string,
  tokenAddress: string,
  targetAmount: number,
  duration: number,
  onFinish?: (data: any) => void
) => {
  return callContract({
    contractName: CONTRACTS.CAMPAIGN_MANAGER,
    functionName: 'create-campaign',
    functionArgs: [
      stringAsciiCV(name),
      stringAsciiCV(description),
      stringAsciiCV(categoryType),
      principalCV(tokenAddress),
      uintCV(targetAmount),
      uintCV(duration)
    ],
    onFinish
  });
};

// Donation Functions
export const makeDonation = async (
  campaignId: number,
  amount: number,
  targetOrg?: string,
  onFinish?: (data: any) => void
) => {
  const functionArgs: any[] = [
    uintCV(campaignId),
    uintCV(amount)
  ];

  if (targetOrg) {
    functionArgs.push(principalCV(targetOrg));
  }

  return callContract({
    contractName: CONTRACTS.DONATION_TARGETING,
    functionName: targetOrg ? 'donate-to-specific-org' : 'donate-to-campaign',
    functionArgs,
    onFinish
  });
};

// Fund Claiming
export const claimFunds = async (
  campaignId: number,
  onFinish?: (data: any) => void
) => {
  return callContract({
    contractName: CONTRACTS.DISTRIBUTION_ENGINE,
    functionName: 'claim-funds',
    functionArgs: [uintCV(campaignId)],
    onFinish
  });
};

// Company Registration
export const registerCompany = async (
  companyName: string,
  onFinish?: (data: any) => void
) => {
  return callContract({
    contractName: CONTRACTS.COMPANY_AUTH,
    functionName: 'register-company',
    functionArgs: [stringAsciiCV(companyName)],
    onFinish
  });
};

// Payroll Processing
export const processPayroll = async (
  employees: Array<{ address: string; amount: number; department: string }>,
  onFinish?: (data: any) => void
) => {
  const employeeList = listCV(
    employees.map(emp => 
      tupleCV({
        'recipient': principalCV(emp.address),
        'amount': uintCV(emp.amount),
        'department': stringAsciiCV(emp.department)
      })
    )
  );

  return callContract({
    contractName: CONTRACTS.DISTRIBUTION_ENGINE,
    functionName: 'distribute-bulk',
    functionArgs: [employeeList],
    onFinish
  });
};

// Utility Functions
export const formatStacksAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getExplorerUrl = (txId: string) => {
  const baseUrl = NETWORK === 'mainnet' 
    ? 'https://explorer.stacks.co'
    : 'https://explorer.stacks.co';
  return `${baseUrl}/txid/${txId}?chain=${NETWORK}`;
};

export const getAddressExplorerUrl = (address: string) => {
  const baseUrl = NETWORK === 'mainnet'
    ? 'https://explorer.stacks.co'
    : 'https://explorer.stacks.co';
  return `${baseUrl}/address/${address}?chain=${NETWORK}`;
};
