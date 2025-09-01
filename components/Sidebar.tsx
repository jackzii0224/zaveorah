import React from 'react';
import { Page, Language } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: JSX.Element;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full text-left p-3 my-1 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-sky-500 text-white shadow-md'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`}
  >
    <div className="w-6 h-6 mr-4">{icon}</div>
    <span className="font-semibold">{label}</span>
  </button>
);

const SubscriptionStatus: React.FC = () => {
    const { currentBusiness, setUpgradeFlow } = useAppContext();

    if (!currentBusiness) return null;

    let statusText = "No active subscription.";
    let statusColor = "text-rose-500";
    let showUpgradeButton = false;

    if (currentBusiness.subscriptionStatus === 'trial' && currentBusiness.trialStartDate) {
        const trialEndDate = new Date(currentBusiness.trialStartDate);
        trialEndDate.setDate(trialEndDate.getDate() + 3);
        const daysLeft = Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        if (daysLeft > 0) {
            statusText = `Trial: ${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
            statusColor = "text-amber-500";
            showUpgradeButton = true;
        } else {
             statusText = "Trial expired";
        }
    } else if (currentBusiness.subscriptionStatus === 'active' && currentBusiness.subscriptionExpiry) {
        const expiryDate = new Date(currentBusiness.subscriptionExpiry);
        if (expiryDate > new Date()) {
            statusText = `Active until ${expiryDate.toLocaleDateString()}`;
            statusColor = "text-emerald-500";
        } else {
            statusText = "Subscription expired";
        }
    }

    return (
        <div className="p-3 my-2 text-center bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Subscription</p>
            <p className={`text-sm font-bold ${statusColor}`}>{statusText}</p>
            {showUpgradeButton && (
                <button onClick={() => setUpgradeFlow(true)} className="mt-2 text-sm w-full bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors">
                    Upgrade to Lifetime
                </button>
            )}
        </div>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const { theme, toggleTheme, language, setLanguage, t, currentUser, permissions, logout } = useAppContext();
  
  const handleNavClick = (page: Page) => {
    setActivePage(page);
    setIsOpen(false);
  };

  const allNavItems: { id: Page; labelKey: string; icon: JSX.Element }[] = [
    { id: 'dashboard', labelKey: 'dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
    { id: 'sales', labelKey: 'sales_expenses', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v-.75A.75.75 0 015.25 4.5h-.75m0 0h.75A.75.75 0 017.5 6v.75m0 0v-.75A.75.75 0 017.5 4.5h-.75m0 0h.75A.75.75 0 019.75 6v.75m0 0v-.75A.75.75 0 019.75 4.5h-.75m1.5 0v.75A.75.75 0 0110.5 6h.75m0 0v-.75A.75.75 0 0111.25 4.5h-.75m0 0h.75A.75.75 0 0113.5 6v.75m0 0v-.75A.75.75 0 0113.5 4.5h-.75m0 0h.75a.75.75 0 01.75.75v.75m0 0v-.75a.75.75 0 01.75-.75h.75m-6 12v.75a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v-.75m0 0v.75a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75v-.75m0 0v.75a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75v-.75m6 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75m-6 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75m0 0h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'inventory', labelKey: 'inventory', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
    { id: 'invoicing', labelKey: 'invoicing', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'finance', labelKey: 'finance', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v-.75A.75.75 0 015.25 4.5h-.75m0 0h.75A.75.75 0 017.5 6v.75m0 0v-.75A.75.75 0 017.5 4.5h-.75m0 0h.75A.75.75 0 019.75 6v.75m0 0v-.75A.75.75 0 019.75 4.5h-.75m1.5 0v.75A.75.75 0 0110.5 6h.75m0 0v-.75A.75.75 0 0111.25 4.5h-.75m0 0h.75A.75.75 0 0113.5 6v.75m0 0v-.75A.75.75 0 0113.5 4.5h-.75m0 0h.75a.75.75 0 01.75.75v.75m0 0v-.75a.75.75 0 01.75-.75h.75M12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" /></svg> },
    { id: 'contacts', labelKey: 'contacts', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.226A3 3 0 0118 15.75M12 13.5a3 3 0 100-6 3 3 0 000 6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 18.72a9.094 9.094 0 013.741-.479 3 3 0 01-4.682-2.72m-7.5-2.226A3 3 0 006 15.75M12 13.5a3 3 0 100-6 3 3 0 000 6z" /></svg> },
    { id: 'employees', labelKey: 'employees', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.34-.014-.708-.341-.942l-2.032-1.522a3.75 3.75 0 00-4.78-1.218l-2.475 1.485A3.75 3.75 0 004 10.5V11c0 .552.448 1 1 1h.634a3.75 3.75 0 012.823 1.25l1.638 1.965M15 19.128a9.37 9.37 0 01-6.374-2.278" /></svg> },
    { id: 'learning', labelKey: 'learning', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> },
    { id: 'settings', labelKey: 'settings', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.113-1.113l.448-.098a1.875 1.875 0 011.697 0l.448.098c.552.106 1.023.57 1.113 1.113l.098.448a1.875 1.875 0 010 1.697l-.098.448c-.106.552-.57 1.023-1.113 1.113l-.448.098a1.875 1.875 0 01-1.697 0l-.448-.098a1.875 1.875 0 01-1.113-1.113l-.098-.448a1.875 1.875 0 010-1.697l.098-.448zM9.594 18.06c.09.542.56 1.007 1.113 1.113l.448.098a1.875 1.875 0 011.697 0l.448.098c.552.106 1.023.57 1.113 1.113l.098.448a1.875 1.875 0 010 1.697l-.098.448c-.106.552-.57 1.023-1.113 1.113l-.448.098a1.875 1.875 0 01-1.697 0l-.448-.098a1.875 1.875 0 01-1.113-1.113l-.098-.448a1.875 1.875 0 010-1.697l.098-.448z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.375a5.625 5.625 0 100 11.25 5.625 5.625 0 000-11.25z" /></svg> },
  ];

  const visibleNavItems = allNavItems.filter(item => 
      currentUser && permissions[item.id] && permissions[item.id].includes(currentUser.role)
  );

  return (
    <aside className={`w-64 bg-white dark:bg-slate-800 p-4 flex flex-col shadow-lg z-30 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center mb-8">
        <div className="bg-sky-500 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14l-14 14h14" /></svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Zave<span className="text-sky-500">Orah</span></h1>
      </div>
      <nav className="flex-1">
        {visibleNavItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={t(item.labelKey)}
            isActive={activePage === item.id}
            onClick={() => handleNavClick(item.id)}
          />
        ))}
      </nav>
      <div className="mt-auto">
        <div className="border-t dark:border-slate-700 my-2"></div>
        
        <SubscriptionStatus />

        <div className="p-3 text-center bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <p className="font-bold text-sm">{currentUser?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t(currentUser?.role || '')}</p>
            <button onClick={logout} className="mt-2 text-sm font-semibold text-rose-500 hover:underline">{t('logout')}</button>
        </div>

        <div className="p-3">
            <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('language')}</label>
            <div className="flex items-center mt-2 bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                <button onClick={() => setLanguage('en')} className={`w-1/2 p-1 rounded-md text-sm font-bold ${language === 'en' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>EN</button>
                <button onClick={() => setLanguage('tp')} className={`w-1/2 p-1 rounded-md text-sm font-bold ${language === 'tp' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>TP</button>
            </div>
        </div>
        <div className="p-3">
            <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('theme')}</label>
            <div className="flex items-center mt-2 bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                <button onClick={toggleTheme} className={`w-1/2 p-1 rounded-md text-sm flex justify-center items-center shadow ${theme === 'light' ? 'bg-white dark:bg-slate-600' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                </button>
                <button onClick={toggleTheme} className={`w-1/2 p-1 rounded-md text-sm flex justify-center items-center shadow ${theme === 'dark' ? 'bg-white dark:bg-slate-600' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                </button>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;