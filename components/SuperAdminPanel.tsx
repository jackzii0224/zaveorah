import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import Modal from './common/Modal';
import { useAppContext } from '../hooks/useAppContext';
import { User, Business } from '../types';

const SuperAdminPanel: React.FC = () => {
    const { t, fullData, impersonateUser, exportAllData, wipeAllData, logout, approvePayment, rejectPayment } = useAppContext();
    const [isWipeConfirmOpen, setWipeConfirmOpen] = useState(false);
    const [receiptToView, setReceiptToView] = useState<string | null>(null);
    const [rejectingBusiness, setRejectingBusiness] = useState<Business | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const allUsers = useMemo(() => {
        const usersWithBiz: (User & { businessName: string; businessId: string })[] = [];
        fullData.businesses.forEach(biz => {
            const businessData = fullData.data[biz.id];
            if (businessData && businessData.users) {
                businessData.users.forEach((user: User) => {
                    usersWithBiz.push({ ...user, businessName: biz.name, businessId: biz.id });
                });
            }
        });
        return usersWithBiz;
    }, [fullData]);

    const pendingApprovals = useMemo(() =>
        fullData.businesses.filter(b => b.subscriptionStatus === 'pending'),
        [fullData.businesses]
    );

    const handleWipeData = () => {
        wipeAllData();
        setWipeConfirmOpen(false);
    };

    const handleRejectSubmit = () => {
        if (rejectingBusiness && rejectionReason) {
            rejectPayment(rejectingBusiness.id, rejectionReason);
            setRejectingBusiness(null);
            setRejectionReason('');
        }
    };

    return (
        <div className="min-h-screen bg-rose-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
            <header className="bg-rose-600 dark:bg-rose-900 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.078 2.25c-.217-.065-.436-.128-.668-.184M8.922 2.25c.217-.065.436-.128.668-.184m2.156 2.156c.053-.223.1-.453.14-.687m-4.572 0c-.04.234-.087.464-.14.687m-1.932 4.45c.224.053.453.1.687.14m0 4.572c-.234.04-.464.087-.687.14m6.508-4.712c.04-.234.087-.464.14-.687m-2.064 6.378c-.223-.053-.453-.1-.687-.14M10 2.25a7.75 7.75 0 100 15.5 7.75 7.75 0 000-15.5zM10 6a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" /></svg>
                    <h1 className="text-2xl font-bold">Super Admin Panel</h1>
                </div>
                <button onClick={logout} className="font-semibold bg-rose-700 dark:bg-rose-800 hover:bg-rose-800 dark:hover:bg-rose-700 px-4 py-2 rounded-lg transition-colors">Logout</button>
            </header>

            <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Businesses ({fullData.businesses.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b dark:border-slate-700 text-sm text-slate-500"><th className="p-2">Name</th><th className="p-2">Status</th><th className="p-2 text-right">Actions</th></tr></thead>
                                <tbody>
                                    {fullData.businesses.map(biz => {
                                        const bizData = fullData.data[biz.id];
                                        const owner = bizData?.users.find((u: User) => u.role === 'owner');
                                        return (
                                            <tr key={biz.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-2 font-semibold">{biz.name}</td>
                                                <td className="p-2 capitalize text-sm">{biz.subscriptionStatus}</td>
                                                <td className="p-2 text-right">
                                                    {owner && <button onClick={() => impersonateUser(biz.id, owner.id)} className="font-semibold text-sky-500 hover:underline">Impersonate Owner</button>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold mb-4">All Users ({allUsers.length})</h2>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b dark:border-slate-700 text-sm text-slate-500"><th className="p-2">Name</th><th className="p-2">Business</th><th className="p-2">Role</th><th className="p-2 text-right">Actions</th></tr></thead>
                                <tbody>
                                    {allUsers.map(user => (
                                        <tr key={user.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="p-2 font-semibold">{user.name}</td>
                                            <td className="p-2 text-slate-500">{user.businessName}</td>
                                            <td className="p-2 capitalize">{user.role}</td>
                                            <td className="p-2 text-right">
                                                <button onClick={() => impersonateUser(user.businessId, user.id)} className="font-semibold text-sky-500 hover:underline">Impersonate</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="border-2 border-rose-500/50 bg-rose-50/50 dark:bg-rose-900/20">
                        <h2 className="text-xl font-bold text-rose-700 dark:text-rose-400 mb-4">Danger Zone</h2>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg gap-3">
                                <div>
                                    <h3 className="font-bold">Export All Data</h3>
                                    <p className="text-sm text-slate-500">Download a JSON backup of all businesses and user data.</p>
                                </div>
                                <button onClick={exportAllData} className="font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0">Export</button>
                            </div>
                             <div className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg gap-3">
                                <div>
                                    <h3 className="font-bold text-rose-500">Wipe All Application Data</h3>
                                    <p className="text-sm text-slate-500">This will permanently delete all businesses, users, and data. This cannot be undone.</p>
                                </div>
                                <button onClick={() => setWipeConfirmOpen(true)} className="font-semibold bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0">Wipe Data</button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Payment Approvals ({pendingApprovals.length})</h2>
                        <div className="space-y-4">
                            {pendingApprovals.length > 0 ? pendingApprovals.map(biz => (
                                <div key={biz.id} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <p className="font-bold">{biz.name}</p>
                                    <p className="text-sm text-slate-500">Plan: <span className="font-semibold capitalize">{biz.pendingSubscriptionTier}</span></p>
                                    <p className="text-sm text-slate-500">Amount Paid: <span className="font-semibold font-mono">K{biz.pendingPaymentAmount?.toFixed(2)}</span></p>
                                    <p className="text-sm text-slate-500">Email: <span className="font-semibold">{biz.ownerEmail || 'N/A'}</span></p>
                                    <p className="text-sm text-slate-500">Phone: <span className="font-semibold">{biz.ownerPhone || 'N/A'}</span></p>
                                    <div className="mt-3 flex justify-between items-center gap-2 flex-wrap">
                                        <button onClick={() => setReceiptToView(biz.pendingPaymentReceipt || null)} className="text-sm font-semibold text-sky-500 hover:underline">View Receipt</button>
                                        <div className="flex gap-2">
                                            <button onClick={() => approvePayment(biz.id)} className="bg-emerald-500 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-emerald-600">Approve</button>
                                            <button onClick={() => setRejectingBusiness(biz)} className="bg-rose-500 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-rose-600">Reject</button>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-slate-500 text-center py-4">No pending approvals.</p>}
                        </div>
                    </Card>
                </div>

            </main>

            <Modal isOpen={isWipeConfirmOpen} onClose={() => setWipeConfirmOpen(false)} title="Confirm Data Wipe">
                <p className="text-slate-600 dark:text-slate-300">Are you absolutely sure you want to delete all data? This action is irreversible. Please export a backup first if you have any doubts.</p>
                <div className="flex justify-end gap-3 pt-6">
                    <button onClick={() => setWipeConfirmOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">Cancel</button>
                    <button onClick={handleWipeData} className="bg-rose-500 text-white font-bold py-2 px-5 rounded-lg">Yes, Delete Everything</button>
                </div>
            </Modal>

            <Modal isOpen={!!receiptToView} onClose={() => setReceiptToView(null)} title="Payment Receipt">
                {receiptToView && <img src={receiptToView} alt="Payment Receipt" className="w-full h-auto rounded-lg" />}
            </Modal>
            
            <Modal isOpen={!!rejectingBusiness} onClose={() => setRejectingBusiness(null)} title={`Reject Payment for ${rejectingBusiness?.name}`}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="rejectionReason" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Reason for Rejection</label>
                        <textarea 
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600"
                            placeholder="e.g., Amount paid is incorrect."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setRejectingBusiness(null)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">Cancel</button>
                        <button onClick={handleRejectSubmit} className="bg-rose-500 text-white font-bold py-2 px-5 rounded-lg">Confirm Rejection</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SuperAdminPanel;