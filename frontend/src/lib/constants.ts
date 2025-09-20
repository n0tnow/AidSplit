// Stacks Network Configuration
export const NETWORK = 'testnet'; // 'mainnet' | 'testnet' | 'devnet'

// Contract Addresses (will be updated after deployment)
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

export const CONTRACTS = {
  ACCESS_CONTROL: 'access-control',
  CAMPAIGN_MANAGER: 'campaign-manager', 
  COMPANY_AUTH: 'company-auth',
  DISTRIBUTION_ENGINE: 'distribution-engine',
  DONATION_TARGETING: 'donation-targeting',
  HIERARCHY_CALCULATOR: 'hierarchy-calculator',
  NFT_GENERATOR: 'nft-generator',
  NFT_RECEIPTS: 'nft-receipts'
};

// Network URLs
export const NETWORK_URLS = {
  testnet: 'https://stacks-node-api.testnet.stacks.co',
  mainnet: 'https://stacks-node-api.mainnet.stacks.co',
  devnet: 'http://localhost:3999'
};

// Explorer URLs
export const EXPLORER_URLS = {
  testnet: 'https://explorer.stacks.co',
  mainnet: 'https://explorer.stacks.co', 
  devnet: 'http://localhost:8000'
};

// App Configuration
export const APP_CONFIG = {
  name: 'AidSplit',
  url: process.env.REACT_APP_URL || 'https://aidsplit.vercel.app',
  icon: '/logo192.png'
};
