import React from 'react';
import './Header.css';
import { useStacksWallet } from '../hooks/useStacksWallet';

// Lucide React Icons
import { Users, Home, AlertTriangle, Building, CircleDollarSign, Wallet, LogOut, ExternalLink } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { 
    isConnected, 
    isConnecting, 
    shortAddress, 
    userRole, 
    connect, 
    disconnect,
    getAddressExplorerLink,
    address
  } = useStacksWallet();

  const handleWalletAction = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const openExplorer = () => {
    if (address) {
      window.open(getAddressExplorerLink(address), '_blank');
    }
  };

  return (
    <header className="header">
      <div 
        className="header-brand"
        onClick={() => onNavigate('home')}
      >
        <div className="brand-icon-container">
          <Users className="brand-icon" size={28} color="#10b981" />
          <div className="icon-glow"></div>
        </div>
        AidSplit
      </div>
      
      <nav className="header-nav">
        <button
          onClick={() => onNavigate('home')}
          className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
        >
          <Home size={18} style={{ marginRight: '8px' }} />
          Home
        </button>
        <button
          onClick={() => onNavigate('disaster-relief')}
          className={`nav-btn ${currentView === 'disaster-relief' ? 'active' : ''}`}
        >
          <AlertTriangle size={18} style={{ marginRight: '8px' }} />
          Disaster Relief
        </button>
        <button
          onClick={() => onNavigate('payroll-system')}
          className={`nav-btn ${currentView === 'payroll-system' ? 'active' : ''}`}
        >
          <Building size={18} style={{ marginRight: '8px' }} />
          Payroll
        </button>
        <button
          onClick={() => onNavigate('nft-receipts')}
          className={`nav-btn ${currentView === 'nft-receipts' ? 'active' : ''}`}
        >
          <CircleDollarSign size={18} style={{ marginRight: '8px' }} />
          NFT Receipts
        </button>
      </nav>
      
      <div className="wallet-section">
        {isConnected ? (
          <div className="wallet-connected">
            <div className="wallet-info">
              <div className="wallet-address">
                {shortAddress}
                <button 
                  className="explorer-btn"
                  onClick={openExplorer}
                  title="View on Stacks Explorer"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
              {userRole && (
                <div className="user-role">
                  {userRole}
                </div>
              )}
            </div>
            <button 
              className="wallet-disconnect-button"
              onClick={handleWalletAction}
              title="Disconnect Wallet"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            className="wallet-connect-button"
            onClick={handleWalletAction}
            disabled={isConnecting}
          >
            <Wallet size={18} style={{ marginRight: '8px' }} />
            {isConnecting ? 'Connecting...' : 'Connect Leather'}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;