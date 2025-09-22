# 🤝 AidSplit - Blockchain-Based Disaster Relief Platform

<p align="center">
  <img src="https://via.placeholder.com/200x200/10B981/FFFFFF?text=AidSplit" alt="AidSplit Logo" width="200" height="200">
</p>

<p align="center">
  <strong>A decentralized disaster relief platform built on Stacks blockchain</strong>
</p>

<p align="center">
  <a href="https://aid-split.vercel.app">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#screenshots">📸 Screenshots</a> •
  <a href="#installation">⚡ Installation</a> •
  <a href="#usage">📖 Usage</a>
</p>

---

## 🌟 Overview

AidSplit is a revolutionary blockchain-based disaster relief platform that enables transparent, efficient, and accountable distribution of aid to those in need. Built on the Stacks blockchain, AidSplit ensures that every donation is tracked, every recipient is verified, and every transaction is immutable.

### 🎯 Mission
To create a transparent, efficient, and trustworthy ecosystem for disaster relief funding and distribution, leveraging blockchain technology to ensure accountability and maximize impact.

## ✨ Features

### 🆘 Disaster Relief Campaigns
- **Campaign Creation**: Create targeted disaster relief campaigns for specific events
- **Smart Distribution**: Automated fund distribution based on predefined criteria
- **Real-time Tracking**: Track donation progress and fund allocation in real-time
- **Multi-organization Support**: Multiple relief organizations can participate in single campaigns

### 💰 Transparent Donations
- **STX & sBTC Support**: Accept donations in multiple cryptocurrencies
- **Instant Processing**: Blockchain-based instant transaction processing
- **Public Ledger**: All transactions recorded on immutable blockchain
- **Donation History**: Complete audit trail for all contributions

### 🎫 NFT Receipt System
- **Donation Receipts**: Automatically generated NFT receipts for all donations
- **Proof of Impact**: Immutable proof of contribution to relief efforts
- **Collectible Badges**: Unique artistic NFTs representing donation milestones
- **Transferable Assets**: Recipients can trade or showcase their contribution NFTs

### 🏢 Company Management System
- **Employee Management**: Comprehensive CRUD operations for staff management
- **Department Organization**: Structured department and role management
- **Payroll Integration**: Blockchain-based salary and compensation tracking
- **Access Control**: Role-based permissions and security controls

### 📊 Advanced Analytics
- **Impact Metrics**: Real-time tracking of aid distribution effectiveness
- **Financial Transparency**: Detailed breakdown of fund allocation
- **Performance Reports**: Comprehensive reporting on campaign success
- **Blockchain Verification**: All data verified through smart contracts

### 🔐 Security & Compliance
- **Smart Contract Auditing**: Thoroughly tested and verified contracts
- **Multi-signature Wallets**: Enhanced security for large transactions
- **Regulatory Compliance**: Built with international aid standards in mind
- **Data Privacy**: GDPR-compliant data handling and storage

## 📸 Screenshots

### 🏠 Homepage
> *Screenshot placeholder: Main landing page showing platform overview*
<!-- Add homepage screenshot here -->

### 🆘 Disaster Relief Campaigns
> *Screenshot placeholder: Campaign listing page with active relief campaigns*
<!-- Add campaigns page screenshot here -->

### 💳 Donation Process
> *Screenshot placeholder: Step-by-step donation flow*
<!-- Add donation process screenshot here -->

### 🎫 NFT Receipt Generation
> *Screenshot placeholder: NFT receipt creation and display*
<!-- Add NFT receipt screenshot here -->

### 🏢 Company Management Dashboard
> *Screenshot placeholder: Admin dashboard for company management*
<!-- Add company management screenshot here -->

### 📊 Analytics Dashboard
> *Screenshot placeholder: Real-time analytics and reporting*
<!-- Add analytics dashboard screenshot here -->

### 📱 Mobile Experience
> *Screenshot placeholder: Mobile-responsive interface*
<!-- Add mobile screenshot here -->

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **CSS3 + Flexbox/Grid** - Responsive design
- **Stacks Connect** - Wallet integration

### Blockchain
- **Stacks Blockchain** - Bitcoin-secured smart contracts
- **Clarity** - Smart contract language
- **Clarinet** - Development and testing framework

### Backend Services
- **Hiro API** - Stacks blockchain integration
- **IPFS (Pinata)** - Decentralized file storage
- **Anthropic AI** - Enhanced user experience

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **Vercel** - Deployment platform

