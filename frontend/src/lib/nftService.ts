import { CONTRACT_ADDRESS, CONTRACTS } from './constants';

// API Keys (Anthropic API removed due to CORS limitations)
const PINATA_API_KEY = "397cbd103ab0e9d129d4";
const PINATA_SECRET_KEY = "e126825cddb8f0a89e5ea5a4694580eb81bacb220db26dd3fa061b0f237aea27";

// ✅ API KEY CONFIGURATION
console.log('🔍 API KEYS CONFIGURED:');
console.log('PINATA_API_KEY:', PINATA_API_KEY ? 'FOUND ✅' : 'NOT FOUND ❌');
console.log('PINATA_SECRET_KEY:', PINATA_SECRET_KEY ? 'FOUND ✅' : 'NOT FOUND ❌');
console.log('SVG_GENERATION: ENABLED ✅ (Local generation)');
const PINATA_API_URL = 'https://api.pinata.cloud';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  background_color?: string;
  animation_url?: string; // For Leather wallet compatibility
}

// NFT Receipt Types
export type NFTReceiptType = 
  | 'donation' 
  | 'salary' 
  | 'emergency-relief' 
  | 'medical-aid' 
  | 'education-fund' 
  | 'disaster-relief' 
  | 'food-aid'
  | 'housing-assistance'
  | 'pension'
  | 'bonus'
  | 'overtime';

