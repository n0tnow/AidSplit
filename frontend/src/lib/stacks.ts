import {
  StacksTestnet,
  StacksMainnet,
  StacksDevnet
} from '@stacks/network';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  listCV,
  tupleCV,
  callReadOnlyFunction,
  cvToJSON
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import {
  NETWORK,
  NETWORK_URLS,
  CONTRACT_ADDRESS,
  CONTRACTS,
  APP_CONFIG,
  HIRO_API_KEY
} from './constants';

// Get network instance
export const getNetwork = () => {
  switch (NETWORK) {
    case 'mainnet':
      return new StacksMainnet({ url: NETWORK_URLS.mainnet });
    case 'testnet':
      return new StacksTestnet({ url: NETWORK_URLS.testnet });
    case 'devnet':
      return new StacksDevnet({ url: NETWORK_URLS.devnet });
    default:
      return new StacksTestnet({ url: NETWORK_URLS.testnet });
  }
};

// Contract call wrapper
export const callContract = async ({
  contractName,
  functionName,
  functionArgs = [],
  onFinish,
  onCancel
}: {
  contractName: string;
  functionName: string;
  functionArgs?: any[];
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}) => {
  try {
    await openContractCall({
      network: getNetwork(),
      contractAddress: CONTRACT_ADDRESS,
      contractName,
      functionName,
      functionArgs,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      appDetails: {
        name: APP_CONFIG.name,
        icon: APP_CONFIG.icon,
      },
      onFinish: (data) => {
        console.log('Transaction successful:', data);
        onFinish?.(data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        onCancel?.();
      }
    });
  } catch (error) {
    console.error('Contract call error:', error);
    throw error;
  }
};

// Helper functions for common contract calls

// Campaign Management
export const createCampaign = async (
  name: string,
  description: string,
  categoryType: string,
  tokenAddress: string,
  targetAmount: number,
  duration: number,
  onFinish?: (data: any) => void
) => {
  return callContract({
    contractName: CONTRACTS.CAMPAIGN_MANAGER,
    functionName: 'create-campaign',
    functionArgs: [
      stringAsciiCV(name),
      stringAsciiCV(description),
      stringAsciiCV(categoryType),
      principalCV(tokenAddress),
      uintCV(targetAmount),
      uintCV(duration)
    ],
    onFinish
  });
};

// Donation Functions
export const makeDonation = async (
  campaignId: number,
  amount: number,
  targetOrg?: string,
  onFinish?: (data: any) => void
) => {
  const functionArgs: any[] = [
    uintCV(campaignId),
    uintCV(amount)
  ];

  if (targetOrg) {
    functionArgs.push(principalCV(targetOrg));
  }

  return callContract({
    contractName: CONTRACTS.DONATION_TARGETING,
    functionName: targetOrg ? 'donate-to-specific-org' : 'donate-to-campaign',
    functionArgs,
    onFinish
  });
};

// Fund Claiming
export const claimFunds = async (
  campaignId: number,
  onFinish?: (data: any) => void
) => {
  return callContract({
    contractName: CONTRACTS.DISTRIBUTION_ENGINE,
    functionName: 'claim-funds',
    functionArgs: [uintCV(campaignId)],
    onFinish
  });
};

// Company Registration
export const registerCompany = async (
  companyName: string,
  onFinish?: (data: any) => void
) => {
  return callContract({
    contractName: CONTRACTS.COMPANY_AUTH,
    functionName: 'register-company',
    functionArgs: [stringAsciiCV(companyName)],
    onFinish
  });
};

// Payroll Processing
export const processPayroll = async (
  employees: Array<{ address: string; amount: number; department: string }>,
  onFinish?: (data: any) => void
) => {
  const employeeList = listCV(
    employees.map(emp => 
      tupleCV({
        'recipient': principalCV(emp.address),
        'amount': uintCV(emp.amount),
        'department': stringAsciiCV(emp.department)
      })
    )
  );

  return callContract({
    contractName: CONTRACTS.DISTRIBUTION_ENGINE,
    functionName: 'distribute-bulk',
    functionArgs: [employeeList],
    onFinish
  });
};

// Utility Functions
export const formatStacksAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getExplorerUrl = (txId: string) => {
  const baseUrl = NETWORK === 'mainnet' 
    ? 'https://explorer.stacks.co'
    : 'https://explorer.stacks.co';
  return `${baseUrl}/txid/${txId}?chain=${NETWORK}`;
};

export const getAddressExplorerUrl = (address: string) => {
  const baseUrl = NETWORK === 'mainnet'
    ? 'https://explorer.stacks.co'
    : 'https://explorer.stacks.co';
  return `${baseUrl}/address/${address}?chain=${NETWORK}`;
};

// =================================
// ENHANCED COMPANY & EMPLOYEE MANAGEMENT
// =================================

// Hybrid localStorage + blockchain approach for better UX
const STORAGE_KEYS = {
  companies: 'aidsplit_companies',
  employees: 'aidsplit_employees',
  departments: 'aidsplit_departments'
};

// Enhanced Company Management with hybrid approach
export const registerCompanyEnhanced = async (
  companyName: string,
  adminAddress: string,
  onFinish?: (data: any) => void
) => {
  // Store immediately in localStorage for instant UI update
  const company = {
    name: companyName,
    admin: adminAddress,
    createdAt: Date.now(),
    blockchainTxId: null
  };

  const existingCompanies = JSON.parse(localStorage.getItem(STORAGE_KEYS.companies) || '[]');
  existingCompanies.push(company);
  localStorage.setItem(STORAGE_KEYS.companies, JSON.stringify(existingCompanies));

  // Then try blockchain call in background
  try {
    return callContract({
      contractName: CONTRACTS.COMPANY_AUTH,
      functionName: 'register-company',
      functionArgs: [stringAsciiCV(companyName)],
      onFinish: (data) => {
        // Update localStorage with blockchain transaction ID
        const companies = JSON.parse(localStorage.getItem(STORAGE_KEYS.companies) || '[]');
        const updatedCompanies = companies.map((c: any) =>
          c.name === companyName && c.admin === adminAddress
            ? { ...c, blockchainTxId: data.txId }
            : c
        );
        localStorage.setItem(STORAGE_KEYS.companies, JSON.stringify(updatedCompanies));
        onFinish?.(data);
      }
    });
  } catch (error) {
    console.error('Blockchain call failed, but localStorage updated:', error);
    return { success: true, localStorage: true };
  }
};

// Get company by admin with hybrid approach
export const getCompanyByAdmin = async (adminAddress: string) => {
  // First check localStorage for immediate response
  const companies = JSON.parse(localStorage.getItem(STORAGE_KEYS.companies) || '[]');
  const localCompany = companies.find((c: any) => c.admin === adminAddress);

  if (localCompany) {
    return { success: true, data: localCompany, source: 'localStorage' };
  }

  // Fallback to blockchain if not in localStorage
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACTS.COMPANY_AUTH,
      functionName: 'get-company-by-admin',
      functionArgs: [principalCV(adminAddress)],
      network: getNetwork(),
    });

    return { success: true, data: cvToJSON(result), source: 'blockchain' };
  } catch (error) {
    console.error('Error fetching company:', error);
    return { success: false, error };
  }
};

