

import React, { useState, useEffect } from 'react';
import WelcomeScreen from './WelcomeScreen';
import RegisterScreen from './RegisterScreen';
import { useAppContext } from '../hooks/useAppContext';

// --- Start of AdminLoginScreen component ---
interface AdminLoginScreenProps {
    onBack: () => void;
}

const ADMIN_PASSWORD = "Adas$128";

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onBack }) => {
    const { adminLogin } = useAppContext();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (password === ADMIN_PASSWORD) {
                const success = adminLogin();
                if (!success) {
                    setError("Admin login failed.");
                }
            } else {
                setError("Incorrect admin password.");
            }
            setLoading(false);
        }, 300);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 font-sans">
            <div className="w-full max-w-sm mx-auto">
                 <div className="flex items-center justify-center mb-8">
                    <div className="bg-sky-500 p-2 rounded-xl mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14l-14 14h14" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Zave<span className="text-sky-500">Orah</span></h1>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl space-y-4">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center">Admin Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Admin Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full bg-white dark:bg-slate-700 p-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                    placeholder="********"
                                    required
                                    autoFocus
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {error && <p className="text-rose-500 text-sm text-center pt-2">{error}</p>}

                        <div className="pt-4 space-y-3">
                            <button 
                                type="submit"
                                disabled={loading || !password}
                                className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Logging In...' : 'Login as Admin'}
                            </button>
                            <button 
                                type="button" 
                                onClick={onBack} 
                                className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </form>
                 </div>
            </div>
        </div>
    );
};
// --- End of AdminLoginScreen component ---

interface AuthFlowProps {
    onBack: () => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onBack }) => {
    const [view, setView] = useState<'welcome' | 'register' | 'admin'>('welcome');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.altKey && event.shiftKey) {
                setView('admin');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleGoToRegister = () => {
        setView('register');
    };

    const handleBackToWelcome = () => {
        setView('welcome');
    }

    switch (view) {
        case 'register':
            return <RegisterScreen onBack={handleBackToWelcome} />;
        case 'admin':
            return <AdminLoginScreen onBack={handleBackToWelcome} />;
        case 'welcome':
        default:
            return <WelcomeScreen onRegister={handleGoToRegister} onBack={onBack} />;
    }
};

export default AuthFlow;