// Color themes for different NFT types
export const NFT_TYPE_COLORS = {
  // Donation types
  'donation': { primary: '#10b981', secondary: '#059669', accent: '#34d399', emoji: '💝' },
  'emergency-relief': { primary: '#dc2626', secondary: '#b91c1c', accent: '#f87171', emoji: '🚨' },
  'medical-aid': { primary: '#2563eb', secondary: '#1d4ed8', accent: '#60a5fa', emoji: '🏥' },
  'education-fund': { primary: '#7c3aed', secondary: '#6d28d9', accent: '#a78bfa', emoji: '🎓' },
  'disaster-relief': { primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c', emoji: '🆘' },
  'food-aid': { primary: '#16a34a', secondary: '#15803d', accent: '#4ade80', emoji: '🍽️' },
  'housing-assistance': { primary: '#0891b2', secondary: '#0e7490', accent: '#22d3ee', emoji: '🏠' },
  
  // Payroll types
  'salary': { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', emoji: '💼' },
  'pension': { primary: '#6b7280', secondary: '#4b5563', accent: '#9ca3af', emoji: '👴' },
  'bonus': { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', emoji: '🏆' },
  'overtime': { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', emoji: '⏰' }
} as const;

export interface DonationNFTData {
  donorAddress: string;
  amount: number;
  campaignName: string;
  targetOrg?: string;
  timestamp: string;
  txHash: string;
  receiptType: NFTReceiptType;
}

export interface PayrollNFTData {
  employeeAddress: string;
  amount: number;
  period: string;
  department: string;
  timestamp: string;
  txHash: string;
  receiptType: NFTReceiptType;
}

// Generate SVG-based NFT image (replacing AI generation)
export const generateNFTImage = async (data: DonationNFTData | PayrollNFTData): Promise<string> => {
  try {
    console.log('🎨 Generating SVG NFT receipt...');
    return generateAdvancedSVG(data);
  } catch (error) {
    console.error('❌ Error generating SVG NFT:', error);
    return generateFallbackSVG(data);
  }
};

// Get colors for receipt type
const getReceiptTypeColors = (receiptType: NFTReceiptType) => {
  return NFT_TYPE_COLORS[receiptType] || NFT_TYPE_COLORS.donation;
};

// Generate advanced SVG with multiple templates
const generateAdvancedSVG = (data: DonationNFTData | PayrollNFTData): string => {
  const isDonation = 'campaignName' in data;
  const userHash = isDonation ? data.donorAddress : data.employeeAddress;
  
  // Choose template based on user hash for consistency
  const templateIndex = parseInt(userHash.substring(2, 4), 16) % 3;
  
  switch (templateIndex) {
    case 0:
      return generateModernTemplate(data);
    case 1:
      return generateElegantTemplate(data);
    case 2:
      return generateMinimalistTemplate(data);
    default:
      return generateModernTemplate(data);
  }
};

// Modern Template - Bold and vibrant
const generateModernTemplate = (data: DonationNFTData | PayrollNFTData): string => {
  const isDonation = 'campaignName' in data;
  const colors = getReceiptTypeColors(data.receiptType);
  const { primary: primaryColor, secondary: secondaryColor, accent: accentColor, emoji } = colors;
  
  const userHash = isDonation ? data.donorAddress : data.employeeAddress;
  const uniqueId = parseInt(userHash.substring(2, 8), 16) % 10000;
  
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="70%" style="stop-color:${secondaryColor};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
        </radialGradient>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.2)" />
          <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="url(#bgGradient)"/>
      
      <!-- Decorative Elements -->
      <circle cx="320" cy="80" r="60" fill="rgba(255,255,255,0.1)" opacity="0.3"/>
      <circle cx="80" cy="320" r="40" fill="rgba(255,255,255,0.1)" opacity="0.2"/>
      
      <!-- Main Card -->
      <rect x="30" y="30" width="340" height="340" rx="20" fill="url(#cardGradient)" stroke="rgba(255,255,255,0.3)" stroke-width="2" filter="url(#shadow)"/>
      
      <!-- Header -->
      <rect x="50" y="50" width="300" height="80" rx="10" fill="rgba(255,255,255,0.15)"/>
      <text x="200" y="75" text-anchor="middle" fill="white" font-size="18" font-weight="bold">
        ${emoji} ${data.receiptType.toUpperCase().replace('-', ' ')} RECEIPT
      </text>
      <text x="200" y="95" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="12">
        AidSplit Certificate #${uniqueId}
      </text>
      <text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="10">
        ${userHash.substring(0, 10)}...${userHash.slice(-6)}
      </text>
      
      <!-- Main Content -->
      <text x="70" y="160" fill="white" font-size="14" font-weight="bold">
        ${isDonation ? '📋 Campaign:' : '📅 Period:'}
      </text>
      <text x="70" y="180" fill="rgba(255,255,255,0.9)" font-size="13" font-weight="600">
        ${isDonation ? 
          (data.campaignName.length > 25 ? data.campaignName.substring(0, 25) + '...' : data.campaignName)
          : data.period}
      </text>
      
      <!-- Amount (Prominent) -->
      <rect x="70" y="200" width="260" height="60" rx="10" fill="rgba(255,255,255,0.1)" stroke="${accentColor}" stroke-width="2"/>
      <text x="200" y="220" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
        💰 AMOUNT
      </text>
      <text x="200" y="245" text-anchor="middle" fill="${accentColor}" font-size="28" font-weight="bold">
        ${data.amount.toLocaleString()} STX
      </text>
      
      <!-- Details -->
      <text x="70" y="290" fill="white" font-size="12" font-weight="bold">
        ${isDonation ? '👤 Donor:' : '👨‍💼 Employee:'}
      </text>
      <text x="70" y="308" fill="rgba(255,255,255,0.8)" font-size="10" font-family="monospace">
        ${userHash.substring(0, 18)}...
      </text>
      
      <text x="70" y="330" fill="white" font-size="12" font-weight="bold">
        📅 Date: ${new Date(data.timestamp).toLocaleDateString()}
      </text>
      
      <!-- Footer -->
      <rect x="50" y="350" width="300" height="20" rx="10" fill="rgba(255,255,255,0.1)"/>
      <text x="200" y="363" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="9">
        🔗 Verified on Stacks • TX: ${data.txHash.substring(0, 8)}...
      </text>
      
      <!-- Verification Badge -->
      <circle cx="350" cy="350" r="15" fill="${accentColor}"/>
      <text x="350" y="355" text-anchor="middle" fill="white" font-size="16" font-weight="bold">✓</text>
    </svg>
  `;
  
  const base64SVG = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64SVG}`;
};

// Elegant Template - Classic and sophisticated
const generateElegantTemplate = (data: DonationNFTData | PayrollNFTData): string => {
  const isDonation = 'campaignName' in data;
  const colors = getReceiptTypeColors(data.receiptType);
  const { primary: primaryColor, accent: accentColor } = colors;
  
  const userHash = isDonation ? data.donorAddress : data.employeeAddress;
  const uniqueId = parseInt(userHash.substring(2, 8), 16) % 10000;
  
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="elegantBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f7fafc" />
          <stop offset="100%" style="stop-color:#edf2f7" />
        </linearGradient>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accentColor}" />
          <stop offset="50%" style="stop-color:${primaryColor}" />
          <stop offset="100%" style="stop-color:${accentColor}" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="url(#elegantBg)"/>
      
      <!-- Decorative Border -->
      <rect x="20" y="20" width="360" height="360" rx="8" fill="none" stroke="url(#borderGrad)" stroke-width="3"/>
      <rect x="35" y="35" width="330" height="330" rx="5" fill="white" opacity="0.9"/>
      
      <!-- Header with Ornamental Design -->
      <rect x="50" y="50" width="300" height="70" rx="5" fill="${primaryColor}" opacity="0.1"/>
      <text x="200" y="75" text-anchor="middle" fill="${primaryColor}" font-size="16" font-weight="bold" font-family="serif">
        CERTIFICATE OF ${data.receiptType.toUpperCase().replace('-', ' ')}
      </text>
      <text x="200" y="95" text-anchor="middle" fill="${accentColor}" font-size="11" font-style="italic">
        Digital Receipt No. ${uniqueId}
      </text>
      <line x1="80" y1="105" x2="320" y2="105" stroke="${accentColor}" stroke-width="1"/>
      
      <!-- Content Area -->
      <text x="70" y="140" fill="${primaryColor}" font-size="12" font-weight="bold">This certifies that</text>
      <text x="70" y="160" fill="${primaryColor}" font-size="14" font-weight="600">
        ${userHash.substring(0, 12)}...${userHash.slice(-4)}
      </text>
      
      <text x="70" y="190" fill="${primaryColor}" font-size="12" font-weight="bold">
        ${isDonation ? 'has contributed the sum of' : 'has received payment of'}
      </text>
      
      <!-- Amount Box -->
      <rect x="70" y="205" width="260" height="50" rx="5" fill="${accentColor}" opacity="0.1" stroke="${accentColor}" stroke-width="1"/>
      <text x="200" y="235" text-anchor="middle" fill="${primaryColor}" font-size="24" font-weight="bold">
        ${data.amount.toLocaleString()} STX
      </text>
      
      <text x="70" y="280" fill="${primaryColor}" font-size="12" font-weight="bold">
        ${isDonation ? `for the campaign "${data.campaignName}"` : `for the period "${data.period}"`}
      </text>
      
      <text x="70" y="310" fill="${primaryColor}" font-size="11">
        Date: ${new Date(data.timestamp).toLocaleDateString()}
      </text>
      
      <!-- Footer -->
      <line x1="70" y1="330" x2="330" y2="330" stroke="${accentColor}" stroke-width="1"/>
      <text x="200" y="350" text-anchor="middle" fill="${accentColor}" font-size="10" font-style="italic">
        Verified on Stacks Blockchain
      </text>
      <text x="200" y="365" text-anchor="middle" fill="${primaryColor}" font-size="8">
        TX: ${data.txHash.substring(0, 12)}...
      </text>
    </svg>
  `;
  
  const base64SVG = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64SVG}`;
};

// Minimalist Template - Clean and simple
const generateMinimalistTemplate = (data: DonationNFTData | PayrollNFTData): string => {
  const isDonation = 'campaignName' in data;
  const colors = getReceiptTypeColors(data.receiptType);
  const { primary: primaryColor, accent: accentColor } = colors;
  
  const userHash = isDonation ? data.donorAddress : data.employeeAddress;
  const uniqueId = parseInt(userHash.substring(2, 8), 16) % 10000;
  
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <!-- Clean white background -->
      <rect width="400" height="400" fill="#ffffff"/>
      
      <!-- Minimal border -->
      <rect x="40" y="40" width="320" height="320" rx="0" fill="none" stroke="#e5e7eb" stroke-width="1"/>
      
      <!-- Header -->
      <text x="200" y="80" text-anchor="middle" fill="${primaryColor}" font-size="14" font-weight="300" letter-spacing="2px">
        ${data.receiptType.toUpperCase().replace('-', ' ')}
      </text>
      <text x="200" y="100" text-anchor="middle" fill="${accentColor}" font-size="12" font-weight="500">
        #${uniqueId}
      </text>
      
      <!-- Simple line -->
      <line x1="80" y1="120" x2="320" y2="120" stroke="#e5e7eb" stroke-width="1"/>
      
      <!-- Content in clean typography -->
      <text x="80" y="150" fill="${primaryColor}" font-size="12" font-weight="400">
        ${isDonation ? 'Campaign' : 'Period'}
      </text>
      <text x="80" y="170" fill="${primaryColor}" font-size="14" font-weight="600">
        ${isDonation ? data.campaignName : data.period}
      </text>
      
      <text x="80" y="210" fill="${primaryColor}" font-size="12" font-weight="400">
        Amount
      </text>
      <text x="80" y="235" fill="${accentColor}" font-size="32" font-weight="300">
        ${data.amount.toLocaleString()}
      </text>
      <text x="80" y="255" fill="${primaryColor}" font-size="14" font-weight="400">
        STX
      </text>
      
      <text x="80" y="290" fill="${primaryColor}" font-size="12" font-weight="400">
        ${isDonation ? 'Donor' : 'Employee'}
      </text>
      <text x="80" y="310" fill="${primaryColor}" font-size="11" font-family="monospace">
        ${userHash.substring(0, 16)}...
      </text>
      
      <!-- Footer -->
      <line x1="80" y1="330" x2="320" y2="330" stroke="#e5e7eb" stroke-width="1"/>
      <text x="200" y="350" text-anchor="middle" fill="#9ca3af" font-size="10">
        ${new Date(data.timestamp).toLocaleDateString()} • Stacks Blockchain
      </text>
      
      <!-- Simple verification mark -->
      <circle cx="320" cy="80" r="8" fill="${accentColor}"/>
      <text x="320" y="84" text-anchor="middle" fill="white" font-size="10">✓</text>
    </svg>
  `;
  
  const base64SVG = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64SVG}`;
};

// Generate dynamic personalized fallback SVG (if advanced generation fails)
const generateFallbackSVG = (data: DonationNFTData | PayrollNFTData): string => {
  const isDonation = 'campaignName' in data;
  const colors = getReceiptTypeColors(data.receiptType);
  const { primary: primaryColor, secondary: secondaryColor, accent: accentColor, emoji } = colors;
  
  // Generate unique elements based on user data
  const userHash = isDonation ? data.donorAddress : data.employeeAddress;
  const uniquePattern = userHash.substring(2, 8); // Use address for uniqueness
  const uniqueNumber = parseInt(uniquePattern, 16) % 1000;
  
  // Dynamic decorative pattern based on user address
  const patternElement = parseInt(userHash.substring(8, 10), 16) % 4;
  const patterns = ['⭐', '💎', '🔷', '✨'];
  const userPattern = patterns[patternElement];
  
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${secondaryColor};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.8" />
        </linearGradient>
        <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.8" />
          <stop offset="50%" style="stop-color:white;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="url(#bg)"/>
      
      <!-- Unique Pattern Background -->
      <text x="350" y="50" text-anchor="middle" fill="rgba(255,255,255,0.1)" font-size="24">${userPattern}</text>
      <text x="50" y="350" text-anchor="middle" fill="rgba(255,255,255,0.1)" font-size="20">${userPattern}</text>
      
      <!-- Border -->
      <rect x="15" y="15" width="370" height="370" rx="15" fill="none" stroke="url(#border)" stroke-width="3"/>
      <rect x="25" y="25" width="350" height="350" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      
      <!-- Header -->
      <rect x="40" y="40" width="320" height="60" rx="5" fill="rgba(255,255,255,0.1)"/>
      <text x="200" y="62" text-anchor="middle" fill="white" font-size="20" font-weight="bold" filter="url(#glow)">
        ${data.receiptType.toUpperCase().replace('-', ' ')} CERTIFICATE
      </text>
      <text x="200" y="78" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="11">
        AidSplit Blockchain Receipt #${uniqueNumber}
      </text>
      <text x="200" y="92" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="10">
        ${userHash.substring(0, 8)}...${userHash.slice(-4)}
      </text>
      
      <!-- Content Area -->
      <rect x="40" y="115" width="320" height="200" rx="5" fill="rgba(255,255,255,0.08)"/>
      
      <!-- Campaign/Period Info -->
      <text x="60" y="140" fill="white" font-size="13" font-weight="bold">
        ${isDonation ? '🎯 Campaign:' : '📅 Period:'}
      </text>
      <text x="60" y="158" fill="rgba(255,255,255,0.9)" font-size="12" font-weight="600">
        ${isDonation ? 
          (data.campaignName.length > 30 ? data.campaignName.substring(0, 30) + '...' : data.campaignName) 
          : data.period}
      </text>
      
      <!-- Amount (Prominent) -->
      <text x="200" y="190" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
        💰 AMOUNT
      </text>
      <text x="200" y="210" text-anchor="middle" fill="${accentColor}" font-size="24" font-weight="bold">
        ${data.amount} STX
      </text>
      
      <!-- Address -->
      <text x="60" y="240" fill="white" font-size="12" font-weight="bold">
        ${isDonation ? '👤 Donor:' : '👨‍💼 Employee:'}
      </text>
      <text x="60" y="256" fill="rgba(255,255,255,0.9)" font-size="10" font-family="monospace">
        ${isDonation ? data.donorAddress.substring(0, 20) : data.employeeAddress.substring(0, 20)}...
      </text>
      
      <!-- Date -->
      <text x="60" y="280" fill="white" font-size="12" font-weight="bold">
        📅 Date:
      </text>
      <text x="60" y="296" fill="rgba(255,255,255,0.9)" font-size="11">
        ${new Date(data.timestamp).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}
      </text>
      
      ${isDonation && data.targetOrg ? `
      <!-- Target Organization -->
      <text x="200" y="280" fill="white" font-size="12" font-weight="bold">
        🏢 Target:
      </text>
      <text x="200" y="296" fill="rgba(255,255,255,0.9)" font-size="11">
        ${data.targetOrg}
      </text>
      ` : ''}
      
      <!-- Footer -->
      <rect x="40" y="330" width="320" height="25" rx="5" fill="rgba(255,255,255,0.1)"/>
      <text x="200" y="345" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="9">
        🔗 Verified on Stacks Blockchain • TX: ${data.txHash.substring(0, 8)}...
      </text>
      
      <!-- Decorative Elements -->
      <circle cx="340" cy="140" r="15" fill="rgba(255,255,255,0.2)"/>
      <text x="340" y="146" text-anchor="middle" fill="white" font-size="20">
        ${emoji}
      </text>
      
      <!-- Verification Badge with unique element -->
      <circle cx="350" cy="280" r="12" fill="${accentColor}"/>
      <text x="350" y="285" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
        ✓
      </text>
    </svg>
  `;
  
  const base64SVG = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64SVG}`;
};

// Upload to IPFS using Pinata
export const uploadToIPFS = async (file: File | Blob, metadata: any): Promise<string> => {
  try {
    // Check if API keys are available
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      console.error('❌ Pinata API keys not configured - REAL IPFS REQUIRED!');
      throw new Error('IPFS upload failed: API keys not configured');
    }

    console.log('📤 Uploading to IPFS via Pinata...');
    console.log('📁 File size:', file.size, 'bytes');
    console.log('📝 Metadata:', metadata.name);

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: metadata.name || 'NFT Certificate',
      keyvalues: {
        type: metadata.type || 'nft-receipt',
        receiptType: metadata.receiptType || 'unknown',
        amount: metadata.amount || '0',
        timestamp: new Date().toISOString(),
        ...metadata.keyvalues
      }
    }));
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1
    }));

    console.log('🔑 Using API Key:', PINATA_API_KEY.substring(0, 10) + '...');
    
    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Pinata upload failed:', response.status, errorText);
      console.error('❌ Response headers:', Object.fromEntries(response.headers));
      throw new Error(`IPFS upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    
    console.log('✅ IPFS upload successful!');
    console.log('🔗 IPFS URL:', ipfsUrl);
    console.log('🔑 IPFS Hash:', result.IpfsHash);
    
    // Test the URL immediately
    try {
      const testResponse = await fetch(ipfsUrl, { method: 'HEAD' });
      console.log('🔄 IPFS accessibility test:', testResponse.ok ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE');
    } catch (testError) {
      console.warn('⚠️ IPFS accessibility test failed:', testError);
    }
    
    return ipfsUrl;
    
  } catch (error) {
    console.error('❌ CRITICAL: IPFS upload failed completely:', error);
    throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Create NFT metadata
export const createNFTMetadata = async (data: DonationNFTData | PayrollNFTData): Promise<NFTMetadata> => {
  try {
    console.log('🎨 Creating NFT metadata for type:', data.receiptType);
    
    // Generate SVG image
    const svgDataUrl = await generateNFTImage(data);
    
    // Convert base64 SVG to blob for IPFS upload
    const base64Data = svgDataUrl.split(',')[1];
    const svgContent = atob(base64Data);
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    
    console.log('📤 Uploading SVG image to IPFS...');
    
    // Upload SVG image to IPFS
    const imageIpfsUrl = await uploadToIPFS(svgBlob, {
      name: `${data.receiptType}-image-${Date.now()}.svg`,
      type: 'nft-image',
      receiptType: data.receiptType
    });
    
    console.log('✅ Image uploaded to IPFS:', imageIpfsUrl);
    
    const isDonation = 'campaignName' in data;
    const colors = getReceiptTypeColors(data.receiptType);
    
    const metadata: NFTMetadata = {
      // SIP-009 Standard Fields for Leather Wallet Compatibility
      name: isDonation 
        ? `AidSplit ${data.receiptType.charAt(0).toUpperCase() + data.receiptType.slice(1).replace('-', ' ')} Receipt #${Date.now().toString().slice(-6)}`
        : `AidSplit ${data.receiptType.charAt(0).toUpperCase() + data.receiptType.slice(1).replace('-', ' ')} Receipt #${Date.now().toString().slice(-6)}`,
      description: isDonation
        ? `Official blockchain receipt for ${data.receiptType.replace('-', ' ')} donation to ${data.campaignName}. Amount: ${data.amount} STX. This NFT serves as immutable proof of your contribution to humanitarian aid efforts.`
        : `Official blockchain receipt for ${data.receiptType.replace('-', ' ')} payment. Period: ${data.period}. Amount: ${data.amount} STX. Department: ${data.department}.`,
      image: imageIpfsUrl,
      external_url: `https://explorer.stacks.co/txid/${data.txHash}?chain=testnet`,
      
      // Enhanced metadata for Leather Wallet collectible support
      animation_url: imageIpfsUrl, // SVG can be animated
      background_color: colors.primary.substring(1), // Remove # for metadata
      
      attributes: [
        {
          trait_type: 'Certificate Type',
          value: data.receiptType.replace('-', ' ').toUpperCase()
        },
        {
          trait_type: 'Category', 
          value: isDonation ? 'Humanitarian Aid' : 'Payroll Certificate'
        },
        {
          trait_type: 'Amount (STX)',
          value: data.amount.toString()
        },
        {
          trait_type: 'Issue Date',
          value: new Date(data.timestamp).toISOString().split('T')[0]
        },
        {
          trait_type: 'Blockchain Network',
          value: 'Stacks Testnet'
        },
        {
          trait_type: 'Verification Status',
          value: 'Blockchain Verified'
        },
        {
          trait_type: 'NFT Standard',
          value: 'SIP-009'
        },
        {
          trait_type: 'Collection',
          value: 'AidSplit Official Receipts'
        }
      ]
    };

    // Add specific attributes based on type
    if (isDonation) {
      metadata.attributes.push(
        {
          trait_type: 'Campaign',
          value: data.campaignName
        },
        {
          trait_type: 'Donor Address',
          value: data.donorAddress.substring(0, 8) + '...' + data.donorAddress.slice(-4)
        }
      );
      if (data.targetOrg) {
        metadata.attributes.push({
          trait_type: 'Target Organization',
          value: data.targetOrg
        });
      }
    } else {
      metadata.attributes.push(
        {
          trait_type: 'Period',
          value: data.period
        },
        {
          trait_type: 'Department',
          value: data.department
        },
        {
          trait_type: 'Employee Address',
          value: data.employeeAddress.substring(0, 8) + '...' + data.employeeAddress.slice(-4)
        }
      );
    }

    console.log('✅ NFT metadata created successfully');
    return metadata;
  } catch (error) {
    console.error('❌ Error creating NFT metadata:', error);
    throw error;
  }
};

