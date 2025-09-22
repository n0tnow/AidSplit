import React from 'react';
import { Threads } from './ui/threads';
import './Homepage.css';

// Lucide React Icons
import { 
  Users, 
  AlertTriangle, 
  Building, 
  CircleDollarSign, 
  Zap, 
  Shield, 
  Key, 
  Target, 
  BarChart, 
  Settings,
  Terminal 
} from 'lucide-react';

interface HomepageProps {
  onNavigate: (view: string) => void;
}

const Homepage: React.FC<HomepageProps> = ({ onNavigate }) => {
  // Backend features
  const backendFeatures = [
    {
      id: 'disaster-relief',
      title: 'Disaster Relief Campaigns',
      icon: <AlertTriangle size={32} color="#10b981" />,
      description: 'Automated donation collection and distribution system for natural disasters',
      details: [
        'Campaign creation and management',
        'Automatic distribution to target organizations',
        'Percentage-based allocation calculation',
        'KYC verification system',
        'Minimum/maximum donation limits',
        'Transparent donation tracking'
      ],
      smartContracts: ['campaign-manager-v6.clar', 'distribution-engine-v6.clar']
    },
    {
      id: 'payroll-system',
      title: 'Corporate Payroll System',
      icon: <Building size={32} color="#10b981" />,
      description: 'Automated salary distribution system for companies',
      details: [
        'Department-based salary distribution',
        'Hierarchical structure calculation',
        'Seniority and performance multipliers',
        'Automatic payroll generation',
        'Employee management',
        'Corporate admin system'
      ],
      smartContracts: ['campaign-manager-v6.clar', 'hierarchy-calculator-v6.clar', 'company-auth-v6.clar']
    },
    {
      id: 'nft-receipts',
      title: 'NFT Receipt System',
      icon: <CircleDollarSign size={32} color="#10b981" />,
      description: 'AI-powered NFT receipt generation for every transaction',
      details: [
        'SIP-009 compliant NFTs',
        'Soulbound (non-transferable) receipts',
        'AI-generated unique designs',
        'Donation and salary receipts',
        'Permanent blockchain records',
        'Personal NFT gallery'
      ],
      smartContracts: ['nft-receipts-v6.clar', 'nft-generator-v6.clar']
    },
    {
      id: 'distribution-engine',
      title: 'Distribution Engine',
      icon: <Zap size={32} color="#10b981" />,
      description: 'Intelligent fund distribution and management system',
      details: [
        'Weighted allocation distribution',
        'Campaign pool management',
        'Automatic calculation algorithms',
        'Batch processing support',
        'Secure fund transfers',
        'Real-time balance tracking'
      ],
      smartContracts: ['distribution-engine-v6.clar']
    },
    {
      id: 'access-control',
      title: 'Access Control',
      icon: <Shield size={32} color="#10b981" />,
      description: 'Role-based permission management system',
      details: [
        'Super Admin privileges',
        'Campaign Admin roles',
        'Financial Admin permissions',
        'Auditor access',
        'System-wide pause functionality',
        'Function-based restrictions'
      ],
      smartContracts: ['access-control-v6.clar']
    },
    {
      id: 'company-auth',
      title: 'Corporate Authentication',
      icon: <Key size={32} color="#10b981" />,
      description: 'Corporate and employee management system',
      details: [
        'Company registration and verification',
        'Admin assignment system',
        'Employee wallet management',
        'Department organization',
        'Role-based access',
        'Corporate profile management'
      ],
      smartContracts: ['company-auth-v6.clar']
    },
    {
      id: 'donation-targeting',
      title: 'Targeted Donation System',
      icon: <Target size={32} color="#10b981" />,
      description: 'Ability to donate to specific organizations',
      details: [
        'Organization selection capability',
        'Common pool donations',
        'Target-based distribution',
        'Donation transparency',
        'Organization performance tracking',
        'Automatic reporting'
      ],
      smartContracts: ['donation-targeting-v6.clar']
    },
    {
      id: 'hierarchy-calculator',
      title: 'Hierarchy Calculator',
      icon: <BarChart size={32} color="#10b981" />,
      description: 'Complex salary calculation algorithm',
      details: [
        'Department weight calculation',
        'Position multipliers',
        'Seniority calculation',
        'Performance evaluation',
        'Automatic salary distribution',
        'Fair payment algorithm'
      ],
      smartContracts: ['hierarchy-calculator-v6.clar']
    }
  ];

  return (
    <div className="home-container">
      {/* Background Threads Animation */}
      <div className="threads-background">
        <Threads
          className="w-full h-full"
          amplitude={0.8}
          distance={0.05}
          enableMouseInteraction={true}
          color={[0.06, 0.73, 0.51]} // Subtle green color for threads
        />
      </div>
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <Users className="brand-icon" size={56} color="#10b981" />
            AidSplit Platform
          </h1>
          <p className="hero-subtitle">
            Blockchain-based disaster relief and corporate payroll management system
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">8</span>
              <span className="stat-label">Smart Contracts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2</span>
              <span className="stat-label">Main Systems</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Transparent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-section">
        <div className="section-header">
          <h2>Platform Features</h2>
          <p>Secure and transparent transactions powered by blockchain technology</p>
        </div>
        
        <div className="features-grid">
          {backendFeatures.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-header">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
              </div>
              
              <p className="feature-description">{feature.description}</p>
              
              <div className="feature-details">
                <h4>Features:</h4>
                <ul>
                  {feature.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
              
              <div className="feature-contracts">
                <h4>Smart Contracts:</h4>
                <div className="contracts-list">
                  {feature.smartContracts.map((contract, index) => (
                    <span key={index} className="contract-tag">{contract}</span>
                  ))}
                </div>
              </div>
              
              <button 
                className="feature-btn"
                onClick={() => onNavigate(feature.id)}
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture */}
      <div className="architecture-section">
        <div className="section-header">
          <h2>System Architecture</h2>
          <p>Powerful system working with 8 integrated Smart Contracts</p>
        </div>
        
        <div className="architecture-grid">
          <div className="arch-card core">
            <h3>🎯 Core Controls</h3>
            <div className="arch-contracts">
              <span>campaign-manager-v6.clar</span>
              <span>access-control-v6.clar</span>
            </div>
          </div>
          
          <div className="arch-card distribution">
            <h3>💰 Distribution System</h3>
            <div className="arch-contracts">
              <span>distribution-engine-v6.clar</span>
              <span>hierarchy-calculator-v6.clar</span>
            </div>
          </div>
          
          <div className="arch-card auth">
            <h3>🔐 Authentication</h3>
            <div className="arch-contracts">
              <span>company-auth-v6.clar</span>
              <span>donation-targeting-v6.clar</span>
            </div>
          </div>
          
          <div className="arch-card nft">
            <h3>🎨 NFT System</h3>
            <div className="arch-contracts">
              <span>nft-receipts-v6.clar</span>
              <span>nft-generator-v6.clar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <div className="section-header">
          <h2>Quick Access</h2>
          <p>Direct access to platform features</p>
        </div>
        
        <div className="quick-actions">
          <div 
            className="quick-access-card"
            onClick={() => onNavigate('disaster-relief')}
          >
            <div className="card-header">
              <div className="card-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="card-title-group">
                <h3 className="card-title">Disaster Relief</h3>
                <p className="card-subtitle">Emergency Aid Distribution</p>
              </div>
            </div>
            <div className="card-content">
              <p className="card-description">
                Create and manage transparent disaster relief campaigns with automatic fund distribution
              </p>
              <div className="card-features">
                <ul className="card-features-list">
                  <li className="card-feature-item">Campaign Creation</li>
                  <li className="card-feature-item">Fund Management</li>
                  <li className="card-feature-item">NFT Receipts</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div 
            className="quick-access-card"
            onClick={() => onNavigate('payroll-system')}
          >
            <div className="card-header">
              <div className="card-icon">
                <Building size={24} />
              </div>
              <div className="card-title-group">
                <h3 className="card-title">Payroll System</h3>
                <p className="card-subtitle">Automated Salary Distribution</p>
              </div>
            </div>
            <div className="card-content">
              <p className="card-description">
                Smart contract-based payroll management with hierarchy calculations and bulk processing
              </p>
              <div className="card-features">
                <ul className="card-features-list">
                  <li className="card-feature-item">Bulk Payments</li>
                  <li className="card-feature-item">Hierarchy Calc</li>
                  <li className="card-feature-item">Auto Distribution</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div 
            className="quick-access-card"
            onClick={() => onNavigate('nft-receipts')}
          >
            <div className="card-header">
              <div className="card-icon">
                <CircleDollarSign size={24} />
              </div>
              <div className="card-title-group">
                <h3 className="card-title">NFT Receipts</h3>
                <p className="card-subtitle">Blockchain Certificates</p>
              </div>
            </div>
            <div className="card-content">
              <p className="card-description">
                View and manage your unique blockchain certificates for all transactions and donations
              </p>
              <div className="card-features">
                <ul className="card-features-list">
                  <li className="card-feature-item">Digital Receipts</li>
                  <li className="card-feature-item">Verification</li>
                  <li className="card-feature-item">Collectibles</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div 
            className="quick-access-card"
            onClick={() => onNavigate('fundraising')}
          >
            <div className="card-header">
              <div className="card-icon">
                <CircleDollarSign size={24} />
              </div>
              <div className="card-title-group">
                <h3 className="card-title">Fundraising Campaign</h3>
                <p className="card-subtitle">STX & sBTC Donations</p>
              </div>
            </div>
            <div className="card-content">
              <p className="card-description">
                Simple fundraising campaign accepting both STX and sBTC donations with real-time tracking
              </p>
              <div className="card-features">
                <ul className="card-features-list">
                  <li className="card-feature-item">Multi-Currency</li>
                  <li className="card-feature-item">Real-time Stats</li>
                  <li className="card-feature-item">Transparent</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div 
            className="quick-access-card"
            onClick={() => onNavigate('access-control')}
          >
            <div className="card-header">
              <div className="card-icon">
                <Settings size={24} />
              </div>
              <div className="card-title-group">
                <h3 className="card-title">Admin Panel</h3>
                <p className="card-subtitle">System Management</p>
              </div>
            </div>
            <div className="card-content">
              <p className="card-description">
                Comprehensive system administration with role management and access controls
              </p>
              <div className="card-features">
                <ul className="card-features-list">
                  <li className="card-feature-item">Role Management</li>
                  <li className="card-feature-item">Access Control</li>
                  <li className="card-feature-item">System Config</li>
                </ul>
              </div>
            </div>
          </div>

          <div 
            className="quick-access-card"
            onClick={() => onNavigate('manual-mint')}
            style={{ border: '1px solid #f59e0b' }}
          >
            <div className="card-header">
              <div className="card-icon">
                <Terminal size={24} />
              </div>
              <div className="card-title-group">
                <h3 className="card-title">Manual NFT Mint</h3>
                <p className="card-subtitle">Developer Tools</p>
              </div>
            </div>
            <div className="card-content">
              <p className="card-description">
                Review pending NFT mint requests and manually process them via Stacks CLI
              </p>
              <div className="card-features">
                <ul className="card-features-list">
                  <li className="card-feature-item">Pending Requests</li>
                  <li className="card-feature-item">CLI Commands</li>
                  <li className="card-feature-item">IPFS Metadata</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;