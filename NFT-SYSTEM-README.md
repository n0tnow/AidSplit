# 🎨 AidSplit NFT Receipt System

## ✨ Tamamen Yenilenmiş NFT Sistemi

### 🚀 Özellikler

#### 📋 **11 Farklı Receipt Tipi**
- **🎯 Donation Types:**
  - 💝 General Donation
  - 🚨 Emergency Relief  
  - 🏥 Medical Aid
  - 🎓 Education Fund
  - 🆘 Disaster Relief
  - 🍽️ Food Aid
  - 🏠 Housing Assistance

- **💼 Payroll Types:**
  - 💼 Monthly Salary
  - 🏆 Performance Bonus
  - 👴 Pension Payment
  - ⏰ Overtime Payment

#### 🎨 **3 SVG Template Sistemi**
- **Modern Template**: Bold ve vibrant tasarım
- **Elegant Template**: Klasik ve sofistike
- **Minimalist Template**: Temiz ve sade

#### 🌈 **Tip-Specific Color System**
Her receipt tipi için özel renk paleti ve emoji

#### 🔗 **Tam Blockchain Entegrasyonu**
- SVG oluşturma → IPFS upload → NFT mint → Wallet'a gönderme
- Testnet üzerinden gerçek NFT mint
- Soulbound (transfer edilemez) certificate'lar

---

## 🛠️ Nasıl Çalışır?

### 1. **SVG Generation**
```typescript
// Otomatik template seçimi user address'e göre
const templateIndex = parseInt(userHash.substring(2, 4), 16) % 3;

// Tip-specific renk sistemi
const colors = NFT_TYPE_COLORS[receiptType];
```

### 2. **IPFS Upload**
```typescript
// Pinata API ile metadata upload
const metadataUrl = await uploadToIPFS(metadataBlob, {
  name: `${data.receiptType}-nft-${Date.now()}`,
  type: 'nft-receipt',
  receiptType: data.receiptType,
  // ... metadata
});
```

### 3. **Blockchain Mint**
```typescript
// Stacks testnet üzerinden mint
const txHash = await mintNFT(
  userSession,
  campaignId,
  data.receiptType,
  data.amount,
  campaignName,
  recipientAddress,
  metadataUrl
);
```

---

## 🧪 Test Etmek İçin

### 1. **Frontend Başlatma**
```bash
cd frontend
npm start
```

### 2. **NFT Sayfasına Git**
- `http://localhost:3000/#nft-receipts`
- Wallet bağlantısı otomatik (demo)

### 3. **Test Mint**
- "Test Mint" tab'ına git
- İstediğin receipt tipini seç
- NFT otomatik oluşturulacak ve collection'da görünecek

### 4. **Console Log'ları İzle**
```javascript
// Browser console'da:
🎨 Generating SVG NFT receipt...
📤 Uploading to IPFS via Pinata...
🔗 Minting NFT on Stacks blockchain...
✅ NFT minted successfully!
```

---

## 📱 Web Interface

### **Ana Sayfa**
- Homepage → NFT Receipts kartı

### **NFT Collection**
- My Collection: Sahip olunan NFT'ler
- Transaction History: Blockchain geçmişi
- Test Mint: Admin için farklı tip test'leri

### **NFT Detail Modal**
- Full metadata görüntüleme
- Blockchain explorer link
- Download/Share seçenekleri

---

## 🎯 Demo Flow

```
1. Ana sayfa → NFT Receipts
2. Wallet otomatik bağlanır
3. "Test Mint" tab
4. Farklı receipt tiplerini test et:
   🚨 Emergency Relief
   🏥 Medical Aid  
   🎓 Education Fund
   💼 Salary
   🏆 Bonus
5. Her NFT unique SVG + IPFS metadata
6. Collection'da görüntüle
7. Detail modal'da incele
```

---

## 🔧 Technical Stack

- **Frontend**: React + TypeScript
- **SVG Generation**: Dynamic templates with user-specific variations
- **IPFS**: Pinata API for metadata storage
- **Blockchain**: Stacks testnet NFT minting
- **Storage**: LocalStorage for demo data persistence

---

## ✅ Tamamlanan Features

- ✅ 11 farklı receipt type
- ✅ Tip-specific color system
- ✅ 3 SVG template variation
- ✅ IPFS metadata upload
- ✅ Blockchain NFT minting
- ✅ Responsive web interface
- ✅ Real-time collection display
- ✅ Transaction history
- ✅ Demo removal (sadece gerçek NFT'ler)

---

## 🎊 Ready to Use!

Sistem tam olarak çalışıyor ve gerçek blockchain NFT'leri mint ediyor! 

Test etmek için: `npm start` → `#nft-receipts` → Test farklı receipt tiplerini! 🚀