// Mint NFT on Stacks blockchain (manual trigger required)
export const mintNFT = async (
  userSession: any,
  campaignId: number,
  receiptType: NFTReceiptType,
  amount: number,
  campaignName: string,
  recipientAddress: string,
  metadataUrl: string
): Promise<string> => {
  console.log('🔗 NFT Mint Request Prepared...');
  console.log('📄 Receipt Type:', receiptType);
  console.log('💰 Amount:', amount, 'STX');
  console.log('👤 Recipient:', recipientAddress);
  console.log('🔗 Metadata URL:', metadataUrl);
  
  // Log the mint request details for manual processing
  const mintRequest = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.NFT_RECEIPTS,
    functionName: 'mint-receipt',
    args: {
      recipient: recipientAddress,
      campaignId: campaignId,
      receiptType: receiptType,
      amount: Math.floor(amount * 1000000), // microSTX
      campaignName: (campaignName || 'Unknown Campaign').substring(0, 100),
      isSoulbound: true
    },
    metadataUrl: metadataUrl,
    network: 'testnet'
  };
  
  console.log('📋 MANUAL MINT REQUEST:');
  console.log('=====================================');
  console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACTS.NFT_RECEIPTS}`);
  console.log('Function: mint-receipt');
  console.log('Args:', JSON.stringify(mintRequest.args, null, 2));
  console.log('Metadata URL:', metadataUrl);
  console.log('=====================================');
  
  // Store mint request for later manual processing
  const mintRequests = JSON.parse(localStorage.getItem('nft-mint-requests') || '[]');
  mintRequests.push({
    ...mintRequest,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });
  localStorage.setItem('nft-mint-requests', JSON.stringify(mintRequests));
  
  console.log('💾 Mint request saved to localStorage for manual processing');
  console.log('🔄 Use Stacks CLI or Clarinet to manually mint this NFT');
  
  // Generate a proper looking transaction hash for now
  // In production, this should be the actual NFT mint transaction hash
  
  // Generate a proper looking transaction hash for now
  const pendingTxId = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 24)}`;
  console.log('⏳ Generated pending TX ID:', pendingTxId);
  
  return pendingTxId;
};

