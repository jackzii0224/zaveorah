import React, { useState } from 'react';
import Card from './common/Card';
import Modal from './common/Modal';
import { useAppContext } from '../hooks/useAppContext';

const Inventory: React.FC = () => {
    const { t, products, addProduct, currentUser, permissions } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isScannerOpen, setScannerOpen] = useState(false);

    const [name, setName] = useState('');
    const [stock, setStock] = useState('');
    const [alertLevel, setAlertLevel] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');

    const canPerformActions = currentUser && permissions.canAdd.includes(currentUser.role);
    const canViewReports = currentUser && permissions.canViewReports.includes(currentUser.role);

    const handleAddProduct = () => {
        if (name && stock && alertLevel && purchasePrice && sellingPrice) {
            addProduct({
                name,
                stock: parseInt(stock),
                alertLevel: parseInt(alertLevel),
                purchasePrice: parseFloat(purchasePrice),
                sellingPrice: parseFloat(sellingPrice),
            });
            setModalOpen(false);
            // Reset fields
            setName('');
            setStock('');
            setAlertLevel('');
            setPurchasePrice('');
            setSellingPrice('');
        }
    };

    const getStatus = (stock: number, alertLevel: number) => {
        if (stock === 0) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">{t('out_of_stock')}</span>;
        }
        if (stock <= alertLevel) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">{t('low_stock')}</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">{t('in_stock')}</span>;
    };
    
    const exportToCSV = () => {
        const filename = 'inventory.csv';
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Product Name,Stock on Hand,Alert Level,Purchase Price,Selling Price,Created By\n";

        products.forEach(p => {
            const row = [p.id, `"${p.name}"`, p.stock, p.alertLevel, p.purchasePrice, p.sellingPrice, p.createdBy].join(",");
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('inventory')}</h1>
                <div className="flex gap-2 flex-wrap">
                    {canViewReports && <button onClick={exportToCSV} className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-emerald-600 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        Export CSV
                    </button>}
                    {canPerformActions && <button onClick={() => setModalOpen(true)} className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        {t('add_product')}
                    </button>}
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-slate-700 text-sm text-slate-500">
                                <th className="p-3">{t('product_name')}</th>
                                <th className="p-3 text-center">{t('stock_on_hand')}</th>
                                <th className="p-3 text-right">{t('selling_price')}</th>
                                <th className="p-3 text-right">{t('profit_margin')}</th>
                                <th className="p-3 text-center">{t('status')}</th>
                                <th className="p-3">{t('created_by')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-semibold">{product.name}</td>
                                    <td className="p-3 text-center font-mono">{product.stock}</td>
                                    <td className="p-3 text-right font-mono">K{product.sellingPrice.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono text-emerald-500">K{(product.sellingPrice - product.purchasePrice).toFixed(2)}</td>
                                    <td className="p-3 text-center">{getStatus(product.stock, product.alertLevel)}</td>
                                    <td className="p-3 text-slate-500 text-sm">{product.createdBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={t('add_product')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('product_name')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('stock_on_hand')}</label>
                        <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('stock_alert_level')}</label>
                        <input type="number" value={alertLevel} onChange={e => setAlertLevel(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('purchase_price')}</label>
                        <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" placeholder="K0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('selling_price')}</label>
                        <input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" placeholder="K0.00" />
                    </div>
                    <div className="col-span-2">
                         <button onClick={() => setScannerOpen(true)} className="w-full text-left bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" /></svg>
                            {t('scan_barcode')}
                         </button>
                    </div>
                    <div className="col-span-2 flex justify-end gap-3 pt-4">
                        <button onClick={() => setModalOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button>
                        <button onClick={handleAddProduct} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg">{t('save')}</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} title={t('scan_barcode')}>
                <div className="flex flex-col items-center justify-center bg-black rounded-lg p-8 h-64">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-500 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                    <p className="text-slate-400 text-center">Camera would be active here to scan barcode.</p>
                </div>
            </Modal>
        </div>
    );
};

export default Inventory;