import React from 'react';
import './FeaturePage.css';

interface FeaturePageProps {
  featureId: string;
  onBack: () => void;
}

const FeaturePage: React.FC<FeaturePageProps> = ({ featureId, onBack }) => {
  // Backend features
  const backendFeatures = [
    {
      id: 'disaster-relief',
      title: 'Disaster Relief Campaigns',
      icon: '🚨',
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
      icon: '🏢',
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
      icon: '🎨',
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
      icon: '⚡',
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
      icon: '🛡️',
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
      icon: '🔐',
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
      icon: '🎯',
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
      icon: '📊',
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

  const feature = backendFeatures.find(f => f.id === featureId);
  
  if (!feature) {
    return (
      <div className="feature-page">
        <div className="feature-page-header">
          <button 
            className="back-btn"
            onClick={onBack}
          >
            ← Back to Home
          </button>
          <h1>Feature not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <button 
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Home
        </button>
        <h1>
          <span className="feature-icon-large">{feature.icon}</span>
          {feature.title}
        </h1>
        <p>{feature.description}</p>
      </div>
      
      <div className="feature-page-content">
        <div className="feature-info">
          <h2>Feature Details</h2>
          <ul className="feature-list">
            {feature.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
        
        <div className="contracts-info">
          <h2>Smart Contracts Used</h2>
          <div className="contracts-grid">
            {feature.smartContracts.map((contract, index) => (
              <div key={index} className="contract-card">
                <h3>{contract}</h3>
                <p>Smart contract running on blockchain</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturePage;