import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SubscriptionTier } from '../types';

type View = 'plans' | 'upload' | 'pending' | 'rejected';

const PlanCard: React.FC<{
    tier: SubscriptionTier | 'trial';
    title: string;
    price: string;
    description: string;
    isSelected: boolean;
    onSelect: () => void;
    className?: string;
}> = ({ tier, title, price, description, isSelected, onSelect, className = '' }) => {
    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 h-full flex flex-col ${
                isSelected ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 shadow-lg' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
            } ${className}`}
        >
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
            <p className="text-3xl font-extrabold text-sky-500 my-2">{price}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow">{description}</p>
        </button>
    );
};


const SubscriptionModal: React.FC = () => {
    const { startTrial, submitForApproval, logout, currentBusiness, isUpgradeFlow, setUpgradeFlow } = useAppContext();
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | 'trial' | null>(null);
    const [view, setView] = useState<View>('plans');
    
    // State for upload view
    const [paidAmount, setPaidAmount] = useState('');
    const [receipt, setReceipt] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        if (isUpgradeFlow) {
            setView('plans');
            setSelectedPlan('lifetime'); // Pre-select lifetime for upgrade flow
            return;
        }
        if (currentBusiness?.subscriptionStatus === 'pending') {
            setView('pending');
        } else if (currentBusiness?.subscriptionStatus === 'rejected') {
            setView('rejected');
        } else {
            setView('plans');
        }
    }, [currentBusiness, isUpgradeFlow]);

    const getTitle = () => {
        if (isUpgradeFlow) return "Upgrade to Lifetime";
        if (view === 'upload') return `Submit Payment for Lifetime Plan`;
        if (view === 'pending') return "Submission Received";
        if (view === 'rejected') return "Submission Rejected";
        if (currentBusiness?.subscriptionStatus === 'lapsed') return "Your Subscription Has Expired";
        if (currentBusiness?.subscriptionStatus === 'none') return "Welcome! Choose Your Plan";
        return "Manage Subscription";
    };

    const getSubtitle = () => {
        if (isUpgradeFlow) return "Secure your access to ZaveOrah forever with a one-time payment.";
        if (view === 'upload') return "Please enter the amount you paid and upload a photo of your bank receipt for verification.";
        if (view === 'pending') return "Your payment is under review. You will be granted access once the payment is approved by an administrator.";
        if (view === 'rejected') return "There was an issue with your submission. Please see the reason below and try again.";
        if (currentBusiness?.subscriptionStatus === 'lapsed') return "Please renew your plan to continue using ZaveOrah.";
        if (currentBusiness?.subscriptionStatus === 'none') return "Get started with a free trial or select a plan that fits your business.";
        return "Select a plan to continue.";
    }

    const handleContinue = () => {
        if (selectedPlan === 'trial') {
            alert('Your 3-day free trial has started! You can upgrade to a lifetime plan at any time from the sidebar. After 3 days, you will be prompted to pay to continue using the service.');
            startTrial();
        } else if (selectedPlan) {
            setView('upload');
        }
    };

    const handleReceiptUpload = (e: ChangeEvent<HTMLInputElement>) => {
        setUploadError('');
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setUploadError('File is too large. Please upload an image under 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceipt(reader.result as string);
            };
            reader.onerror = () => {
                 setUploadError('Failed to read file.');
            }
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitForApproval = () => {
        if (!selectedPlan || selectedPlan === 'trial') return;
        if (!paidAmount || !receipt) {
            setUploadError('Please enter the amount and upload a receipt.');
            return;
        }
        setUploadError('');
        submitForApproval(selectedPlan, parseFloat(paidAmount), receipt);
        setView('pending');
    };
    
    const handleTryAgain = () => {
        setSelectedPlan(null);
        setPaidAmount('');
        setReceipt(null);
        setUploadError('');
        setView('plans');
    };

    const renderPlanSelection = () => {
        const showTrialOption = !isUpgradeFlow && currentBusiness?.subscriptionStatus !== 'lapsed';
        
        return (
            <>
                <div className={`grid grid-cols-1 ${showTrialOption ? 'sm:grid-cols-2' : ''} gap-6 max-w-3xl mx-auto`}>
                    {showTrialOption && (
                        <PlanCard 
                            tier="trial"
                            title="Free Trial"
                            price="Free"
                            description="3 days full access. No payment required."
                            isSelected={selectedPlan === 'trial'}
                            onSelect={() => setSelectedPlan('trial')}
                        />
                    )}
                    <PlanCard 
                        tier="lifetime"
                        title="Lifetime"
                        price="K500"
                        description="One-time payment for lifetime access."
                        isSelected={selectedPlan === 'lifetime'}
                        onSelect={() => setSelectedPlan('lifetime')}
                        className={!showTrialOption ? 'sm:col-span-1' : ''}
                    />
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={handleContinue} 
                        disabled={!selectedPlan}
                        className="w-full sm:w-auto bg-sky-500 text-white font-bold py-3 px-10 rounded-lg shadow hover:bg-sky-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {selectedPlan === 'trial' ? 'Start Free Trial' : 'Continue'}
                    </button>
                    {isUpgradeFlow ? (
                         <button onClick={() => setUpgradeFlow(false)} className="w-full sm:w-auto text-slate-500 font-semibold hover:text-sky-500">
                            Maybe Later
                         </button>
                    ) : (
                         <button onClick={logout} className="w-full sm:w-auto text-slate-500 font-semibold hover:text-sky-500">
                            Logout
                        </button>
                    )}
                </div>
            </>
        );
    };

    const renderUploadForm = () => (
        <div className="max-w-md mx-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Amount Paid (Kina)</label>
                <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" placeholder="e.g., 500.00" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Upload Bank Receipt</label>
                <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleReceiptUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 dark:file:bg-sky-900/50 dark:file:text-sky-300 dark:hover:file:bg-sky-900"/>
                {receipt && <img src={receipt} alt="Receipt preview" className="mt-4 max-h-48 rounded-lg mx-auto" />}
            </div>
            
            {uploadError && <p className="text-rose-500 text-sm text-center">{uploadError}</p>}
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={handleSubmitForApproval} className="w-full sm:w-auto bg-sky-500 text-white font-bold py-3 px-10 rounded-lg shadow hover:bg-sky-600">
                    Submit for Approval
                </button>
                 <button onClick={() => setView('plans')} className="w-full sm:w-auto text-slate-500 font-semibold hover:text-sky-500">
                    Back to Plans
                </button>
            </div>
        </div>
    );
    
    const renderStatusView = (icon: JSX.Element, children: React.ReactNode) => (
        <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mx-auto w-fit mb-4">{icon}</div>
            {children}
            <div className="mt-8">
                <button onClick={logout} className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-10 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                    Logout
                </button>
            </div>
        </div>
    );

    const renderPending = () => renderStatusView(<span>⏳</span>, 
        <p className="text-slate-600 dark:text-slate-300">Thank you for your submission!</p>
    );

    const renderRejected = () => renderStatusView(<span>⚠️</span>, 
        <div className="space-y-4">
             <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg">
                <p className="font-semibold text-rose-800 dark:text-rose-200">Reason for Rejection:</p>
                <p className="text-rose-700 dark:text-rose-300">{currentBusiness?.rejectionReason || "No reason provided."}</p>
            </div>
            <button onClick={handleTryAgain} className="text-sky-500 font-bold hover:underline">
                Submit a New Payment
            </button>
        </div>
    );
    
    const renderContent = () => {
        switch(view) {
            case 'plans': return renderPlanSelection();
            case 'upload': return renderUploadForm();
            case 'pending': return renderPending();
            case 'rejected': return renderRejected();
            default: return renderPlanSelection();
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 font-sans">
            <div className="w-full max-w-5xl mx-auto text-center">
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-sky-500 p-2 rounded-xl mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14l-14 14h14" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Zave<span className="text-sky-500">Orah</span></h1>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{getTitle()}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">{getSubtitle()}</p>
                    </div>
                    
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;