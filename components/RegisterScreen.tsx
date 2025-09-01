import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';

interface RegisterScreenProps {
    onBack: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBack }) => {
    const { t, registerBusiness } = useAppContext();
    const [businessName, setBusinessName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const validatePassword = (pass: string): boolean => {
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasLowerCase = /[a-z]/.test(pass);
        const hasNumber = /\d/.test(pass);
        const hasSpecialChar = /[@$!%*?&]/.test(pass);
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && pass.length > 0;
    };


    const handleSubmit = () => {
        if (!businessName.trim() || !ownerName.trim() || !email.trim() || !phone.trim()) {
            setError('Please fill all fields.');
            return;
        }
        if (password.length > 8) {
            setError('Password must be a maximum of 8 characters.');
            return;
        }
        if (!validatePassword(password)) {
             setError('Password must include uppercase, lowercase, number, and a special character (@$!%*?&).');
             return;
        }

        setError('');
        registerBusiness(businessName.trim(), ownerName.trim(), password, email.trim(), phone.trim());
        onBack(); // Go back to welcome screen to login
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
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center">Register Your Business</h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Business Name</label>
                        <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Your Name (Owner)</label>
                        <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Set Your Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                maxLength={8} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full bg-white dark:bg-slate-700 p-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-600" 
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
                        <p className="text-xs text-slate-500 mt-1">Max 8 chars. Use uppercase, lowercase, numbers, and symbols.</p>
                    </div>
                    
                    {error && <p className="text-rose-500 text-sm text-center pt-2">{error}</p>}

                    <div className="pt-4 space-y-3">
                        <button onClick={handleSubmit} className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600 transition-colors">
                            Create Business
                        </button>
                        <button onClick={onBack} className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                            Back
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default RegisterScreen;