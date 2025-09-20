import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

// App configuration
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

// Network configuration (use testnet for development)
const network = process.env.NODE_ENV === 'production' ? new StacksMainnet() : new StacksTestnet();

export const useStacksWallet = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'donor' | 'organization' | null>(null);

  // Check if user is already signed in
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const stxAddress = userData.profile.stxAddress?.mainnet || userData.profile.stxAddress?.testnet;
      
      setIsConnected(true);
      setAddress(stxAddress);
      
      // Mock role assignment based on address
      const roles: ('admin' | 'donor' | 'organization')[] = ['admin', 'donor', 'organization'];
      const mockRole = roles[Math.floor(Math.random() * roles.length)];
      setUserRole(mockRole);
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const authOptions = {
        appDetails: {
          name: 'AidSplit',
          icon: `${window.location.origin}/logo192.png`,
        },
        redirectTo: '/',
        onFinish: (authData: any) => {
          console.log('Wallet connected:', authData);
          
          const userData = userSession.loadUserData();
          const stxAddress = userData.profile.stxAddress?.mainnet || userData.profile.stxAddress?.testnet;
          
          setIsConnected(true);
          setAddress(stxAddress);
          setIsConnecting(false);
          
          // Mock role assignment
          const roles: ('admin' | 'donor' | 'organization')[] = ['admin', 'donor', 'organization'];
          const mockRole = roles[Math.floor(Math.random() * roles.length)];
          setUserRole(mockRole);
          
          console.log(`Assigned role: ${mockRole} to address: ${stxAddress}`);
        },
        onCancel: () => {
          console.log('Wallet connection cancelled');
          setIsConnecting(false);
        },
        userSession,
      };

      await showConnect(authOptions);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setIsConnected(false);
    setAddress('');
    setUserRole(null);
  };

  const getShortAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerLink = (txHash: string) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://explorer.stacks.co/txid' 
      : 'https://explorer.stacks.co/txid?chain=testnet';
    return `${baseUrl}/${txHash}`;
  };

  const getAddressExplorerLink = (address: string) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://explorer.stacks.co/address' 
      : 'https://explorer.stacks.co/address?chain=testnet';
    return `${baseUrl}/${address}`;
  };

  return {
    // Connection state
    isConnected,
    isConnecting,
    address,
    shortAddress: getShortAddress(address),
    userRole,
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    
    // Utilities
    getExplorerLink,
    getAddressExplorerLink,
    network,
    userSession,
  };
};

export default useStacksWallet;
