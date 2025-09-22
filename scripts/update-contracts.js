const { StacksTestnet } = require('@stacks/network');
const { makeContractDeploy, broadcastTransaction } = require('@stacks/transactions');
const fs = require('fs');
const path = require('path');

// Network configuration
const network = new StacksTestnet();
const senderKey = process.env.SENDER_KEY; // Your private key
const contractAddress = 'STBMFWFXC4VKC5PEZDXPR0JAKEJ5WCH3KA0D1EP4';

// Contract files to update
const contracts = [
  'campaign-manager',
  'distribution-engine', 
  'donation-targeting'
];

async function updateContract(contractName) {
  try {
    console.log(`Updating contract: ${contractName}`);
    
    const contractPath = path.join(__dirname, '..', 'contracts', `${contractName}.clar`);
    const contractCode = fs.readFileSync(contractPath, 'utf8');
    
    const txOptions = {
      contractName,
      codeBody: contractCode,
      senderKey,
      network,
      fee: 10000, // 0.01 STX
      nonce: 0, // Will be set automatically
    };
    
    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction(transaction, network);
    
    console.log(`✅ ${contractName} updated successfully:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Error updating ${contractName}:`, error);
    throw error;
  }
}

async function updateAllContracts() {
  console.log('🚀 Starting contract updates...');
  
  for (const contract of contracts) {
    await updateContract(contract);
    // Wait between updates
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('🎉 All contracts updated successfully!');
}

// Run if called directly
if (require.main === module) {
  updateAllContracts().catch(console.error);
}

module.exports = { updateAllContracts };


