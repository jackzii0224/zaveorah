import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { 
    AppContextType, Theme, Language, Sale, Expense, Product, Customer, Supplier, Employee, 
    BusinessProfile, Invoice, AttendanceRecord, Payslip, Loan, LoanRepayment, SavingGoal, User, UserRole, Business, SubscriptionTier
} from '../types';
import { translations } from '../lib/i18n';

const AppContext = createContext<AppContextType | null>(null);

const APP_DATA_KEY = 'zaveOrahMultiBizData';

const permissions: { [key: string]: UserRole[] } = {
  dashboard: ['owner', 'manager', 'staff', 'employee'],
  sales: ['owner', 'manager', 'staff'],
  inventory: ['owner', 'manager', 'staff'],
  contacts: ['owner', 'manager', 'staff'],
  employees: ['owner', 'manager', 'employee'],
  invoicing: ['owner', 'manager', 'staff'],
  finance: ['owner'],
  learning: ['owner', 'manager', 'staff', 'employee'],
  settings: ['owner', 'manager'],
  canAdd: ['owner', 'manager', 'staff'],
  canEdit: ['owner', 'manager'],
  canDelete: ['owner'],
  canManageUsers: ['owner', 'manager'],
  canViewReports: ['owner', 'manager'],
};

const createInitialBusinessData = (businessName: string, ownerName: string, ownerPassword: string) => {
    const ownerId = `user-${Date.now()}`;
    return {
        users: [{ id: ownerId, name: ownerName, password: ownerPassword, role: 'owner' }] as User[],
        sales: [] as Sale[],
        expenses: [] as Expense[],
        products: [] as Product[],
        customers: [] as Customer[],
        suppliers: [] as Supplier[],
        employees: [] as Employee[],
        attendance: [] as AttendanceRecord[],
        payslips: [] as Payslip[],
        invoices: [] as Invoice[],
        loans: [] as Loan[],
        savingGoals: [] as SavingGoal[],
        businessProfile: {
            name: businessName,
            logo: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0idy02IGgtNiI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNC41IDMuNzVBNi43NSA2Ljc1IDAgMDAtMi4yNSA5YzAgMS43NjcgMS4yNzggMy4yNDYgMyA0LjAyMlYxOS41YTMyLjI1IDMyLjI1IDAgMDExMy41IDBoLjc1YTIuMjUgMi4yNSAwIDAwMi4yNS0yLjI1di00LjQ3OGMzLjI5OC0xLjI0NyA1LjQzNy00LjM4IDUuNDM3LTcuNzcxQTYuNzUgNi43NSAwIDAwMTkuNSA0LjUxMlY0LjVhMi4yNSAyLjI1IDAgMDAtMi4yNS0yLjI1aC0xLjVhMi4yNSAyLjI1IDAgMDAtMi4yNSAyLjI1djEuMjM4QTguMTk0IDguMTk0IDAgMDAxMiA3LjVhOC4xOTMgOC4xOTMgMCAwMC0xLjQwMi0xLjAxMlY0LjVBMi4yNSAyLjI1mAgMDAtOC4yNSAyaC0xLjVBMi4yNSAyLjI1IDAgMDAtNC41IDQuNXYtLjc1ek0xMiAxMi43NWE0LjUgNC41IDAgMDAtNDUgNC41IDQuNSA0LjUgMCAwMDQ1LTQuNXoiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+Cg==",
            address: "Waigani, Port Moresby, NCD",
            contact: "contact@business.com",
        } as BusinessProfile
    };
};

const initialMultiTenantData = {
    businesses: [] as Business[],
    data: {} as Record<string, ReturnType<typeof createInitialBusinessData>>
};