## ⚡ Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git
- Stacks wallet (Hiro Wallet recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/n0tnow/AidSplit.git
   cd AidSplit
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Visit application**
   Open http://localhost:3000 in your browser

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Stacks Network Configuration
REACT_APP_NETWORK=testnet
REACT_APP_CONTRACT_ADDRESS=your_contract_address_here
REACT_APP_HIRO_API_KEY=your_hiro_api_key_here

# Optional APIs for enhanced features
# REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
# REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
# REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key_here
```

## 📖 Usage Guide

### For Donors

1. **Connect Wallet**: Connect your Stacks wallet (Hiro Wallet recommended)
2. **Browse Campaigns**: Explore active disaster relief campaigns
3. **Make Donation**: Choose amount and contribute to campaigns
4. **Receive NFT**: Get unique NFT receipt as proof of donation
5. **Track Impact**: Monitor how your donation is being used

### For Relief Organizations

1. **Register Organization**: Submit organization verification
2. **Create Campaigns**: Set up targeted relief campaigns
3. **Manage Distribution**: Allocate funds to beneficiaries
4. **Report Progress**: Update donors on relief efforts
5. **Claim Funds**: Withdraw allocated funds for operations

### For Administrators

1. **Access Admin Panel**: Use admin credentials to access management
2. **Approve Organizations**: Verify and approve relief organizations
3. **Monitor Campaigns**: Oversee all platform activities
4. **Generate Reports**: Create transparency and impact reports
5. **Manage System**: Maintain platform health and security

## 🏗️ Smart Contracts

### Core Contracts

- **campaign-manager-v6**: Main campaign logic and fund management
- **company-auth-v6**: Authentication and authorization system
- **nft-receipts-v6**: NFT generation and management
- **distribution-engine-v6**: Automated fund distribution
- **fundraising-campaign-v1**: Fundraising campaign operations

### Contract Deployment

Contracts are deployed on Stacks testnet:
- Network: Testnet
- Address: `STBMFWFXC4VKC5PEZDXPR0JAKEJ5WCH3KA0D1EP4`

## 🔧 Development

### Project Structure
```
AidSplit/
├── contracts/           # Clarity smart contracts
├── deployments/        # Deployment configurations
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── lib/       # Utility functions and services
│   │   ├── hooks/     # Custom React hooks
│   │   └── contexts/  # React context providers
├── scripts/           # Automation scripts
└── README.md         # Project documentation
```

### Available Scripts

```bash
# Development
npm start              # Start development server
npm run build         # Build for production
npm test              # Run test suite

# Smart Contracts
clarinet check        # Validate contracts
clarinet test         # Run contract tests
clarinet deploy       # Deploy to network
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 🌐 Live Demo

Visit the live application: **[https://aid-split.vercel.app](https://aid-split.vercel.app)**

### Demo Features Available:
- ✅ Browse active disaster relief campaigns
- ✅ Connect Stacks wallet
- ✅ Make test donations (testnet STX)
- ✅ Receive NFT receipts
- ✅ View company management system
- ✅ Access admin dashboard (with appropriate permissions)

### Test Credentials:
Use testnet STX for donations. Get testnet STX from the [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet).

## 📊 Platform Statistics

> *Update these with real numbers as the platform grows*

- 🎯 **Active Campaigns**: 12
- 💰 **Total Donations**: 25,000 STX
- 🏢 **Partner Organizations**: 8
- 🎫 **NFTs Issued**: 1,247
- 🌍 **Countries Served**: 15

## 🛡️ Security

### Smart Contract Security
- All contracts undergo thorough testing
- Multi-signature requirements for large transactions
- Time-locked withdrawals for added security
- Regular security audits

### Data Protection
- No sensitive data stored on-chain
- GDPR-compliant data handling
- Encrypted communication channels
- Regular security updates

## 🤝 Partners & Supporters

<!-- Add partner logos/links here -->
- International Relief Organizations
- Blockchain Development Communities
- Educational Institutions
- Technology Partners

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

- **Website**: [https://aid-split.vercel.app](https://aid-split.vercel.app)
- **GitHub**: [https://github.com/n0tnow/AidSplit](https://github.com/n0tnow/AidSplit)
- **Issues**: [GitHub Issues](https://github.com/n0tnow/AidSplit/issues)

## 🙏 Acknowledgments

- Stacks Foundation for blockchain infrastructure
- Hiro for development tools and APIs
- Open source community for inspiration and support
- All donors and relief organizations making impact possible

---

<p align="center">
  <strong>Built with ❤️ for humanitarian causes</strong>
</p>

<p align="center">
  Made possible by blockchain technology and community support
</p>