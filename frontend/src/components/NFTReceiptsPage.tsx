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
  Share2,
  Heart
} from 'lucide-react';
import './NFTReceiptsPage.css';

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
  txHash: string;
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
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'donor' | 'organization' | null>(null);
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

  // Initialize mock data
  useEffect(() => {
    const mockNFTReceipts: NFTReceipt[] = [
      {
        id: 1,
        tokenId: "NFT-RCP-001",
        campaignId: 1,
        campaignName: "Istanbul Earthquake Relief",
        type: 'donation',
        amount: 500,
        recipient: "SP1DONOR123...ABC",
        issuer: "SP1ADMIN456...XYZ",
        issuedAt: "2024-09-15T10:30:00Z",
        txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        imageUrl: "https://via.placeholder.com/300x300/10b981/ffffff?text=Donation+Receipt",
        metadata: {
          category: "Disaster Relief",
          rarity: 'rare',
          attributes: [
            { trait: "Campaign Type", value: "Earthquake Relief" },
            { trait: "Amount", value: "500 STX" },
            { trait: "Date", value: "September 2024" },
            { trait: "Impact", value: "High" }
          ]
        },
        isSoulbound: true,
        isOwned: true
      },
      {
        id: 2,
        tokenId: "NFT-RCP-002",
        campaignId: 2,
        campaignName: "October 2024 Payroll",
        type: 'salary',
        amount: 1800,
        recipient: "SP1EMP789...DEF",
        issuer: "SP1COMPANY...GHI",
        issuedAt: "2024-10-01T15:45:00Z",
        txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
        imageUrl: "https://via.placeholder.com/300x300/3b82f6/ffffff?text=Salary+Receipt",
        metadata: {
          category: "Payroll",
          rarity: 'common',
          attributes: [
            { trait: "Employee Role", value: "Senior Developer" },
            { trait: "Department", value: "Engineering" },
            { trait: "Amount", value: "1800 STX" },
            { trait: "Month", value: "October 2024" }
          ]
        },
        isSoulbound: true,
        isOwned: true
      },
      {
        id: 3,
        tokenId: "NFT-RCP-003",
        campaignId: 1,
        campaignName: "Forest Fire Relief",
        type: 'relief-claim',
        amount: 2500,
        recipient: "SP1ORG456...JKL",
        issuer: "SP1ADMIN789...MNO",
        issuedAt: "2024-09-20T09:15:00Z",
        txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
        imageUrl: "https://via.placeholder.com/300x300/f59e0b/ffffff?text=Relief+Claim",
        metadata: {
          category: "Organization Claim",
          rarity: 'epic',
          attributes: [
            { trait: "Organization", value: "Turkish Red Crescent" },
            { trait: "Relief Type", value: "Forest Fire" },
            { trait: "Amount", value: "2500 STX" },
            { trait: "Impact Level", value: "Critical" }
          ]
        },
        isSoulbound: true,
        isOwned: false
      },
      {
        id: 4,
        tokenId: "NFT-RCP-004",
        campaignId: 3,
        campaignName: "Reforestation Initiative",
        type: 'donation',
        amount: 750,
        recipient: "SP1DONOR987...PQR",
        issuer: "SP1ADMIN654...STU",
        issuedAt: "2024-09-25T14:20:00Z",
        txHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
        imageUrl: "https://via.placeholder.com/300x300/22c55e/ffffff?text=Green+Donation",
        metadata: {
          category: "Environmental",
          rarity: 'legendary',
          attributes: [
            { trait: "Project", value: "Tree Planting" },
            { trait: "Trees Funded", value: "37" },
            { trait: "Amount", value: "750 STX" },
            { trait: "CO2 Offset", value: "15 tons/year" }
          ]
        },
        isSoulbound: true,
        isOwned: true
      }
    ];

    setNftReceipts(mockNFTReceipts);
    setFilteredReceipts(mockNFTReceipts);

    // Auto-connect wallet for demo
    setTimeout(() => {
      setIsWalletConnected(true);
      setUserAddress('SP1USER123...DEMO');
      setUserRole('donor');
    }, 1000);
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
    return `https://explorer.hiro.so/txid/${txHash}?chain=mainnet`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const connectWallet = async () => {
    setIsLoading(true);
    // Simulate wallet connection
    setTimeout(() => {
      setIsWalletConnected(true);
      setUserAddress('SP1USER123...DEMO');
      setUserRole(['admin', 'donor', 'organization'][Math.floor(Math.random() * 3)] as any);
      setIsLoading(false);
    }, 1500);
  };

  const mintNewNFT = async () => {
    setIsLoading(true);
    // Simulate NFT minting
    setTimeout(() => {
      const newNFT: NFTReceipt = {
        id: nftReceipts.length + 1,
        tokenId: `NFT-RCP-${String(nftReceipts.length + 1).padStart(3, '0')}`,
        campaignId: 999,
        campaignName: "Test Campaign",
        type: 'donation',
        amount: 100,
        recipient: userAddress,
        issuer: "SP1ADMIN...TEST",
        issuedAt: new Date().toISOString(),
        txHash: "0xTEST123...NEW",
        imageUrl: "https://via.placeholder.com/300x300/8b5cf6/ffffff?text=New+NFT",
        metadata: {
          category: "Test",
          rarity: 'common',
          attributes: [
            { trait: "Type", value: "Test Receipt" },
            { trait: "Amount", value: "100 STX" }
          ]
        },
        isSoulbound: true,
        isOwned: true
      };

      setNftReceipts(prev => [newNFT, ...prev]);
      setSuccessModal({
        isOpen: true,
        title: 'NFT Minted Successfully!',
        message: 'Your new NFT receipt has been created and added to your collection.',
        nftReceiptId: newNFT.id,
        txHash: newNFT.txHash
      });
      setIsLoading(false);
    }, 2000);
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

  if (!isWalletConnected) {
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
              
              <button 
                className="connect-wallet-btn"
                onClick={connectWallet}
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : (
                  <>
                    <Wallet size={20} />
                    Connect Wallet
                  </>
                )}
              </button>
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
              <span>{userAddress.substring(0, 8)}...{userAddress.slice(-4)}</span>
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
                    <div className="nft-image">
                      <img src={receipt.imageUrl} alt={receipt.campaignName} />
                      <div className="owned-indicator">
                        <CheckCircle size={24} />
                      </div>
                      <div className="rarity-badge" style={{ backgroundColor: getRarityColor(receipt.metadata.rarity) }}>
                        {receipt.metadata.rarity}
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
                        <button className="action-btn">
                          <Download size={16} />
                          Download
                        </button>
                        <button className="action-btn">
                          <Share2 size={16} />
                          Share
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
                        title="View on Explorer"
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
                <p>Create new blockchain certificates</p>
              </div>
              
              <div className="mint-card glass-card">
                <div className="mint-header">
                  <Plus size={48} color="#10b981" />
                  <h3>Create NFT Receipt</h3>
                  <p>Generate a new soulbound certificate</p>
                </div>
                
                <button
                  className="mint-btn primary-btn"
                  onClick={mintNewNFT}
                  disabled={isLoading}
                >
                  {isLoading ? 'Minting...' : (
                    <>
                      <Plus size={20} />
                      Mint Test NFT
                    </>
                  )}
                </button>
              </div>
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
            
            <div className="modal-content">
              <div className="nft-detail-image">
                <img src={selectedNFT.imageUrl} alt={selectedNFT.campaignName} />
                <div 
                  className={`rarity-indicator ${selectedNFT.metadata.rarity}`}
                  style={{ borderColor: getRarityColor(selectedNFT.metadata.rarity) }}
                >
                  {selectedNFT.metadata.rarity}
                </div>
              </div>
              
              <div className="nft-detail-info">
                <h3>{selectedNFT.tokenId}</h3>
                <p className="campaign-name">{selectedNFT.campaignName}</p>
                
                <div className="detail-section">
                  <h4>Receipt Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Type:</span>
                      <span>{selectedNFT.type}</span>
                    </div>
                    <div className="detail-item">
                      <span>Amount:</span>
                      <span className="amount">{selectedNFT.amount.toLocaleString()} STX</span>
                    </div>
                    <div className="detail-item">
                      <span>Issued:</span>
                      <span>{new Date(selectedNFT.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span>Category:</span>
                      <span>{selectedNFT.metadata.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Attributes</h4>
                  <div className="attributes-grid">
                    {selectedNFT.metadata.attributes.map((attr, index) => (
                      <div key={index} className="attribute-item">
                        <span className="trait">{attr.trait}</span>
                        <span className="value">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Blockchain Details</h4>
                  <div className="blockchain-info">
                    <div className="detail-item">
                      <span>Recipient:</span>
                      <span className="address">{selectedNFT.recipient}</span>
                      <button onClick={() => copyToClipboard(selectedNFT.recipient)}>
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="detail-item">
                      <span>Transaction:</span>
                      <span className="hash">{selectedNFT.txHash.substring(0, 20)}...</span>
                      <button onClick={() => copyToClipboard(selectedNFT.txHash)}>
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => window.open(getExplorerLink(selectedNFT.txHash), '_blank')}
                  >
                    <ExternalLink size={20} />
                    View on Explorer
                  </button>
                  {selectedNFT.isOwned && (
                    <button className="action-btn">
                      <Download size={20} />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="success-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <CheckCircle size={48} color="#10b981" />
              <h2>{successModal.title}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-content">
              <p>{successModal.message}</p>
              
              {successModal.nftReceiptId && (
                <div className="nft-receipt">
                  <h3>NFT Receipt Generated</h3>
                  <div className="nft-card">
                    <div className="nft-preview">🎫</div>
                    <div className="nft-info">
                      <span className="nft-id">NFT #{successModal.nftReceiptId}</span>
                      <span className="nft-desc">Blockchain Receipt</span>
                    </div>
                  </div>
                </div>
              )}
              
              {successModal.txHash && (
                <div className="blockchain-info">
                  <h3>Transaction Details</h3>
                  <div className="tx-info">
                    <span className="tx-label">Transaction Hash:</span>
                    <div className="tx-hash">
                      <span>{successModal.txHash.substring(0, 20)}...</span>
                      <button onClick={() => copyToClipboard(successModal.txHash!)}>
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <a 
                    href={getExplorerLink(successModal.txHash)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="explorer-link"
                  >
                    <ExternalLink size={16} />
                    View on Explorer
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTReceiptsPage;
