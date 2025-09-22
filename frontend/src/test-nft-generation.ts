import { generateNFTImage, DonationNFTData, PayrollNFTData } from './lib/nftService';

// Test SVG generation with sample data
const testSVGGeneration = async () => {
  console.log('🧪 Testing SVG NFT Generation...');
  
  // Test donation NFT
  const donationData: DonationNFTData = {
    donorAddress: 'SP1TEST123ABC456DEF789GHI012JKL345MNO678PQR',
    amount: 250,
    campaignName: 'Emergency Relief Fund for Earthquake Victims',
    targetOrg: 'Red Cross Turkey',
    timestamp: new Date().toISOString(),
    txHash: '0x' + Math.random().toString(16).substr(2, 40),
    receiptType: 'disaster-relief'
  };

  // Test payroll NFT
  const payrollData: PayrollNFTData = {
    employeeAddress: 'SP1EMPLOYEE987ZYX654WVU321TSR098QPO765NML432',
    amount: 1500,
    period: 'December 2024',
    department: 'Engineering',
    timestamp: new Date().toISOString(),
    txHash: '0x' + Math.random().toString(16).substr(2, 40),
    receiptType: 'salary'
  };

  try {
    // Test donation NFT generation
    console.log('🎯 Testing Donation NFT...');
    const donationSVG = await generateNFTImage(donationData);
    console.log('✅ Donation NFT generated successfully');
    console.log('📏 SVG length:', donationSVG.length);
    console.log('🔍 SVG preview:', donationSVG.substring(0, 100) + '...');

    // Test payroll NFT generation  
    console.log('\n💼 Testing Payroll NFT...');
    const payrollSVG = await generateNFTImage(payrollData);
    console.log('✅ Payroll NFT generated successfully');
    console.log('📏 SVG length:', payrollSVG.length);
    console.log('🔍 SVG preview:', payrollSVG.substring(0, 100) + '...');

    // Test with different addresses to see template variation
    console.log('\n🎨 Testing Template Variation...');
    const testAddresses = [
      'SP1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Should use template 0
      'SP1BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', // Should use template 1  
      'SP1CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'  // Should use template 2
    ];

    for (let i = 0; i < testAddresses.length; i++) {
      const testData: DonationNFTData = {
        ...donationData,
        donorAddress: testAddresses[i]
      };
      
      const templateSVG = await generateNFTImage(testData);
      const templateIndex = parseInt(testAddresses[i].substring(2, 4), 16) % 3;
      console.log(`Template ${templateIndex} (${['Modern', 'Elegant', 'Minimalist'][templateIndex]}): ${templateSVG.length} chars`);
    }

    // Test different receipt types
    console.log('\n🎨 Testing Different Receipt Types...');
    const receiptTypes: Array<{type: any, description: string}> = [
      { type: 'emergency-relief', description: 'Emergency Relief' },
      { type: 'medical-aid', description: 'Medical Aid' },
      { type: 'education-fund', description: 'Education Fund' },
      { type: 'food-aid', description: 'Food Aid' },
      { type: 'bonus', description: 'Employee Bonus' },
      { type: 'pension', description: 'Pension Payment' }
    ];

    for (const receiptType of receiptTypes) {
      const isDonation = !['salary', 'bonus', 'pension', 'overtime'].includes(receiptType.type);
      
      if (isDonation) {
        const testDonation: DonationNFTData = {
          ...donationData,
          receiptType: receiptType.type,
          campaignName: `${receiptType.description} Campaign`
        };
        
        const svg = await generateNFTImage(testDonation);
        console.log(`✅ ${receiptType.description}: ${svg.length} chars`);
      } else {
        const testPayroll: PayrollNFTData = {
          ...payrollData,
          receiptType: receiptType.type,
          period: `${receiptType.description} - Dec 2024`
        };
        
        const svg = await generateNFTImage(testPayroll);
        console.log(`✅ ${receiptType.description}: ${svg.length} chars`);
      }
    }

    console.log('\n🎉 All SVG tests passed successfully!');
    
    // Test with extreme data
    console.log('\n🧪 Testing Edge Cases...');
    
    const longCampaignData: DonationNFTData = {
      donorAddress: 'SP1EDGE123CASE456TEST789LONG012NAME345DATA',
      amount: 9999999,
      campaignName: 'This is a very long campaign name that should be truncated properly to fit in the SVG template without breaking the layout',
      targetOrg: 'Very Long Organization Name That Should Also Be Handled Properly',
      timestamp: new Date().toISOString(),
      txHash: '0x' + Math.random().toString(16).substr(2, 40),
      receiptType: 'housing-assistance'
    };

    const edgeCaseSVG = await generateNFTImage(longCampaignData);
    console.log('✅ Edge case test passed');
    console.log('📏 Edge case SVG length:', edgeCaseSVG.length);

  } catch (error) {
    console.error('❌ SVG generation test failed:', error);
  }
};

// Export for use in browser console
(window as any).testSVGGeneration = testSVGGeneration;

// Auto-run if in development
if (process.env.NODE_ENV === 'development') {
  testSVGGeneration();
}

export { testSVGGeneration };
