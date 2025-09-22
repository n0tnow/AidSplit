import React, { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import { getContributeStxTx, getContributeSbtcTx } from '../lib/fundraisingUtils';
import { uintCV } from '@stacks/transactions';
import './FundraisingPage.css';

const FundraisingPage: React.FC = () => {
  const { authenticate, signOut, authOptions } = useConnect();
  const [userAddress, setUserAddress] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('user');

  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationType, setDonationType] = useState<'stx' | 'sbtc'>('stx');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Campaign info state
  const [campaignInfo, setCampaignInfo] = useState({
    goal: 1000000, // 1M microSTX = 1000 STX
    totalRaised: 0,
    donorCount: 0,
    isActive: true,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  });

  useEffect(() => {
    // Check if user is already connected
    if (authOptions.userSession?.isUserSignedIn()) {
      const userData = authOptions.userSession.loadUserData();
      setUserAddress(userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet);
    }
  }, [authOptions.userSession]);

  const connectWallet = () => {
    authenticate();
  };

  const disconnectWallet = () => {
    signOut();
    setUserAddress('');
  };

  const handleDonation = async () => {
    if (!userAddress) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setMessage('Please enter a valid donation amount');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const amountInMicrounits = donationType === 'stx'
        ? Math.floor(parseFloat(donationAmount) * 1000000) // Convert STX to microSTX
        : Math.floor(parseFloat(donationAmount) * 100000000); // Convert BTC to sats

      const contractCall = donationType === 'stx'
        ? getContributeStxTx('testnet', { address: userAddress, amount: amountInMicrounits })
        : getContributeSbtcTx('testnet', { address: userAddress, amount: amountInMicrounits });

      await openContractCall({
        ...contractCall,
        onFinish: (data: any) => {
          console.log('Transaction submitted:', data);
          setMessage(`Donation successful! Transaction ID: ${data.txId}`);
          setDonationAmount('');
          // Update campaign info
          setCampaignInfo(prev => ({
            ...prev,
            totalRaised: prev.totalRaised + amountInMicrounits,
            donorCount: prev.donorCount + 1
          }));
        },
        onCancel: () => {
          setMessage('Transaction cancelled');
        },
      });
    } catch (error) {
      console.error('Donation error:', error);
      setMessage('Donation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = (campaignInfo.totalRaised / campaignInfo.goal) * 100;

  return (
    <div className="fundraising-page">
      <div className="page-header">
        <h1>🎯 Fundraising Campaign</h1>
        <p>Support our mission with your crypto donations</p>
      </div>

      {/* Wallet Connection */}
      <div className="wallet-section">
        {!userAddress ? (
          <button onClick={connectWallet} className="connect-wallet-btn">
            Connect Stacks Wallet
          </button>
        ) : (
          <div className="wallet-info">
            <div className="wallet-address">{userAddress}</div>
            <button onClick={disconnectWallet} className="disconnect-btn">
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Campaign Stats */}
      <div className="campaign-stats">
        <div className="stat-card">
          <h3>Campaign Goal</h3>
          <p>{(campaignInfo.goal / 1000000).toLocaleString()} STX</p>
        </div>
        <div className="stat-card">
          <h3>Total Raised</h3>
          <p>{(campaignInfo.totalRaised / 1000000).toLocaleString()} STX</p>
        </div>
        <div className="stat-card">
          <h3>Donors</h3>
          <p>{campaignInfo.donorCount}</p>
        </div>
        <div className="stat-card">
          <h3>Progress</h3>
          <p>{progressPercentage.toFixed(1)}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="progress-text">
          {progressPercentage >= 100 ? '🎉 Goal Reached!' : `${progressPercentage.toFixed(1)}% of goal reached`}
        </div>
      </div>

      {/* Donation Form */}
      {userAddress && (
        <div className="donation-form">
          <h2>Make a Donation</h2>

          <div className="donation-type-selector">
            <button
              className={`type-btn ${donationType === 'stx' ? 'active' : ''}`}
              onClick={() => setDonationType('stx')}
            >
              STX
            </button>
            <button
              className={`type-btn ${donationType === 'sbtc' ? 'active' : ''}`}
              onClick={() => setDonationType('sbtc')}
            >
              sBTC
            </button>
          </div>

          <div className="amount-input">
            <input
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              placeholder={`Enter amount in ${donationType.toUpperCase()}`}
              min="0"
              step="0.000001"
            />
          </div>

          <button
            onClick={handleDonation}
            disabled={isLoading || !donationAmount}
            className="donate-btn"
          >
            {isLoading ? 'Processing...' : `Donate ${donationType.toUpperCase()}`}
          </button>

          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      )}

      {/* Campaign Info */}
      <div className="campaign-info">
        <h2>About This Campaign</h2>
        <p>
          This fundraising campaign aims to raise funds for important causes using blockchain technology.
          Your donations are secure, transparent, and tracked on the Stacks blockchain.
        </p>
        <ul>
          <li>✅ 100% transparent fund tracking</li>
          <li>✅ Smart contract security</li>
          <li>✅ Instant transaction processing</li>
          <li>✅ Tax-deductible receipts (where applicable)</li>
        </ul>
      </div>
    </div>
  );
};

export default FundraisingPage;