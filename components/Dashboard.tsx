import React, { useMemo } from 'react';
import Card from './common/Card';
import { useAppContext } from '../hooks/useAppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sale, Expense, Customer, Product } from '../types';

const ActivityIcon = ({ type }: { type: string }) => {
    if (type === 'sale') {
        return <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></div>
    }
    return <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg></div>
};

const Dashboard: React.FC = () => {
    const { t, sales, expenses, products, customers, currentUser } = useAppContext();

    // Memoized calculations for widgets
    const totalSales = useMemo(() => sales.reduce((sum, sale) => sum + sale.amount, 0), [sales]);
    const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);
    const profit = useMemo(() => totalSales - totalExpenses, [totalSales, totalExpenses]);
    const lowStockItemsCount = useMemo(() => products.filter(p => p.stock > 0 && p.stock <= p.alertLevel).length, [products]);
    const totalCreditDue = useMemo(() => customers.reduce((sum, customer) => sum + customer.creditBalance, 0), [customers]);

    const salesVsExpensesData = useMemo(() => {
        const last30Days = [...Array(30)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last30Days.map(date => {
            const daySales = sales
                .filter(s => s.date === date)
                .reduce((sum, s) => sum + s.amount, 0);
            const dayExpenses = expenses
                .filter(e => e.date === date)
                .reduce((sum, e) => sum + e.amount, 0);
            return {
                name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                Sales: daySales,
                Expenses: dayExpenses,
            };
        });
    }, [sales, expenses]);

    const lowStockProducts = useMemo(() => products.filter(p => p.stock > 0 && p.stock <= p.alertLevel), [products]);
    const customersWithCredit = useMemo(() => customers.filter(c => c.creditBalance > 0).sort((a,b) => b.creditBalance - a.creditBalance), [customers]);

    const expenseBreakdownData = useMemo(() => {
        const breakdown = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(breakdown).map(([name, value]) => ({ name: t(name), value }));
    }, [expenses, t]);
    
    const recentActivity = useMemo(() => {
        const combined = [
            ...sales.map(s => ({ ...s, type: 'sale' })),
            ...expenses.map(e => ({ ...e, type: 'expense' }))
        ];
        return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    }, [sales, expenses]);

    const COLORS = ['#38bdf8', '#f43f5e', '#34d399', '#f59e0b', '#a78bfa', '#ec4899'];
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('welcome')} {currentUser?.name}!</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('dashboard_subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-sky-400 to-sky-600 text-white"><h3 className="font-bold text-lg opacity-80">{t('total_sales')}</h3><p className="text-4xl font-extrabold mt-2">K{totalSales.toFixed(2)}</p></Card>
                <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"><h3 className="font-bold text-lg opacity-80">{t('profit')}</h3><p className="text-4xl font-extrabold mt-2">K{profit.toFixed(2)}</p></Card>
                <Card className="bg-gradient-to-br from-rose-400 to-rose-600 text-white"><h3 className="font-bold text-lg opacity-80">Credit Due</h3><p className="text-4xl font-extrabold mt-2">K{totalCreditDue.toFixed(2)}</p></Card>
                <Card className="bg-gradient-to-br from-amber-400 to-amber-600 text-white"><h3 className="font-bold text-lg opacity-80">{t('low_stock_items')}</h3><p className="text-4xl font-extrabold mt-2">{lowStockItemsCount}</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="font-bold text-lg mb-4">{t('sales_vs_expenses')}</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={salesVsExpensesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `K${value}`} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgb(51 65 85)', borderRadius: '0.75rem' }} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}} />
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                <Bar dataKey="Sales" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                
                <div className="space-y-6">
                    <Card>
                        <h3 className="font-bold text-lg mb-4">{t('low_stock_items')}</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                                <div key={p.id} className="flex justify-between items-center text-sm">
                                    <span className="font-semibold">{p.name}</span>
                                    <span className="font-mono text-amber-500 font-bold">{p.stock} left</span>
                                </div>
                            )) : <p className="text-slate-500 text-sm">All products are well-stocked!</p>}
                        </div>
                    </Card>
                    <Card>
                        <h3 className="font-bold text-lg mb-4">Customers with Credit</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {customersWithCredit.length > 0 ? customersWithCredit.map(c => (
                                <div key={c.id} className="flex justify-between items-center text-sm">
                                    <span className="font-semibold">{c.name}</span>
                                    <span className="font-mono text-rose-500 font-bold">K{c.creditBalance.toFixed(2)}</span>
                                </div>
                            )) : <p className="text-slate-500 text-sm">No outstanding credit.</p>}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <h3 className="font-bold text-lg mb-4">{t('expense_breakdown')}</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={expenseBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { const radius = innerRadius + (outerRadius - innerRadius) * 0.5; const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180)); const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180)); return (percent > 0.05) ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">{`${(percent * 100).toFixed(0)}%`}</text> : null; }}>{expenseBreakdownData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgb(51 65 85)', borderRadius: '0.75rem' }} />
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="lg:col-span-2">
                    <h3 className="font-bold text-lg mb-4">{t('recent_activity')}</h3>
                    <div className="space-y-4">{recentActivity.map(item => (<div key={item.id} className="flex items-center gap-4"><ActivityIcon type={item.type} /><div className="flex-1"><p className="font-semibold">{item.type === 'sale' ? (item as Sale).customerName : t((item as Expense).category)}</p><p className="text-sm text-slate-500 dark:text-slate-400">{item.date}</p></div><p className={`font-mono font-semibold ${item.type === 'sale' ? 'text-emerald-500' : 'text-rose-500'}`}>{item.type === 'sale' ? '+' : '-'}K{item.amount.toFixed(2)}</p></div>))}</div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;