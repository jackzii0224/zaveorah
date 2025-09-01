import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import { useAppContext } from '../hooks/useAppContext';
import { Sale } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SalesReport: React.FC = () => {
    const { t, sales } = useAppContext();
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            if (startDate && sale.date < startDate) return false;
            if (endDate && sale.date > endDate) return false;
            return true;
        });
    }, [sales, startDate, endDate]);

    const reportMetrics = useMemo(() => {
        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
        const numberOfSales = filteredSales.length;
        const averageSaleAmount = numberOfSales > 0 ? totalSales / numberOfSales : 0;
        
        const salesByPaymentMethod = filteredSales.reduce((acc, sale) => {
            const method = t(sale.paymentMethod);
            acc[method] = (acc[method] || 0) + sale.amount;
            return acc;
        }, {} as Record<string, number>);

        const paymentMethodData = Object.entries(salesByPaymentMethod).map(([name, value]) => ({ name, value }));
        
        return { totalSales, numberOfSales, averageSaleAmount, paymentMethodData };
    }, [filteredSales, t]);

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    const exportToCSV = () => {
        const filename = 'sales_report.csv';
        let csvContent = "data:text/csv;charset=utf-8,";
        
        csvContent += "ID,Date,Customer Name,Amount,Payment Method,Created By\n";
        filteredSales.forEach(sale => {
            const row = [sale.id, sale.date, `"${sale.customerName}"`, sale.amount, sale.paymentMethod, sale.createdBy].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const COLORS = ['#38bdf8', '#f43f5e', '#34d399'];

    return (
        <div className="space-y-6 p-4">
            <Card className="!p-4 bg-slate-50 dark:bg-slate-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                    <button onClick={handleClearFilters} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-4 rounded-lg h-fit">
                        Clear Filters
                    </button>
                    <button onClick={exportToCSV} className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 h-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        Export Report
                    </button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><h3 className="font-bold text-lg text-slate-500 dark:text-slate-400">{t('total_sales')}</h3><p className="text-3xl font-extrabold mt-2">K{reportMetrics.totalSales.toFixed(2)}</p></Card>
                <Card><h3 className="font-bold text-lg text-slate-500 dark:text-slate-400">Number of Sales</h3><p className="text-3xl font-extrabold mt-2">{reportMetrics.numberOfSales}</p></Card>
                <Card><h3 className="font-bold text-lg text-slate-500 dark:text-slate-400">Average Sale</h3><p className="text-3xl font-extrabold mt-2">K{reportMetrics.averageSaleAmount.toFixed(2)}</p></Card>
            </div>
            
            <Card>
                <h3 className="font-bold text-lg mb-4">Sales by Payment Method</h3>
                 <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={reportMetrics.paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                                {reportMetrics.paymentMethodData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgb(51 65 85)', borderRadius: '0.75rem' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default SalesReport;
