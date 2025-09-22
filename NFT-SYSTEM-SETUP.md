# 🎨 NFT Makbuz Sistemi - Kurulum Rehberi

## ✅ Basitleştirilmiş Sistem

- **TypeScript hataları** - Düzeltildi
- **Port çakışması** - Çözüldü  
- **Backend proxy** - Kaldırıldı (gereksiz karmaşıklık)
- **AI görsel oluşturma** - Yerleşik profesyonel SVG generator

---

## 🔑 1. API Key'lerinizi Ayarlayın

`frontend/.env` dosyası oluşturun:

```env
# Pinata IPFS Keys (zorunlu)
REACT_APP_PINATA_API_KEY=xxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_PINATA_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stacks Network
REACT_APP_STACKS_NETWORK=testnet
REACT_APP_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
REACT_APP_ENVIRONMENT=development
```

**Not:** Artık Anthropic API key gerekmez - sistem yerleşik SVG generator kullanıyor!

---

## 🚀 2. Sistemi Başlatın

### Sadece Frontend (Port 3000)
```powershell
cd frontend; npm start
```

**Hepsi bu kadar! Ayrı backend gerekmez.** 🎉

---

## 🧪 3. NFT Sistemi Test Edin

### Adım 1: Disaster Relief Sayfası
1. `http://localhost:3000` → **Disaster Relief** sayfasına gidin
2. Bir kampanya seçin (örn: "XXX")
3. **100 STX** bağış yapın
4. Transaction'ı onaylayın

### Adım 2: NFT Oluşum Süreci
```
🎉 Donation successful! Transaction ID: [txid]
🎨 Creating NFT receipt for donation...
🎨 Calling Anthropic API for NFT image generation...
✅ SVG generated successfully
📤 Uploading to IPFS via Pinata...
✅ Successfully uploaded to IPFS: https://gateway.pinata.cloud/ipfs/[hash]
🔗 NFT minted on blockchain: [mint_tx]
📋 NFT receipt saved to local storage
```

### Adım 3: NFT Receipts Sayfası
1. **NFT Receipts** sekmesine gidin
2. Yeni oluşturulan NFT'yi görün:
   - ✨ AI tarafından oluşturulan profesyonel görsel
   - 📊 Bağış bilgileri (kampanya, miktar, tarih)
   - 🔗 IPFS metadata URL'i
   - 💎 Rarity sistemi (amount'a göre)

---

## 🎯 4. Sistem Özellikleri

### 🎨 NFT Görseli
- **Claude AI** tarafından SVG formatında oluşturuluyor
- Bağış tipine göre **renk şemaları** (yeşil/mavi)
- **Profesyonel sertifika** tasarımı
- Bağış bilgileri görsel üzerinde

### 📤 IPFS Storage
- **Pinata** ile gerçek IPFS upload
- NFT metadata kalıcı olarak saklanıyor
- Gateway URL'leri otomatik oluşturuluyor

### 🔗 Blockchain Integration
- **Stacks blockchain**'de gerçek NFT mint
- **Soulbound** (transfer edilemez) sertifikalar
- `nft-receipts-v3.clar` contract kullanıyor

### 🏆 NFT Collection
- **Real-time** görüntüleme
- **Filtreleme** ve **arama**
- **Rarity** sistemi (common → legendary)
- **LocalStorage** entegrasyonu

---

## ⚠️ Önemli Notlar

1. **API Key'ler zorunlu** - Sistem key'ler olmadan çalışmaz
2. **Backend proxy gerekli** - Port 3001'de çalışmalı
3. **İnternet bağlantısı** - Anthropic ve Pinata API'leri için
4. **Stacks wallet** - Transaction onayları için

---

## 🔧 Troubleshooting

### Backend Proxy Çalışmıyor
```bash
# Bağımlılıkları yükleyin
npm install

# Proxy'yi yeniden başlatın
node backend-proxy.js
```

### API Key Hataları
- `.env` dosyasının doğru konumda olduğunu kontrol edin
- Key'lerin doğru formatda olduğunu kontrol edin
- Browser'ı yenileyin (hard refresh: Ctrl+F5)

### IPFS Upload Hatası
- Pinata hesabınızın aktif olduğunu kontrol edin
- API key'lerin doğru olduğunu kontrol edin
- İnternet bağlantınızı kontrol edin

---

## 🎉 Başarılı Test Sonucu

Bağış yaptıktan sonra **NFT Receipts** sayfasında:
- ✅ Güzel AI oluşturulmuş NFT görseli
- ✅ Gerçek IPFS metadata URL'i  
- ✅ Blockchain transaction hash'i
- ✅ Doğru bağış bilgileri
- ✅ Çalışan filtreler ve arama

**Sistem artık tamamen operasyonel! 🚀**
