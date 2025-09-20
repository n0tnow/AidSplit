# AidSplit Deployment Guide

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
- GitHub repository connected to Vercel
- Node.js 18+ environment

### Deployment Steps

1. **Fix React 19 Dependency Issues** ✅ (Completed)
   - Updated `lucide-react` to v0.460.0
   - Added npm overrides for React 19 compatibility
   - Created `.npmrc` with `legacy-peer-deps=true`

2. **Vercel Configuration**
   ```bash
   # Build Command (in Vercel dashboard)
   npm run build:vercel
   
   # Install Command
   npm install --legacy-peer-deps
   ```

3. **Environment Variables** (Set in Vercel Dashboard)
   ```env
   REACT_APP_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
   REACT_APP_NETWORK=testnet
   REACT_APP_URL=https://your-app.vercel.app
   ```

## 🏗️ Backend Deployment (Stacks Blockchain)

### Smart Contract Deployment

1. **Install Clarinet**
   ```bash
   # macOS
   brew install clarinet
   
   # Ubuntu/Linux
   curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-linux-x64.tar.gz | tar zx
   sudo mv clarinet /usr/local/bin
   ```

2. **Deploy to Testnet**
   ```bash
   # Navigate to project root
   cd /path/to/aidsplit
   
   # Deploy all contracts
   clarinet deployments generate --testnet
   clarinet deployments apply --testnet
   ```

3. **Update Contract Address**
   - Copy deployed contract address from deployment output
   - Update `REACT_APP_CONTRACT_ADDRESS` in Vercel environment variables
   - Update `frontend/src/lib/constants.ts`

### Contract Deployment Order
```bash
# Deploy in this exact order for dependencies
1. access-control.clar
2. company-auth.clar  
3. hierarchy-calculator.clar
4. nft-generator.clar
5. nft-receipts.clar
6. donation-targeting.clar
7. distribution-engine.clar
8. campaign-manager.clar
```

## 🔧 Integration Steps

### 1. Update Frontend Constants
```typescript
// frontend/src/lib/constants.ts
export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS';
export const NETWORK = 'testnet'; // or 'mainnet'
```

### 2. Test Blockchain Integration
```typescript
// Test basic connection
import { createCampaign, makeDonation } from './lib/stacks';

// Create test campaign
await createCampaign(
  "Test Campaign",
  "Test description", 
  "disaster-relief",
  "STX",
  1000,
  144000
);
```

### 3. Connect Wallet Integration
```typescript
// Already implemented in DisasterReliefPage.tsx
// Update mock functions with real blockchain calls
```

## 📊 Monitoring & Testing

### Frontend Testing
```bash
cd frontend
npm test
npm run build
```

### Smart Contract Testing  
```bash
clarinet test
clarinet console
```

### Integration Testing
1. Connect wallet (Hiro Wallet recommended)
2. Create test campaign
3. Make test donation
4. Claim test funds
5. Generate NFT receipt

## 🔍 Troubleshooting

### Common Vercel Issues
- **React 19 conflicts**: Fixed with overrides ✅
- **Build timeouts**: Use `npm run build:vercel` script
- **Missing env vars**: Check Vercel dashboard settings

### Common Stacks Issues
- **Contract deploy fails**: Check Clarinet.toml configuration
- **Function calls fail**: Verify contract address and network
- **Wallet connection issues**: Clear browser cache and reconnect

## 🌐 Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Smart contracts deployed to testnet
- [ ] Contract addresses updated in frontend
- [ ] Environment variables configured
- [ ] Wallet integration tested
- [ ] All core functions working
- [ ] Error handling implemented
- [ ] Analytics configured (optional)

## 📝 Next Steps

1. **Backend API** (Optional)
   - Create Express.js API for caching
   - Database integration for analytics
   - Webhook handlers for blockchain events

2. **Enhanced Features**
   - Real-time notifications
   - Advanced analytics dashboard  
   - Mobile app integration
   - Multi-language support

3. **Mainnet Deployment**
   - Security audit
   - Gas optimization
   - Production environment setup
   - Domain configuration