// =================================
// EMPLOYEE CRUD OPERATIONS
// =================================

export const addEmployee = async (
  employeeWallet: string,
  employeeName: string,
  department: string,
  position: string,
  salary: number,
  onFinish?: (data: any) => void
) => {
  const employee = {
    wallet: employeeWallet,
    name: employeeName,
    department,
    position,
    salary,
    active: true,
    createdAt: Date.now(),
    blockchainTxId: null
  };

  // Store immediately in localStorage
  const existingEmployees = JSON.parse(localStorage.getItem(STORAGE_KEYS.employees) || '[]');
  existingEmployees.push(employee);
  localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(existingEmployees));

  // Try blockchain call in background
  try {
    return callContract({
      contractName: CONTRACTS.COMPANY_AUTH,
      functionName: 'add-employee',
      functionArgs: [
        principalCV(employeeWallet),
        stringAsciiCV(employeeName),
        stringAsciiCV(department),
        stringAsciiCV(position),
        uintCV(salary)
      ],
      onFinish: (data) => {
        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.employees) || '[]');
        const updatedEmployees = employees.map((e: any) =>
          e.wallet === employeeWallet && !e.blockchainTxId
            ? { ...e, blockchainTxId: data.txId }
            : e
        );
        localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(updatedEmployees));
        onFinish?.(data);
      }
    });
  } catch (error) {
    console.error('Blockchain call failed, but localStorage updated:', error);
    return { success: true, localStorage: true };
  }
};

