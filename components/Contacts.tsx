import React, { useState } from 'react';
import Card from './common/Card';
import { useAppContext } from '../hooks/useAppContext';
import { Customer, Supplier, Sale } from '../types';

type Tab = 'customers' | 'suppliers';

const ContactDetailView: React.FC<{
    contact: Customer | Supplier;
    onBack: () => void;
}> = ({ contact, onBack }) => {
    const { t, sales, businessProfile } = useAppContext();
    
    const customerSales = (contact as Customer).creditBalance !== undefined 
        ? sales.filter(s => s.customerName === contact.name)
        : [];
        
    const handleSendReminder = () => {
        const customer = contact as Customer;
        const message = t('sms_reminder_template')
            .replace('{amount}', customer.creditBalance.toFixed(2))
            .replace('{shop}', businessProfile.name);
        window.location.href = `sms:${customer.contact}?body=${encodeURIComponent(message)}`;
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 font-semibold text-sky-500 hover:text-sky-700 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                {t('back')}
            </button>
            <Card>
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{contact.name}</h2>
                            <p className="text-slate-500 font-mono">{contact.contact}</p>
                        </div>
                        <div className="text-right">
                        { 'creditBalance' in contact &&
                            <>
                                <p className="text-sm text-slate-500">{t('credit_balance')}</p>
                                <p className="text-2xl font-bold text-amber-500">K{contact.creditBalance.toFixed(2)}</p>
                                {contact.creditBalance > 0 && 
                                    <button onClick={handleSendReminder} className="mt-2 bg-amber-500 text-white font-bold py-1 px-3 rounded-lg text-sm shadow hover:bg-amber-600">
                                        {t('send_reminder')}
                                    </button>
                                }
                            </>
                        }
                        { 'paymentDue' in contact &&
                             <>
                                <p className="text-sm text-slate-500">{t('payment_due')}</p>
                                <p className="text-2xl font-bold text-rose-500">K{contact.paymentDue.toFixed(2)}</p>
                            </>
                        }
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold border-b dark:border-slate-700 pb-2 mb-2">{t('transaction_history')}</h3>
                        {customerSales.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-sm text-slate-500">
                                        <th className="p-2">{t('date')}</th>
                                        <th className="p-2">{t('payment_method')}</th>
                                        <th className="p-2 text-right">{t('amount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerSales.map(sale => (
                                        <tr key={sale.id} className="border-t dark:border-slate-700">
                                            <td className="p-2">{sale.date}</td>
                                            <td className="p-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                sale.paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-800' :
                                                sale.paymentMethod === 'credit' ? 'bg-amber-100 text-amber-800' :
                                                'bg-sky-100 text-sky-800'
                                            }`}>{t(sale.paymentMethod)}</span></td>
                                            <td className="p-2 text-right font-mono">K{sale.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-slate-500 text-center py-4">No transactions found.</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}


const Contacts: React.FC = () => {
    const { t, customers, suppliers, currentUser, permissions } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('customers');
    const [selectedContact, setSelectedContact] = useState<Customer | Supplier | null>(null);

    const canPerformActions = currentUser && permissions.canAdd.includes(currentUser.role);
    const canViewReports = currentUser && permissions.canViewReports.includes(currentUser.role);

    const exportToCSV = () => {
        const items = activeTab === 'customers' ? customers : suppliers;
        const filename = activeTab === 'customers' ? 'customers.csv' : 'suppliers.csv';
        
        let csvContent = "data:text/csv;charset=utf-8,";
        
        if (activeTab === 'customers') {
            csvContent += "ID,Name,Contact,Credit Balance,Due Date\n";
            items.forEach(item => {
                const customer = item as Customer;
                const row = [customer.id, `"${customer.name}"`, customer.contact, customer.creditBalance, customer.dueDate || ''].join(",");
                csvContent += row + "\n";
            });
        } else {
            csvContent += "ID,Name,Contact,Payment Due\n";
            items.forEach(item => {
                const supplier = item as Supplier;
                const row = [supplier.id, `"${supplier.name}"`, supplier.contact, supplier.paymentDue].join(",");
                csvContent += row + "\n";
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (selectedContact) {
        return <ContactDetailView contact={selectedContact} onBack={() => setSelectedContact(null)} />;
    }

    const renderContacts = () => {
        const items = activeTab === 'customers' ? customers : suppliers;
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-slate-700 text-sm text-slate-500">
                            <th className="p-3">{t('name')}</th>
                            <th className="p-3">{t('contact_info')}</th>
                            <th className="p-3 text-right">{activeTab === 'customers' ? t('credit_balance') : t('payment_due')} (K)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} onClick={() => setSelectedContact(item)} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                <td className="p-3 font-semibold">{item.name}</td>
                                <td className="p-3 font-mono">{item.contact}</td>
                                <td className={`p-3 text-right font-mono ${'creditBalance' in item ? 'text-amber-500' : 'text-rose-500'}`}>
                                    {('creditBalance' in item ? item.creditBalance : item.paymentDue).toFixed(2)}
                                </td>
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
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('contacts')}</h1>
                <div className="flex gap-2 flex-wrap">
                    {canViewReports && <button onClick={exportToCSV} className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-emerald-600 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        Export CSV
                    </button>}
                    {canPerformActions && (
                      <>
                        <button className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600 transition-colors flex items-center gap-2">
                            {t('add_customer')}
                        </button>
                        <button className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-slate-700 transition-colors flex items-center gap-2">
                            {t('add_supplier')}
                        </button>
                      </>
                    )}
                </div>
            </div>

            <Card>
                <div className="flex border-b dark:border-slate-700">
                    <button onClick={() => setActiveTab('customers')} className={`py-3 px-6 font-semibold ${activeTab === 'customers' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('customers')}</button>
                    <button onClick={() => setActiveTab('suppliers')} className={`py-3 px-6 font-semibold ${activeTab === 'suppliers' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('suppliers')}</button>
                </div>
                <div className="mt-4">{renderContacts()}</div>
            </Card>
        </div>
    );
};

export default Contacts;