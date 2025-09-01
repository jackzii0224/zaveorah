import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import Modal from './common/Modal';
import { useAppContext } from '../hooks/useAppContext';
import { Sale, Expense } from '../types';
import SalesReport from './SalesReport';

type Tab = 'sales' | 'expenses' | 'reports';

const Sales: React.FC = () => {
    const { t, sales, expenses, addSale, addExpense, currentUser, permissions } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('sales');
    const [isSaleModalOpen, setSaleModalOpen] = useState(false);
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    
    // Form state
    const [saleAmount, setSaleAmount] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'mobile'>('cash');

    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState<'stock' | 'rent' | 'wages' | 'utilities' | 'transport' | 'fuel'>('stock');

    // Filter state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'credit' | 'mobile'>('all');
    
    const canPerformActions = currentUser && permissions.canAdd.includes(currentUser.role);
    const canViewReports = currentUser && permissions.canViewReports.includes(currentUser.role);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            if (startDate && sale.date < startDate) return false;
            if (endDate && sale.date > endDate) return false;
            if (paymentFilter !== 'all' && sale.paymentMethod !== paymentFilter) return false;
            return true;
        });
    }, [sales, startDate, endDate, paymentFilter]);

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setPaymentFilter('all');
    };

    const handleAddSale = () => {
        if (saleAmount) {
            addSale({
                amount: parseFloat(saleAmount),
                customerName: paymentMethod === 'credit' ? customerName : 'Cash Sale',
                paymentMethod,
            });
            setSaleModalOpen(false);
            setSaleAmount('');
            setCustomerName('');
        }
    };
    
    const handleAddExpense = () => {
        if (expenseAmount) {
            addExpense({
                amount: parseFloat(expenseAmount),
                category: expenseCategory,
            });
            setExpenseModalOpen(false);
            setExpenseAmount('');
        }
    };

    const exportToCSV = () => {
        // This function now only handles expenses, as sales reports has its own export.
        if (activeTab !== 'expenses') return;

        const items = expenses;
        const filename = 'expenses_report.csv';
        let csvContent = "data:text/csv;charset=utf-8,";
        
        csvContent += "ID,Date,Category,Amount,Created By\n";
        items.forEach(item => {
            const expense = item as Expense;
            const row = [expense.id, expense.date, expense.category, expense.amount, expense.createdBy].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const renderTransactions = () => {
        const items = activeTab === 'sales' ? filteredSales : expenses;
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-slate-700 text-sm text-slate-500">
                            <th className="p-3">{t('date')}</th>
                            <th className="p-3">{activeTab === 'sales' ? t('customer_name') : t('category')}</th>
                            <th className="p-3 text-right">{t('amount')} (K)</th>
                            {activeTab === 'sales' && <th className="p-3">{t('payment_method')}</th>}
                            <th className="p-3">{t('created_by')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-3">{item.date}</td>
                                <td className="p-3">{activeTab === 'sales' ? (item as Sale).customerName : t((item as Expense).category)}</td>
                                <td className="p-3 text-right font-mono">{item.amount.toFixed(2)}</td>
                                {activeTab === 'sales' && <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    (item as Sale).paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-800' :
                                    (item as Sale).paymentMethod === 'credit' ? 'bg-amber-100 text-amber-800' :
                                    'bg-sky-100 text-sky-800'
                                }`}>{t((item as Sale).paymentMethod)}</span></td>}
                                <td className="p-3 text-slate-500 text-sm">{(item as Sale).createdBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('sales_expenses')}</h1>
                <div className="flex gap-2 flex-wrap">
                    {canViewReports && activeTab === 'expenses' && <button onClick={exportToCSV} className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-emerald-600 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        Export Expenses
                    </button>}
                    {canPerformActions && (
                        <>
                            <button onClick={() => setSaleModalOpen(true)} className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600 transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                {t('add_sale')}
                            </button>
                            <button onClick={() => setExpenseModalOpen(true)} className="bg-rose-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-rose-600 transition-colors flex items-center gap-2">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                                {t('add_expense')}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <Card>
                <div className="flex border-b dark:border-slate-700">
                    <button onClick={() => setActiveTab('sales')} className={`py-3 px-6 font-semibold ${activeTab === 'sales' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('sales')}</button>
                    <button onClick={() => setActiveTab('expenses')} className={`py-3 px-6 font-semibold ${activeTab === 'expenses' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('expenses')}</button>
                    {canViewReports && <button onClick={() => setActiveTab('reports')} className={`py-3 px-6 font-semibold ${activeTab === 'reports' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('reports')}</button>}
                </div>

                {activeTab === 'sales' && (
                    <>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-300 dark:border-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-300 dark:border-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('payment_method')}</label>
                                    <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value as any)} className="w-full bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-300 dark:border-slate-600">
                                        <option value="all">All</option>
                                        <option value="cash">{t('cash')}</option>
                                        <option value="credit">{t('credit')}</option>
                                        <option value="mobile">{t('mobile_money')}</option>
                                    </select>
                                </div>
                                <button onClick={handleClearFilters} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-4 rounded-lg h-fit">
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">{renderTransactions()}</div>
                    </>
                )}

                {activeTab === 'expenses' && <div className="mt-4">{renderTransactions()}</div>}
                
                {activeTab === 'reports' && canViewReports && <SalesReport />}
                
            </Card>

            <Modal isOpen={isSaleModalOpen} onClose={() => setSaleModalOpen(false)} title={t('add_sale')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('amount')}</label>
                        <input type="number" value={saleAmount} onChange={e => setSaleAmount(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" placeholder="K0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('payment_method')}</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600">
                            <option value="cash">{t('cash')}</option>
                            <option value="credit">{t('credit')}</option>
                            <option value="mobile">{t('mobile_money')}</option>
                        </select>
                    </div>
                    {paymentMethod === 'credit' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('customer_name')}</label>
                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" placeholder="John Doe" />
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setSaleModalOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button>
                        <button onClick={handleAddSale} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg">{t('save')}</button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} title={t('add_expense')}>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('amount')}</label>
                        <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" placeholder="K0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('category')}</label>
                        <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value as any)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600">
                           <option value="stock">Stock</option>
                           <option value="rent">Rent</option>
                           <option value="wages">Wages</option>
                           <option value="utilities">Utilities</option>
                           <option value="transport">Transport</option>
                           <option value="fuel">Fuel</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setExpenseModalOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button>
                        <button onClick={handleAddExpense} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg">{t('save')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Sales;