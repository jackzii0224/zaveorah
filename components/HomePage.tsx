import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const FeatureCard: React.FC<{ icon: JSX.Element; title: string; }> = ({ icon, title }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg h-full">
        <div className="p-4 bg-sky-100 dark:bg-sky-900/50 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h3>
    </div>
);

const HomePage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
    const { businesses } = useAppContext();
    
    return (
        <div className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-sans">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 shadow-sm">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-sky-500 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14l-14 14h14" /></svg>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Zave<span className="text-sky-500">Orah</span></h1>
                    </div>
                    <button onClick={onGetStarted} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg shadow hover:bg-sky-600 transition-colors">
                        Login / Register
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-6 py-16 sm:py-24 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-800 dark:text-white leading-tight">
                    Your Business. <span className="text-sky-500">Simplified.</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                    Focus on Growth. Let Us Handle the Management. The all-in-one business toolkit made for PNG SMEs.
                </p>
                <div className="mt-8">
                    <button onClick={onGetStarted} className="bg-sky-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-sky-600 transition-transform transform hover:scale-105">
                        Get Started Now
                    </button>
                </div>
            </main>

            {/* Features Section */}
            <section className="bg-slate-100 dark:bg-slate-800/50 py-16 sm:py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            title="Sales & Inventory Tracking" 
                        />
                        <FeatureCard 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                            title="Employee Management" 
                        />
                        <FeatureCard 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            title="Invoicing & Receipts" 
                        />
                        <FeatureCard 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                            title="Secure Cloud Data" 
                        />
                    </div>
                </div>
            </section>

            {/* Description Section */}
            <section className="container mx-auto px-6 py-16 sm:py-24">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">🌍 Empowering Papua New Guinea’s SMEs</h2>
                        <div className="space-y-4 text-slate-600 dark:text-slate-400">
                            <p>Running a business in Papua New Guinea can be challenging — from managing employees and tracking sales to handling invoices and customer records. Our all-in-one business management platform is designed specifically for SMEs to make business simple, efficient, and secure.</p>
                            <p>With our web app, you can:</p>
                            <ul className="space-y-2 pl-4 list-disc list-inside">
                                <li>Track sales & inventory in real time</li>
                                <li>Manage employees, attendance, and payroll</li>
                                <li>Create and share professional invoices & receipts</li>
                                <li>Securely store customer and supplier data</li>
                                <li>Gain insights with easy-to-read reports</li>
                            </ul>
                            <p>Whether you own a trade store, SME, service business, or growing company, our platform helps you save time, reduce mistakes, and grow with confidence.</p>
                            <p className="font-bold text-sky-500 text-lg pt-4">👉 Your business, managed in one place. Anytime. Anywhere.</p>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Business team working collaboratively on laptops" className="rounded-2xl shadow-xl"/>
                    </div>
                </div>
            </section>
            
            {/* Registered Businesses Section */}
            <section className="bg-white dark:bg-slate-900 py-16 sm:py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
                        Join Our Growing Community of Businesses
                    </h2>
                    {businesses.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                            {businesses.slice(0, 8).map((biz) => (
                                <div key={biz.id} className="bg-slate-100 dark:bg-slate-800/50 px-5 py-3 rounded-lg shadow-sm font-semibold text-slate-700 dark:text-slate-200 transition-transform transform hover:scale-105">
                                    {biz.name}
                                </div>
                            ))}
                            {businesses.length > 8 && (
                                <div className="px-5 py-3 font-semibold text-slate-500">
                                    and {businesses.length - 8} more...
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Be the first business to join ZaveOrah and lead the way!
                        </p>
                    )}
                </div>
            </section>

            {/* Slogans Section */}
            <section className="bg-sky-500 text-white py-16">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-8">Smart, simple, and secure – Business management made easy.</h2>
                    <div className="flex flex-wrap justify-center gap-4 text-sky-100 font-semibold">
                        <span className="bg-sky-600/50 rounded-full px-4 py-2">Track Sales. Manage Staff. Grow Faster.</span>
                        <span className="bg-sky-600/50 rounded-full px-4 py-2">No more paperwork chaos.</span>
                        <span className="bg-sky-600/50 rounded-full px-4 py-2">Start managing like a pro today!</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-200 dark:bg-slate-800 py-6">
                <div className="container mx-auto px-6 text-center text-slate-500 dark:text-slate-400">
                    <p>&copy; {new Date().getFullYear()} ZaveOrah. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;