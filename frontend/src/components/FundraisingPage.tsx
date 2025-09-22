import React, { useState, useEffect } from 'react';
import { ArrowLeft, CircleDollarSign, Users, Target, Calendar, TrendingUp, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useCampaignInfo } from '../hooks/campaignQueries';
import { ustxToStx, satsToSbtc, formatCurrency } from '../lib/currencyUtils';
import DonationModal from './DonationModal';
import './FundraisingPage.css';

interface FundraisingPageProps {
  onBack: () => void;
}

const FundraisingPage: React.FC<FundraisingPageProps> = ({ onBack }) => {
  const { userAddress, isConnected, userRole } = useWallet();
  const { data: campaignInfo, isLoading, error } = useCampaignInfo(15000);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Calculate progress percentage
  const progressPercentage = campaignInfo 
    ? Math.min((campaignInfo.totalStx + campaignInfo.totalSbtc) / campaignInfo.goal * 100, 100)
    : 0;

  // Format amounts for display
  const totalStxDisplay = campaignInfo ? ustxToStx(campaignInfo.totalStx) : 0;
  const totalSbtcDisplay = campaignInfo ? satsToSbtc(campaignInfo.totalSbtc) : 0;

  // Calculate days remaining
  const daysRemaining = campaignInfo && !campaignInfo.isExpired
    ? Math.max(0, Math.ceil((campaignInfo.end - Date.now() / 1000) / (24 * 60 * 60)))
    : 0;

  return (
    <div className="fundraising-page">
      <div className="fundraising-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          Back to Home
        </button>
        <h1>Fundraising Campaign</h1>
      </div>

      <div className="fundraising-content">
        {/* Campaign Overview Card */}
        <div className="campaign-overview-card">
          <div className="campaign-header">
            <div className="campaign-title">
              <CircleDollarSign size={32} className="campaign-icon" />
              <div>
                <h2>Emergency Relief Fund</h2>
                <p>Supporting communities in need through cryptocurrency donations</p>
              </div>
            </div>
            
            {campaignInfo?.isCancelled && (
              <div className="campaign-status cancelled">
                <AlertCircle size={16} />
                Campaign Cancelled
              </div>
            )}
            
            {campaignInfo?.isExpired && !campaignInfo.isCancelled && (
              <div className="campaign-status expired">
                <Calendar size={16} />
                Campaign Ended
              </div>
            )}
            
            {!campaignInfo?.isExpired && !campaignInfo?.isCancelled && (
              <div className="campaign-status active">
                <CheckCircle size={16} />
                Active Campaign
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="progress-section">
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-label">Raised</span>
                <span className="stat-value">
                  {formatCurrency(totalStxDisplay, 'STX')} + {formatCurrency(totalSbtcDisplay, 'sBTC')}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Goal</span>
                <span className="stat-value">
                  {campaignInfo ? `$${campaignInfo.goal.toLocaleString()}` : 'Loading...'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Donors</span>
                <span className="stat-value">
                  {campaignInfo?.donationCount || 0}
                </span>
              </div>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="progress-percentage">{progressPercentage.toFixed(1)}%</span>
            </div>

            {!campaignInfo?.isExpired && !campaignInfo?.isCancelled && (
              <div className="time-remaining">
                <Calendar size={16} />
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Campaign ending soon'}
              </div>
            )}
          </div>

          {/* Donation Button */}
          <div className="donation-section">
            {!isConnected ? (
              <div className="connect-wallet-prompt">
                <Wallet size={24} />
                <p>Connect your wallet to make a donation</p>
              </div>
            ) : campaignInfo?.isExpired ? (
              <div className="campaign-ended-message">
                <AlertCircle size={20} />
                <span>This campaign has ended</span>
              </div>
            ) : campaignInfo?.isCancelled ? (
              <div className="campaign-cancelled-message">
                <AlertCircle size={20} />
                <span>This campaign has been cancelled</span>
              </div>
            ) : (
              <button 
                className="donate-button"
                onClick={() => setIsDonationModalOpen(true)}
              >
                <CircleDollarSign size={20} />
                Make a Donation
              </button>
            )}
          </div>
        </div>

        {/* Campaign Information */}
        <div className="campaign-info-grid">
          <div className="info-card">
            <div className="info-header">
              <Target size={24} />
              <h3>Campaign Goal</h3>
            </div>
            <div className="info-content">
              <p>
                This fundraising campaign aims to raise emergency funds for disaster relief 
                and community support. Donations are accepted in both STX and sBTC to maximize 
                accessibility and support for those in need.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <Users size={24} />
              <h3>How It Works</h3>
            </div>
            <div className="info-content">
              <ul>
                <li>Connect your Stacks wallet</li>
                <li>Choose donation amount in USD</li>
                <li>Select payment method (STX or sBTC)</li>
                <li>Confirm transaction in your wallet</li>
                <li>Receive confirmation and optional NFT receipt</li>
              </ul>
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <TrendingUp size={24} />
              <h3>Transparency</h3>
            </div>
            <div className="info-content">
              <p>
                All donations are recorded on the Stacks blockchain for full transparency. 
                You can track your contributions and see how funds are being distributed 
                to beneficiaries in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Status Details */}
        {campaignInfo && (
          <div className="campaign-details-card">
            <h3>Campaign Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Total STX Raised:</span>
                <span className="detail-value">{formatCurrency(totalStxDisplay, 'STX')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total sBTC Raised:</span>
                <span className="detail-value">{formatCurrency(totalSbtcDisplay, 'sBTC')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Number of Donations:</span>
                <span className="detail-value">{campaignInfo.donationCount}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Campaign Status:</span>
                <span className="detail-value">
                  {campaignInfo.isCancelled ? 'Cancelled' : 
                   campaignInfo.isExpired ? 'Ended' : 'Active'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Funds Withdrawn:</span>
                <span className="detail-value">{campaignInfo.isWithdrawn ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-card">
            <AlertCircle size={24} />
            <div>
              <h3>Error Loading Campaign</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading-card">
            <div className="loading-spinner" />
            <p>Loading campaign information...</p>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaignName="Emergency Relief Fund"
        campaignId={1}
      />
    </div>
  );
};

export default FundraisingPage;
