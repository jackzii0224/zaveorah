import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import Contacts from './components/Contacts';
import Employees from './components/Employees';
import Invoicing from './components/Invoicing';
import Settings from './components/Settings';
import Finance from './components/Finance';
import Learning from './components/Learning';
import HomePage from './components/HomePage';
import AuthFlow from './components/AuthFlow';
import SuperAdminPanel from './components/SuperAdminPanel';
import SubscriptionModal from './components/SubscriptionModal';
import Modal from './components/common/Modal';
import { Page } from './types';
import { useAppContext } from './hooks/useAppContext';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { theme, currentUser, permissions, isAdminMode, subscriptionRequired, currentBusiness, isUpgradeFlow, markApprovalAsNotified } = useAppContext();
  const [showAuthFlow, setShowAuthFlow] = useState(false);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Reset to dashboard if user logs out or role changes and they lose access to current page
  React.useEffect(() => {
    if (currentUser && permissions[activePage] && !permissions[activePage].includes(currentUser.role)) {
      setActivePage('dashboard');
    }
  }, [currentUser, activePage, permissions]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <Sales />;
      case 'inventory':
        return <Inventory />;
      case 'contacts':
        return <Contacts />;
      case 'employees':
        return <Employees />;
      case 'invoicing':
        return <Invoicing />;
      case 'finance':
        return <Finance />;
      case 'learning':
        return <Learning />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (isAdminMode) {
    return <SuperAdminPanel />;
  }

  const shouldShowSubscriptionModal = currentUser && (
      subscriptionRequired || // for lapsed
      currentBusiness?.subscriptionStatus === 'none' ||
      currentBusiness?.subscriptionStatus === 'pending' ||
      currentBusiness?.subscriptionStatus === 'rejected' ||
      isUpgradeFlow
  );

  if (shouldShowSubscriptionModal) {
      return <SubscriptionModal />;
  }

  const shouldShowApprovalNotification = currentUser && currentBusiness?.hasBeenNotifiedOfApproval === false;

  if (shouldShowApprovalNotification) {
      return (
          <Modal isOpen={true} onClose={() => {}} title="Registration Approved!">
              <div className="text-center p-4">
                  <p className="text-6xl mb-4">🎉</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Congratulations, {currentUser.name}!</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-sm mx-auto">
                      Your business, <strong>{currentBusiness.name}</strong>, has been successfully registered. You now have full access to ZaveOrah.
                  </p>
                  <button
                      onClick={() => {
                          markApprovalAsNotified(currentBusiness!.id);
                      }}
                      className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-sky-600 transition-colors"
                  >
                      Let's Get Started!
                  </button>
              </div>
          </Modal>
      );
  }

  if (!currentUser) {
    return showAuthFlow 
      ? <AuthFlow onBack={() => setShowAuthFlow(false)} /> 
      : <HomePage onGetStarted={() => setShowAuthFlow(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen} 
      />
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          aria-hidden="true"
        ></div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <Header 
          toggleSidebar={() => setSidebarOpen(true)}
          activePage={activePage}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;