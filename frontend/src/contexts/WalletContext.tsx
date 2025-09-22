import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showConnect, UserSession, FinishedAuthData } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { APP_CONFIG, NETWORK } from '../lib/constants';

interface WalletContextType {
  isConnected: boolean;
  userSession: UserSession | null;
  userAddress: string | null;
  userRole: 'admin' | 'organization' | 'donor' | null;
  connectedOrgName: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'organization' | 'donor' | null>(null);
  const [connectedOrgName, setConnectedOrgName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize wallet connection on app start
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        // Check if user was previously connected
        const storedSession = localStorage.getItem('stacks-session');
        const storedAddress = localStorage.getItem('stacks-address');
        const storedRole = localStorage.getItem('stacks-role');
        const storedOrgName = localStorage.getItem('stacks-org-name');
        
        if (storedSession && storedAddress) {
          try {
            const session = JSON.parse(storedSession);
            if (session) {
              setUserSession(session);
              setUserAddress(storedAddress);
              setIsConnected(true);
              
              // Restore user role and org name
              if (storedRole) {
                setUserRole(storedRole as 'admin' | 'organization' | 'donor');
              }
              if (storedOrgName) {
                setConnectedOrgName(storedOrgName);
              }
              
              console.log('Wallet session restored from localStorage');
            }
          } catch (parseError) {
            console.error('Error parsing stored session:', parseError);
            // Clear invalid session
            localStorage.removeItem('stacks-session');
            localStorage.removeItem('stacks-address');
            localStorage.removeItem('stacks-role');
            localStorage.removeItem('stacks-org-name');
          }
        }
      } catch (error) {
        console.error('Error initializing wallet:', error);
      }
    };

    initializeWallet();
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const network = NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
      
      await showConnect({
        appDetails: {
          name: APP_CONFIG.name,
          icon: APP_CONFIG.icon,
        },
        redirectTo: '/',
        onFinish: (payload: FinishedAuthData) => {
          const userSession = payload.userSession;
          setUserSession(userSession);
          
          // Get user address safely
          let userAddress = '';
          try {
            if (userSession && typeof userSession.loadUserData === 'function') {
              const userData = userSession.loadUserData();
              userAddress = userData?.profile?.stxAddress?.testnet || '';
            }
            
            console.log('User address extracted:', userAddress);
            setUserAddress(userAddress);
          } catch (error) {
            console.error('Error loading user data:', error);
            console.log('UserSession object:', userSession);
            setUserAddress('');
          }
          
          setIsConnected(true);
          
          // Store session in localStorage
          localStorage.setItem('stacks-session', JSON.stringify(userSession));
          
          // Determine user role based on wallet address
          let mockRole: 'admin' | 'organization' | 'donor' = 'donor';
          let orgName: string | null = null;
          
          if (userAddress === 'STBMFWFXC4VKC5PEZDXPR0JAKEJ5WCH3KA0D1EP4') {
            mockRole = 'admin';
          } else if (userAddress === 'STAQM5WJ0C3G7KF4X9KXWDPVFTKW5QT343RT65Q6') {
            mockRole = 'organization';
            orgName = 'Türk Kızılayı';
          } else if (userAddress === 'ST2GPC0BJ2PC9SMTPW9AYY41827MT7M0BDXH4QFTY') {
            mockRole = 'organization';
            orgName = 'AFAD - Afet ve Acil Durum Yönetimi';
          } else if (userAddress === 'ST3BTJAD6DX3Z1YP74HB1NZJ7XM6C3DPD86694FGS') {
            mockRole = 'donor';
          }
          
          setUserRole(mockRole);
          setConnectedOrgName(orgName);
          
          // Store additional data in localStorage for persistence
          localStorage.setItem('stacks-address', userAddress);
          localStorage.setItem('stacks-role', mockRole);
          if (orgName) {
            localStorage.setItem('stacks-org-name', orgName);
          }
          
          console.log('Wallet connected successfully!');
        },
        userSession: undefined,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // Don't show alert on first attempt - let user try again
      if (error instanceof Error && error.message.includes('User rejected')) {
        console.log('User rejected wallet connection');
      } else {
        console.log('Wallet connection error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setUserSession(null);
    setUserAddress(null);
    setUserRole(null);
    setConnectedOrgName(null);
    setIsConnected(false);
    
    // Clear all stored data
    localStorage.removeItem('stacks-session');
    localStorage.removeItem('stacks-address');
    localStorage.removeItem('stacks-role');
    localStorage.removeItem('stacks-org-name');
    
    console.log('Wallet disconnected');
  };

  const value: WalletContextType = {
    isConnected,
    userSession,
    userAddress,
    userRole,
    connectedOrgName,
    connectWallet,
    disconnectWallet,
    isLoading,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
