import React, { useState } from 'react';
import { X, CircleDollarSign, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useExistingDonation } from '../hooks/campaignQueries';
import {
  getContributeSbtcTx,
  getContributeStxTx,
  isDevnetEnvironment,
  isTestnetEnvironment,
  getStacksNetworkString
} from '../lib/fundraisingUtils';
import { executeContractCall, openContractCallTx } from '../lib/contractUtils';
import { useDevnetWallet } from '../lib/devnetWalletContext';
import {
  btcToSats,
  satsToSbtc,
  stxToUstx,
  usdToSbtc,
  usdToStx,
  useCurrentPrices,
  ustxToStx
} from '../lib/currencyUtils';
import { createDonationNFT, DonationNFTData } from '../lib/nftService';
import { CONTRACT_ADDRESS } from '../lib/constants';
import './DonationModal.css';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName?: string;
  campaignId?: number;
}

interface ToastMessage {
  type: 'success' | 'error' | 'info';
  title: string;
  description: string;
  duration?: number;
}

const DonationModal: React.FC<DonationModalProps> = ({ 
  isOpen, 
  onClose, 
  campaignName = "Fundraising Campaign",
  campaignId 
}) => {
  const { userAddress, isConnected } = useWallet();
  const {
    currentWallet: devnetWallet,
    wallets: devnetWallets,
    setCurrentWallet: setDevnetWallet,
  } = useDevnetWallet();

  const currentWalletAddress = isDevnetEnvironment()
    ? devnetWallet?.stxAddress
    : isTestnetEnvironment()
    ? userAddress
    : userAddress;

  const { data: previousDonation } = useExistingDonation(currentWalletAddress || undefined);
  const { data: prices } = useCurrentPrices();

  const hasMadePreviousDonation =
    previousDonation &&
    (previousDonation?.stxAmount > 0 || previousDonation?.sbtcAmount > 0);

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stx' | 'sbtc'>('stx');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const presetAmounts = [10, 25, 50, 100];

  const showToast = (message: ToastMessage) => {
    setToast(message);
    setTimeout(() => setToast(null), message.duration || 5000);
  };

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleSubmit = async () => {
    if (!isConnected && !isDevnetEnvironment()) {
      showToast({
        type: 'error',
        title: 'Wallet not connected',
        description: 'Please connect your wallet to make a donation'
      });
      return;
    }

    const amount = selectedAmount || Number(customAmount);

    if (!amount || amount <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid amount',
        description: 'Please enter a valid donation amount'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Only STX payments supported for now
      const txOptions = getContributeStxTx(getStacksNetworkString(), {
        address: currentWalletAddress || '',
        amount: Math.round(
          Number(stxToUstx(usdToStx(amount, prices?.stx || 0)))
        ),
      });

      const doSuccessToast = async (txid: string) => {
        showToast({
          type: 'success',
          title: 'Thank you!',
          description: `Processing donation of $${amount}. Transaction ID: ${txid}`,
          duration: 30000
        });

        // Create NFT receipt for the donation
        try {
          // Creating NFT receipt...
          
          const nftData: DonationNFTData = {
            donorAddress: currentWalletAddress || '',
            amount: usdToStx(amount, prices?.stx || 0),
            campaignName: campaignName || 'Fundraising Campaign',
            targetOrg: 'AidSplit Platform',
            timestamp: new Date().toISOString(),
            txHash: txid,
            receiptType: 'donation'
          };
          
          const nftResult = await createDonationNFT(null, nftData, campaignId || 1);
          // ✅ NFT Receipt created
          
          // Store NFT receipt data in localStorage for NFTReceiptsPage
          const existingReceipts = JSON.parse(localStorage.getItem('aidsplit-nft-receipts') || '[]');
          const nftReceipt = {
            id: nftResult.nftId,
            tokenId: `NFT-RCP-${String(nftResult.nftId).padStart(3, '0')}`,
            campaignId: campaignId || 1,
            campaignName: campaignName || 'Fundraising Campaign',
            type: 'donation',
            amount: usdToStx(amount, prices?.stx || 0),
            recipient: currentWalletAddress,
            issuer: CONTRACT_ADDRESS,
            issuedAt: new Date().toISOString(),
            txHash: txid, // Use donation transaction hash instead of NFT mint hash
            nftMintTxHash: nftResult.txHash, // Store NFT mint hash separately if needed
            imageUrl: nftResult.imageUrl,
            metadata: {
              category: 'Fundraising',
              rarity: amount >= 1000 ? 'legendary' : amount >= 500 ? 'epic' : amount >= 100 ? 'rare' : 'common',
              attributes: [
                { trait: 'Campaign Type', value: 'Fundraising' },
                { trait: 'Amount', value: `${usdToStx(amount, prices?.stx || 0)} STX` },
                { trait: 'USD Value', value: `$${amount}` },
                { trait: 'Date', value: new Date().toLocaleDateString() },
                { trait: 'Impact', value: amount >= 500 ? 'High' : 'Medium' }
              ]
            },
            isSoulbound: true,
            isOwned: true
          };
          
          existingReceipts.unshift(nftReceipt);
          localStorage.setItem('aidsplit-nft-receipts', JSON.stringify(existingReceipts));
          // ✅ NFT receipt saved
          
        } catch (error) {
          console.error('❌ Error creating NFT receipt:', error);
          // Don't show error to user, NFT creation is optional
        }
      };

      // Devnet uses direct call, Testnet/Mainnet needs to prompt with browser extension
      if (isDevnetEnvironment()) {
        const { txid } = await executeContractCall(txOptions, devnetWallet);
        doSuccessToast(txid);
      } else {
        await openContractCallTx({
          ...txOptions,
          onFinish: (data) => {
            doSuccessToast(data.txId);
          },
          onCancel: () => {
            showToast({
              type: 'info',
              title: 'Cancelled',
              description: 'Transaction was cancelled'
            });
          },
        });
      }
      
      setCustomAmount('');
      setSelectedAmount(null);
    } catch (e) {
      console.error(e);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to make contribution'
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="donation-modal-overlay">
      <div className="donation-modal">
        <div className="donation-modal-header">
          <h2 className="donation-modal-title">
            <CircleDollarSign className="donation-modal-icon" />
            Make a Contribution to {campaignName}
          </h2>
          <button className="donation-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="donation-modal-content">
          {!currentWalletAddress ? (
            <div className="donation-modal-wallet-connect">
              <div className="donation-modal-wallet-message">
                <Wallet size={48} />
                <p>Please connect a STX wallet to make a contribution.</p>
                {isDevnetEnvironment() ? (
                  <div className="devnet-wallet-selector">
                    <select 
                      value={devnetWallet?.stxAddress || ''} 
                      onChange={(e) => {
                        const wallet = devnetWallets.find(w => w.stxAddress === e.target.value);
                        setDevnetWallet(wallet || null);
                      }}
                    >
                      <option value="">Select devnet wallet</option>
                      {devnetWallets.map((wallet) => (
                        <option key={wallet.stxAddress} value={wallet.stxAddress}>
                          {wallet.label} - {wallet.stxAddress}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <button className="connect-wallet-btn" onClick={() => {/* Add connect wallet logic */}}>
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {hasMadePreviousDonation && (
                <div className="donation-modal-alert">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Heads up: you've contributed before. Thank you!</strong>
                    <div>STX: {Number(ustxToStx(previousDonation?.stxAmount || 0)).toFixed(2)}</div>
                    <div>sBTC: {satsToSbtc(previousDonation?.sbtcAmount || 0).toFixed(8)}</div>
                  </div>
                </div>
              )}

              <div className="donation-form-section">
                <h3>Choose Payment Method</h3>
                <div className="payment-method-selector">
                  <label className={`payment-method-option ${paymentMethod === 'stx' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="stx"
                      checked={paymentMethod === 'stx'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'stx')}
                    />
                    STX
                  </label>
                  <label className={`payment-method-option disabled`} style={{opacity: 0.5, cursor: 'not-allowed'}}>
                    <input
                      type="radio"
                      value="sbtc"
                      disabled
                    />
                    sBTC (Coming Soon)
                  </label>
                </div>
              </div>

              <div className="donation-form-section">
                <h3>Choose Contribution Amount</h3>
                <div className="preset-amounts">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      className={`preset-amount-btn ${selectedAmount === amount ? 'selected' : ''}`}
                      onClick={() => handlePresetClick(amount)}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                <div className="custom-amount-section">
                  <label>Or enter custom amount:</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Enter amount"
                    className="custom-amount-input"
                  />
                </div>

                <div className="conversion-display">
                  <div className="conversion-text">
                    ≈ {usdToStx(
                      Number(selectedAmount || customAmount || '0'),
                      prices?.stx || 0
                    ).toFixed(2)} STX
                  </div>
                </div>

                <button
                  className="donate-submit-btn"
                  onClick={handleSubmit}
                  disabled={(!selectedAmount && !customAmount) || isLoading}
                >
                  {isLoading ? 'Processing...' : `Donate $${selectedAmount || customAmount || '0'}`}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="donation-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Toast notification */}
        {toast && (
          <div className={`donation-toast ${toast.type}`}>
            <div className="donation-toast-content">
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <AlertCircle size={20} />}
              <div>
                <strong>{toast.title}</strong>
                <p>{toast.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationModal;
