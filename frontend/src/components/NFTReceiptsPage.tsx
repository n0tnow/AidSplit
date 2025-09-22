import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Award, 
  ExternalLink, 
  Copy, 
  Eye, 
  Search,
  Wallet,
  DollarSign,
  Building,
  CheckCircle,
  X,
  Plus,
  Download,
  Heart
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { createDonationNFT, createPayrollNFT, DonationNFTData, PayrollNFTData } from '../lib/nftService';
import './NFTReceiptsPage.css';
import './NFTReceiptsPage-mint.css';

interface NFTReceiptsPageProps {
  onBack: () => void;
}

interface NFTReceipt {
  id: number;
  tokenId: string;
  campaignId: number;
  campaignName: string;
  type: 'donation' | 'salary' | 'relief-claim' | 'beneficiary-setup';
  amount: number;
  recipient: string;
  issuer: string;
  issuedAt: string;
  txHash: string; // This is the donation/transaction hash (what we want to show in explorer)
  nftMintTxHash?: string; // This is the NFT mint transaction hash (optional)
  imageUrl?: string;
  metadata: {
    category: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    attributes: { trait: string; value: string }[];
  };
  isSoulbound: boolean;
  isOwned: boolean;
}

interface SuccessModal {
  isOpen: boolean;
  title: string;
  message: string;
  txHash?: string;
  nftReceiptId?: number;
}

// Optimized NFT Background Component
const NFTOptimizedBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Reduced to 8 paths for better performance - Enhanced visibility
  const paths = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    d: `M-${200 - i * 15} -${100 + i * 20}C-${200 - i * 15} -${100 + i * 20} -${150 - i * 15} ${120 - i * 15} ${80 - i * 15} ${200 - i * 15}C${300 - i * 15} ${280 - i * 15} ${400 - i * 15} ${450 - i * 15} ${400 - i * 15} ${450 - i * 15}`,
    strokeWidth: 1.2 + i * 0.08,
    opacity: 0.25 + i * 0.08,
    animationDelay: i * 1.5,
  }));

  return (
    <div className="nft-optimized-bg">
      {/* Gradient Background */}
      <div className="gradient-overlay"></div>
      
      {/* Simplified SVG Paths */}
      <svg className="nft-paths-svg" viewBox="0 0 800 600" fill="none">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.6)" />
            <stop offset="50%" stopColor="rgba(16, 185, 129, 0.3)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke="url(#pathGradient)"
            strokeWidth={path.strokeWidth}
            strokeOpacity={path.opacity}
            fill="none"
            filter="url(#glow)"
            className={`nft-animated-path nft-path-${path.id}`}
            style={{
              animationDelay: `${path.animationDelay}s`,
            }}
          />
        ))}
      </svg>
      
      {/* Optimized Floating Elements */}
      <div className="nft-floating-elements">
        <div className="nft-orb nft-orb-1"></div>
        <div className="nft-orb nft-orb-2"></div>
        <div className="nft-particle nft-particle-1">🎨</div>
        <div className="nft-particle nft-particle-2">💎</div>
        <div className="nft-particle nft-particle-3">🎫</div>
      </div>
    </div>
  );
};

