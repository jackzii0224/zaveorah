
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Page } from '../types';

interface HeaderProps {
    toggleSidebar: () => void;
    activePage: Page;
}

const pageTitleKeys: Record<Page, string> = {
    dashboard: 'dashboard',
    sales: 'sales_expenses',
    inventory: 'inventory',
    contacts: 'contacts',
    employees: 'employees',
    invoicing: 'invoicing',
    finance: 'finance',
    learning: 'learning',
    settings: 'settings',
};


const Header: React.FC<HeaderProps> = ({ toggleSidebar, activePage }) => {
    const { t } = useAppContext();
    
    return (
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Open menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
            <h1 className="text-lg font-bold capitalize">{t(pageTitleKeys[activePage])}</h1>
            <div className="w-8"></div> {/* Spacer */}
        </header>
    );
};

export default Header;
