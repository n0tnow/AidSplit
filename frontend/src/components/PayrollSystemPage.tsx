import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  DollarSign, 
  Calculator, 
  TrendingUp, 
  Award, 
  Briefcase, 
  Clock, 
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Wallet,
  Shield,
  BarChart,
  Save,
  X,
  QrCode
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { 
  createCampaign, 
  setupPayrollEmployees, 
  processPayrollV4, 
  claimPayrollFunds,
  getCampaignInfo,
  getExplorerUrl,
  createDepartment,
  addRole,
  assignEmployee,
  registerCompany,
  addCompanyFunds,
  getCompanyBudget,
  addEmployee as addEmployeeToCompany,
  updateEmployee as updateEmployeeInCompany,
  removeEmployee as removeEmployeeFromCompany,
  getCompanyByAdmin,
  getCompanyEmployees,
  getEmployeeByWallet
} from '../lib/stacks';
import './PayrollSystemPage.css';
import QRCodeModal from './QRCodeModal';

interface PayrollSystemPageProps {
  onBack: () => void;
}

// Interfaces
interface Company {
  id: number;
  name: string;
  adminAddress: string;
  employeeCount: number;
  totalPayroll: number;
  isVerified: boolean;
  registeredAt: string;
  departments: Department[];
}

interface Department {
  id: string;
  name: string;
  allocationPercentage: number;
  employeeCount: number;
  isActive: boolean;
  roles: Role[];
}

interface Role {
  id: string;
  name: string;
  multiplier: number;
  baseSalaryPoints: number;
  isActive: boolean;
}

interface Employee {
  id: number;
  address: string;
  name: string;
  departmentId: string;
  roleId: string;
  individualMultiplier: number;
  performanceRating: number;
  hireDate: string;
  status: 'active' | 'inactive';
  totalEarned: number;
  lastPayroll: string;
}

interface PayrollCampaign {
  id: number;
  name: string;
  description?: string; // Optional description for campaigns
  totalBudget: number;
  processedAmount: number;
  employeeCount: number;
  status: 'draft' | 'processing' | 'completed';
  createdAt: string;
  processedAt?: string;
}

// interface SalaryCalculation {
//   employeeId: number;
//   finalShares: number;
//   deptBaseShares: number;
//   roleMultipliedShares: number;
//   performanceBonus: number;
//   calculatedSalary: number;
// }

interface SuccessModal {
  isOpen: boolean;
  type: 'payroll' | 'employee' | 'department' | 'claim' | 'role' | 'company';
  title: string;
  message: string;
  txHash?: string;
  nftReceiptId?: number;
  amount?: number;
}

interface SalaryPayment {
  id: number;
  employeeId: number;
  employeeName: string;
  campaignId: number;
  campaignName: string;
  amount: number;
  processedAt: string;
  claimedAt?: string; // When the payment was claimed (optional)
  txHash: string;
  nftReceiptId: number;
  status: 'pending' | 'paid' | 'claimed';
}

