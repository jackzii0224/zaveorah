import React, { useState } from 'react';
import Card from './common/Card';
import { useAppContext } from '../hooks/useAppContext';
import { Invoice } from '../types';

const InvoiceStatusBadge: React.FC<{ status: Invoice['status'] }> = ({ status }) => {
    const { t } = useAppContext();
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
        case 'paid':
            return <span className={`${baseClasses} bg-emerald-100 text-emerald-800`}>{t('paid')}</span>;
        case 'sent':
            return <span className={`${baseClasses} bg-sky-100 text-sky-800`}>{t('sent')}</span>;
        case 'overdue':
            return <span className={`${baseClasses} bg-rose-100 text-rose-800`}>{t('overdue')}</span>;
        default:
            return <span className={`${baseClasses} bg-slate-100 text-slate-800`}>{t('draft')}</span>;
    }
};

const InvoiceTemplate: React.FC<{ invoice: Invoice, onBack: () => void }> = ({ invoice, onBack }) => {
    const { t, businessProfile } = useAppContext();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-invoice, #printable-invoice * {
                        visibility: visible;
                    }
                    #printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            <div className="flex justify-between items-center mb-6 no-print">
                <button onClick={onBack} className="flex items-center gap-2 font-semibold text-sky-500 hover:text-sky-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    Back to Invoices
                </button>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-sky-600 transition-colors flex items-center gap-2">
                        {t('print_download')}
                    </button>
                </div>
            </div>
            <Card>
                <div id="printable-invoice" className="p-4 sm:p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start pb-6 border-b dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            {businessProfile.logo && <img src={businessProfile.logo} alt="Business Logo" className="w-16 h-16 object-contain" />}
                            <div>
                                <h1 className="text-2xl font-bold">{businessProfile.name}</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-line">{businessProfile.address}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{businessProfile.contact}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-extrabold uppercase text-slate-400 dark:text-slate-500">{t('invoice')}</h2>
                            <p className="font-mono text-sm">#{invoice.invoiceNumber}</p>
                        </div>
                    </div>
                    {/* Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-6">
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">{t('bill_to')}</p>
                            <p className="font-semibold">{invoice.customerName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">{t('issue_date')}</p>
                            <p className="font-semibold">{invoice.issueDate}</p>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">{t('due_date')}</p>
                            <p className="font-semibold">{invoice.dueDate}</p>
                        </div>
                    </div>
                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr className="text-sm text-slate-500">
                                    <th className="p-3 font-semibold">{t('item_description')}</th>
                                    <th className="p-3 font-semibold text-center">{t('quantity')}</th>
                                    <th className="p-3 font-semibold text-right">{t('unit_price')}</th>
                                    <th className="p-3 font-semibold text-right">{t('total')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, index) => (
                                    <tr key={index} className="border-b dark:border-slate-700">
                                        <td className="p-3">{item.description}</td>
                                        <td className="p-3 text-center font-mono">{item.quantity}</td>
                                        <td className="p-3 text-right font-mono">K{item.unitPrice.toFixed(2)}</td>
                                        <td className="p-3 text-right font-mono">K{(item.quantity * item.unitPrice).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Total */}
                    <div className="flex justify-end pt-6">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>{t('total')}:</span>
                                <span className="font-mono">K{invoice.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-sky-500 border-t-2 dark:border-slate-700 pt-2 mt-2">
                                <span>Balance Due:</span>
                                <span className="font-mono">K{invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="pt-8 mt-8 border-t dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                         <p className="font-semibold mb-1">{t('notes')}:</p>
                         <p>{invoice.notes || 'Tenkyu tru long business wantaim mipla!'}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const Invoicing: React.FC = () => {
    const { t, invoices } = useAppContext();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    if (selectedInvoice) {
        return <InvoiceTemplate invoice={selectedInvoice} onBack={() => setSelectedInvoice(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('invoicing')}</h1>
                <div className="flex gap-2 flex-wrap">
                    <button className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        {t('create_invoice')}
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-slate-700 text-sm text-slate-500">
                                <th className="p-3">{t('invoice_no')}</th>
                                <th className="p-3">{t('customer_name')}</th>
                                <th className="p-3">{t('issue_date')}</th>
                                <th className="p-3">{t('due_date')}</th>
                                <th className="p-3 text-right">{t('total')}</th>
                                <th className="p-3 text-center">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => (
                                <tr key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                    <td className="p-3 font-mono text-sky-500">{invoice.invoiceNumber}</td>
                                    <td className="p-3 font-semibold">{invoice.customerName}</td>
                                    <td className="p-3">{invoice.issueDate}</td>
                                    <td className="p-3">{invoice.dueDate}</td>
                                    <td className="p-3 text-right font-mono">K{invoice.total.toFixed(2)}</td>
                                    <td className="p-3 text-center"><InvoiceStatusBadge status={invoice.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Invoicing;
