import React, { useState, useEffect } from 'react';
import { AlertTriangle, CircleDollarSign, Calendar, MapPin, TrendingUp, Heart, Wallet, Flame, Droplets, TreePine, Leaf, ExternalLink, Copy, CheckCircle, X, ChevronDown, Building } from 'lucide-react';
import './DisasterReliefPage.css';

interface DisasterReliefPageProps {
  onBack: () => void;
}

interface Campaign {
  id: number;
  name: string;
  description: string;
  type: 'earthquake' | 'fire' | 'flood' | 'reforestation' | 'environmental';
  targetAmount: number;
  currentAmount: number;
  endDate: string;
  location: string;
  beneficiaries: Beneficiary[];
  isActive: boolean;
}

interface Beneficiary {
  id: number;
  name: string;
  address: string;
  percentage: number;
  claimed: number;
  pending: number;
}

interface DonationForm {
  campaignId: number;
  amount: number;
  targetOrgId?: number;
}

interface DonationRecord {
  id: string;
  campaignName: string;
  donorAddress: string;
  amount: number;
  targetOrg?: string;
  timestamp: string;
  txHash: string;
  nftReceiptId?: number;
}

interface SuccessModal {
  isOpen: boolean;
  type: 'donation' | 'claim' | 'campaign';
  txHash: string;
  nftReceiptId?: number;
  amount?: number;
  campaignName?: string;
}

