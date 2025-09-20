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
  X
} from 'lucide-react';
import './PayrollSystemPage.css';

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
  type: 'payroll' | 'employee' | 'department' | 'claim';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'employees' | 'payroll' | 'claims'>('overview');
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null);
  const [, setUserAddress] = useState<string>('');
  
  // Company data
  const [company, setCompany] = useState<Company | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollCampaigns, setPayrollCampaigns] = useState<PayrollCampaign[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  
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
  // const [newEmployee, setNewEmployee] = useState({ 
  //   address: '', 
  //   name: '', 
  //   deptId: '', 
  //   roleId: '', 
  //   multiplier: 100, 
  //   performance: 100 
  // });
  // const [payrollForm, setPayrollForm] = useState({ name: '', budget: 0 });
  
  // Dropdowns
  // const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  // const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  // const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  

  // Initialize mock data
  useEffect(() => {
    const mockCompany: Company = {
      id: 1,
      name: "TechCorp Solutions",
      adminAddress: "SP1ADMIN...TECH123",
      employeeCount: 25,
      totalPayroll: 450000,
      isVerified: true,
      registeredAt: "2024-01-15",
      departments: []
    };

    const mockDepartments: Department[] = [
      {
        id: "engineering",
        name: "Engineering",
        allocationPercentage: 40,
        employeeCount: 12,
        isActive: true,
        roles: [
          { id: "senior-dev", name: "Senior Developer", multiplier: 150, baseSalaryPoints: 5000, isActive: true },
          { id: "junior-dev", name: "Junior Developer", multiplier: 100, baseSalaryPoints: 3000, isActive: true },
          { id: "tech-lead", name: "Tech Lead", multiplier: 200, baseSalaryPoints: 7000, isActive: true }
        ]
      },
      {
        id: "marketing",
        name: "Marketing",
        allocationPercentage: 25,
        employeeCount: 8,
        isActive: true,
        roles: [
          { id: "marketing-manager", name: "Marketing Manager", multiplier: 140, baseSalaryPoints: 4500, isActive: true },
          { id: "content-creator", name: "Content Creator", multiplier: 110, baseSalaryPoints: 3200, isActive: true }
        ]
      },
      {
        id: "hr",
        name: "Human Resources",
        allocationPercentage: 20,
        employeeCount: 3,
        isActive: true,
        roles: [
          { id: "hr-manager", name: "HR Manager", multiplier: 130, baseSalaryPoints: 4000, isActive: true },
          { id: "hr-specialist", name: "HR Specialist", multiplier: 110, baseSalaryPoints: 3500, isActive: true }
        ]
      },
      {
        id: "finance",
        name: "Finance",
        allocationPercentage: 15,
        employeeCount: 2,
        isActive: true,
        roles: [
          { id: "cfo", name: "CFO", multiplier: 250, baseSalaryPoints: 8000, isActive: true },
          { id: "accountant", name: "Accountant", multiplier: 120, baseSalaryPoints: 3800, isActive: true }
        ]
      }
    ];

    const mockEmployees: Employee[] = [
      {
        id: 1,
        address: "SP1EMP...DEV001",
        name: "Ahmet Yılmaz",
        departmentId: "engineering",
        roleId: "senior-dev",
        individualMultiplier: 120,
        performanceRating: 95,
        hireDate: "2023-03-15",
        status: 'active',
        totalEarned: 125000,
        lastPayroll: "2024-09-01"
      },
      {
        id: 2,
        address: "SP1EMP...DEV002",
        name: "Fatma Kaya",
        departmentId: "engineering",
        roleId: "tech-lead",
        individualMultiplier: 130,
        performanceRating: 98,
        hireDate: "2022-11-08",
        status: 'active',
        totalEarned: 180000,
        lastPayroll: "2024-09-01"
      },
      {
        id: 3,
        address: "SP1EMP...MKT001",
        name: "Mehmet Özkan",
        departmentId: "marketing",
        roleId: "marketing-manager",
        individualMultiplier: 110,
        performanceRating: 88,
        hireDate: "2023-06-20",
        status: 'active',
        totalEarned: 95000,
        lastPayroll: "2024-09-01"
      },
      {
        id: 4,
        address: "SP1EMP...HR001",
        name: "Ayşe Demir",
        departmentId: "hr",
        roleId: "hr-manager",
        individualMultiplier: 115,
        performanceRating: 92,
        hireDate: "2023-01-10",
        status: 'active',
        totalEarned: 87000,
        lastPayroll: "2024-09-01"
      },
      {
        id: 5,
        address: "SP1EMP...FIN001",
        name: "Can Mutlu",
        departmentId: "finance",
        roleId: "cfo",
        individualMultiplier: 140,
        performanceRating: 96,
        hireDate: "2022-08-01",
        status: 'active',
        totalEarned: 220000,
        lastPayroll: "2024-09-01"
      }
    ];

    const mockPayrollCampaigns: PayrollCampaign[] = [
      {
        id: 1,
        name: "September 2024 Payroll",
        description: "Monthly salary distribution for all departments",
        totalBudget: 45000,
        processedAmount: 45000,
        employeeCount: 25,
        status: 'completed',
        createdAt: "2024-09-01T09:00:00Z",
        processedAt: "2024-09-01T15:30:00Z"
      },
      {
        id: 2,
        name: "October 2024 Payroll",
        description: "Regular monthly payroll with Q4 performance bonuses",
        totalBudget: 47000,
        processedAmount: 0,
        employeeCount: 25,
        status: 'draft',
        createdAt: "2024-10-01T09:00:00Z"
      }
    ];

    const mockSalaryPayments: SalaryPayment[] = [
      {
        id: 1,
        employeeId: 1,
        employeeName: "Ahmet Yılmaz",
        campaignId: 1,
        campaignName: "September 2024 Payroll",
        amount: 1800,
        processedAt: "2024-09-01T15:30:00Z",
        claimedAt: "2024-09-02T10:15:00Z",
        txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        nftReceiptId: 3001,
        status: 'claimed'
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: "Fatma Kaya",
        campaignId: 1,
        campaignName: "September 2024 Payroll",
        amount: 2200,
        processedAt: "2024-09-01T15:30:00Z",
        claimedAt: "2024-09-02T14:22:00Z",
        txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
        nftReceiptId: 3002,
        status: 'claimed'
      },
      {
        id: 3,
        employeeId: 3,
        employeeName: "Mehmet Özkan",
        campaignId: 1,
        campaignName: "September 2024 Payroll",
        amount: 1600,
        processedAt: "2024-09-01T15:30:00Z",
        claimedAt: "2024-09-03T09:45:00Z",
        txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
        nftReceiptId: 3003,
        status: 'claimed'
      },
      {
        id: 4,
        employeeId: 4,
        employeeName: "Ayşe Demir",
        campaignId: 1,
        campaignName: "September 2024 Payroll",
        amount: 1500,
        processedAt: "2024-09-01T15:30:00Z",
        claimedAt: "2024-09-03T16:20:00Z",
        txHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
        nftReceiptId: 3004,
        status: 'claimed'
      },
      {
        id: 5,
        employeeId: 5,
        employeeName: "Can Mutlu",
        campaignId: 1,
        campaignName: "September 2024 Payroll",
        amount: 2800,
        processedAt: "2024-09-01T15:30:00Z",
        claimedAt: "2024-09-04T11:30:00Z",
        txHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
        nftReceiptId: 3005,
        status: 'claimed'
      }
    ];

    setCompany(mockCompany);
    setDepartments(mockDepartments);
    setEmployees(mockEmployees);
    setPayrollCampaigns(mockPayrollCampaigns);
    setSalaryPayments(mockSalaryPayments);

    // Auto-authenticate as admin for demo
    setTimeout(() => {
      setIsAuthenticated(true);
      setUserRole('admin');
      setUserAddress('SP1ADMIN...TECH123');
    }, 1000);
  }, []);

  // Utility functions
  const getExplorerLink = (txHash: string): string => {
    return `https://explorer.hiro.so/txid/${txHash}?chain=mainnet`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Authentication
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // Mock authentication
      setIsAuthenticated(true);
      setUserRole('admin'); // or 'employee'
      setUserAddress('SP1ADMIN...TECH123');
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Department management
  const createDepartment = async () => {
    if (!newDepartment.name || newDepartment.allocation <= 0) return;
    
    setIsLoading(true);
    try {
      const deptId = newDepartment.name.toLowerCase().replace(/\s+/g, '-');
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
        txHash: '0x' + Math.random().toString(16).substring(2, 66)
      });
    } catch (error) {
      console.error('Failed to create department:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Employee management
  /*
  const addEmployee = async () => {
    if (!newEmployee.address || !newEmployee.name || !newEmployee.deptId || !newEmployee.roleId) return;
    
    setIsLoading(true);
    try {
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
        message: `${employee.name} has been successfully added to the payroll system.`,
        txHash: '0x' + Math.random().toString(16).substring(2, 66),
        nftReceiptId: 2000 + employee.id
      });
    } catch (error) {
      console.error('Failed to add employee:', error);
    } finally {
      setIsLoading(false);
    }
  };
  */

  // Payroll processing
  /*
  const processPayroll = async (campaign: PayrollCampaign) => {
    setIsLoading(true);
    try {
      // Mock payroll processing
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
        txHash: '0x' + Math.random().toString(16).substring(2, 66)
      });
    } catch (error) {
      console.error('Failed to process payroll:', error);
    } finally {
      setIsLoading(false);
    }
  };
  */

  // Salary claim (for employees)
  /*
  const claimSalary = async () => {
    if (userRole !== 'employee') return;
    
    setIsLoading(true);
    try {
      const pendingAmount = 3500; // Mock pending salary
      
      setSuccessModal({
        isOpen: true,
        type: 'claim',
        title: 'Salary Claimed!',
        message: `Successfully claimed your salary payment.`,
        amount: pendingAmount,
        txHash: '0x' + Math.random().toString(16).substring(2, 66),
        nftReceiptId: 3000 + Math.floor(Math.random() * 1000)
      });
    } catch (error) {
      console.error('Failed to claim salary:', error);
    } finally {
      setIsLoading(false);
    }
  };
  */

  // Calculate employee salary
  /*
  const calculateSalary = (employee: Employee): SalaryCalculation => {
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
    
    const deptBaseShares = dept.allocationPercentage * 100;
    const roleMultipliedShares = (deptBaseShares * role.multiplier) / 100;
    const performanceBonus = (roleMultipliedShares * employee.performanceRating) / 100;
    const individualAdjusted = (roleMultipliedShares * employee.individualMultiplier) / 100;
    const finalShares = individualAdjusted + (performanceBonus - roleMultipliedShares);
    
    return {
      employeeId: employee.id,
      finalShares,
      deptBaseShares,
      roleMultipliedShares,
      performanceBonus,
      calculatedSalary: (finalShares * role.baseSalaryPoints) / 10000
    };
  };
  */

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
              onClick={connectWallet}
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
                      onClick={createDepartment}
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
                      onClick={() => {
                        // Add role logic here
                        const modal = document.getElementById('create-role-modal');
                        if (modal) modal.style.display = 'none';
                      }}
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
                        <button className="primary-btn">
                          <TrendingUp size={16} />
                          Process Payroll
                        </button>
                      )}
                      {campaign.status === 'processing' && (
                        <button className="secondary-btn" disabled>
                          <Clock size={16} />
                          Processing...
                        </button>
                      )}
                      {campaign.status === 'completed' && (
                        <button className="success-btn">
                          <CheckCircle size={16} />
                          Completed
                        </button>
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
                    <button className="primary-btn">
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
    </div>
  );
};

export default PayrollSystemPage;
