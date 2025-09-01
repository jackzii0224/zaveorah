

import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Business } from '../types';
import Modal from './common/Modal';
import LoginScreen from './LoginScreen';

interface WelcomeScreenProps {
    onRegister: () => void;
    onBack: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onRegister, onBack }) => {
    const { businesses } = useAppContext();
    const [loginBusiness, setLoginBusiness] = useState<Business | null>(null);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 font-sans">
            <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 font-semibold text-sky-500 hover:text-sky-700 text-sm z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                Back to Home
            </button>
            <div className="w-full max-w-sm mx-auto text-center">
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-sky-500 p-2 rounded-xl mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14l-14 14h14" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Zave<span className="text-sky-500">Orah</span></h1>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Welcome!</h2>
                    {businesses.length > 0 ? (
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">Select your business to log in:</p>
                            <div className="space-y-3">
                                {businesses.map(biz => (
                                    <button key={biz.id} onClick={() => setLoginBusiness(biz)} className="w-full text-left p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold text-slate-700 dark:text-slate-200">
                                        {biz.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                         <p className="text-slate-500 dark:text-slate-400">No businesses found. Register one to get started!</p>
                    )}
                    <div className="pt-4 border-t dark:border-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Or, start a new one:</p>
                        <button onClick={onRegister} className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600 transition-colors">
                            Register a New Business
                        </button>
                    </div>
                </div>
            </div>

            <Modal isOpen={!!loginBusiness} onClose={() => setLoginBusiness(null)} title={`Login to ${loginBusiness?.name || ''}`}>
                {loginBusiness && (
                    <LoginScreen 
                        business={loginBusiness}
                    />
                )}
            </Modal>
        </div>
    );
};
export default WelcomeScreen;