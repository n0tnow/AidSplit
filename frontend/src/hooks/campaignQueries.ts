import { useState, useEffect } from 'react';
import { NETWORK_URLS, CONTRACT_ADDRESS, CONTRACTS, NETWORK } from '../lib/constants';

export interface ExistingDonation {
  stxAmount: number;
  sbtcAmount: number;
  totalDonations: number;
}

export interface CampaignInfo {
  start: number;
  end: number;
  goal: number;
  totalStx: number;
  totalSbtc: number;
  donationCount: number;
  isExpired: boolean;
  isWithdrawn: boolean;
  isCancelled: boolean;
}

// Hook to get existing donation for a user
export const useExistingDonation = (address: string | undefined) => {
  const [data, setData] = useState<ExistingDonation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }

    const fetchDonation = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch STX donation
        const stxResponse = await fetch(
          `${NETWORK_URLS[NETWORK]}/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACTS.FUNDRAISING_CAMPAIGN}/get-stx-donation/${address}`
        );
        
        // Fetch sBTC donation
        const sbtcResponse = await fetch(
          `${NETWORK_URLS[NETWORK]}/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACTS.FUNDRAISING_CAMPAIGN}/get-sbtc-donation/${address}`
        );

        let stxAmount = 0;
        let sbtcAmount = 0;

        if (stxResponse.ok) {
          const stxData = await stxResponse.json();
          if (stxData.okay && stxData.result) {
            stxAmount = parseInt(stxData.result.replace('u', '')) || 0;
          }
        }

        if (sbtcResponse.ok) {
          const sbtcData = await sbtcResponse.json();
          if (sbtcData.okay && sbtcData.result) {
            sbtcAmount = parseInt(sbtcData.result.replace('u', '')) || 0;
          }
        }

        setData({
          stxAmount,
          sbtcAmount,
          totalDonations: stxAmount + sbtcAmount
        });
      } catch (err) {
        console.error('Error fetching existing donation:', err);
        setError('Failed to fetch donation information');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonation();
  }, [address]);

  return { data, isLoading, error };
};

// Hook to get campaign information with auto-refresh
export const useCampaignInfo = (refreshInterval: number = 10000) => {
  const [data, setData] = useState<CampaignInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaignInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching campaign info from blockchain...');
      
      // Directly fetch campaign info using POST (required by Hiro API for read-only functions)
      const response = await fetch(
        `${NETWORK_URLS[NETWORK]}/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACTS.FUNDRAISING_CAMPAIGN}/get-campaign-info`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: CONTRACT_ADDRESS,
            arguments: []
          })
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.okay && responseData.result) {
          const result = responseData.result;
          
          // Always return campaign data, even if goal = 0 (set reasonable defaults)
          const goal = parseInt(result.goal?.replace('u', '') || '0');
          
          const campaignData = {
            start: parseInt(result.start?.replace('u', '') || '0'),
            end: parseInt(result.end?.replace('u', '') || '0'),
            goal: goal,
            totalStx: parseInt(result.totalStx?.replace('u', '') || '0'),
            totalSbtc: parseInt(result.totalSbtc?.replace('u', '') || '0'),
            donationCount: parseInt(result.donationCount?.replace('u', '') || '0'),
            isExpired: result.isExpired === true,
            isWithdrawn: result.isWithdrawn === true,
            isCancelled: result.isCancelled === true
          };
          
          console.log('✅ Campaign info updated:', {
            goal: campaignData.goal,
            totalStx: campaignData.totalStx,
            totalSbtc: campaignData.totalSbtc,
            donations: campaignData.donationCount
          });
          
          setData(campaignData);
          setError(null);
        } else {
          console.log('⚠️ No campaign data found in response');
          setData(null);
          setError('No campaign data available');
        }
      } else if (response.status === 404) {
        console.log('📝 Campaign contract not found or function not available');
        setData(null);
        setError('Campaign contract not found. Please check deployment.');
      } else {
        throw new Error(`HTTP ${response.status}: Failed to fetch campaign info`);
      }
    } catch (err) {
      console.error('❌ Error fetching campaign info:', err);
      setError(`Failed to fetch campaign information: ${err instanceof Error ? err.message : String(err)}`);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCampaignInfo();
    
    // Set up auto-refresh interval only if refreshInterval > 0
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchCampaignInfo();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return { data, isLoading, error, refetch: fetchCampaignInfo };
};
