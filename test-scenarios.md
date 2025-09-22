# AidSplit Test Scenarios

## Test Wallets
- **Admin:** STBMFWFXC4VKC5PEZDXPR0JAKEJ5WCH3KA0D1EP4
- **Türk Kızılayı:** STAQM5WJ0C3G7KF4X9KXWDPVFTKW5QT343RT65Q6
- **AFAD:** ST2GPC0BJ2PC9SMTPW9AYY41827MT7M0BDXH4QFTY
- **Donor:** ST3BTJAD6DX3Z1YP74HB1NZJ7XM6C3DPD86694FGS

## Test Scenario 1: Admin Creates Campaign
1. Connect with Admin wallet (STBMFWFXC4VKC5PEZDXPR0JAKEJ5WCH3KA0D1EP4)
2. Go to Disaster Relief page
3. Click "Create Campaign" tab
4. Fill campaign details:
   - Name: "Test Earthquake Relief"
   - Description: "Test campaign for earthquake relief"
   - Type: "earthquake"
   - Target Amount: 1000 STX
   - Duration: 100 blocks
5. Click "Create Campaign"
6. **Expected:** Campaign created successfully on blockchain

## Test Scenario 2: Donor Makes Donation
1. Connect with Donor wallet (ST3BTJAD6DX3Z1YP74HB1NZJ7XM6C3DPD86694FGS)
2. Go to Disaster Relief page
3. Click "Make Donation" tab
4. Select campaign from dropdown
5. Enter amount: 50 STX
6. Select target organization (optional)
7. Click "Donate"
8. **Expected:** Donation successful, NFT receipt generated

## Test Scenario 3: Organization Claims Funds
1. Connect with Türk Kızılayı wallet (STAQM5WJ0C3G7KF4X9KXWDPVFTKW5QT343RT65Q6)
2. Go to Disaster Relief page
3. Click "Claim Funds" tab
4. See available funds for campaigns
5. Click "Claim" for available funds
6. **Expected:** Funds claimed successfully

## Test Scenario 4: Multiple Wallets Test
1. Test all scenarios with different wallet combinations
2. Verify role-based access control
3. Check transaction history
4. Verify NFT generation

## Expected Results
- All transactions should succeed
- No "transaction rejected" errors
- NFT receipts should be generated
- Role-based UI should work correctly
- Blockchain explorer links should work
