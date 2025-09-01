
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Business, User } from '../types';

interface LoginScreenProps {
    business: Business;
}

const UserAvatar: React.FC<{ name: string }> = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center mb-2 group-hover:bg-sky-200 dark:group-hover:bg-sky-800 transition-colors">
            <span className="text-2xl font-bold text-slate-600 dark:text-slate-200">{initials}</span>
        </div>
    );
};

const LoginScreen: React.FC<LoginScreenProps> = ({ business }) => {
    const { t, login, getUsersForBusiness } = useAppContext();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const businessUsers = getUsersForBusiness(business.id);
        if (businessUsers) {
            setUsers(businessUsers.filter(u => u.role !== 'employee'));
        }
    }, [business.id, getUsersForBusiness]);

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setPassword('');
        setError('');
    };
    
    const handleBack = () => {
        setSelectedUser(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setLoading(true);
        setError('');
        
        // Simulate network delay for better UX
        setTimeout(() => {
            const success = login(business.id, selectedUser.id, password);
            if (!success) {
                setError(t('password_incorrect'));
            }
            // On success, the main App component will re-render, so no need to handle it here.
            setLoading(false);
        }, 300);
    };

    if (!selectedUser) {
        return (
            <div className="w-full max-w-md mx-auto text-center">
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-6">Who is logging in?</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {users.map(user => (
                        <button key={user.id} onClick={() => handleUserSelect(user)} className="group flex flex-col items-center p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                            <UserAvatar name={user.name} />
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{t(user.role)}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xs mx-auto text-center">
             <button onClick={handleBack} className="absolute top-6 left-6 flex items-center gap-2 font-semibold text-sky-500 hover:text-sky-700 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                Switch User
            </button>
            <div className="flex flex-col items-center mb-4">
                <UserAvatar name={selectedUser.name} />
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-2">{selectedUser.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 capitalize">{t(selectedUser.role)}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="password-input" className="sr-only">{t('password')}</label>
                    <div className="relative">
                        <input 
                            id="password-input"
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

                {error && <p className="text-rose-500 text-sm font-semibold h-5">{error}</p>}
                {!error && <div className="h-5"></div>}
                
                <button 
                    type="submit" 
                    disabled={loading || !password}
                    className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Logging in...' : t('login')}
                </button>
            </form>
        </div>
    );
};

export default LoginScreen;