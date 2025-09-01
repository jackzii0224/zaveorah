import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import Modal from './common/Modal';
import { useAppContext } from '../hooks/useAppContext';
import { Employee, Payslip, AttendanceRecord, User } from '../types';

const PinPad: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [pin, setPin] = useState('');
    const { clockIn, clockOut } = useAppContext();

    const handleKeyPress = (key: string) => {
        if (key === 'del') {
            setPin(p => p.slice(0, -1));
        } else if (pin.length < 4) {
            setPin(p => p + key);
        }
    };

    const handleSubmit = () => {
        if (pin.length === 4) {
            const clockedIn = clockIn(pin);
            if (!clockedIn) {
                clockOut(pin);
            }
            onComplete();
        }
    };
    
    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-4 mb-6 h-12">
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 ${pin.length > i ? 'bg-sky-500 border-sky-500' : 'border-slate-400'}`}></div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[...Array(9).keys()].map(i => (
                    <button key={i+1} onClick={() => handleKeyPress(String(i+1))} className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 text-2xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{i+1}</button>
                ))}
                <button onClick={() => handleKeyPress('del')} className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">DEL</button>
                <button onClick={() => handleKeyPress('0')} className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 text-2xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">0</button>
                <button onClick={handleSubmit} className="w-16 h-16 rounded-full bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors">OK</button>
            </div>
        </div>
    );
};

const EmployeeDetailView: React.FC<{ employee: Employee, onBack?: () => void, isSelfView?: boolean }> = ({ employee, onBack, isSelfView = false }) => {
    const { t, attendance, payslips, generatePayslip, currentUser, permissions } = useAppContext();
    const [activeTab, setActiveTab] = useState<'attendance' | 'payslips'>('attendance');
    
    const canManage = currentUser && permissions.canManageUsers.includes(currentUser.role);
    
    const employeeAttendance = useMemo(() => 
        attendance.filter(a => a.employeeId === employee.id).sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()),
        [attendance, employee.id]
    );

    const employeePayslips = useMemo(() => 
        payslips.filter(p => p.employeeId === employee.id),
        [payslips, employee.id]
    );

    const handleGeneratePayslip = () => {
        const today = new Date();
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        const period = `${lastWeek.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`;
        generatePayslip(employee.id, period);
    };

    return (
         <div>
            {!isSelfView && onBack && (
                <button onClick={onBack} className="flex items-center gap-2 font-semibold text-sky-500 hover:text-sky-700 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    {t('back')}
                </button>
            )}
            <Card>
                <div className="p-4">
                    <h2 className="text-2xl font-bold">{employee.name}</h2>
                    <p className="text-slate-500">{employee.position}</p>
                    <div className="flex border-b dark:border-slate-700 mt-6">
                        <button onClick={() => setActiveTab('attendance')} className={`py-3 px-6 font-semibold ${activeTab === 'attendance' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('attendance')}</button>
                        <button onClick={() => setActiveTab('payslips')} className={`py-3 px-6 font-semibold ${activeTab === 'payslips' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('payslips')}</button>
                    </div>

                    <div className="mt-4">
                        {activeTab === 'attendance' && (
                           <table className="w-full text-left">
                               <thead><tr className="text-sm text-slate-500"><th className="p-2">Date</th><th className="p-2">Clock In</th><th className="p-2">Clock Out</th><th className="p-2 text-right">Hours</th></tr></thead>
                               <tbody>
                                   {employeeAttendance.map(a => {
                                       const hours = a.clockOut ? ((new Date(a.clockOut).getTime() - new Date(a.clockIn).getTime()) / 3600000).toFixed(2) : 'N/A';
                                       return (<tr key={a.id} className="border-t dark:border-slate-700">
                                           <td className="p-2">{new Date(a.clockIn).toLocaleDateString()}</td>
                                           <td className="p-2">{new Date(a.clockIn).toLocaleTimeString()}</td>
                                           <td className="p-2">{a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : 'Still clocked in'}</td>
                                           <td className="p-2 text-right font-mono">{hours}</td>
                                       </tr>)
                                   })}
                               </tbody>
                           </table>
                        )}
                         {activeTab === 'payslips' && (
                           <div>
                               {canManage && <button onClick={handleGeneratePayslip} className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-emerald-600 mb-4">{t('generate_payslip')} (Last 7 Days)</button>}
                               <table className="w-full text-left">
                                   <thead><tr className="text-sm text-slate-500"><th className="p-2">Period</th><th className="p-2">Total Hours</th><th className="p-2 text-right">Total Pay</th></tr></thead>
                                   <tbody>
                                       {employeePayslips.map(p => (<tr key={p.id} className="border-t dark:border-slate-700">
                                           <td className="p-2">{p.period}</td>
                                           <td className="p-2 font-mono">{p.totalHours.toFixed(2)}</td>
                                           <td className="p-2 text-right font-mono">K{p.totalPay.toFixed(2)}</td>
                                       </tr>))}
                                   </tbody>
                               </table>
                           </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}

const Employees: React.FC = () => {
    const { t, employees, addEmployee, deleteEmployee, attendance, currentUser, permissions } = useAppContext();
    const [activeTab, setActiveTab] = useState<'records' | 'structure'>('records');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isPinModalOpen, setPinModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [pin, setPin] = useState('');
    const [wageRate, setWageRate] = useState('');

    const canManage = currentUser && permissions.canManageUsers.includes(currentUser.role);
    const canDelete = currentUser && permissions.canDelete.includes(currentUser.role);

    const handleAddEmployee = () => {
        if (name && position && pin.length === 4 && wageRate) {
            addEmployee({ name, position, wageRate: parseFloat(wageRate), wageType: 'hourly' }, pin);
            setAddModalOpen(false);
            setName(''); setPosition(''); setPin(''); setWageRate('');
        }
    };

    const openDeleteConfirm = (employee: Employee) => {
        setEmployeeToDelete(employee);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (employeeToDelete) {
            deleteEmployee(employeeToDelete.id);
            setDeleteConfirmOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const getStatus = (employeeId: string) => {
        const lastRecord = attendance.filter(a => a.employeeId === employeeId).sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())[0];
        return lastRecord && !lastRecord.clockOut ? 'clocked_in' : 'clocked_out';
    };

    // Employee View
    if (currentUser?.role === 'employee') {
        const self = employees.find(e => e.id === currentUser.employeeId);
        if (!self) return <div>Error: Employee record not found.</div>;
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('my_profile')}</h1>
                <EmployeeDetailView employee={self} isSelfView={true} />
            </div>
        )
    }

    // Manager/Owner View
    if (selectedEmployee) {
        return <EmployeeDetailView employee={selectedEmployee} onBack={() => setSelectedEmployee(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('employees')}</h1>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setPinModalOpen(true)} className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-slate-700">{t('clock_in_out')}</button>
                    {canManage && <button onClick={() => setAddModalOpen(true)} className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-sky-600">{t('add_employee')}</button>}
                </div>
            </div>

            <Card>
                <div className="flex border-b dark:border-slate-700">
                    <button onClick={() => setActiveTab('records')} className={`py-3 px-6 font-semibold ${activeTab === 'records' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('employee_records')}</button>
                    <button onClick={() => setActiveTab('structure')} className={`py-3 px-6 font-semibold ${activeTab === 'structure' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>{t('org_structure')}</button>
                </div>

                {activeTab === 'records' && (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b dark:border-slate-700 text-sm text-slate-500"><th className="p-3">{t('name')}</th><th className="p-3">{t('position')}</th><th className="p-3 text-center">{t('status')}</th><th className="p-3 text-center">{t('actions')}</th></tr>
                            </thead>
                            <tbody>
                                {employees.map(employee => {
                                    const isSelf = currentUser?.employeeId === employee.id;
                                    return (
                                        <tr key={employee.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="p-3 font-semibold">{employee.name}</td>
                                            <td className="p-3">{employee.position}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatus(employee.id) === 'clocked_in' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                                    {t(getStatus(employee.id))}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center space-x-4">
                                                <button onClick={() => setSelectedEmployee(employee)} className="text-sky-500 hover:text-sky-700 font-semibold">{t('view')}</button>
                                                {canDelete && (
                                                    <button 
                                                        onClick={() => openDeleteConfirm(employee)} 
                                                        className="font-semibold text-rose-500 hover:underline disabled:text-slate-400 disabled:no-underline"
                                                        disabled={isSelf}
                                                    >
                                                        {t('delete')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'structure' && (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                       <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-4">Organizational Chart</h3>
                       <p className="mt-1">Feature coming soon. This will help you visualize your team's reporting structure.</p>
                    </div>
                )}
            </Card>

            <Modal isOpen={isPinModalOpen} onClose={() => setPinModalOpen(false)} title={t('enter_pin')}>
                <PinPad onComplete={() => setPinModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title={t('add_employee')}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">{t('employee_name')}</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" /></div>
                    <div><label className="block text-sm font-medium">{t('position')}</label><input type="text" value={position} onChange={e => setPosition(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" /></div>
                    <div><label className="block text-sm font-medium">{t('pin')} (4 digits)</label><input type="text" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" /></div>
                    <div><label className="block text-sm font-medium">{t('wage_rate')}</label><input type="number" value={wageRate} onChange={e => setWageRate(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border dark:border-slate-600" placeholder="K0.00" /></div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setAddModalOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button>
                        <button onClick={handleAddEmployee} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg">{t('save')}</button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isDeleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title={t('delete_confirmation_title')}>
                <p className="text-slate-600 dark:text-slate-300">{t('delete_employee_confirmation_body')}</p>
                <div className="flex justify-end gap-3 pt-6">
                    <button onClick={() => setDeleteConfirmOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button>
                    <button onClick={confirmDelete} className="bg-rose-500 text-white font-bold py-2 px-5 rounded-lg">{t('delete')}</button>
                </div>
            </Modal>
        </div>
    );
};

export default Employees;