const NFTReceiptsPage: React.FC<NFTReceiptsPageProps> = ({ onBack }) => {
  const { isConnected, userSession, userAddress, userRole } = useWallet();
  const [nftReceipts, setNftReceipts] = useState<NFTReceipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<NFTReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'owned' | 'history' | 'mint'>('owned');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'donation' | 'salary' | 'relief-claim'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<NFTReceipt | null>(null);
  const [successModal, setSuccessModal] = useState<SuccessModal>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Load real NFT receipts from localStorage
  useEffect(() => {
    const loadNFTReceipts = () => {
      try {
        // Load NFT receipts created by donation flow
        const storedReceipts = localStorage.getItem('aidsplit-nft-receipts');
        const receipts = storedReceipts ? JSON.parse(storedReceipts) : [];
        
        // Loading NFT receipts...
        
        // Transform receipts to match component interface
        const transformedReceipts: NFTReceipt[] = receipts.map((receipt: any) => ({
          ...receipt,
          isOwned: true // All receipts in localStorage belong to current user
        }));

        setNftReceipts(transformedReceipts);
        setFilteredReceipts(transformedReceipts);
        
        if (transformedReceipts.length > 0) {
          // ✅ Loaded NFT receipts
        } else {
          // No NFT receipts found
        }
      } catch (error) {
        console.error('❌ Error loading NFT receipts:', error);
        setNftReceipts([]);
        setFilteredReceipts([]);
      }
    };

    loadNFTReceipts();

    // Wallet connection is now handled by the global wallet context

    // Listen for storage changes to update receipts in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aidsplit-nft-receipts') {
        // ✅ Reloading updated receipts
        loadNFTReceipts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Filter receipts based on selected filter and search
  useEffect(() => {
    let filtered = nftReceipts;

    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(receipt => receipt.type === selectedFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(receipt =>
        receipt.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.tokenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.metadata.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReceipts(filtered);
  }, [selectedFilter, searchQuery, nftReceipts]);

  // Utility functions
  const getExplorerLink = (txHash: string): string => {
    return `https://explorer.hiro.so/txid/${txHash}?chain=testnet`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadNFT = (receipt: NFTReceipt) => {
    // Create download link for the NFT image
    if (receipt.imageUrl) {
      const link = document.createElement('a');
      link.href = receipt.imageUrl;
      link.download = `${receipt.tokenId}-${receipt.type}-receipt.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openExplorer = (txHash: string) => {
    const explorerUrl = `https://explorer.stacks.co/txid/${txHash}?chain=testnet`;
    window.open(explorerUrl, '_blank');
  };


  const mintNewNFT = async (receiptType: any) => {
    setIsLoading(true);
    
    try {
      console.log('🎯 Creating NFT receipt of type:', receiptType);
      
      // Create realistic test data based on receipt type
      const isDonationType = !['salary', 'bonus', 'pension', 'overtime'].includes(receiptType);
      
      let nftResult;
      
      if (isDonationType) {
        const testDonationData: DonationNFTData = {
          donorAddress: userAddress || 'SP1TEST...DEMO',
          amount: Math.floor(Math.random() * 1000) + 50,
          campaignName: `${receiptType.replace('-', ' ').toUpperCase()} Campaign`,
          targetOrg: "Relief Organization",
          timestamp: new Date().toISOString(),
          txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
          receiptType: receiptType
        };

        nftResult = await createDonationNFT(null, testDonationData, 999);
      } else {
        const testPayrollData: PayrollNFTData = {
          employeeAddress: userAddress || 'SP1TEST...DEMO',
          amount: Math.floor(Math.random() * 3000) + 500,
          period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          department: "Engineering",
          timestamp: new Date().toISOString(),
          txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
          receiptType: receiptType
        };

        nftResult = await createPayrollNFT(null, testPayrollData, 999);
      }
      
      const amount = isDonationType ? Math.floor(Math.random() * 1000) + 50 : Math.floor(Math.random() * 3000) + 500;
      
      const newNFT: NFTReceipt = {
        id: nftResult.nftId,
        tokenId: `NFT-RCP-${String(nftResult.nftId).padStart(3, '0')}`,
        campaignId: 999,
        campaignName: isDonationType ? `${receiptType.replace('-', ' ').toUpperCase()} Campaign` : 
                     new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        type: receiptType,
        amount: amount,
        recipient: userAddress || '',
        issuer: "SP1ADMIN...TEST",
        issuedAt: new Date().toISOString(),
        txHash: nftResult.txHash,
        imageUrl: nftResult.imageUrl,
        metadata: {
          category: isDonationType ? "Donation" : "Payroll",
          rarity: 'common',
          attributes: [
            { trait: "Type", value: receiptType.replace('-', ' ').toUpperCase() },
            { trait: "Amount", value: `${amount} STX` },
            { trait: "Date", value: new Date().toLocaleDateString() }
          ]
        },
        isSoulbound: true,
        isOwned: true
      };

      // Add to local storage
      const existingReceipts = JSON.parse(localStorage.getItem('aidsplit-nft-receipts') || '[]');
      existingReceipts.unshift(newNFT);
      localStorage.setItem('aidsplit-nft-receipts', JSON.stringify(existingReceipts));

      // Update state
      setNftReceipts(prev => [newNFT, ...prev]);
      setFilteredReceipts(prev => [newNFT, ...prev]);
      
      setSuccessModal({
        isOpen: true,
        title: 'NFT Receipt Created!',
        message: `Your ${receiptType.replace('-', ' ')} NFT receipt has been successfully created and minted to your wallet.`,
        nftReceiptId: newNFT.id,
        txHash: newNFT.txHash
      });
      
      console.log('✅ NFT Receipt created successfully');
    } catch (error) {
      console.error('❌ Error creating NFT receipt:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to create NFT receipt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9ca3af';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#9ca3af';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donation': return <Heart size={16} />;
      case 'salary': return <DollarSign size={16} />;
      case 'relief-claim': return <Building size={16} />;
      case 'beneficiary-setup': return <Award size={16} />;
      default: return <Receipt size={16} />;
    }
  };

  if (!isConnected) {
    return (
      <div className="nft-page">
        <NFTOptimizedBackground />
        
        <div className="nft-container">
          <div className="auth-section">
            <div className="auth-card liquid-glass-card">
              <div className="auth-header">
                <Receipt size={64} color="#10b981" />
                <h1>My NFT Receipts</h1>
                <p>Connect your wallet to view your blockchain certificates</p>
              </div>
              
              <div className="auth-features">
                <div className="feature-item">
                  <Award size={24} color="#10b981" />
                  <span>Soulbound Certificates</span>
                </div>
                <div className="feature-item">
                  <Eye size={24} color="#10b981" />
                  <span>View Collection</span>
                </div>
                <div className="feature-item">
                  <ExternalLink size={24} color="#10b981" />
                  <span>Blockchain Verified</span>
                </div>
              </div>
              
              <div className="wallet-info">
                <p>Please connect your wallet using the header button to view your NFT receipts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-page">
      <NFTOptimizedBackground />
      
      <div className="nft-container">
        {/* Header */}
        <div className="nft-header">
          <button className="back-btn liquid-glass-btn" onClick={onBack}>
            ← Back to Home
          </button>
          <div className="header-content">
            <div className="header-info">
              <Receipt size={40} color="#10b981" />
              <div>
                <h1>My NFT Receipts</h1>
                <p>Your personal blockchain certificates</p>
              </div>
            </div>
            <div className="user-info liquid-glass-card">
              <Wallet size={20} />
              <span>{userAddress ? `${userAddress.substring(0, 8)}...${userAddress.slice(-4)}` : 'Not Connected'}</span>
              <span className={`role-badge ${userRole}`}>{userRole}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nft-tabs liquid-glass-container">
          <button 
            className={`tab-btn ${activeTab === 'owned' ? 'active' : ''}`}
            onClick={() => setActiveTab('owned')}
          >
            <Award size={18} />
            My Collection
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Receipt size={18} />
            Transaction History
          </button>
          {userRole === 'admin' && (
            <button 
              className={`tab-btn ${activeTab === 'mint' ? 'active' : ''}`}
              onClick={() => setActiveTab('mint')}
            >
              <Plus size={18} />
              Test Mint
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by campaign name, token ID, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            {[
              { key: 'all', label: 'All Types', icon: <Receipt size={16} /> },
              { key: 'donation', label: 'Donations', icon: <Heart size={16} /> },
              { key: 'salary', label: 'Salary', icon: <DollarSign size={16} /> },
              { key: 'relief-claim', label: 'Relief Claims', icon: <Building size={16} /> }
            ].map((filter) => (
              <button
                key={filter.key}
                className={`filter-btn ${selectedFilter === filter.key ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter.key as any)}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="tab-content">
          {/* My Collection Tab */}
          {activeTab === 'owned' && (
            <div className="owned-section">
              <div className="section-header">
                <h2>My NFT Collection</h2>
                <p>Your personal blockchain certificates and receipts</p>
              </div>
              
              <div className="collection-stats liquid-glass-card">
                <div className="stat-item">
                  <span className="stat-number">{filteredReceipts.filter(r => r.isOwned).length}</span>
                  <span className="stat-label">Total NFTs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{filteredReceipts.filter(r => r.isOwned && r.type === 'donation').length}</span>
                  <span className="stat-label">Donations</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{filteredReceipts.filter(r => r.isOwned && r.type === 'salary').length}</span>
                  <span className="stat-label">Salaries</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{filteredReceipts.filter(r => r.isOwned && r.metadata.rarity === 'legendary').length}</span>
                  <span className="stat-label">Legendary</span>
                </div>
              </div>
              
              <div className="nft-grid">
                {filteredReceipts.filter(r => r.isOwned).map(receipt => (
                  <div key={receipt.id} className="nft-card liquid-glass-card owned">
                    <div 
                      className="nft-image"
                      onClick={() => setSelectedNFT(receipt)}
                    >
                      <img src={receipt.imageUrl} alt={receipt.campaignName} />
                      <div className="owned-indicator">
                        <CheckCircle size={24} />
                      </div>
                      <div className="nft-overlay-info">
                        <div className="tx-info">
                          <span className="tx-id">TX: {receipt.txHash.substring(0, 12)}...</span>
                        </div>
                        <div className="address-info">
                          <span className="recipient">To: {receipt.recipient.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="nft-info">
                      <div className="nft-header-card">
                        <h3>{receipt.tokenId}</h3>
                        <div className="type-badge" style={{ color: getRarityColor(receipt.metadata.rarity) }}>
                          {getTypeIcon(receipt.type)}
                          {receipt.type}
                        </div>
                      </div>
                      
                      <p className="campaign-name">{receipt.campaignName}</p>
                      
                      <div className="nft-stats">
                        <div className="stat-item">
                          <span>Amount</span>
                          <span className="amount">{receipt.amount.toLocaleString()} STX</span>
                        </div>
                        <div className="stat-item">
                          <span>Issued</span>
                          <span>{new Date(receipt.issuedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="nft-actions">
                        <button
                          className="action-btn primary"
                          onClick={() => setSelectedNFT(receipt)}
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button 
                          className="action-btn"
                          onClick={() => downloadNFT(receipt)}
                        >
                          <Download size={16} />
                          Download
                        </button>
                        <button 
                          className="action-btn"
                          onClick={() => openExplorer(receipt.txHash)}
                        >
                          <ExternalLink size={16} />
                          Explorer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredReceipts.filter(r => r.isOwned).length === 0 && (
                  <div className="empty-state liquid-glass-card">
                    <Receipt size={64} color="#666" />
                    <h3>No NFT Receipts Yet</h3>
                    <p>Your NFT receipts will appear here when you make donations or receive payments</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === 'history' && (
            <div className="history-section">
              <div className="section-header">
                <h2>Transaction History</h2>
                <p>All your blockchain transactions and NFT mints</p>
              </div>
              
              <div className="history-table liquid-glass-card">
                <div className="table-header">
                  <span>Date</span>
                  <span>Type</span>
                  <span>Campaign</span>
                  <span>Amount</span>
                  <span>NFT</span>
                  <span>Actions</span>
                </div>
                
                {filteredReceipts.filter(r => r.isOwned).map(receipt => (
                  <div key={receipt.id} className="table-row">
                    <span className="date">{new Date(receipt.issuedAt).toLocaleDateString()}</span>
                    <span className={`type-tag ${receipt.type}`}>
                      {getTypeIcon(receipt.type)}
                      {receipt.type}
                    </span>
                    <span className="campaign">{receipt.campaignName}</span>
                    <span className="amount">{receipt.amount.toLocaleString()} STX</span>
                    <span className="nft-id">{receipt.tokenId}</span>
                    <div className="row-actions">
                      <button
                        className="action-btn mini"
                        onClick={() => window.open(getExplorerLink(receipt.txHash), '_blank')}
                        title="View Donation Transaction on Explorer"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        className="action-btn mini"
                        onClick={() => copyToClipboard(receipt.txHash)}
                        title="Copy Hash"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="action-btn mini primary"
                        onClick={() => setSelectedNFT(receipt)}
                        title="View NFT"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredReceipts.filter(r => r.isOwned).length === 0 && (
                  <div className="empty-history">
                    <Receipt size={32} color="#666" />
                    <span>No transaction history available</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mint NFT Tab (Admin Only) */}
          {activeTab === 'mint' && userRole === 'admin' && (
            <div className="mint-section">
              <div className="section-header">
                <h2>Mint New NFT Receipt</h2>
                <p>Create blockchain certificates for different types of transactions</p>
              </div>
              
              <div className="mint-categories">
                {/* Donation Types */}
                <div className="mint-category">
                  <h3>🎯 Donation Receipts</h3>
                  <div className="mint-buttons-grid">
                    <button
                      className="mint-btn donation-btn"
                      onClick={() => mintNewNFT('donation')}
                      disabled={isLoading}
                    >
                      💝 General Donation
                    </button>
                    <button
                      className="mint-btn emergency-btn"
                      onClick={() => mintNewNFT('emergency-relief')}
                      disabled={isLoading}
                    >
                      🚨 Emergency Relief
                    </button>
                    <button
                      className="mint-btn medical-btn"
                      onClick={() => mintNewNFT('medical-aid')}
                      disabled={isLoading}
                    >
                      🏥 Medical Aid
                    </button>
                    <button
                      className="mint-btn education-btn"
                      onClick={() => mintNewNFT('education-fund')}
                      disabled={isLoading}
                    >
                      🎓 Education Fund
                    </button>
                    <button
                      className="mint-btn disaster-btn"
                      onClick={() => mintNewNFT('disaster-relief')}
                      disabled={isLoading}
                    >
                      🆘 Disaster Relief
                    </button>
                    <button
                      className="mint-btn food-btn"
                      onClick={() => mintNewNFT('food-aid')}
                      disabled={isLoading}
                    >
                      🍽️ Food Aid
                    </button>
                    <button
                      className="mint-btn housing-btn"
                      onClick={() => mintNewNFT('housing-assistance')}
                      disabled={isLoading}
                    >
                      🏠 Housing Assistance
                    </button>
                  </div>
                </div>

                {/* Payroll Types */}
                <div className="mint-category">
                  <h3>💼 Payroll Receipts</h3>
                  <div className="mint-buttons-grid">
                    <button
                      className="mint-btn salary-btn"
                      onClick={() => mintNewNFT('salary')}
                      disabled={isLoading}
                    >
                      💼 Monthly Salary
                    </button>
                    <button
                      className="mint-btn bonus-btn"
                      onClick={() => mintNewNFT('bonus')}
                      disabled={isLoading}
                    >
                      🏆 Performance Bonus
                    </button>
                    <button
                      className="mint-btn pension-btn"
                      onClick={() => mintNewNFT('pension')}
                      disabled={isLoading}
                    >
                      👴 Pension Payment
                    </button>
                    <button
                      className="mint-btn overtime-btn"
                      onClick={() => mintNewNFT('overtime')}
                      disabled={isLoading}
                    >
                      ⏰ Overtime Payment
                    </button>
                  </div>
                </div>
              </div>

              {isLoading && (
                <div className="minting-status">
                  <div className="loading-spinner"></div>
                  <p>Creating NFT receipt and uploading to IPFS...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="modal-overlay" onClick={() => setSelectedNFT(null)}>
          <div className="nft-detail-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>NFT Receipt Details</h2>
              <button className="close-btn" onClick={() => setSelectedNFT(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* NFT Image Section - Top */}
              <div className="nft-detail-image-section" style={{ textAlign: 'center' }}>
                <img 
                  src={selectedNFT.imageUrl} 
                  alt={selectedNFT.campaignName} 
                  style={{ 
                    maxWidth: '400px', 
                    width: '100%', 
                    borderRadius: '16px', 
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgba(16, 185, 129, 0.2)'
                  }}
                />
              </div>

              {/* NFT Info Section - Bottom */}
              <div className="nft-detail-info-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
                <div className="left-info">
                  <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#10b981', textAlign: 'center' }}>
                    {selectedNFT.tokenId}
                  </h3>
                  <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#888', textAlign: 'center' }}>
                    {selectedNFT.campaignName}
                  </p>
                  
                  <div className="detail-section" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.2rem' }}>Receipt Information</h4>
                    <div className="detail-grid" style={{ display: 'grid', gap: '1rem' }}>
                      <div className="detail-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>Type:</span>
                        <span style={{ color: '#fff', textAlign: 'right', textTransform: 'capitalize', fontWeight: '600' }}>
                          {selectedNFT.type.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="detail-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>Amount:</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold', textAlign: 'right', fontSize: '1.1rem' }}>
                          {selectedNFT.amount.toLocaleString()} STX
                        </span>
                      </div>
                      <div className="detail-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>Issued:</span>
                        <span style={{ color: '#fff', textAlign: 'right', fontWeight: '600' }}>
                          {new Date(selectedNFT.issuedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="detail-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>Campaign:</span>
                        <span style={{ color: '#fff', textAlign: 'right', fontWeight: '600' }}>
                          {selectedNFT.campaignName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="right-info">
                  <div className="detail-section" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.2rem' }}>Blockchain Verification</h4>
                    <div className="blockchain-info" style={{ display: 'grid', gap: '1rem' }}>
                      <div className="detail-item" style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: '#10b981' }}>Recipient Address:</span>
                          <button 
                            onClick={() => copyToClipboard(selectedNFT.recipient)}
                            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '0.25rem' }}
                            title="Copy Address"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <div className="address" style={{ 
                          color: '#fff', 
                          fontSize: '0.8rem', 
                          fontFamily: 'monospace', 
                          wordBreak: 'break-all',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          borderRadius: '6px',
                          border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                          {selectedNFT.recipient}
                        </div>
                      </div>
                      
                      <div className="detail-item" style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: '#10b981' }}>Donation Transaction Hash:</span>
                          <button
                            onClick={() => copyToClipboard(selectedNFT.txHash)}
                            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '0.25rem' }}
                            title="Copy Donation TX Hash"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <div className="hash" style={{ 
                          color: '#fff', 
                          fontSize: '0.8rem', 
                          fontFamily: 'monospace', 
                          wordBreak: 'break-all',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          borderRadius: '6px',
                          border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                          {selectedNFT.txHash}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Full Width */}
              <div className="modal-actions" style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center', 
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <button
                  onClick={() => openExplorer(selectedNFT.txHash)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.75rem',
                    padding: '1rem 2rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    minWidth: '140px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <ExternalLink size={18} />
                  View Donation TX
                </button>
                
                {selectedNFT.isOwned && (
                  <button 
                    onClick={() => downloadNFT(selectedNFT)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.75rem',
                      padding: '1rem 2rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      minWidth: '140px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <Download size={18} />
                    Download NFT
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTReceiptsPage;