const PayrollSystemPage: React.FC<PayrollSystemPageProps> = ({ onBack }) => {
  const { isConnected, userSession, connectWallet, userAddress } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'employees' | 'payroll' | 'claims'>('overview');
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null);
  
  // Company data
  const [company, setCompany] = useState<Company | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollCampaigns, setPayrollCampaigns] = useState<PayrollCampaign[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [companyBudget, setCompanyBudget] = useState(0);
  const [fundsToAdd, setFundsToAdd] = useState(0);
  const [stxPrice, setStxPrice] = useState(0);
  const [stxAmount, setStxAmount] = useState(0);
  const [usdAmount, setUsdAmount] = useState(0);
  const [isCompanyRegistered, setIsCompanyRegistered] = useState<boolean>(false);
  const [isCheckingCompany, setIsCheckingCompany] = useState<boolean>(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<SuccessModal>({
    isOpen: false,
    type: 'payroll',
    title: '',
    message: ''
  });
  
  // Forms
  const [newDepartment, setNewDepartment] = useState({ name: '', allocation: 0 });
  const [newRole, setNewRole] = useState({ deptId: '', name: '', multiplier: 100, baseSalary: 1000 });
  const [newEmployee, setNewEmployee] = useState({ 
    address: '', 
    name: '', 
    deptId: '', 
    roleId: '', 
    multiplier: 100, 
    performance: 100 
  });
  const [payrollForm, setPayrollForm] = useState({ name: '', budget: 0 });
  
  // Dropdowns
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // QR Code Modal state
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    salaryAmount: 0,
    employeeName: '',
    campaignName: '',
    claimUrl: ''
  });
  


  // Utility functions
  const getExplorerLink = (txHash: string): string => {
    return `https://explorer.hiro.so/txid/${txHash}?chain=testnet`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // QR Code generation for salary claims
  const generateSalaryQR = (employee: Employee, campaignId: number, salaryAmount: number) => {
    const baseUrl = window.location.origin;
    const claimUrl = `${baseUrl}/claim-salary?employee=${employee.address}&campaign=${campaignId}&amount=${salaryAmount}`;
    
    setQrModal({
      isOpen: true,
      salaryAmount,
      employeeName: employee.name,
      campaignName: `Campaign #${campaignId}`,
      claimUrl
    });
  };

  const closeQrModal = () => {
    setQrModal({
      isOpen: false,
      salaryAmount: 0,
      employeeName: '',
      campaignName: '',
      claimUrl: ''
    });
  };

  // Authentication with real wallet
  const handleWalletConnection = async () => {
    setIsLoading(true);
    try {
      await connectWallet();
      // Role is now determined in the useEffect above
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle wallet connection state and admin role
  useEffect(() => {
    if (isConnected && userAddress) {
      setIsAuthenticated(true);
      
      // Check if user is admin based on wallet address
      const adminAddresses = [
        'STBMFWFXC4VKC5PEZDXPR0JAKEJ5WCH3KA0D1EP4', // Main admin
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Test admin 1
        'ST2CY5V9NHDPDBXMWGQ9J7H6NCNF0N0SSJQTXQP3W', // Test admin 2
        'ST1ADMIN...TEST', // Test admin 3
        'ST2ADMIN...TEST', // Test admin 4
      ];
      
      console.log('=== 🔐 ROLE CHECK DEBUG ===');
      console.log('👤 User Address:', userAddress);
      console.log('📊 User Address Type:', typeof userAddress);
      console.log('📏 User Address Length:', userAddress?.length);
      console.log('💰 Admin Addresses:', adminAddresses);
      console.log('✅ Is Admin Check:', adminAddresses.includes(userAddress));
      console.log('🎯 Exact Match:', adminAddresses.some(addr => addr === userAddress));
      console.log('========================');
      
      if (adminAddresses.includes(userAddress)) {
        setUserRole('admin');
        console.log('✅ User role set to ADMIN');
      } else {
        setUserRole('employee');
        console.log('❌ User role set to EMPLOYEE');
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, [isConnected, userAddress]);

  // Load company data when user is admin
  useEffect(() => {
    if (userRole === 'admin' && userAddress) {
      loadCompanyData();
    }
  }, [userRole, userAddress]);

  // Load STX price
  useEffect(() => {
    loadStxPrice();
  }, []);

  // Load STX price from API
  const loadStxPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stacks&vs_currencies=usd');
      const data = await response.json();
      if (data.stacks && data.stacks.usd) {
        setStxPrice(data.stacks.usd);
      }
    } catch (error) {
      console.error('Error loading STX price:', error);
      // Fallback price
      setStxPrice(0.5);
    }
  };

  // Calculate USD amount from STX
  const calculateUsdAmount = (stx: number) => {
    return stx * stxPrice;
  };

  // Calculate STX amount from USD
  const calculateStxAmount = (usd: number) => {
    return stxPrice > 0 ? usd / stxPrice : 0;
  };

  // Load company data from blockchain with improved error handling
  const loadCompanyData = async () => {
    if (!userAddress) {
      console.log('❌ No user address available for company data loading');
      return;
    }

    console.log('🔄 Loading company data for:', userAddress);
    setIsCheckingCompany(true);

    try {
      // Get company data from blockchain
      const companyData = await getCompanyByAdmin(userAddress);

      if (companyData) {
        console.log('✅ Company data loaded:', companyData);

        const company: Company = {
          id: companyData.id,
          name: companyData.name,
          adminAddress: userAddress,
          employeeCount: companyData.employee_count || 0,
          totalPayroll: companyData.total_budget || 0,
          isVerified: companyData.active,
          registeredAt: new Date(companyData.created_at * 1000).toISOString().split('T')[0],
          departments: departments
        };

        setCompany(company);
        setCompanyBudget(companyData.total_budget || 0);
        setIsCompanyRegistered(true);

        console.log('🏢 Company state updated:', company);

        // Load employees from blockchain
        try {
          const employeesData = await getCompanyEmployees(companyData.id);
          if (employeesData && Array.isArray(employeesData)) {
            const blockchainEmployees: Employee[] = employeesData.map((emp: any, index: number) => ({
              id: index + 1,
              name: emp.name,
              address: emp.wallet_address,
              departmentId: emp.department,
              roleId: emp.position, // Fixed: should be roleId not role
              individualMultiplier: 100, // Default multiplier
              performanceRating: 85, // Default performance rating
              status: emp.active ? 'active' : 'inactive',
              hireDate: new Date(emp.added_at * 1000).toISOString().split('T')[0],
              totalEarned: 0, // Default total earned
              lastPayroll: '2024-01-01' // Default last payment
            }));

            console.log('👥 Employees loaded:', blockchainEmployees);
            setEmployees(blockchainEmployees);
          } else {
            console.log('ℹ️ No employees found or empty array');
            setEmployees([]);
          }
        } catch (employeeError) {
          console.error('⚠️ Error loading employees:', employeeError);
          setEmployees([]); // Set empty array on error
        }

      } else {
        console.log('ℹ️ No company found for admin');
        setIsCompanyRegistered(false);
        setCompany(null);
        setEmployees([]);
      }
    } catch (error) {
      console.error('💥 Error loading company data:', error);
      setIsCompanyRegistered(false);
      setCompany(null);
      setEmployees([]);
    } finally {
      setIsCheckingCompany(false);
      console.log('🏁 Company loading process completed');
    }
  };

  // Register company with better user feedback
  const handleRegisterCompany = async () => {
    if (isCompanyRegistered) {
      alert('You already have a registered company!');
      return;
    }

    console.log('🏢 Starting company registration...');
    setIsLoading(true);

    try {
      await registerCompany(
        "AidSplit Company",
        "A blockchain-based payroll management company",
        0, // Initial budget
        (data) => {
          console.log('✅ Company registered on blockchain:', data);

          setSuccessModal({
            isOpen: true,
            type: 'company',
            title: 'Company Registered!',
            message: `Your company has been successfully registered on the blockchain. You can now add funds and manage employees.`,
            txHash: data.txId || '0x' + Math.random().toString(16).substring(2, 66)
          });

          // Wait longer for blockchain state to be updated
          setTimeout(() => {
            console.log('🔄 Reloading company data after registration...');
            loadCompanyData();
          }, 5000); // Wait 5 seconds for blockchain confirmation
        },
        userAddress || undefined // Pass admin address to registerCompany
      );
    } catch (error) {
      console.error('💥 Failed to register company:', error);
      alert('Failed to register company. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add funds to company budget
  const handleAddFunds = async () => {
    if (fundsToAdd <= 0) return;
    
    setIsLoading(true);
    try {
      await addCompanyFunds(
        fundsToAdd,
        (data) => {
          console.log('Funds added to company:', data);
          setCompanyBudget(prev => prev + fundsToAdd);
          setFundsToAdd(0);
          
          setSuccessModal({
            isOpen: true,
            type: 'company',
            title: 'Funds Added!',
            message: `Successfully added ${fundsToAdd} STX to company budget.`,
            amount: fundsToAdd,
            txHash: data.txId || '0x' + Math.random().toString(16).substring(2, 66)
          });
        }
      );
    } catch (error) {
      console.error('Failed to add funds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Role management with real contracts
  const handleAddRole = async () => {
    if (!newRole.name || !selectedDepartment) return;
    
    setIsLoading(true);
    try {
      // Add role to department on blockchain
      await addRole(
        selectedDepartment.id,
        newRole.name.toLowerCase().replace(/\s+/g, '-'),
        newRole.multiplier,
        newRole.baseSalary,
        (data) => {
          console.log('Role added on blockchain:', data);
          
          // Add to local state after blockchain success
          const updatedRole: Role = {
            id: newRole.name.toLowerCase().replace(/\s+/g, '-'),
            name: newRole.name,
            multiplier: newRole.multiplier,
            baseSalaryPoints: newRole.baseSalary,
            isActive: true
          };
          
          // Update the department with the new role
          setDepartments(prev => 
            prev.map(dept => 
              dept.id === selectedDepartment.id 
                ? { ...dept, roles: [...dept.roles, updatedRole] }
                : dept
            )
          );
          
          // Reset form
          setNewRole({ deptId: '', name: '', multiplier: 100, baseSalary: 1000 });
          setSelectedDepartment(null);
          
          setSuccessModal({
            isOpen: true,
            type: 'role',
            title: 'Role Added!',
            message: `${updatedRole.name} role has been successfully added to ${selectedDepartment.name} department.`,
            txHash: data.txId || '0x' + Math.random().toString(16).substring(2, 66)
          });
          
          // Close modal
          const modal = document.getElementById('create-role-modal');
          if (modal) modal.style.display = 'none';
        }
      );
    } catch (error) {
      console.error('Failed to add role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Department management with real contracts
  const handleCreateDepartment = async () => {
    if (!newDepartment.name || newDepartment.allocation <= 0) return;
    
    setIsLoading(true);
    try {
      const deptId = newDepartment.name.toLowerCase().replace(/\s+/g, '-');
      
      // Create department on blockchain first
      await createDepartment(
        deptId,
        newDepartment.name,
        newDepartment.allocation * 100, // Convert percentage to basis points (50% = 5000)
        (data) => {
          console.log('Department created on blockchain:', data);
          
          // Add to local state after blockchain success
      const newDept: Department = {
        id: deptId,
        name: newDepartment.name,
        allocationPercentage: newDepartment.allocation,
        employeeCount: 0,
        isActive: true,
        roles: []
      };
      
      setDepartments([...departments, newDept]);
      setNewDepartment({ name: '', allocation: 0 });
      
      setSuccessModal({
        isOpen: true,
        type: 'department',
        title: 'Department Created!',
        message: `${newDept.name} department has been successfully created with ${newDept.allocationPercentage}% allocation.`,
            txHash: data.txId || '0x' + Math.random().toString(16).substring(2, 66)
      });
        }
      );
    } catch (error) {
      console.error('Failed to create department:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Payroll campaign creation with real contracts
  const handleCreatePayrollCampaign = async () => {
    if (!payrollForm.name || payrollForm.budget <= 0) return;
    
    setIsLoading(true);
    try {
      // Create payroll campaign on blockchain
      await createCampaign(
        payrollForm.name,
        `Payroll campaign for ${payrollForm.name}`,
        'payroll', // Campaign type
        payrollForm.budget,
        720, // 30 days duration in blocks
        0, // min amount
        payrollForm.budget, // max amount
        (data) => {
          console.log('Payroll campaign created on blockchain:', data);
          
          // Add to local state after blockchain success
          const newCampaign: PayrollCampaign = {
            id: payrollCampaigns.length + 1,
            name: payrollForm.name,
            description: `Monthly payroll for ${employees.length} employees`,
            totalBudget: payrollForm.budget,
            processedAmount: 0,
            employeeCount: employees.filter(emp => emp.status === 'active').length,
            status: 'draft',
            createdAt: new Date().toISOString()
          };
          
          setPayrollCampaigns([...payrollCampaigns, newCampaign]);
          setPayrollForm({ name: '', budget: 0 });
          
          setSuccessModal({
            isOpen: true,
            type: 'payroll',
            title: 'Payroll Campaign Created!',
            message: `${newCampaign.name} campaign has been successfully created with ${newCampaign.totalBudget} STX budget.`,
            amount: newCampaign.totalBudget,
            txHash: data.txId || '0x' + Math.random().toString(16).substring(2, 66)
          });
          
          // Close modal
          const modal = document.getElementById('create-payroll-modal');
          if (modal) modal.style.display = 'none';
        }
      );
    } catch (error) {
      console.error('Failed to create payroll campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Employee management with real contracts
  const addEmployee = async () => {
    if (!userAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!newEmployee.address || !newEmployee.name || !newEmployee.deptId || !newEmployee.roleId) return;
    
    setIsLoading(true);
    try {
      // Add employee to company on blockchain
      await addEmployeeToCompany(
        newEmployee.address,
        newEmployee.name,
        newEmployee.deptId,
        newEmployee.roleId,
        newEmployee.multiplier * 100, // Convert to salary
        (data) => {
          console.log('Employee added to company on blockchain:', data);
          
          // Add to local state after blockchain success
      const employee: Employee = {
        id: employees.length + 1,
        address: newEmployee.address,
        name: newEmployee.name,
        departmentId: newEmployee.deptId,
        roleId: newEmployee.roleId,
        individualMultiplier: newEmployee.multiplier,
        performanceRating: newEmployee.performance,
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
        totalEarned: 0,
        lastPayroll: ''
      };
      
      setEmployees([...employees, employee]);
      setNewEmployee({ address: '', name: '', deptId: '', roleId: '', multiplier: 100, performance: 100 });
      
      setSuccessModal({
        isOpen: true,
        type: 'employee',
        title: 'Employee Added!',
            message: `${employee.name} has been successfully added to the company.`,
            txHash: data.txId || '0x' + Math.random().toString(16).substring(2, 66),
        nftReceiptId: 2000 + employee.id
      });
        }
      );
    } catch (error) {
      console.error('Failed to add employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Payroll processing with real contracts
  const processPayroll = async (campaign: PayrollCampaign) => {
    setIsLoading(true);
    try {
      // Get employee addresses for this campaign
      const employeeAddresses = employees
        .filter(emp => emp.status === 'active')
        .map(emp => emp.address);

      // Process payroll on blockchain
      await processPayrollV4(
        campaign.id,
        campaign.totalBudget,
        employeeAddresses,
        (data) => {
          console.log('Payroll processed on blockchain:', data);
          
          // Update local state after blockchain success
      const updatedCampaign = { 
        ...campaign, 
        status: 'completed' as const, 
        processedAmount: campaign.totalBudget,
        processedAt: new Date().toISOString()
      };
      
      setPayrollCampaigns(prev => 
        prev.map(p => p.id === campaign.id ? updatedCampaign : p)
      );
      
      setSuccessModal({
        isOpen: true,
        type: 'payroll',
        title: 'Payroll Processed!',
        message: `Successfully processed payroll for ${campaign.employeeCount} employees.`,
        amount: campaign.totalBudget,
            txHash: data.txId || '0x' + Math.random().toString(16).substring(2, 66)
      });
        }
      );
    } catch (error) {
      console.error('Failed to process payroll:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Salary claim (for employees) with real contracts
  const claimSalary = async () => {
    if (userRole !== 'employee') return;
    
    setIsLoading(true);
    try {
      // Use a mock campaign ID for now - in real implementation, this would be determined dynamically
      const campaignId = 1;
      
      await claimPayrollFunds(
        campaignId,
        (data) => {
          console.log('Salary claimed on blockchain:', data);
      
      setSuccessModal({
        isOpen: true,
        type: 'claim',
        title: 'Salary Claimed!',
        message: `Successfully claimed your salary payment.`,
            amount: 3500, // This would come from blockchain data
            txHash: data.txId || '0x' + Math.random().toString(16).substring(2, 66),
        nftReceiptId: 3000 + Math.floor(Math.random() * 1000)
      });
        }
      );
    } catch (error) {
      console.error('Failed to claim salary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate employee salary - local calculation matching blockchain logic
  const calculateSalary = (employee: Employee) => {
    const dept = departments.find(d => d.id === employee.departmentId);
    const role = dept?.roles.find(r => r.id === employee.roleId);
    
    if (!dept || !role) return {
      employeeId: employee.id,
      finalShares: 0,
      deptBaseShares: 0,
      roleMultipliedShares: 0,
      performanceBonus: 0,
      calculatedSalary: 0
    };
    
    // Match the blockchain calculation logic from hierarchy-calculator-v6.clar
    const deptBaseShares = dept.allocationPercentage * 100;
    const roleMultipliedShares = (deptBaseShares * role.multiplier) / 100;
    const performanceBonus = (roleMultipliedShares * employee.performanceRating) / 100;
    const individualAdjusted = (roleMultipliedShares * employee.individualMultiplier) / 100;
    const finalShares = individualAdjusted + performanceBonus;
    
    return {
      employeeId: employee.id,
      finalShares,
      deptBaseShares,
      roleMultipliedShares,
      performanceBonus,
      calculatedSalary: (finalShares * role.baseSalaryPoints) / 10000
    };
  };

  const closeModal = () => {
    setSuccessModal({ isOpen: false, type: 'payroll', title: '', message: '' });
  };

  // Close dropdowns when clicking outside
  /*
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.custom-dropdown-container')) {
        setIsDeptDropdownOpen(false);
        setIsRoleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  */

  if (!isAuthenticated) {
    return (
      <div className="payroll-page simple-theme">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <Building size={48} color="#10b981" />
              <h1>Corporate Payroll System</h1>
              <p>Connect your wallet to access the payroll management system</p>
            </div>
            
            <div className="auth-features">
              <div className="feature-item">
                <Users size={24} color="#10b981" />
                <span>Employee Management</span>
              </div>
              <div className="feature-item">
                <Calculator size={24} color="#10b981" />
                <span>Automated Salary Calculation</span>
              </div>
              <div className="feature-item">
                <BarChart size={24} color="#10b981" />
                <span>Department Hierarchy</span>
              </div>
              <div className="feature-item">
                <Shield size={24} color="#10b981" />
                <span>Blockchain Security</span>
              </div>
            </div>
            
            <button 
              className="auth-btn"
              onClick={handleWalletConnection}
              disabled={isLoading}
            >
              <Wallet size={20} />
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
            
            <button className="back-btn" onClick={onBack}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payroll-page simple-theme">
      
      <div className="payroll-container simple-container">
        {/* Header */}
        <div className="payroll-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Home
          </button>
          
          <div className="header-content">
            <div className="header-info">
              <Building size={40} color="#10b981" />
              <div>
                <h1>Payroll Management System</h1>
                <p>Corporate salary distribution & employee management</p>
              </div>
            </div>
            
            <div className="header-stats">
              <div className="stat-card">
                <Users size={24} color="#10b981" />
                <div>
                  <span className="stat-number">{company?.employeeCount || 0}</span>
                  <span className="stat-label">Employees</span>
                </div>
              </div>
              <div className="stat-card">
                <DollarSign size={24} color="#10b981" />
                <div>
                  <span className="stat-number">{(company?.totalPayroll || 0).toLocaleString()} STX</span>
                  <span className="stat-label">Total Payroll</span>
                </div>
              </div>
              <div className="stat-card">
                <Briefcase size={24} color="#10b981" />
                <div>
                  <span className="stat-number">{departments.length}</span>
                  <span className="stat-label">Departments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="payroll-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart size={18} />
            Overview
          </button>
          
          {userRole === 'admin' && (
            <>
              <button 
                className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
                onClick={() => setActiveTab('departments')}
              >
                <Building size={18} />
                Departments
              </button>
              
              <button 
                className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
                onClick={() => setActiveTab('employees')}
              >
                <Users size={18} />
                Employees
              </button>
              
              <button 
                className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`}
                onClick={() => setActiveTab('payroll')}
              >
                <DollarSign size={18} />
                Payroll
              </button>
            </>
          )}
          
          {userRole === 'employee' && (
            <button 
              className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
              onClick={() => setActiveTab('claims')}
            >
              <Wallet size={18} />
              My Salary
            </button>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-grid">
              <div className="overview-card simple-glass-card">
                <div className="card-header">
                  <TrendingUp size={32} color="#10b981" />
                  <h3>Company Performance</h3>
                </div>
                <div className="performance-metrics">
                  <div className="metric">
                    <span className="metric-label">Monthly Payroll</span>
                    <span className="metric-value">45,000 STX</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Active Employees</span>
                    <span className="metric-value">{employees.filter(e => e.status === 'active').length}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Avg Performance</span>
                    <span className="metric-value">94%</span>
                  </div>
                </div>
              </div>

              <div className="overview-card simple-glass-card">
                <div className="card-header">
                  <Building size={32} color="#10b981" />
                  <h3>Department Distribution</h3>
                </div>
                <div className="dept-distribution">
                  {departments.map(dept => (
                    <div key={dept.id} className="dept-item">
                      <div className="dept-info">
                        <span className="dept-name">{dept.name}</span>
                        <span className="dept-percentage">{dept.allocationPercentage}%</span>
                      </div>
                      <div className="dept-bar">
                        <div 
                          className="dept-fill"
                          style={{ width: `${dept.allocationPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-card simple-glass-card">
                <div className="card-header">
                  <Clock size={32} color="#10b981" />
                  <h3>Recent Payroll</h3>
                </div>
                <div className="recent-payroll">
                  {payrollCampaigns.slice(0, 3).map(campaign => (
                    <div key={campaign.id} className="payroll-item">
                      <div className="payroll-info">
                        <span className="payroll-name">{campaign.name}</span>
                        <span className={`payroll-status ${campaign.status}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </div>
                      <div className="payroll-amount">
                        {campaign.totalBudget.toLocaleString()} STX
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Management Section - Only for Admins */}
            {userRole === 'admin' && (
              <div className="company-management-section">
                <div className="management-card simple-glass-card">
                  <div className="card-header">
                    <Building size={32} color="#10b981" />
                    <h3>Company Management</h3>
                  </div>
                  
                  <div className="management-content">
                    <div className="budget-section">
                      <div className="budget-info">
                        <h4>Company Status</h4>
                        <div className="company-status">
                          {isCheckingCompany ? (
                            <div className="status-loading">
                              <div className="loading-spinner"></div>
                              <span>Checking company status...</span>
                            </div>
                          ) : isCompanyRegistered && company ? (
                            <div className="status-verified">
                              <CheckCircle size={20} color="#10b981" />
                              <div className="company-info">
                                <span className="company-name">✅ {company.name}</span>
                                <span className="company-details">
                                  ID: {company.id} | Employees: {company.employeeCount} | Budget: {company.totalPayroll.toLocaleString()} STX
                                </span>
                                <span className="company-registered">
                                  Registered: {company.registeredAt}
                                </span>
                              </div>
                              <button
                                className="refresh-company-btn"
                                onClick={loadCompanyData}
                                disabled={isLoading}
                                title="Refresh company data from blockchain"
                              >
                                🔄 Refresh
                              </button>
                            </div>
                          ) : (
                            <div className="status-unverified">
                              <X size={20} color="#ef4444" />
                              <div className="unregistered-info">
                                <span className="no-company-text">❌ No Company Registered</span>
                                <span className="registration-note">
                                  Register your company to start managing payroll
                                </span>
                              </div>
                              <button
                                className="register-company-btn"
                                onClick={handleRegisterCompany}
                                disabled={isLoading}
                              >
                                {isLoading ? '🔄 Registering...' : '🏢 Register Company'}
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="budget-amount">
                          <span className="budget-value">
                            💰 {companyBudget.toLocaleString()} STX
                          </span>
                          <span className="budget-label">Available Company Funds</span>
                          {company && (
                            <span className="budget-note">
                              Total Budget: {company.totalPayroll.toLocaleString()} STX
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="add-funds-section">
                        <h4>Add Funds to Company</h4>
                        <div className="funds-input-group">
                          <input
                            type="number"
                            placeholder="Amount in STX"
                            value={fundsToAdd}
                            onChange={(e) => setFundsToAdd(Number(e.target.value))}
                            className="funds-input"
                          />
                          <button
                            className="add-funds-btn"
                            onClick={handleAddFunds}
                            disabled={fundsToAdd <= 0 || isLoading || !isCompanyRegistered}
                          >
                            {!isCompanyRegistered ? 'Register Company First' : isLoading ? 'Adding...' : 'Add Funds'}
                          </button>
                        </div>
                        <p className="funds-note">
                          Funds will be added to the company budget for payroll distribution.
                        </p>
                      </div>

                      {/* STX Calculator */}
                      <div className="stx-calculator-section">
                        <h4>STX Calculator</h4>
                        <div className="calculator-container">
                          <div className="price-display">
                            <span className="price-label">Current STX Price:</span>
                            <span className="price-value">${stxPrice.toFixed(4)}</span>
                          </div>
                          
                          <div className="calculator-inputs">
                            <div className="input-group">
                              <label>STX Amount</label>
                              <input
                                type="number"
                                placeholder="Enter STX amount"
                                value={stxAmount}
                                onChange={(e) => {
                                  const stx = Number(e.target.value);
                                  setStxAmount(stx);
                                  setUsdAmount(calculateUsdAmount(stx));
                                }}
                                className="calculator-input"
                              />
                              <span className="input-suffix">STX</span>
                            </div>
                            
                            <div className="input-group">
                              <label>USD Amount</label>
                              <input
                                type="number"
                                placeholder="Enter USD amount"
                                value={usdAmount}
                                onChange={(e) => {
                                  const usd = Number(e.target.value);
                                  setUsdAmount(usd);
                                  setStxAmount(calculateStxAmount(usd));
                                }}
                                className="calculator-input"
                              />
                              <span className="input-suffix">USD</span>
                            </div>
                          </div>
                          
                          <div className="calculator-result">
                            <div className="result-item">
                              <span className="result-label">STX Value:</span>
                              <span className="result-value">{stxAmount.toFixed(4)} STX</span>
                            </div>
                            <div className="result-item">
                              <span className="result-label">USD Value:</span>
                              <span className="result-value">${usdAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="company-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Employees</span>
                        <span className="stat-value">{employees.length}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Active Departments</span>
                        <span className="stat-value">{departments.length}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Payroll Campaigns</span>
                        <span className="stat-value">{payrollCampaigns.length}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Total Distributed</span>
                        <span className="stat-value">
                          {payrollCampaigns.reduce((sum, campaign) => sum + campaign.processedAmount, 0).toLocaleString()} STX
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employee Performance Chart */}
            <div className="performance-chart-card simple-glass-card">
              <div className="card-header">
                <Award size={32} color="#10b981" />
                <h3>Top Performers</h3>
              </div>
              <div className="performance-list">
                {employees
                  .sort((a, b) => b.performanceRating - a.performanceRating)
                  .slice(0, 5)
                  .map((employee, index) => (
                    <div key={employee.id} className="performance-item">
                      <div className="performance-rank">#{index + 1}</div>
                      <div className="performance-info">
                        <span className="employee-name">{employee.name}</span>
                        <span className="employee-dept">
                          {departments.find(d => d.id === employee.departmentId)?.name}
                        </span>
                      </div>
                      <div className="performance-rating">
                        <span>{employee.performanceRating}%</span>
                        <div className="rating-bar">
                          <div 
                            className="rating-fill"
                            style={{ width: `${employee.performanceRating}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Salary Payments History */}
            <div className="salary-payments-card simple-glass-card">
              <div className="card-header">
                <DollarSign size={32} color="#10b981" />
                <h3>Recent Salary Payments</h3>
              </div>
              <div className="salary-payments-table">
                <div className="table-header">
                  <span>Employee</span>
                  <span>Campaign</span>
                  <span>Amount</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {salaryPayments.slice(0, 5).map(payment => (
                  <div key={payment.id} className="table-row">
                    <div className="employee-info">
                      <span className="employee-name">{payment.employeeName}</span>
                      <span className="employee-id">ID: {payment.employeeId}</span>
                    </div>
                    <span className="campaign-name">{payment.campaignName}</span>
                    <span className="payment-amount">{payment.amount.toLocaleString()} STX</span>
                    <span className="payment-date">
                      {new Date(payment.processedAt).toLocaleDateString()}
                    </span>
                    <span className={`payment-status ${payment.status}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                    <div className="payment-actions">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => window.open(getExplorerLink(payment.txHash), '_blank')}
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        className="action-btn copy-btn"
                        onClick={() => copyToClipboard(payment.txHash)}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && userRole === 'admin' && (
          <div className="departments-section">
            <div className="section-header">
              <div className="header-left">
                <Building size={32} color="#10b981" />
                <div>
                  <h2>Department Management</h2>
                  <p>Manage company departments, roles, and allocation percentages</p>
                </div>
              </div>
              <button 
                className="primary-btn"
                onClick={() => {
                  const modal = document.getElementById('create-dept-modal');
                  if (modal) modal.style.display = 'flex';
                }}
              >
                <Plus size={20} />
                Create Department
              </button>
            </div>

            <div className="departments-grid">
              {departments.map(dept => (
                <div key={dept.id} className="department-card simple-glass-card">
                  <div className="dept-card-header">
                    <div className="dept-info">
                      <h3>{dept.name}</h3>
                      <span className="dept-allocation">{dept.allocationPercentage}% Budget Allocation</span>
                    </div>
                    <div className="dept-actions">
                      <button className="action-btn edit-btn">
                        <Edit size={16} />
                      </button>
                      <button className="action-btn delete-btn">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="dept-stats">
                    <div className="stat">
                      <Users size={20} color="#10b981" />
                      <span>{dept.employeeCount} Employees</span>
                    </div>
                    <div className="stat">
                      <Briefcase size={20} color="#10b981" />
                      <span>{dept.roles.length} Roles</span>
                    </div>
                  </div>

                  <div className="roles-section">
                    <div className="roles-header">
                      <h4>Department Roles</h4>
                      <button 
                        className="secondary-btn"
                        onClick={() => {
                          setSelectedDepartment(dept);
                          const modal = document.getElementById('create-role-modal');
                          if (modal) modal.style.display = 'flex';
                        }}
                      >
                        <Plus size={16} />
                        Add Role
                      </button>
                    </div>
                    <div className="roles-list">
                      {dept.roles.map(role => (
                        <div key={role.id} className="role-item">
                          <div className="role-info">
                            <span className="role-name">{role.name}</span>
                            <span className="role-multiplier">{role.multiplier}% multiplier</span>
                          </div>
                          <span className="role-salary">{role.baseSalaryPoints.toLocaleString()} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {departments.length === 0 && (
                <div className="empty-state simple-glass-card">
                  <Building size={48} color="#666" />
                  <h3>No Departments</h3>
                  <p>Create your first department to get started with payroll management</p>
                  <button className="primary-btn">
                    <Plus size={20} />
                    Create Department
                  </button>
                </div>
              )}
            </div>

            {/* Create Department Modal */}
            <div id="create-dept-modal" className="modal-overlay" style={{ display: 'none' }}>
              <div className="create-modal simple-glass-card">
                <div className="modal-header">
                  <h3>Create New Department</h3>
                  <button 
                    className="close-btn"
                    onClick={() => {
                      const modal = document.getElementById('create-dept-modal');
                      if (modal) modal.style.display = 'none';
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-content">
                  <div className="form-group">
                    <label>Department Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Engineering, Marketing, Sales"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Budget Allocation (%)</label>
                    <input 
                      type="number" 
                      placeholder="Percentage of total budget"
                      max="100"
                      min="0"
                      value={newDepartment.allocation}
                      onChange={(e) => setNewDepartment({...newDepartment, allocation: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="secondary-btn"
                      onClick={() => {
                        const modal = document.getElementById('create-dept-modal');
                        if (modal) modal.style.display = 'none';
                        setNewDepartment({ name: '', allocation: 0 });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="primary-btn"
                      onClick={handleCreateDepartment}
                      disabled={!newDepartment.name || newDepartment.allocation <= 0}
                    >
                      <Save size={20} />
                      Create Department
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Role Modal */}
            <div id="create-role-modal" className="modal-overlay" style={{ display: 'none' }}>
              <div className="create-modal simple-glass-card">
                <div className="modal-header">
                  <h3>Add Role to {selectedDepartment?.name}</h3>
                  <button 
                    className="close-btn"
                    onClick={() => {
                      const modal = document.getElementById('create-role-modal');
                      if (modal) modal.style.display = 'none';
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-content">
                  <div className="form-group">
                    <label>Role Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Senior Developer, Marketing Manager"
                      value={newRole.name}
                      onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Salary Multiplier (%)</label>
                    <input 
                      type="number" 
                      placeholder="Base multiplier for this role"
                      value={newRole.multiplier}
                      onChange={(e) => setNewRole({...newRole, multiplier: parseInt(e.target.value) || 100})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Base Salary Points</label>
                    <input 
                      type="number" 
                      placeholder="Base points for salary calculation"
                      value={newRole.baseSalary}
                      onChange={(e) => setNewRole({...newRole, baseSalary: parseInt(e.target.value) || 1000})}
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="secondary-btn"
                      onClick={() => {
                        const modal = document.getElementById('create-role-modal');
                        if (modal) modal.style.display = 'none';
                        setNewRole({ deptId: '', name: '', multiplier: 100, baseSalary: 1000 });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="primary-btn"
                      onClick={handleAddRole}
                      disabled={!newRole.name || !selectedDepartment}
                    >
                      <Save size={20} />
                      Add Role
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && userRole === 'admin' && (
          <div className="employees-section">
            <div className="section-header">
              <div className="header-left">
                <Users size={32} color="#10b981" />
                <div>
                  <h2>Employee Management</h2>
                  <p>Manage company employees, assign roles, and track performance</p>
                </div>
              </div>
              <button
                className="primary-btn"
                onClick={() => {
                  const modal = document.getElementById('add-employee-modal');
                  if (modal) modal.style.display = 'flex';
                }}
              >
                <Plus size={20} />
                Add Employee
              </button>
            </div>

            <div className="employees-grid">
              {employees.map(employee => (
                <div key={employee.id} className="employee-card simple-glass-card">
                  <div className="employee-header">
                    <div className="employee-info">
                      <h3>{employee.name}</h3>
                      <p className="employee-address">{employee.address}</p>
                      <div className="employee-meta">
                        <span className="department-badge">
                          {departments.find(d => d.id === employee.departmentId)?.name || 'Unknown Dept'}
                        </span>
                        <span className="role-badge">
                          {departments.find(d => d.id === employee.departmentId)?.roles
                            .find(r => r.id === employee.roleId)?.name || 'Unknown Role'}
                        </span>
                      </div>
                    </div>
                    <div className="employee-stats">
                      <div className="stat-item">
                        <span className="stat-label">Performance</span>
                        <span className="stat-value">{employee.performanceRating}%</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Multiplier</span>
                        <span className="stat-value">{employee.individualMultiplier}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="employee-details">
                    <div className="detail-row">
                      <span>Hire Date:</span>
                      <span>{employee.hireDate}</span>
                    </div>
                    <div className="detail-row">
                      <span>Status:</span>
                      <span className={`status-badge ${employee.status}`}>
                        {employee.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Total Earned:</span>
                      <span className="amount">{employee.totalEarned.toLocaleString()} STX</span>
                    </div>
                  </div>
                  
                  <div className="employee-actions">
                    <button className="action-btn">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button className="action-btn danger">
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {employees.length === 0 && (
                <div className="empty-state simple-glass-card">
                  <Users size={48} color="#666" />
                  <h3>No Employees</h3>
                  <p>Add your first employee to start managing payroll</p>
                  <button 
                    className="primary-btn"
                    onClick={() => {
                      const modal = document.getElementById('add-employee-modal');
                      if (modal) modal.style.display = 'flex';
                    }}
                  >
                    <Plus size={20} />
                    Add Employee
                  </button>
                </div>
              )}
            </div>

            {/* Add Employee Modal */}
            <div id="add-employee-modal" className="modal-overlay" style={{ display: 'none' }}>
              <div className="create-modal simple-glass-card">
                <div className="modal-header">
                  <h3>Add New Employee</h3>
                  <button 
                    className="close-btn"
                    onClick={() => {
                      const modal = document.getElementById('add-employee-modal');
                      if (modal) modal.style.display = 'none';
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="modal-content">
                  <div className="form-group">
                    <label>Employee Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter employee full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Wallet Address</label>
                    <input 
                      type="text" 
                      placeholder="STX wallet address (SP1ABC...)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select>
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select>
                      <option value="">Select Role</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Individual Multiplier (%)</label>
                    <input 
                      type="number" 
                      placeholder="100"
                      defaultValue="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Performance Rating (%)</label>
                    <input 
                      type="number" 
                      placeholder="100" 
                      defaultValue="100"
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="secondary-btn"
                      onClick={() => {
                        const modal = document.getElementById('add-employee-modal');
                        if (modal) modal.style.display = 'none';
                      }}
                    >
                      Cancel
                    </button>
                    <button className="primary-btn">
                      <Save size={20} />
                      Add Employee
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === 'payroll' && userRole === 'admin' && (
          <div className="payroll-section">
            <div className="section-header">
              <div className="header-left">
                <DollarSign size={32} color="#10b981" />
                <div>
                  <h2>Payroll Management</h2>
                  <p>Process payroll, manage campaigns, and distribute salaries</p>
                </div>
              </div>
              <button
                className="primary-btn"
                onClick={() => {
                  const modal = document.getElementById('create-payroll-modal');
                  if (modal) modal.style.display = 'flex';
                }}
              >
                <Plus size={20} />
                Create Payroll Campaign
              </button>
            </div>

            {/* Active Payroll Campaigns */}
            <div className="campaigns-section">
              <h3>Payroll Campaigns</h3>
              <div className="campaigns-grid">
                {payrollCampaigns.map(campaign => (
                  <div key={campaign.id} className="campaign-card simple-glass-card">
                    <div className="campaign-header">
                      <div>
                        <h4>{campaign.name}</h4>
                        <p className="campaign-desc">{campaign.description}</p>
                      </div>
                      <span className={`status-badge ${campaign.status}`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="campaign-stats">
                      <div className="stat-row">
                        <span>Total Budget:</span>
                        <span className="amount">{campaign.totalBudget.toLocaleString()} STX</span>
                      </div>
                      <div className="stat-row">
                        <span>Employees:</span>
                        <span>{campaign.employeeCount}</span>
                      </div>
                      <div className="stat-row">
                        <span>Processed:</span>
                        <span className="amount">
                          {campaign.processedAmount ? campaign.processedAmount.toLocaleString() : '0'} STX
                        </span>
                      </div>
                      <div className="stat-row">
                        <span>Created:</span>
                        <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="campaign-actions">
                      {campaign.status === 'draft' && (
                        <>
                          <button 
                            className="primary-btn"
                            onClick={() => processPayroll(campaign)}
                            disabled={isLoading}
                          >
                          <TrendingUp size={16} />
                          Process Payroll
                        </button>
                          <button 
                            className="secondary-btn"
                            onClick={() => {
                              // Generate QR codes for all employees in this campaign
                              employees.forEach((emp, index) => {
                                const salary = calculateSalary(emp).calculatedSalary;
                                setTimeout(() => generateSalaryQR(emp, campaign.id, salary), index * 100);
                              });
                            }}
                            style={{ marginLeft: '8px' }}
                          >
                            <QrCode size={16} />
                            Generate QR
                          </button>
                        </>
                      )}
                      {campaign.status === 'processing' && (
                        <button className="secondary-btn" disabled>
                          <Clock size={16} />
                          Processing...
                        </button>
                      )}
                      {campaign.status === 'completed' && (
                        <>
                        <button className="success-btn">
                          <CheckCircle size={16} />
                          Completed
                        </button>
                          <button 
                            className="secondary-btn"
                            onClick={() => {
                              // Generate QR codes for completed payroll
                              employees.forEach((emp, index) => {
                                const salary = calculateSalary(emp).calculatedSalary;
                                setTimeout(() => generateSalaryQR(emp, campaign.id, salary), index * 100);
                              });
                            }}
                            style={{ marginLeft: '8px' }}
                          >
                            <QrCode size={16} />
                            View QR
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {payrollCampaigns.length === 0 && (
                  <div className="empty-state simple-glass-card">
                    <DollarSign size={48} color="#666" />
                    <h3>No Payroll Campaigns</h3>
                    <p>Create your first payroll campaign to start distributing salaries</p>
                    <button 
                      className="primary-btn"
                      onClick={() => {
                        const modal = document.getElementById('create-payroll-modal');
                        if (modal) modal.style.display = 'flex';
                      }}
                    >
                      <Plus size={20} />
                      Create Campaign
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Create Payroll Campaign Modal */}
            <div id="create-payroll-modal" className="modal-overlay" style={{ display: 'none' }}>
              <div className="create-modal simple-glass-card">
                <div className="modal-header">
                  <h3>Create Payroll Campaign</h3>
                  <button 
                    className="close-btn"
                    onClick={() => {
                      const modal = document.getElementById('create-payroll-modal');
                      if (modal) modal.style.display = 'none';
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="modal-content">
                  <div className="form-group">
                    <label>Campaign Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., December 2024 Payroll"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      placeholder="Optional description for this payroll campaign"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Budget (STX)</label>
                    <input 
                      type="number" 
                      placeholder="Total STX amount for distribution"
                    />
                  </div>
                  <div className="form-group">
                    <label>Target Employees</label>
                    <div className="checkbox-group">
                      <label className="checkbox-item">
                        <input type="checkbox" defaultChecked />
                        <span>All Active Employees ({employees.length})</span>
                      </label>
                      <label className="checkbox-item">
                        <input type="checkbox" />
                        <span>Engineering Department (12)</span>
                      </label>
                      <label className="checkbox-item">
                        <input type="checkbox" />
                        <span>Marketing Department (8)</span>
                      </label>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="secondary-btn"
                      onClick={() => {
                        const modal = document.getElementById('create-payroll-modal');
                        if (modal) modal.style.display = 'none';
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="primary-btn"
                      onClick={handleCreatePayrollCampaign}
                      disabled={!payrollForm.name || payrollForm.budget <= 0}
                    >
                      <Save size={20} />
                      Create Campaign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employee Claims Tab */}
        {activeTab === 'claims' && userRole === 'employee' && (
          <div className="claims-section">
            <div className="section-header">
              <div className="header-left">
                <Wallet size={32} color="#10b981" />
                <div>
                  <h2>My Salary Claims</h2>
                  <p>View and claim your salary payments</p>
                </div>
              </div>
            </div>

            {/* Available Claims */}
            <div className="available-claims">
              <h3>Available for Claim</h3>
              <div className="claims-grid">
                <div className="claim-card simple-glass-card available">
                  <div className="claim-header">
                    <div className="claim-info">
                      <h4>December 2024 Salary</h4>
                      <p>Your monthly salary is ready for withdrawal</p>
                    </div>
                    <div className="claim-amount">
                      <span className="amount-label">Available</span>
                      <span className="amount-value">3,500 STX</span>
                    </div>
                  </div>
                  <div className="claim-details">
                    <div className="detail-row">
                      <span>Base Salary:</span>
                      <span>3,000 STX</span>
                    </div>
                    <div className="detail-row">
                      <span>Performance Bonus:</span>
                      <span>500 STX</span>
                    </div>
                    <div className="detail-row">
                      <span>Generated:</span>
                      <span>Dec 1, 2024</span>
                    </div>
                  </div>
                  <button className="primary-btn full-width">
                    <Wallet size={20} />
                    Claim Salary
                  </button>
                </div>
              </div>
            </div>

            {/* Claim History */}
            <div className="claim-history">
              <h3>Claim History</h3>
              <div className="history-table">
                {salaryPayments.map(payment => (
                  <div key={payment.id} className="history-row simple-glass-card">
                    <div className="history-info">
                      <h4>{payment.campaignName}</h4>
                      <p>Claimed on {payment.claimedAt ? new Date(payment.claimedAt).toLocaleDateString() : 'Pending'}</p>
                    </div>
                    <div className="history-amount">
                      <span className="amount">{payment.amount.toLocaleString()} STX</span>
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="history-actions">
                      <button 
                        className="action-btn"
                        onClick={() => window.open(getExplorerLink(payment.txHash), '_blank')}
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => copyToClipboard(payment.txHash)}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successModal.isOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <CheckCircle size={48} color="#10b981" />
                <h2>{successModal.title}</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
              
              <div className="modal-content">
                <p>{successModal.message}</p>
                
                {successModal.amount && (
                  <div className="amount-display">
                    <DollarSign size={24} color="#10b981" />
                    <span>{successModal.amount.toLocaleString()} STX</span>
                  </div>
                )}
                
                {successModal.nftReceiptId && (
                  <div className="nft-receipt">
                    <h3>Receipt NFT Generated</h3>
                    <div className="nft-card">
                      <div className="nft-preview">🎫</div>
                      <div className="nft-info">
                        <span className="nft-id">NFT #{successModal.nftReceiptId}</span>
                        <span className="nft-desc">Payroll Receipt</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {successModal.txHash && (
                  <div className="blockchain-info">
                    <h3>Transaction Details</h3>
                    <div className="tx-info">
                      <span className="tx-label">Transaction Hash:</span>
                      <div className="tx-hash">
                        <span>{successModal.txHash.substring(0, 20)}...</span>
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(successModal.txHash!)}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <a 
                      href={getExplorerLink(successModal.txHash)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="explorer-link"
                    >
                      <ExternalLink size={16} />
                      View on Explorer
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModal.isOpen}
        onClose={closeQrModal}
        salaryAmount={qrModal.salaryAmount}
        employeeName={qrModal.employeeName}
        campaignName={qrModal.campaignName}
        claimUrl={qrModal.claimUrl}
      />
    </div>
  );
};

export default PayrollSystemPage;
