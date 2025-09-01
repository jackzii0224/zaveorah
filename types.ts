export type Page = 'dashboard' | 'sales' | 'inventory' | 'contacts' | 'employees' | 'invoicing' | 'settings' | 'finance' | 'learning';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'tp';

export type UserRole = 'owner' | 'manager' | 'staff' | 'employee';

export type SubscriptionStatus = 'trial' | 'active' | 'lapsed' | 'none' | 'pending' | 'rejected';
export type SubscriptionTier = 'lifetime';

export interface Business {
  id: string;
  name: string;
  ownerEmail?: string;
  ownerPhone?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiry?: string; // ISO string
  trialStartDate?: string; // ISO string
  hasBeenNotifiedOfApproval?: boolean;
  // Fields for manual payment approval
  pendingSubscriptionTier?: SubscriptionTier;
  pendingPaymentAmount?: number;
  pendingPaymentReceipt?: string; // base64 string
  rejectionReason?: string;
}

export interface User {
  id: string;
  name: string;
  password?: string; // For app login
  pin?: string;      // For employee clock-in
  role: UserRole;
  employeeId?: string; // Links user account to an employee record
}

export interface Sale {
  id: string;
  date: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'credit' | 'mobile';
  createdBy: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'stock' | 'rent' | 'wages' | 'utilities' | 'transport' | 'fuel';
  amount: number;
  receipt?: string; 
  createdBy: string;
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  alertLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  createdBy: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  creditBalance: number;
  dueDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  paymentDue: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  clockIn: string; // ISO string
  clockOut?: string; // ISO string
}

export interface Payslip {
  id: string;
  employeeId: string;
  period: string;
  totalHours: number;
  totalPay: number;
  generatedDate: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  wageRate: number; // per hour
  wageType: 'hourly' | 'weekly' | 'monthly';
  reportsTo?: string; // employeeId of manager
}

export interface BusinessProfile {
  name: string;
  logo: string; // base64 string
  address: string;
  contact: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  total: number;
  status: 'paid' | 'sent' | 'overdue' | 'draft';
  notes?: string;
}

export interface LoanRepayment {
  id: string;
  date: string;
  amount: number;
}
export interface Loan {
  id: string;
  lender: string;
  initialAmount: number;
  repayments: LoanRepayment[];
  dateTaken: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface LearningArticle {
  id: string;
  titleKey: string;
  contentKey: string;
  icon: string;
}

export interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  // Multi-tenant state
  businesses: Business[];
  currentBusinessId: string | null;
  currentBusiness: Business | null;
  currentUser: User | null;
  isAdminMode: boolean;
  subscriptionRequired: boolean;
  isUpgradeFlow: boolean;
  setUpgradeFlow: (isFlow: boolean) => void;
  fullData: {
    businesses: Business[];
    data: Record<string, any>;
  };

  // Data for the current business
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  payslips: Payslip[];
  invoices: Invoice[];
  loans: Loan[];
  savingGoals: SavingGoal[];
  businessProfile: BusinessProfile;
  users: User[];

  permissions: { [key: string]: UserRole[] };
  
  // Auth & Subscription functions
  login: (businessId: string, userId: string, password: string) => boolean;
  logout: () => void;
  registerBusiness: (businessName: string, ownerName: string, ownerPassword: string, ownerEmail: string, ownerPhone: string) => void;
  getUsersForBusiness: (businessId: string) => User[] | undefined;
  adminLogin: () => boolean;
  impersonateUser: (businessId: string, userId: string) => void;
  startTrial: () => void;
  submitForApproval: (tier: SubscriptionTier, amount: number, receipt: string) => void;
  approvePayment: (businessId: string) => void;
  rejectPayment: (businessId: string, reason: string) => void;
  markApprovalAsNotified: (businessId: string) => void;
  
  // Business data functions
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'createdBy'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date' | 'createdBy'>) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdBy'>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'total'>) => void;
  updateBusinessProfile: (profile: BusinessProfile) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'reportsTo'>, pin: string) => void; // Pin is needed to create a user
  deleteEmployee: (employeeId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  clockIn: (pin: string) => boolean;
  clockOut: (pin: string) => boolean;
  generatePayslip: (employeeId: string, period: string) => void;
  addLoan: (loan: Omit<Loan, 'id' | 'repayments'>) => void;
  addLoanRepayment: (loanId: string, amount: number) => void;
  addSavingGoal: (goal: Omit<SavingGoal, 'id' | 'currentAmount'>) => void;
  addContributionToSaving: (goalId: string, amount: number) => void;
  
  // Super admin functions
  exportAllData: () => void;
  wipeAllData: () => void;
}