const DisasterReliefPage: React.FC<DisasterReliefPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'create' | 'donate' | 'claim'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationForm, setDonationForm] = useState<DonationForm>({ campaignId: 0, amount: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // User authentication state
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'organization' | 'donor' | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [connectedOrgName, setConnectedOrgName] = useState<string>('');
  
  // New features state
  const [successModal, setSuccessModal] = useState<SuccessModal>({ isOpen: false, type: 'donation', txHash: '' });
  const [recentDonations, setRecentDonations] = useState<DonationRecord[]>([]);

  // Mock data for development - will be replaced with blockchain calls
  useEffect(() => {
    const mockCampaigns: Campaign[] = [
      {
        id: 1,
        name: "Kahramanmaraş Deprem Yardımları",
        description: "6 Şubat depremlerinde zarar gören aileler için acil yardım kampanyası",
        type: 'earthquake',
        targetAmount: 5000000,
        currentAmount: 3200000,
        endDate: "2024-12-31",
        location: "Kahramanmaraş, Hatay, Gaziantep",
        isActive: true,
        beneficiaries: [
          { id: 1, name: "Türk Kızılayı", address: "SP1KIZIL...AY01", percentage: 35, claimed: 1120000, pending: 0 },
          { id: 2, name: "AFAD - Afet ve Acil Durum Yönetimi", address: "SP1AFAD...GOV02", percentage: 30, claimed: 960000, pending: 0 },
          { id: 3, name: "İHH İnsani Yardım Vakfı", address: "SP1IHH...VKF03", percentage: 20, claimed: 640000, pending: 0 },
          { id: 4, name: "AKUT Arama Kurtarma Derneği", address: "SP1AKUT...DER04", percentage: 15, claimed: 480000, pending: 0 }
        ]
      },
      {
        id: 2,
        name: "Antalya Orman Yangını Yardımları",
        description: "Antalya ve Muğla'daki orman yangınlarında zarar görenlere destek",
        type: 'fire',
        targetAmount: 2500000,
        currentAmount: 1800000,
        endDate: "2024-10-31",
        location: "Antalya, Muğla",
        isActive: true,
        beneficiaries: [
          { id: 5, name: "Türk Kızılayı", address: "SP1KIZIL...AY01", percentage: 40, claimed: 720000, pending: 0 },
          { id: 6, name: "Orman ve Su İşleri Bakanlığı", address: "SP1ORMAN...BAK05", percentage: 35, claimed: 630000, pending: 0 },
          { id: 7, name: "TEMA Vakfı", address: "SP1TEMA...VKF06", percentage: 25, claimed: 450000, pending: 0 }
        ]
      },
      {
        id: 3,
        name: "Anadolu Ağaçlandırma Projesi",
        description: "Türkiye genelinde çölleşmeyle mücadele ve ağaçlandırma çalışmaları",
        type: 'reforestation',
        targetAmount: 1500000,
        currentAmount: 950000,
        endDate: "2025-03-15",
        location: "Türkiye Geneli",
        isActive: true,
        beneficiaries: [
          { id: 8, name: "TEMA Vakfı", address: "SP1TEMA...VKF06", percentage: 50, claimed: 475000, pending: 0 },
          { id: 9, name: "WWF-Türkiye", address: "SP1WWF...TUR07", percentage: 30, claimed: 285000, pending: 0 },
          { id: 10, name: "Doğal Hayatı Koruma Vakfı", address: "SP1DHKV...VKF08", percentage: 20, claimed: 190000, pending: 0 }
        ]
      },
      {
        id: 4,
        name: "Marmara Denizi Temizleme Projesi",
        description: "Marmara Denizi'ndeki müsilaj sorunu ve deniz kirliliğine karşı çevre projesi",
        type: 'environmental',
        targetAmount: 3000000,
        currentAmount: 1250000,
        endDate: "2024-11-30",
        location: "Marmara Denizi",
        isActive: true,
        beneficiaries: [
          { id: 11, name: "ÇEVKO Vakfı", address: "SP1CEVKO...VKF09", percentage: 45, claimed: 562500, pending: 0 },
          { id: 12, name: "Greenpeace Akdeniz", address: "SP1GREEN...MED10", percentage: 35, claimed: 437500, pending: 0 },
          { id: 13, name: "Deniz Temiz Derneği", address: "SP1DNZTZ...DER11", percentage: 20, claimed: 250000, pending: 0 }
        ]
      }
    ];
    setCampaigns(mockCampaigns);
    
    // Mock recent donations data
    const mockDonations: DonationRecord[] = [
      {
        id: '1',
        campaignName: 'Kahramanmaraş Deprem Yardımları',
        donorAddress: 'SP1DONOR...ABC123',
        amount: 50000,
        targetOrg: 'Türk Kızılayı',
        timestamp: '2024-09-19T18:30:00Z',
        txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        nftReceiptId: 1001
      },
      {
        id: '2', 
        campaignName: 'Antalya Orman Yangını Yardımları',
        donorAddress: 'SP1DONOR...XYZ789',
        amount: 75000,
        timestamp: '2024-09-19T17:15:00Z',
        txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
        nftReceiptId: 1002
      },
      {
        id: '3',
        campaignName: 'Marmara Denizi Temizleme Projesi', 
        donorAddress: 'SP1DONOR...DEF456',
        amount: 25000,
        targetOrg: 'ÇEVKO Vakfı',
        timestamp: '2024-09-19T16:45:00Z',
        txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        nftReceiptId: 1003
      }
    ];
    setRecentDonations(mockDonations);
    
    // Mock wallet connection - replace with real Stacks Connect
    const mockConnect = () => {
      setIsWalletConnected(true);
      setUserAddress('SP1EXAMPLE...WALLET123');
      // Mock: Set random role for demo (in real app, this comes from blockchain)
      const mockRole = Math.random() > 0.7 ? 'admin' : Math.random() > 0.5 ? 'organization' : 'donor';
      setUserRole(mockRole);
      
      // Set organization name if user is organization
      if (mockRole === 'organization') {
        const orgNames = ['Türk Kızılayı', 'TEMA Vakfı', 'İHH İnsani Yardım Vakfı', 'AKUT Arama Kurtarma Derneği'];
        setConnectedOrgName(orgNames[Math.floor(Math.random() * orgNames.length)]);
      }
    };
    
    // Auto-connect for demo purposes (remove in production)
    setTimeout(mockConnect, 1000);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.custom-dropdown-container')) {
        setIsDropdownOpen(false);
        setIsOrgDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Wallet Connection Functions
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real Stacks Connect integration
      // const { userSession } = await showConnect({...});
      setIsWalletConnected(true);
      setUserAddress('SP1EXAMPLE...WALLET123');
      alert('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setUserRole(null);
    setUserAddress('');
    alert('Wallet disconnected');
  };

  // Blockchain Integration Functions (will be implemented with @stacks/connect)
  const createCampaign = async (campaignData: any) => {
    setIsLoading(true);
    try {
      // TODO: Integrate with campaign-manager.clar create-campaign function
      console.log('Creating campaign:', campaignData);
      // const result = await contractCall({
      //   contractAddress: CAMPAIGN_MANAGER_ADDRESS,
      //   contractName: 'campaign-manager',
      //   functionName: 'create-campaign',
      //   functionArgs: [
      //     stringAsciiCV(campaignData.name),
      //     stringAsciiCV(campaignData.description),
      //     stringAsciiCV("disaster-relief"),
      //     principalCV(STX_ADDRESS),
      //     uintCV(campaignData.targetAmount),
      //     uintCV(campaignData.duration)
      //   ]
      // });
      alert('Campaign created successfully! (Mock)');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function for blockchain explorer links
  const getExplorerLink = (txHash: string) => {
    return `https://explorer.hiro.so/txid/${txHash}?chain=mainnet`;
  };

  const getStacksAddress = (address: string) => {
    return `https://explorer.hiro.so/address/${address}?chain=mainnet`;
  };

  const makeDonation = async (donation: DonationForm) => {
    setIsLoading(true);
    try {
      // TODO: Integrate with campaign-manager.clar donate-to-disaster-relief function
      console.log('Making donation:', donation);
      
      // Mock successful transaction
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 66).padEnd(64, '0')}`;
      const mockNftReceiptId = Math.floor(Math.random() * 9000) + 1000;
      const selectedCampName = campaigns.find(c => c.id === donation.campaignId)?.name || '';
      
      // Add to recent donations
      const newDonation: DonationRecord = {
        id: Date.now().toString(),
        campaignName: selectedCampName,
        donorAddress: userAddress,
        amount: donation.amount,
        targetOrg: donation.targetOrgId ? campaigns.find(c => c.id === donation.campaignId)?.beneficiaries.find(b => b.id === donation.targetOrgId)?.name : undefined,
        timestamp: new Date().toISOString(),
        txHash: mockTxHash,
        nftReceiptId: mockNftReceiptId
      };
      
      setRecentDonations(prev => [newDonation, ...prev.slice(0, 9)]); // Keep last 10 donations
      
      // Show success modal
      setSuccessModal({
        isOpen: true,
        type: 'donation',
        txHash: mockTxHash,
        nftReceiptId: mockNftReceiptId,
        amount: donation.amount,
        campaignName: selectedCampName
      });
      
      // Reset form
      setDonationForm({ campaignId: 0, amount: 0 });
      
    } catch (error) {
      console.error('Error making donation:', error);
      alert('Failed to make donation');
    } finally {
      setIsLoading(false);
    }
  };

  const claimFunds = async (campaignId: number, amount: number) => {
    setIsLoading(true);
    try {
      // TODO: Integrate with campaign-manager.clar claim-disaster-relief-funds function
      console.log('Claiming funds for campaign:', campaignId);
      
      // Mock successful transaction
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 66).padEnd(64, '0')}`;
      const selectedCampName = campaigns.find(c => c.id === campaignId)?.name || '';
      
      // Show success modal
      setSuccessModal({
        isOpen: true,
        type: 'claim',
        txHash: mockTxHash,
        amount: amount,
        campaignName: selectedCampName
      });
      
    } catch (error) {
      console.error('Error claiming funds:', error);
      alert('Failed to claim funds');
    } finally {
      setIsLoading(false);
    }
  };

  // Stars Background Component
  const StarsBackground: React.FC = () => {
    useEffect(() => {
      const createStars = () => {
        const starsContainer = document.querySelector('.stars-background');
        if (!starsContainer) return;

        // Clear existing stars
        starsContainer.innerHTML = '';

        // Create different types of stars - more stars, all green (representing donors)
        const starCounts = { large: 15, medium: 40, small: 120 };
        
        Object.entries(starCounts).forEach(([size, count]) => {
          for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = `star ${size}`;
            
            // Random position
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // Random animation delay
            star.style.animationDelay = Math.random() * 2 + 's';
            
            starsContainer.appendChild(star);
          }
        });
      };

      createStars();
    }, []);

    return <div className="stars-background"></div>;
  };

  return (
    <div className="disaster-relief-page">
      {/* Stars Background */}
      <StarsBackground />
      
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Home
        </button>
        <div className="header-content">
          <div className="header-main">
            <AlertTriangle className="page-icon" size={48} color="#10b981" />
            <div className="header-text">
              <h1>Disaster Relief Campaigns</h1>
              <p>Transparent emergency aid distribution powered by blockchain</p>
            </div>
          </div>
          
          {/* Wallet Section */}
          {!isWalletConnected ? (
            <div className="wallet-section">
              <button className="connect-wallet-btn" onClick={connectWallet} disabled={isLoading}>
                <Wallet size={20} />
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div className="wallet-section">
              <div className="wallet-connected">
                <div className="wallet-details">
                  <span className="wallet-address">{userAddress}</span>
                  <span className="wallet-role">{userRole?.toUpperCase()}</span>
                </div>
                <button className="disconnect-btn" onClick={disconnectWallet}>
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      {isWalletConnected && (
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            <TrendingUp size={20} />
            Active Campaigns
          </button>
          
          {/* Create Campaign - Only for Admins */}
          {userRole === 'admin' && (
            <button 
              className={`tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <AlertTriangle size={20} />
              Create Campaign
            </button>
          )}
          
          {/* Make Donation - For Donors and Admins */}
          {(userRole === 'donor' || userRole === 'admin') && (
            <button 
              className={`tab ${activeTab === 'donate' ? 'active' : ''}`}
              onClick={() => setActiveTab('donate')}
            >
              <Heart size={20} />
              Make Donation
            </button>
          )}
          
          {/* Claim Funds - Only for Organizations */}
          {userRole === 'organization' && (
            <button 
              className={`tab ${activeTab === 'claim' ? 'active' : ''}`}
              onClick={() => setActiveTab('claim')}
            >
              <CircleDollarSign size={20} />
              Claim Funds
            </button>
          )}
        </div>
      )}

      {/* Content Sections */}
      <div className="page-content">
        {/* Active Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="campaigns-section">
            <h2>Active Emergency Campaigns</h2>
            <div className="campaigns-grid">
              {campaigns.map(campaign => {
                const getCampaignIcon = (type: string) => {
                  switch(type) {
                    case 'earthquake': return <AlertTriangle size={24} color="#10b981" />;
                    case 'fire': return <Flame size={24} color="#ef4444" />;
                    case 'flood': return <Droplets size={24} color="#3b82f6" />;
                    case 'reforestation': return <TreePine size={24} color="#22c55e" />;
                    case 'environmental': return <Leaf size={24} color="#059669" />;
                    default: return <AlertTriangle size={24} color="#10b981" />;
                  }
                };

                const getCampaignTypeText = (type: string) => {
                  switch(type) {
                    case 'earthquake': return 'Deprem Yardımı';
                    case 'fire': return 'Yangın Yardımı';
                    case 'flood': return 'Sel Yardımı';
                    case 'reforestation': return 'Ağaçlandırma';
                    case 'environmental': return 'Çevre Projesi';
                    default: return 'Yardım Kampanyası';
                  }
                };

                return (
                  <div key={campaign.id} className="campaign-card">
                    <div className="campaign-header">
                      <div className="campaign-title">
                        {getCampaignIcon(campaign.type)}
                        <h3>{campaign.name}</h3>
                      </div>
                      <div className="campaign-badges">
                        <span className={`type-badge ${campaign.type}`}>
                          {getCampaignTypeText(campaign.type)}
                        </span>
                        <span className={`status ${campaign.isActive ? 'active' : 'ended'}`}>
                          {campaign.isActive ? 'Aktif' : 'Tamamlandı'}
                        </span>
                      </div>
                    </div>
                  
                  <p className="campaign-description">{campaign.description}</p>
                  
                  <div className="campaign-location">
                    <MapPin size={16} />
                    <span>{campaign.location}</span>
                  </div>
                  
                  <div className="campaign-progress">
                    <div className="progress-info">
                      <span>{campaign.currentAmount.toLocaleString()} STX raised</span>
                      <span>{campaign.targetAmount.toLocaleString()} STX target</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(campaign.currentAmount / campaign.targetAmount) * 100}%` }}
                      />
                    </div>
                    <div className="progress-percentage">
                      %{Math.round((campaign.currentAmount / campaign.targetAmount) * 100)} tamamlandı
                    </div>
                  </div>
                  
                  <div className="campaign-end">
                    <Calendar size={16} />
                    <span>Bitiş: {new Date(campaign.endDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  
                  <button 
                    className="campaign-btn"
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    Detayları Görüntüle
                  </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Campaign Tab */}
        {activeTab === 'create' && userRole === 'admin' && (
          <div className="create-section">
            <h2>Create Emergency Campaign</h2>
            <div className="create-container">
              <div className="create-form-card">
                <div className="create-form">
                  <div className="form-header">
                    <AlertTriangle size={32} color="#10b981" />
                    <h3>New Campaign</h3>
                    <p>Launch secure and transparent aid campaigns on blockchain</p>
                  </div>
                  
                  <div className="form-group">
                    <label>Campaign Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Kahramanmaraş Earthquake Relief 2024"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Campaign Type</label>
                    <select className="form-input">
                      <option value="earthquake">🏚️ Earthquake Relief</option>
                      <option value="fire">🔥 Fire Relief</option>
                      <option value="flood">💧 Flood Relief</option>
                      <option value="reforestation">🌳 Reforestation</option>
                      <option value="environmental">🌿 Environmental Project</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      placeholder="Describe the emergency situation and how funds will be used in detail..."
                      rows={4}
                      className="form-textarea"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Target Amount (STX)</label>
                      <input 
                        type="number" 
                        placeholder="5000000"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Campaign Duration (blocks)</label>
                      <input 
                        type="number" 
                        placeholder="144000"
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Kahramanmaraş, Hatay, Turkey"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="beneficiaries-section">
                    <h3>Beneficiary Organizations</h3>
                    <p className="beneficiaries-desc">Specify organizations that will receive aid funds and their share percentages</p>
                    
                    <div className="beneficiary-list">
                      <div className="beneficiary-item">
                        <div className="beneficiary-input">
                          <input 
                            type="text" 
                            placeholder="Organization Name (e.g., Turkish Red Crescent)" 
                            className="form-input"
                          />
                          <input 
                            type="text" 
                            placeholder="Stacks Wallet Address" 
                            className="form-input"
                          />
                          <input 
                            type="number" 
                            placeholder="Percentage (0-100)" 
                            className="form-input"
                            min="1"
                            max="100"
                          />
                          <button className="add-beneficiary" title="Add Organization">
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <button className="add-more-beneficiaries">
                      + Add Organization
                    </button>
                  </div>
                  
                  <div className="campaign-summary">
                    <h4>Campaign Summary</h4>
                    <div className="summary-item">
                      <span>Total Share Distribution:</span>
                      <span className="summary-percentage">100%</span>
                    </div>
                  </div>
                  
                  <button 
                    className="create-btn"
                    onClick={() => createCampaign({})}
                    disabled={isLoading}
                  >
                    <AlertTriangle size={20} />
                    {isLoading ? 'Creating...' : 'Create Campaign'}
                  </button>
                  
                  <div className="creation-info">
                    <p><strong>ℹ️ Info:</strong> Campaign cannot be modified once recorded on blockchain. Please review all details carefully.</p>
                  </div>
                </div>
              </div>
              
              <div className="campaign-preview-create">
                <div className="preview-header">
                  <h4>Campaign Preview</h4>
                  <p>Your campaign will look like this</p>
                </div>
                
                <div className="mock-campaign-card">
                  <div className="mock-header">
                    <div className="mock-title">
                      <AlertTriangle size={24} color="#10b981" />
                      <h3>Your New Campaign</h3>
                    </div>
                    <div className="mock-badges">
                      <span className="type-badge earthquake">Earthquake Relief</span>
                      <span className="status active">Active</span>
                    </div>
                  </div>
                  
                  <p className="mock-description">Your campaign description will appear here...</p>
                  
                  <div className="mock-location">
                    <MapPin size={16} />
                    <span>Campaign location</span>
                  </div>
                  
                  <div className="mock-progress">
                    <div className="mock-stats">
                      <span>0 STX raised</span>
                      <span>Target amount STX</span>
                    </div>
                    <div className="mock-bar">
                      <div className="mock-fill" style={{ width: '0%' }}></div>
                    </div>
                    <div className="mock-percentage">0% completed</div>
                  </div>
                  
                  <div className="mock-end">
                    <Calendar size={16} />
                    <span>End date</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Make Donation Tab */}
        {activeTab === 'donate' && (
          <div className="donate-section">
            <h2>Make Donation</h2>
            <div className="donate-container">
              <div className="donate-form-card">
                <div className="donate-form">
                  <div className="form-header">
                    <Heart size={32} color="#10b981" />
                    <h3>Support Relief</h3>
                    <p>Make secure and transparent donations on blockchain</p>
                  </div>
                  
                  <div className="form-group">
                    <label>Select Campaign</label>
                    <div className="custom-dropdown-container">
                      <div 
                        className="custom-dropdown-trigger"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span className="dropdown-selected">
                          {donationForm.campaignId === 0 
                            ? "Choose a campaign..." 
                            : campaigns.find(c => c.id === donationForm.campaignId)?.name || "Choose a campaign..."
                          }
                        </span>
                        <div className={`select-arrow ${isDropdownOpen ? 'open' : ''}`}>
                          <ChevronDown size={20} color="#10b981" />
                        </div>
                      </div>
                      
                      {isDropdownOpen && (
                        <div className="custom-dropdown-menu">
                          <div 
                            className="dropdown-option"
                            onClick={() => {
                              setDonationForm({...donationForm, campaignId: 0});
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="option-content">
                              <span className="option-title">Choose a campaign...</span>
                            </div>
                          </div>
                          {campaigns.filter(c => c.isActive).map(campaign => {
                            const getCampaignIcon = (type: string) => {
                              switch(type) {
                                case 'earthquake': return <AlertTriangle size={18} color="#10b981" />;
                                case 'fire': return <Flame size={18} color="#f97316" />;
                                case 'flood': return <Droplets size={18} color="#3b82f6" />;
                                case 'reforestation': return <TreePine size={18} color="#22c55e" />;
                                case 'environmental': return <Leaf size={18} color="#16a34a" />;
                                default: return <AlertTriangle size={18} color="#10b981" />;
                              }
                            };
                            
                            return (
                              <div 
                                key={campaign.id}
                                className="dropdown-option"
                                onClick={() => {
                                  setDonationForm({...donationForm, campaignId: campaign.id});
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <div className="option-content">
                                  <div className="option-header">
                                    {getCampaignIcon(campaign.type)}
                                    <span className="option-title">{campaign.name}</span>
                                  </div>
                                  <div className="option-progress">
                                    <span className="progress-text">
                                      {campaign.currentAmount.toLocaleString()} STX / {campaign.targetAmount.toLocaleString()} STX
                                    </span>
                                    <div className="mini-progress-bar">
                                      <div 
                                        className="mini-progress-fill"
                                        style={{ width: `${Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className="option-location">{campaign.location}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Donation Amount (STX)</label>
                    <input 
                      type="number" 
                      placeholder="100"
                      min="1"
                      value={donationForm.amount || ''}
                      onChange={(e) => setDonationForm({...donationForm, amount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  {donationForm.campaignId > 0 && (
                    <div className="form-group">
                      <label>Target Organization (Optional)</label>
                      <div className="custom-dropdown-container">
                        <div 
                          className="custom-dropdown-trigger"
                          onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                        >
                          <span className="dropdown-selected">
                            {!donationForm.targetOrgId 
                              ? "General Pool (All Organizations)" 
                              : campaigns.find(c => c.id === donationForm.campaignId)?.beneficiaries.find(org => org.id === donationForm.targetOrgId)?.name + ` (${campaigns.find(c => c.id === donationForm.campaignId)?.beneficiaries.find(org => org.id === donationForm.targetOrgId)?.percentage}%)` || "General Pool (All Organizations)"
                            }
                          </span>
                          <div className={`select-arrow ${isOrgDropdownOpen ? 'open' : ''}`}>
                            <ChevronDown size={20} color="#10b981" />
                          </div>
                        </div>
                        
                        {isOrgDropdownOpen && (
                          <div className="custom-dropdown-menu">
                            <div 
                              className="dropdown-option"
                              onClick={() => {
                                setDonationForm({...donationForm, targetOrgId: undefined});
                                setIsOrgDropdownOpen(false);
                              }}
                            >
                              <div className="option-content">
                                <div className="option-header">
                                  <CircleDollarSign size={18} color="#10b981" />
                                  <span className="option-title">General Pool (All Organizations)</span>
                                </div>
                                <span className="option-location">Funds distributed equally among all beneficiaries</span>
                              </div>
                            </div>
                            {campaigns.find(c => c.id === donationForm.campaignId)?.beneficiaries.map(org => (
                              <div 
                                key={org.id}
                                className="dropdown-option"
                                onClick={() => {
                                  setDonationForm({...donationForm, targetOrgId: org.id});
                                  setIsOrgDropdownOpen(false);
                                }}
                              >
                                <div className="option-content">
                                  <div className="option-header">
                                    <Building size={18} color="#10b981" />
                                    <span className="option-title">{org.name}</span>
                                  </div>
                                  <div className="option-progress">
                                    <span className="progress-text">
                                      Allocation: {org.percentage}% of campaign funds
                                    </span>
                                    <div className="mini-progress-bar">
                                      <div 
                                        className="mini-progress-fill"
                                        style={{ width: `${org.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className="option-location">Direct funding to this organization</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button 
                    className="donate-btn"
                    onClick={() => makeDonation(donationForm)}
                    disabled={isLoading || donationForm.campaignId === 0 || donationForm.amount === 0}
                  >
                    {isLoading ? 'Processing...' : `Donate ${donationForm.amount} STX`}
                  </button>
                  
                  <div className="donation-info">
                    <p><strong>💡 Info:</strong> Your donation will be recorded on blockchain and you'll receive a unique NFT receipt.</p>
                  </div>
                </div>
              </div>
              
              {donationForm.campaignId > 0 && (
                <div className="campaign-preview">
                  {(() => {
                    const selectedCamp = campaigns.find(c => c.id === donationForm.campaignId);
                    if (!selectedCamp) return null;
                    return (
                      <div className="preview-card">
                        <h4>Selected Campaign</h4>
                        <h3>{selectedCamp.name}</h3>
                        <p>{selectedCamp.description}</p>
                        <div className="preview-progress">
                          <div className="preview-stats">
                            <span>{selectedCamp.currentAmount.toLocaleString()} STX raised</span>
                            <span>{selectedCamp.targetAmount.toLocaleString()} STX target</span>
                          </div>
                          <div className="preview-bar">
                            <div 
                              className="preview-fill"
                              style={{ width: `${(selectedCamp.currentAmount / selectedCamp.targetAmount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Claim Funds Tab */}
        {activeTab === 'claim' && userRole === 'organization' && (
          <div className="claim-section">
            <h2>Claim Funds</h2>
            <div className="org-welcome">
              <h3>Welcome, {connectedOrgName}</h3>
              <p>You can claim funds allocated to your organization below.</p>
            </div>
            
            <div className="claimable-funds">
              {campaigns.map(campaign => {
                // Filter to show only funds for the connected organization
                const orgBeneficiary = campaign.beneficiaries.find(org => org.name === connectedOrgName);
                if (!orgBeneficiary) return null;
                
                const allocatedAmount = (campaign.currentAmount * orgBeneficiary.percentage) / 100;
                const pendingAmount = allocatedAmount - orgBeneficiary.claimed;
                
                return (
                  <div key={campaign.id} className="claim-campaign">
                    <h3>{campaign.name}</h3>
                    <div className="claim-org">
                      <div className="org-summary">
                        <div className="org-header">
                          <span className="org-name">{connectedOrgName}</span>
                          <span className="org-share">%{orgBeneficiary.percentage} pay</span>
                        </div>
                        <div className="org-address">{orgBeneficiary.address}</div>
                      </div>
                      
                      <div className="claim-amounts">
                        <div className="amount-item">
                          <span>Tahsis Edilen:</span>
                          <span>{allocatedAmount.toLocaleString()} STX</span>
                        </div>
                        <div className="amount-item">
                          <span>Talep Edilen:</span>
                          <span>{orgBeneficiary.claimed.toLocaleString()} STX</span>
                        </div>
                        <div className="amount-item pending">
                          <span>Bekleyen:</span>
                          <span>{pendingAmount.toLocaleString()} STX</span>
                        </div>
                      </div>
                      
                      <button 
                        className="claim-btn"
                        onClick={() => claimFunds(campaign.id, pendingAmount)}
                        disabled={isLoading || pendingAmount <= 0}
                      >
                        {isLoading ? 'Claiming...' : `Claim ${pendingAmount.toLocaleString()} STX`}
                      </button>
                    </div>
                  </div>
                );
              }).filter(Boolean)}
              
              {campaigns.every(c => !c.beneficiaries.find(org => org.name === connectedOrgName)) && (
                <div className="no-claims">
                  <p>Şu anda kuruluşunuz için talep edilebilir fon bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="modal-overlay" onClick={() => setSelectedCampaign(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCampaign.name}</h2>
              <button className="close-btn" onClick={() => setSelectedCampaign(null)}>×</button>
            </div>
            
            <div className="modal-content">
              <p>{selectedCampaign.description}</p>
              
              <div className="campaign-stats">
                <div className="stat">
                  <span className="stat-label">Target Amount:</span>
                  <span className="stat-value">${selectedCampaign.targetAmount.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Raised:</span>
                  <span className="stat-value">${selectedCampaign.currentAmount.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Progress:</span>
                  <span className="stat-value">{Math.round((selectedCampaign.currentAmount / selectedCampaign.targetAmount) * 100)}%</span>
                </div>
              </div>
              
              <h3>Beneficiary Organizations</h3>
              <div className="beneficiaries-list">
                {selectedCampaign.beneficiaries.map(org => (
                  <div key={org.id} className="beneficiary-item">
                    <div className="beneficiary-info">
                      <span className="beneficiary-name">{org.name}</span>
                      <span className="beneficiary-percentage">{org.percentage}%</span>
                    </div>
                    <div className="beneficiary-address">{org.address}</div>
                    <div className="beneficiary-amounts">
                      <span>Allocated: ${((selectedCampaign.currentAmount * org.percentage) / 100).toLocaleString()}</span>
                      <span>Claimed: ${org.claimed.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Donations Table */}
      <div className="recent-donations">
        <h2>Recent Donations</h2>
        <div className="donations-table">
          <div className="table-header">
            <span>Campaign</span>
            <span>Donor</span>
            <span>Amount</span>
            <span>Target Organization</span>
            <span>Date</span>
            <span>Transaction</span>
          </div>
          <div className="table-body">
            {recentDonations.map(donation => (
              <div key={donation.id} className="table-row">
                <span className="campaign-name">{donation.campaignName}</span>
                <span className="donor-address">
                  <a 
                    href={getStacksAddress(donation.donorAddress)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="address-link"
                  >
                    {donation.donorAddress}
                    <ExternalLink size={12} />
                  </a>
                </span>
                <span className="amount">{donation.amount.toLocaleString()} STX</span>
                <span className="target-org">{donation.targetOrg || 'Genel Havuz'}</span>
                <span className="timestamp">
                  {new Date(donation.timestamp).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="tx-actions">
                  <a 
                    href={getExplorerLink(donation.txHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="tx-link"
                    title="Blockchain Explorer"
                  >
                    <ExternalLink size={16} />
                  </a>
                  {donation.nftReceiptId && (
                    <span className="nft-badge" title={`NFT Receipt #${donation.nftReceiptId}`}>
                      #{donation.nftReceiptId}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
          
          {recentDonations.length === 0 && (
            <div className="no-donations">
              <p>Henüz bağış işlemi bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="modal-overlay" onClick={() => setSuccessModal(prev => ({...prev, isOpen: false}))}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-header">
              <CheckCircle size={48} color="#10b981" />
              <button 
                className="close-btn" 
                onClick={() => setSuccessModal(prev => ({...prev, isOpen: false}))}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="success-content">
              {successModal.type === 'donation' && (
                <>
                  <h2>Bağış Başarılı! 🎉</h2>
                  <p>
                    <strong>{successModal.amount?.toLocaleString()} STX</strong> bağışınız 
                    "<strong>{successModal.campaignName}</strong>" kampanyasına başarıyla gönderildi.
                  </p>
                  
                  {successModal.nftReceiptId && (
                    <div className="nft-receipt">
                      <h3>NFT Makbuzunuz Hazır!</h3>
                      <div className="nft-card">
                        <div className="nft-preview">🎨</div>
                        <div className="nft-info">
                          <span className="nft-id">Receipt #{successModal.nftReceiptId}</span>
                          <span className="nft-desc">Bağış Makbuzu NFT</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {successModal.type === 'claim' && (
                <>
                  <h2>Fon Talebi Başarılı! 💰</h2>
                  <p>
                    <strong>{successModal.amount?.toLocaleString()} STX</strong> tutarındaki 
                    fon talebiniz "<strong>{successModal.campaignName}</strong>" kampanyasından başarıyla işlendi.
                  </p>
                </>
              )}
              
              <div className="blockchain-info">
                <h4>Blockchain Information</h4>
                <div className="tx-info">
                  <span>Transaction Hash:</span>
                  <div className="tx-hash">
                    <code>{successModal.txHash}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(successModal.txHash)}
                    >
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
                  Blockchain Explorer'da Görüntüle
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterReliefPage;