const isSubscriptionActive = (business: Business | null): boolean => {
    if (!business) return false;

    if (business.subscriptionStatus === 'active' && business.subscriptionExpiry) {
        return new Date(business.subscriptionExpiry) > new Date();
    }
    if (business.subscriptionStatus === 'trial' && business.trialStartDate) {
        const trialEndDate = new Date(business.trialStartDate);
        trialEndDate.setDate(trialEndDate.getDate() + 3);
        return trialEndDate > new Date();
    }
    return false;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');
    const [language, setLanguage] = useState<Language>('en');
    
    const [data, setData] = useState(() => {
        const savedData = localStorage.getItem(APP_DATA_KEY);
        if (!savedData) {
            return initialMultiTenantData;
        }

        try {
            const parsed = JSON.parse(savedData);
            
            if (!parsed.businesses || !parsed.data) {
                throw new Error("Saved data is missing required properties ('businesses' or 'data').");
            }
            
            // Migration for existing users without subscription fields
            parsed.businesses.forEach((biz: Business) => {
                if (!biz.subscriptionStatus) {
                    biz.subscriptionStatus = 'active'; // Grandfather old users
                    biz.subscriptionTier = 'lifetime';
                    // Set expiry to 100 years from now for grandfathered users
                    const expiryDate = new Date();
                    expiryDate.setFullYear(expiryDate.getFullYear() + 100);
                    biz.subscriptionExpiry = expiryDate.toISOString();
                }
            });
            return parsed;

        } catch (error) {
            console.error("Failed to load or parse data from localStorage. Creating a backup.", error);
            
            try {
                const backupKey = `${APP_DATA_KEY}_backup_${new Date().toISOString()}`;
                localStorage.setItem(backupKey, savedData);
                alert(
                    "Warning: There was an issue loading your saved data. A backup has been created. The application will now start with fresh data. Please contact support if you need to recover your data."
                );
            } catch (backupError) {
                 console.error("Failed to save backup of corrupted data", backupError);
                 alert(
                    "Critical Error: Could not load your saved data, and also failed to create a backup. The application will now start with fresh data. Your previous data might be lost."
                 );
            }
            
            return initialMultiTenantData;
        }
    });
    
    const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [subscriptionRequired, setSubscriptionRequired] = useState(false);
    const [isUpgradeFlow, setUpgradeFlow] = useState(false);

    const currentBusiness = useMemo(() => {
        if (!currentBusinessId) return null;
        return data.businesses.find(b => b.id === currentBusinessId) || null;
    }, [currentBusinessId, data.businesses]);


    useEffect(() => {
        try {
            localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [data]);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) setTheme(storedTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    }, []);

    const t = useCallback((key: string): string => {
        return translations[key]?.[language] || key;
    }, [language]);
    
    const getUsersForBusiness = useCallback((businessId: string): User[] | undefined => {
        return data.data[businessId]?.users;
    }, [data.data]);

    const updateBusinessData = (updater: (businessData: any) => any) => {
        if (!currentBusinessId) return;
        setData(prev => {
            const currentData = prev.data[currentBusinessId];
            const updatedData = updater(currentData);
            return {
                ...prev,
                data: {
                    ...prev.data,
                    [currentBusinessId]: updatedData
                }
            };
        });
    };

    const login = (businessId: string, userId: string, password: string) => {
        const businessData = data.data[businessId];
        const business = data.businesses.find(b => b.id === businessId);
        if (!businessData || !business) return false;
        
        const user = businessData.users.find(u => u.id === userId && u.password === password);
        if (user) {
            setIsAdminMode(false);
            setCurrentBusinessId(businessId);
            setCurrentUser(user);
            setUpgradeFlow(false);

            const isActive = isSubscriptionActive(business);
            if (!isActive && business.subscriptionStatus !== 'pending' && business.subscriptionStatus !== 'rejected') {
                if (business.subscriptionStatus !== 'none') { // Lapsed
                     setData(prev => ({
                        ...prev,
                        businesses: prev.businesses.map(b => b.id === businessId ? { ...b, subscriptionStatus: 'lapsed' } : b)
                    }));
                }
                setSubscriptionRequired(true);
            } else {
                setSubscriptionRequired(false);
            }
            return true;
        }
        return false;
    };

    const adminLogin = useCallback(() => {
        setIsAdminMode(true);
        setCurrentUser({ id: 'admin-user', name: 'Super Admin', role: 'owner' });
        setCurrentBusinessId(null);
        setSubscriptionRequired(false);
        setUpgradeFlow(false);
        return true;
    }, []);
    
    const impersonateUser = (businessId: string, userId: string) => {
        const businessData = data.data[businessId];
        if (!businessData) return;
        
        const user = businessData.users.find(u => u.id === userId);
        if (user) {
            setIsAdminMode(false);
            setCurrentBusinessId(businessId);
            setCurrentUser(user);
            setSubscriptionRequired(false); // Admins bypass subscription check
            setUpgradeFlow(false);
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setCurrentBusinessId(null);
        setIsAdminMode(false);
        setSubscriptionRequired(false);
        setUpgradeFlow(false);
    };

    const registerBusiness = (businessName: string, ownerName: string, ownerPassword: string, ownerEmail: string, ownerPhone: string) => {
        const newBusinessId = `biz-${Date.now()}`;
        const newBusiness: Business = { 
            id: newBusinessId, 
            name: businessName,
            ownerEmail,
            ownerPhone,
            subscriptionStatus: 'none',
        };
        const newBusinessData = createInitialBusinessData(businessName, ownerName, ownerPassword);
        
        setData(prev => ({
            businesses: [...prev.businesses, newBusiness],
            data: {
                ...prev.data,
                [newBusinessId]: newBusinessData
            }
        }));
    };
    
    const startTrial = () => {
        if (!currentBusinessId) return;
        setData(prev => ({
            ...prev,
            businesses: prev.businesses.map(b => 
                b.id === currentBusinessId 
                ? { ...b, subscriptionStatus: 'trial', trialStartDate: new Date().toISOString() } 
                : b
            )
        }));
        setSubscriptionRequired(false);
        setUpgradeFlow(false);
    };

    const submitForApproval = (tier: SubscriptionTier, amount: number, receipt: string) => {
        if (!currentBusinessId) return;
        setData(prev => ({
            ...prev,
            businesses: prev.businesses.map(b =>
                b.id === currentBusinessId
                ? {
                    ...b,
                    subscriptionStatus: 'pending',
                    pendingSubscriptionTier: tier,
                    pendingPaymentAmount: amount,
                    pendingPaymentReceipt: receipt,
                    rejectionReason: undefined, // Clear previous rejection
                  }
                : b
            )
        }));
        setUpgradeFlow(false);
    };

    const approvePayment = (businessId: string) => {
        setData(prev => {
            const businessToApprove = prev.businesses.find(b => b.id === businessId);
            if (!businessToApprove || !businessToApprove.pendingSubscriptionTier) return prev;

            // Simulate sending notifications
            if (businessToApprove.ownerEmail) {
                alert(`Business Approved.\n\nSimulating sending notification to ${businessToApprove.ownerEmail}:\n"Congratulations! Your business '${businessToApprove.name}' has been approved."`);
            } else {
                alert('Approval successful! User will now have access.');
            }

            const tier = businessToApprove.pendingSubscriptionTier;
            const now = new Date();
            let expiryDate = new Date();
            
            if (tier === 'lifetime') {
                expiryDate.setFullYear(now.getFullYear() + 100);
            }

            return {
                ...prev,
                businesses: prev.businesses.map(b =>
                    b.id === businessId
                    ? {
                        ...b,
                        subscriptionStatus: 'active',
                        subscriptionTier: tier,
                        subscriptionExpiry: expiryDate.toISOString(),
                        hasBeenNotifiedOfApproval: false,
                        pendingSubscriptionTier: undefined,
                        pendingPaymentAmount: undefined,
                        pendingPaymentReceipt: undefined,
                        rejectionReason: undefined
                      }
                    : b
                )
            };
        });
    };

    const rejectPayment = (businessId: string, reason: string) => {
        const businessToReject = data.businesses.find(b => b.id === businessId);
        if (businessToReject?.ownerEmail) {
            alert(`Business Rejected.\n\nSimulating sending notification to ${businessToReject.ownerEmail}:\n"Your registration for '${businessToReject.name}' was not approved. Reason: ${reason}"`);
        }

        setData(prev => ({
            ...prev,
            businesses: prev.businesses.map(b =>
                b.id === businessId
                ? {
                    ...b,
                    subscriptionStatus: 'rejected',
                    rejectionReason: reason,
                  }
                : b
            )
        }));
    };

    const markApprovalAsNotified = (businessId: string) => {
        setData(prev => ({
            ...prev,
            businesses: prev.businesses.map(b =>
                b.id === businessId
                ? { ...b, hasBeenNotifiedOfApproval: true }
                : b
            )
        }));
    };

    const exportAllData = () => {
        try {
            const allData = localStorage.getItem(APP_DATA_KEY);
            if (allData) {
                const blob = new Blob([allData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'zaveorah_backup.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Failed to export data", error);
        }
    };

    const wipeAllData = () => {
        setData(initialMultiTenantData);
        logout();
    };

    const addUser = (user: Omit<User, 'id'>) => {
        if (!currentUser || !permissions.canManageUsers.includes(currentUser.role)) return;
        const newUser: User = { id: `user-${Date.now()}`, ...user };
        updateBusinessData(d => ({ ...d, users: [...d.users, newUser]}));
    };
    
    const updateUser = (updatedUser: User) => {
        if (!currentUser || !permissions.canManageUsers.includes(currentUser.role)) return;
        updateBusinessData(d => ({
            ...d,
            users: d.users.map(u => u.id === updatedUser.id ? updatedUser : u)
        }));
    };

    const deleteUser = (userId: string) => {
        if (!currentUser || !permissions.canManageUsers.includes(currentUser.role)) return;
        if (currentUser.id === userId) return; // Prevent self-deletion
        updateBusinessData(d => ({
            ...d,
            users: d.users.filter(u => u.id !== userId)
        }));
    };
    
    const addSale = (sale: Omit<Sale, 'id' | 'date' | 'createdBy'>) => {
        if (!currentUser) return;
        const newSale: Sale = { id: `sale-${Date.now()}`, date: new Date().toISOString().split('T')[0], createdBy: currentUser.name, ...sale };
        updateBusinessData(d => ({ ...d, sales: [newSale, ...d.sales] }));

        if (sale.paymentMethod === 'credit') {
            const customer = data.data[currentBusinessId!]?.customers.find(c => c.name === sale.customerName);
            if (customer) {
                addInvoice({
                    customerId: customer.id, customerName: customer.name, issueDate: newSale.date,
                    dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
                    items: [{ description: `Credit sale`, quantity: 1, unitPrice: sale.amount }],
                    notes: 'Thank you for your business.'
                });
            }
        }
    };
    
    const addExpense = (expense: Omit<Expense, 'id' | 'date' | 'createdBy'>) => {
        if (!currentUser) return;
        const newExpense: Expense = { id: `exp-${Date.now()}`, date: new Date().toISOString().split('T')[0], createdBy: currentUser.name, ...expense };
        updateBusinessData(d => ({ ...d, expenses: [newExpense, ...d.expenses] }));
    };

    const addProduct = (product: Omit<Product, 'id' | 'createdBy'>) => {
        if (!currentUser) return;
        const newProduct: Product = { id: `prod-${Date.now()}`, createdBy: currentUser.name, ...product };
        updateBusinessData(d => ({ ...d, products: [newProduct, ...d.products] }));
    };

    const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'total'>) => {
        updateBusinessData(d => {
            const newInvoice: Invoice = {
                id: `inv-${Date.now()}`,
                invoiceNumber: `2024-${String(d.invoices.length + 1).padStart(3, '0')}`,
                status: new Date(invoiceData.dueDate) < new Date() ? 'overdue' : 'sent',
                total: invoiceData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
                ...invoiceData
            };
            return { ...d, invoices: [newInvoice, ...d.invoices] };
        });
    };

    const updateBusinessProfile = (profile: BusinessProfile) => {
        if (!currentUser || !permissions.settings.includes(currentUser.role)) return;
        updateBusinessData(d => ({ ...d, businessProfile: profile }));
    };

    const addEmployee = (employee: Omit<Employee, 'id'>, pin: string) => {
        if (!currentUser || !permissions.canManageUsers.includes(currentUser.role)) return;
        const newEmployee: Employee = { id: `emp-${Date.now()}`, ...employee };
        const newUser: User = {
            id: `user-${Date.now()}`, name: newEmployee.name, pin, role: 'employee', employeeId: newEmployee.id
        };
        updateBusinessData(d => ({ ...d, employees: [...d.employees, newEmployee], users: [...d.users, newUser] }));
    };

    const deleteEmployee = (employeeId: string) => {
        if (!currentUser || !permissions.canDelete.includes(currentUser.role)) return;
        updateBusinessData(d => {
            const employeeToDelete = d.employees.find(e => e.id === employeeId);
            if (!employeeToDelete) return d;
            const userToDelete = d.users.find(u => u.employeeId === employeeId);
            if (userToDelete && userToDelete.id === currentUser.id) return d;
            const updatedEmployees = d.employees.filter(e => e.id !== employeeId).map(e => e.reportsTo === employeeId ? { ...e, reportsTo: undefined } : e);
            const updatedUsers = userToDelete ? d.users.filter(u => u.id !== userToDelete.id) : d.users;
            return { ...d, employees: updatedEmployees, users: updatedUsers };
        });
    };
    
    const clockIn = (pin: string) => {
        const businessData = data.data[currentBusinessId!];
        const user = businessData.users.find(u => u.pin === pin);
        if (!user || !user.employeeId) return false;
        
        const existingRecord = businessData.attendance.find(a => a.employeeId === user.employeeId && !a.clockOut);
        if (existingRecord) return false;

        const newRecord: AttendanceRecord = { id: `att-${Date.now()}`, employeeId: user.employeeId, clockIn: new Date().toISOString() };
        updateBusinessData(d => ({ ...d, attendance: [...d.attendance, newRecord] }));
        return true;
    };
    
    const clockOut = (pin: string) => {
        const businessData = data.data[currentBusinessId!];
        const user = businessData.users.find(u => u.pin === pin);
        if (!user || !user.employeeId) return false;
        
        const recordToUpdate = businessData.attendance.find(a => a.employeeId === user.employeeId && !a.clockOut);
        if (!recordToUpdate) return false;

        updateBusinessData(d => ({
            ...d,
            attendance: d.attendance.map(a => a.id === recordToUpdate.id ? { ...a, clockOut: new Date().toISOString() } : a)
        }));
        return true;
    };

    const generatePayslip = (employeeId: string, period: string) => {
        if (!currentUser || !permissions.canViewReports.includes(currentUser.role)) return;
        updateBusinessData(d => {
            const [startDate, endDate] = period.split(' to ');
            const employee = d.employees.find(e => e.id === employeeId);
            if (!employee) return d;
            const relevantAttendance = d.attendance.filter(a => a.employeeId === employeeId && a.clockOut && new Date(a.clockIn) >= new Date(startDate) && new Date(a.clockIn) <= new Date(endDate));
            const totalHours = relevantAttendance.reduce((total, record) => total + (new Date(record.clockOut!).getTime() - new Date(record.clockIn).getTime()) / 3600000, 0);
            const totalPay = totalHours * employee.wageRate;
            const newPayslip: Payslip = { id: `slip-${Date.now()}`, employeeId, period, totalHours, totalPay, generatedDate: new Date().toISOString().split('T')[0] };
            return { ...d, payslips: [...d.payslips, newPayslip] };
        });
    };
    
    const addLoan = (loan: Omit<Loan, 'id' | 'repayments'>) => {
        const newLoan: Loan = { id: `loan-${Date.now()}`, repayments: [], ...loan };
        updateBusinessData(d => ({ ...d, loans: [...d.loans, newLoan] }));
    };
    
    const addLoanRepayment = (loanId: string, amount: number) => {
        const newRepayment: LoanRepayment = { id: `rep-${Date.now()}`, date: new Date().toISOString().split('T')[0], amount };
        updateBusinessData(d => ({
            ...d,
            loans: d.loans.map(l => l.id === loanId ? { ...l, repayments: [...l.repayments, newRepayment] } : l)
        }));
    };

    const addSavingGoal = (goal: Omit<SavingGoal, 'id' | 'currentAmount'>) => {
        const newGoal: SavingGoal = { id: `sg-${Date.now()}`, currentAmount: 0, ...goal };
        updateBusinessData(d => ({ ...d, savingGoals: [...d.savingGoals, newGoal] }));
    };

    const addContributionToSaving = (goalId: string, amount: number) => {
        updateBusinessData(d => ({
            ...d,
            savingGoals: d.savingGoals.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g)
        }));
    };

    const currentBusinessData = (isAdminMode || !currentBusinessId || !data.data[currentBusinessId]) 
        ? createInitialBusinessData('', '', '') 
        : data.data[currentBusinessId];

    const value: AppContextType = useMemo(() => ({
        theme, toggleTheme, language, setLanguage, t,
        businesses: data.businesses,
        currentBusinessId,
        currentBusiness,
        currentUser,
        ...currentBusinessData,
        isAdminMode,
        subscriptionRequired,
        isUpgradeFlow, 
        setUpgradeFlow,
        fullData: data,
        permissions,
        login, logout, registerBusiness,
        getUsersForBusiness,
        adminLogin,
        impersonateUser,
        startTrial,
        submitForApproval,
        approvePayment,
        rejectPayment,
        markApprovalAsNotified,
        addUser, updateUser, deleteUser,
        addSale, addExpense, addProduct, addInvoice,
        updateBusinessProfile, addEmployee, deleteEmployee,
        clockIn, clockOut, generatePayslip,
        addLoan, addLoanRepayment, addSavingGoal, addContributionToSaving,
        exportAllData, wipeAllData
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [theme, toggleTheme, language, t, data, currentUser, currentBusinessId, currentBusiness, isAdminMode, subscriptionRequired, isUpgradeFlow, getUsersForBusiness, adminLogin]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;