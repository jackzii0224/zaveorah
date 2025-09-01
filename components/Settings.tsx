import React, { useState, ChangeEvent } from 'react';
import Card from './common/Card';
import { useAppContext } from '../hooks/useAppContext';
import { BusinessProfile } from '../types';
import UserManagement from './UserManagement';

type Tab = 'business' | 'users';

const Settings: React.FC = () => {
    const { t, businessProfile, updateBusinessProfile, currentUser, permissions } = useAppContext();
    const [profile, setProfile] = useState<BusinessProfile>(businessProfile);
    const [feedback, setFeedback] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('business');

    const canManageUsers = currentUser && permissions.canManageUsers.includes(currentUser.role);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setProfile(prev => ({ ...prev, logo: event.target.result as string }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateBusinessProfile(profile);
        setFeedback('Settings updated successfully!');
        setTimeout(() => setFeedback(''), 3000);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('settings')}</h1>
            
            <Card>
                 <div className="flex border-b dark:border-slate-700">
                    <button onClick={() => setActiveTab('business')} className={`py-3 px-6 font-semibold ${activeTab === 'business' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('business_settings')}</button>
                    {canManageUsers && <button onClick={() => setActiveTab('users')} className={`py-3 px-6 font-semibold ${activeTab === 'users' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('users')}</button>}
                </div>
                
                {activeTab === 'business' && (
                    <div className="p-4">
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('business_name')}</label>
                                <input type="text" id="name" name="name" value={profile.name} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('business_address')}</label>
                                <textarea id="address" name="address" value={profile.address} onChange={handleChange} rows={3} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600"></textarea>
                            </div>
                            <div>
                                <label htmlFor="contact" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('contact_info')}</label>
                                <input type="text" id="contact" name="contact" value={profile.contact} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                            </div>

                            <div>
                                <label htmlFor="logo" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('business_logo')}</label>
                                <div className="flex items-center gap-4">
                                    {profile.logo && <img src={profile.logo} alt="Current Logo" className="w-16 h-16 rounded-lg object-contain bg-slate-200 dark:bg-slate-700" />}
                                    <input type="file" id="logo" onChange={handleLogoChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
                                </div>
                            </div>

                            <div className="flex justify-end items-center gap-4 pt-4">
                                {feedback && <p className="text-emerald-500 text-sm font-semibold">{feedback}</p>}
                                <button type="submit" className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600 transition-colors">
                                    {t('update_settings')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {activeTab === 'users' && canManageUsers && (
                    <div className="p-4">
                        <UserManagement />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Settings;