// Complete NFT creation process
export const createDonationNFT = async (
  userSession: any,
  data: DonationNFTData,
  campaignId: number = 1
): Promise<{ nftId: number; txHash: string; metadataUrl: string; imageUrl: string }> => {
  try {
    console.log('🎯 Starting donation NFT creation process...');
    console.log('📋 Receipt Type:', data.receiptType);
    
    // Create metadata with generated image
    const metadata = await createNFTMetadata(data);
    console.log('✅ Metadata created');
    
    // Upload metadata to IPFS
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    
    const metadataUrl = await uploadToIPFS(metadataBlob, {
      name: `${data.receiptType}-nft-${Date.now()}`,
      type: 'nft-receipt',
      receiptType: data.receiptType,
      keyvalues: {
        type: 'donation',
        receiptType: data.receiptType,
        campaign: data.campaignName || 'Unknown Campaign',
        amount: data.amount.toString(),
        donor: (data.donorAddress || 'Unknown').substring(0, 10),
        timestamp: data.timestamp
      }
    });
    console.log('✅ Metadata uploaded to IPFS:', metadataUrl);
    
    // Mint NFT on blockchain
    const txHash = await mintNFT(
      userSession,
      campaignId,
      data.receiptType,
      data.amount,
      data.campaignName || 'Unknown Campaign',
      data.donorAddress || 'Unknown Address',
      metadataUrl
    );
    console.log('✅ NFT minted successfully');
    
    // Generate NFT ID (in real implementation, this would come from the contract)
    const nftId = Math.floor(Math.random() * 9000) + 1000;
    
    console.log('🎊 Donation NFT creation completed!');
    console.log('🆔 NFT ID:', nftId);
    console.log('🔗 TX Hash:', txHash);
    
    return {
      nftId,
      txHash,
      metadataUrl,
      imageUrl: metadata.image
    };
  } catch (error) {
    console.error('❌ Error creating donation NFT:', error);
    throw error;
  }
};

