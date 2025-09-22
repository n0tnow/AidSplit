// Stacks Network Configuration
export const NETWORK = process.env.REACT_APP_NETWORK as 'mainnet' | 'testnet' | 'devnet' || 'testnet';

// Contract Addresses (V4 deployed to testnet)
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || 'STBMFWFXC4VKC5PEZDXPR0JAKEJ5WCH3KA0D1EP4';

// Hiro API Configuration
export const HIRO_API_KEY = process.env.REACT_APP_HIRO_API_KEY || '244d7e507bbde1cf678961481f30a092';

export const CONTRACTS = {
  ACCESS_CONTROL: 'access-control-v6',
  CAMPAIGN_MANAGER: 'campaign-manager-v6',
  COMPANY_AUTH: 'company-auth-v6',
  DISTRIBUTION_ENGINE: 'distribution-engine-v6',
  DONATION_TARGETING: 'donation-targeting-v6',
  HIERARCHY_CALCULATOR: 'hierarchy-calculator-v6',
  NFT_GENERATOR: 'nft-generator-v6',
  NFT_RECEIPTS: 'nft-receipts-v6',
  FUNDRAISING_CAMPAIGN: 'fundraising-campaign-v1'
};

// Network URLs - Using Hiro API
export const NETWORK_URLS = {
  testnet: `https://api.testnet.hiro.so`,
  mainnet: `https://api.hiro.so`,
  devnet: 'http://localhost:3999'
};

// Explorer URLs
export const EXPLORER_URLS = {
  testnet: 'https://explorer.hiro.so',
  mainnet: 'https://explorer.hiro.so',
  devnet: 'http://localhost:8000'
};

// App Configuration
export const APP_CONFIG = {
  name: 'AidSplit',
  url: process.env.REACT_APP_URL || 'https://aidsplit.vercel.app',
  icon: '/logo192.png'
};