export const getEmployees = () => {
  const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.employees) || '[]');
  return employees.filter((emp: any) => emp.active);
};

export const updateEmployee = (
  employeeWallet: string,
  updates: {
    name?: string;
    department?: string;
    position?: string;
    salary?: number;
  }
) => {
  const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.employees) || '[]');
  const updatedEmployees = employees.map((emp: any) =>
    emp.wallet === employeeWallet
      ? { ...emp, ...updates, updatedAt: Date.now() }
      : emp
  );
  localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(updatedEmployees));
  return { success: true };
};

export const removeEmployee = (employeeWallet: string) => {
  const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.employees) || '[]');
  const updatedEmployees = employees.map((emp: any) =>
    emp.wallet === employeeWallet
      ? { ...emp, active: false, removedAt: Date.now() }
      : emp
  );
  localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(updatedEmployees));
  return { success: true };
};

// =================================
// DEPARTMENT CRUD OPERATIONS
// =================================

export const addDepartment = (name: string, description?: string) => {
  const department = {
    id: Date.now().toString(),
    name,
    description: description || '',
    createdAt: Date.now(),
    active: true
  };

  const existingDepartments = JSON.parse(localStorage.getItem(STORAGE_KEYS.departments) || '[]');
  existingDepartments.push(department);
  localStorage.setItem(STORAGE_KEYS.departments, JSON.stringify(existingDepartments));

  return { success: true, data: department };
};

export const getDepartments = () => {
  const departments = JSON.parse(localStorage.getItem(STORAGE_KEYS.departments) || '[]');
  return departments.filter((dept: any) => dept.active);
};

export const updateDepartment = (id: string, updates: { name?: string; description?: string }) => {
  const departments = JSON.parse(localStorage.getItem(STORAGE_KEYS.departments) || '[]');
  const updatedDepartments = departments.map((dept: any) =>
    dept.id === id
      ? { ...dept, ...updates, updatedAt: Date.now() }
      : dept
  );
  localStorage.setItem(STORAGE_KEYS.departments, JSON.stringify(updatedDepartments));
  return { success: true };
};

export const removeDepartment = (id: string) => {
  const departments = JSON.parse(localStorage.getItem(STORAGE_KEYS.departments) || '[]');
  const updatedDepartments = departments.map((dept: any) =>
    dept.id === id
      ? { ...dept, active: false, removedAt: Date.now() }
      : dept
  );
  localStorage.setItem(STORAGE_KEYS.departments, JSON.stringify(updatedDepartments));
  return { success: true };
};

// =================================
// DISASTER RELIEF ENHANCED FUNCTIONS
// =================================

export const closeCampaign = async (
  campaignId: string,
  onFinish?: (data: any) => void
) => {
  try {
    return callContract({
      contractName: CONTRACTS.CAMPAIGN_MANAGER,
      functionName: 'close-campaign',
      functionArgs: [uintCV(parseInt(campaignId))],
      onFinish
    });
  } catch (error) {
    console.error('Error closing campaign:', error);
    throw error;
  }
};

export const reopenCampaign = async (
  campaignId: string,
  onFinish?: (data: any) => void
) => {
  try {
    return callContract({
      contractName: CONTRACTS.CAMPAIGN_MANAGER,
      functionName: 'reopen-campaign',
      functionArgs: [uintCV(parseInt(campaignId))],
      onFinish
    });
  } catch (error) {
    console.error('Error reopening campaign:', error);
    throw error;
  }
};

export const deleteCampaign = async (
  campaignId: string,
  onFinish?: (data: any) => void
) => {
  try {
    return callContract({
      contractName: CONTRACTS.CAMPAIGN_MANAGER,
      functionName: 'delete-campaign',
      functionArgs: [uintCV(parseInt(campaignId))],
      onFinish
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};
