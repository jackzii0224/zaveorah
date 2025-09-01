import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import Modal from './common/Modal';
import { useAppContext } from '../hooks/useAppContext';
import { Loan, SavingGoal } from '../types';

type Tab = 'loans' | 'savings';

const Finance: React.FC = () => {
    const { t, loans, savingGoals, addLoan, addLoanRepayment, addSavingGoal, addContributionToSaving, currentUser, permissions } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('loans');
    
    // Modal states
    const [isLoanModalOpen, setLoanModalOpen] = useState(false);
    const [isSavingModalOpen, setSavingModalOpen] = useState(false);
    const [isRepaymentModalOpen, setRepaymentModalOpen] = useState<Loan | null>(null);
    const [isContributionModalOpen, setContributionModalOpen] = useState<SavingGoal | null>(null);

    // Form states
    const [lender, setLender] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [repaymentAmount, setRepaymentAmount] = useState('');
    const [contributionAmount, setContributionAmount] = useState('');

    if (!currentUser || !permissions.finance.includes(currentUser.role)) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    const handleAddLoan = () => {
        if (lender && loanAmount) {
            addLoan({ lender, initialAmount: parseFloat(loanAmount), dateTaken: new Date().toISOString().split('T')[0] });
            setLoanModalOpen(false);
            setLender(''); setLoanAmount('');
        }
    };
    
    const handleAddSavingGoal = () => {
        if (goalName && targetAmount) {
            addSavingGoal({ name: goalName, targetAmount: parseFloat(targetAmount) });
            setSavingModalOpen(false);
            setGoalName(''); setTargetAmount('');
        }
    };

    const handleAddRepayment = () => {
        if (repaymentAmount && isRepaymentModalOpen) {
            addLoanRepayment(isRepaymentModalOpen.id, parseFloat(repaymentAmount));
            setRepaymentModalOpen(null);
            setRepaymentAmount('');
        }
    };

    const handleAddContribution = () => {
        if (contributionAmount && isContributionModalOpen) {
            addContributionToSaving(isContributionModalOpen.id, parseFloat(contributionAmount));
            setContributionModalOpen(null);
            setContributionAmount('');
        }
    };
    
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('finance')}</h1>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setLoanModalOpen(true)} className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600">{t('add_loan')}</button>
                    <button onClick={() => setSavingModalOpen(true)} className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-emerald-600">{t('add_saving_goal')}</button>
                </div>
            </div>

            <Card>
                <div className="flex border-b dark:border-slate-700">
                    <button onClick={() => setActiveTab('loans')} className={`py-3 px-6 font-semibold ${activeTab === 'loans' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('loans')}</button>
                    <button onClick={() => setActiveTab('savings')} className={`py-3 px-6 font-semibold ${activeTab === 'savings' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('savings_jars')}</button>
                </div>
                
                {activeTab === 'loans' && <div className="p-4 space-y-4">
                    {loans.map(loan => {
                        const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
                        const outstanding = loan.initialAmount - totalRepaid;
                        return (
                            <Card key={loan.id} className="!shadow-md">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{loan.lender}</h3>
                                        <p className="text-sm text-slate-500">Taken on {loan.dateTaken}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">{t('outstanding_balance')}</p>
                                        <p className="font-bold text-xl text-rose-500">K{outstanding.toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">of K{loan.initialAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t dark:border-slate-700">
                                    <button onClick={() => setRepaymentModalOpen(loan)} className="w-full bg-emerald-500 text-white font-bold py-2 rounded-lg hover:bg-emerald-600">{t('make_repayment')}</button>
                                </div>
                            </Card>
                        )
                    })}
                </div>}

                {activeTab === 'savings' && <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savingGoals.map(goal => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                             <Card key={goal.id} className="!shadow-md flex flex-col">
                                <h3 className="font-bold text-lg">{goal.name}</h3>
                                <div className="my-2">
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1 text-right font-mono">K{goal.currentAmount.toFixed(2)} / K{goal.targetAmount.toFixed(2)}</p>
                                </div>
                                <div className="mt-auto pt-4 border-t dark:border-slate-700">
                                    <button onClick={() => setContributionModalOpen(goal)} className="w-full bg-sky-500 text-white font-bold py-2 rounded-lg hover:bg-sky-600">{t('add_contribution')}</button>
                                </div>
                            </Card>
                        )
                    })}
                </div>}
            </Card>

            {/* Modals */}
            <Modal isOpen={isLoanModalOpen} onClose={() => setLoanModalOpen(false)} title={t('add_loan')}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">{t('lender_name')}</label><input type="text" value={lender} onChange={e => setLender(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" /></div>
                    <div><label className="block text-sm font-medium">{t('loan_amount')}</label><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" placeholder="K0.00" /></div>
                    <div className="flex justify-end gap-3 pt-4"><button onClick={() => setLoanModalOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button><button onClick={handleAddLoan} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg">{t('save')}</button></div>
                </div>
            </Modal>
            <Modal isOpen={isSavingModalOpen} onClose={() => setSavingModalOpen(false)} title={t('add_saving_goal')}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">{t('goal_name')}</label><input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" /></div>
                    <div><label className="block text-sm font-medium">{t('target_amount')}</label><input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" placeholder="K0.00" /></div>
                    <div className="flex justify-end gap-3 pt-4"><button onClick={() => setSavingModalOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button><button onClick={handleAddSavingGoal} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg">{t('save')}</button></div>
                </div>
            </Modal>
             <Modal isOpen={isRepaymentModalOpen !== null} onClose={() => setRepaymentModalOpen(null)} title={t('make_repayment')}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">{t('amount')}</label><input type="number" value={repaymentAmount} onChange={e => setRepaymentAmount(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" placeholder="K0.00" /></div>
                    <div className="flex justify-end gap-3 pt-4"><button onClick={() => setRepaymentModalOpen(null)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button><button onClick={handleAddRepayment} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg">{t('save')}</button></div>
                </div>
            </Modal>
             <Modal isOpen={isContributionModalOpen !== null} onClose={() => setContributionModalOpen(null)} title={t('add_contribution')}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">{t('amount')}</label><input type="number" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" placeholder="K0.00" /></div>
                    <div className="flex justify-end gap-3 pt-4"><button onClick={() => setContributionModalOpen(null)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button><button onClick={handleAddContribution} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg">{t('save')}</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default Finance;