import React, { useState } from 'react';
import Modal from './common/Modal';
import { useAppContext } from '../hooks/useAppContext';
import { User, UserRole } from '../types';

const UserManagement: React.FC = () => {
    const { t, users, addUser, updateUser, deleteUser, currentUser } = useAppContext();
    
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('staff');
    
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const openAddModal = () => {
        setEditingUser(null);
        setName('');
        setPassword('');
        setRole('staff');
        setFormModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setName(user.name);
        setPassword(user.password || '');
        setRole(user.role);
        setFormModalOpen(true);
    };

    const handleFormSubmit = () => {
        if (name && password) {
            if (editingUser) { // It's an Edit
                updateUser({ ...editingUser, name, password, role });
            } else { // It's an Add
                addUser({ name, password, role });
            }
            setFormModalOpen(false);
        }
    };

    const openDeleteConfirm = (user: User) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setDeleteConfirmOpen(false);
            setUserToDelete(null);
        }
    };
    
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('user_management')}</h2>
                <button onClick={openAddModal} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg shadow hover:bg-sky-600 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    {t('add_user')}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-slate-700 text-sm text-slate-500">
                            <th className="p-3">{t('name')}</th>
                            <th className="p-3">{t('user_role')}</th>
                            <th className="p-3 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter(u => u.role !== 'employee').map(user => (
                            <tr key={user.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-3 font-semibold">{user.name}</td>
                                <td className="p-3">
                                     <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200">
                                        {t(user.role)}
                                     </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => openEditModal(user)} className="font-semibold text-sky-500 hover:underline mr-4">{t('edit')}</button>
                                    <button 
                                        onClick={() => openDeleteConfirm(user)} 
                                        className="font-semibold text-rose-500 hover:underline disabled:text-slate-400 disabled:no-underline"
                                        disabled={currentUser?.id === user.id}
                                    >
                                        {t('delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} title={editingUser ? t('edit_user') : t('add_user')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('name')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('password')}</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('user_role')}</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-300 dark:border-slate-600">
                           <option value="owner">{t('owner')}</option>
                           <option value="manager">{t('manager')}</option>
                           <option value="staff">{t('staff')}</option>
                           <option value="employee" disabled>{t('employee')}</option>
                        </select>
                         <p className="text-xs text-slate-500 mt-1">Employee users are managed from the 'Employees' page.</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setFormModalOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button>
                        <button onClick={handleFormSubmit} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg">{t('save')}</button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title={t('delete_confirmation_title')}>
                <p className="text-slate-600 dark:text-slate-300">{t('delete_confirmation_body')}</p>
                <div className="flex justify-end gap-3 pt-6">
                    <button onClick={() => setDeleteConfirmOpen(false)} className="bg-slate-200 dark:bg-slate-600 font-bold py-2 px-5 rounded-lg">{t('cancel')}</button>
                    <button onClick={confirmDelete} className="bg-rose-500 text-white font-bold py-2 px-5 rounded-lg">{t('delete')}</button>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;