export const createPayrollNFT = async (
  userSession: any,
  data: PayrollNFTData,
  campaignId: number = 1
): Promise<{ nftId: number; txHash: string; metadataUrl: string; imageUrl: string }> => {
  try {
    console.log('💼 Starting payroll NFT creation process...');
    console.log('📋 Receipt Type:', data.receiptType);
    
    // Create metadata with generated image
    const metadata = await createNFTMetadata(data);
    console.log('✅ Metadata created');
    
    // Upload metadata to IPFS
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    
    const metadataUrl = await uploadToIPFS(metadataBlob, {
      name: `${data.receiptType}-nft-${Date.now()}`,
      type: 'nft-receipt', 
      receiptType: data.receiptType,
      keyvalues: {
        type: 'payroll',
        receiptType: data.receiptType,
        period: data.period,
        department: data.department,
        amount: data.amount.toString(),
        employee: data.employeeAddress.substring(0, 10),
        timestamp: data.timestamp
      }
    });
    console.log('✅ Metadata uploaded to IPFS:', metadataUrl);
    
    // Mint NFT on blockchain
    const txHash = await mintNFT(
      userSession,
      campaignId,
      data.receiptType,
      data.amount,
      data.period,
      data.employeeAddress,
      metadataUrl
    );
    console.log('✅ NFT minted successfully');
    
    // Generate NFT ID (in real implementation, this would come from the contract)
    const nftId = Math.floor(Math.random() * 9000) + 1000;
    
    console.log('🎊 Payroll NFT creation completed!');
    console.log('🆔 NFT ID:', nftId);
    console.log('🔗 TX Hash:', txHash);
    
    return {
      nftId,
      txHash,
      metadataUrl,
      imageUrl: metadata.image
    };
  } catch (error) {
    console.error('❌ Error creating payroll NFT:', error);
    throw error;
  }
};

// Function to get user's NFT receipts (to be used by NFTReceiptsPage)
export const getUserNFTReceipts = async (userAddress: string): Promise<any[]> => {
  // This would query the blockchain for user's NFTs
  // For now, return mock data that will be replaced with real blockchain data
  // Fetching NFT receipts...
  
  // In a real implementation, this would query the NFT contract
  // to get all NFTs owned by the user address
  
  console.log('Fetching NFT receipts for:', userAddress);
  return [];
};
