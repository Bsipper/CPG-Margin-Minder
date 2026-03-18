import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MockDB } from '../../api/mockDb';
import { Company, User } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Users, LogOut, Building2, Edit2, Trash2, X, Check } from 'lucide-react';
import styles from './SuperAdminDashboard.module.css';
import layoutStyles from '../../components/layout/MainLayout.module.css';
import { Sidebar } from '../../components/layout/Sidebar';

interface Props {
    onSelectCompany: (companyId: string) => void;
}

export function SuperAdminDashboard({ onSelectCompany }: Props) {
    const { user, logout } = useAuth();

    if (!user || user.role !== 'super_admin') return null;

    const [companies, setCompanies] = useState<Company[]>(MockDB.getCompanies());
    const [users, setUsers] = useState<User[]>(MockDB.getUsers());
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = companies.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [isAddingCompany, setIsAddingCompany] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');

    const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
    const [editCompanyName, setEditCompanyName] = useState('');

    const [managingUsersForCompany, setManagingUsersForCompany] = useState<string | null>(null);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<'admin' | 'distributor' | 'retailer'>('admin');

    const [confirmDeleteCompany, setConfirmDeleteCompany] = useState<string | null>(null);
    const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);
    const [userAlertError, setUserAlertError] = useState<string | null>(null);

    const handleAddCompany = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyName.trim()) return;

        const newComp: Company = {
            id: `comp_${uuidv4()}`,
            name: newCompanyName
        };

        MockDB.saveCompany(newComp);
        setCompanies(MockDB.getCompanies());
        setNewCompanyName('');
        setIsAddingCompany(false);
    };

    const handleDeleteCompany = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setConfirmDeleteCompany(id);
    };

    const confirmExecuteDeleteCompany = () => {
        if (confirmDeleteCompany) {
            MockDB.deleteCompany(confirmDeleteCompany);
            setCompanies(MockDB.getCompanies());
            setConfirmDeleteCompany(null);
        }
    };

    const startEditCompany = (e: React.MouseEvent, c: Company) => {
        e.stopPropagation();
        setEditingCompanyId(c.id);
        setEditCompanyName(c.name);
    };

    const saveEditCompany = (e: React.MouseEvent, c: Company) => {
        e.stopPropagation();
        if (!editCompanyName.trim()) return;

        const updated = { ...c, name: editCompanyName };
        MockDB.saveCompany(updated);
        setCompanies(MockDB.getCompanies());
        setEditingCompanyId(null);
        setEditCompanyName('');
    };

    const cancelEditCompany = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCompanyId(null);
        setEditCompanyName('');
    };

    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editUserEmail, setEditUserEmail] = useState('');
    const [editUserRole, setEditUserRole] = useState<'admin' | 'distributor' | 'retailer'>('admin');

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail.trim() || !managingUsersForCompany) return;

        if (!newUserEmail.includes('@')) {
            setUserAlertError("Warning: Please enter a valid email address containing an '@' symbol.");
            return;
        }

        const newUser: User = {
            id: `usr_${uuidv4()}`,
            email: newUserEmail,
            role: newUserRole,
            companyId: managingUsersForCompany
        };

        MockDB.saveUser(newUser);
        setUsers(MockDB.getUsers());
        setNewUserEmail('');
        setIsAddingUser(false);
        setUserAlertError(null);
    };

    const handleDeleteUser = (id: string) => {
        setConfirmDeleteUser(id);
    };

    const confirmExecuteDeleteUser = () => {
        if (confirmDeleteUser) {
            MockDB.deleteUser(confirmDeleteUser);
            setUsers(MockDB.getUsers());
            setConfirmDeleteUser(null);
        }
    };

    const startEditUser = (u: User) => {
        setEditingUserId(u.id);
        setEditUserEmail(u.email);
        setEditUserRole(u.role as 'admin' | 'distributor' | 'retailer');
    };

    const saveEditUser = () => {
        if (!editUserEmail.trim()) return;

        const targetUser = users.find(x => x.id === editingUserId);
        if (targetUser) {
            const updated = { ...targetUser, email: editUserEmail, role: editUserRole };
            MockDB.saveUser(updated);
            setUsers(MockDB.getUsers());
        }
        setEditingUserId(null);
    };

    const cancelEditUser = () => {
        setEditingUserId(null);
    };

    const getCompanyUsers = (companyId: string) => users.filter(u => u.companyId === companyId);

    return (
        <div className={layoutStyles.layout}>
            <Sidebar 
                activeTab="admin" 
                onTabChange={() => {}} 
                onGoAdmin={() => {}} // already admin
                onGoHome={() => alert("Please select a company first to view products.")}
            />
            <div className={layoutStyles.mainContent} style={{ overflowY: 'auto' }}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <div className={styles.headerContent}>
                    <div>
                        <h1>Company Dashboard</h1>
                        <p>Welcome back, Super Admin ({user.email})</p>
                    </div>
                    <button className={styles.logoutBtn} onClick={logout}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.sectionHeader}>
                    <h2>Client Companies</h2>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Filter companies..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-surface)', color: 'var(--color-text)' }}
                        />
                        <button className={styles.addBtn} onClick={() => setIsAddingCompany(true)}>
                            <Plus size={16} /> Add Company
                        </button>
                    </div>
                </div>

                {isAddingCompany && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h2>Add New Company</h2>
                            <form onSubmit={handleAddCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    value={newCompanyName}
                                    onChange={e => setNewCompanyName(e.target.value)}
                                    placeholder="E.g., Acme Corp Food Division"
                                    autoFocus
                                    style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                                />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className={styles.saveBtn} style={{ padding: '8px 16px' }}>Save Company</button>
                                    <button type="button" className={styles.cancelBtn} onClick={() => setIsAddingCompany(false)} style={{ padding: '8px 16px' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className={styles.companyGrid}>
                    {filteredCompanies.map(c => (
                        <div key={c.id} className={styles.companyCard}>
                            <div className={styles.cardTop}>
                                {editingCompanyId === c.id ? (
                                    <div className={styles.editModeBody} style={{ flex: 1, marginRight: 12 }}>
                                        <input
                                            className={styles.editInput}
                                            value={editCompanyName}
                                            onChange={e => setEditCompanyName(e.target.value)}
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') saveEditCompany(e as any, c);
                                                if (e.key === 'Escape') cancelEditCompany(e as any);
                                            }}
                                        />
                                        <div className={styles.editActions} style={{ display: 'flex', gap: '8px' }}>
                                            <button className={styles.saveBtn} onClick={(e) => saveEditCompany(e, c)} style={{ padding: '4px 12px', fontSize: '0.875rem' }}>Save</button>
                                            <button className={styles.cancelBtn} onClick={cancelEditCompany} style={{ padding: '4px 12px', fontSize: '0.875rem' }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.cardHeader}>
                                        <Building2 className={styles.cardIcon} size={24} />
                                        <h3>{c.name}</h3>
                                        <div className={styles.cardActionsSmall}>
                                            <button onClick={(e) => startEditCompany(e, c)} className={styles.iconBtn}><Edit2 size={16} /></button>
                                            <button onClick={(e) => handleDeleteCompany(e, c.id)} className={`${styles.iconBtn} ${styles.danger}`}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardActions}>
                                <button className={styles.actionBtn} onClick={() => setManagingUsersForCompany(c.id)}>
                                    <Users size={16} /> Manage Users ({getCompanyUsers(c.id).length})
                                </button>
                                <button className={styles.actionBtnPrimary} onClick={() => onSelectCompany(c.id)}>
                                    Manage Products &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {managingUsersForCompany && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h2>Users for: {companies.find(c => c.id === managingUsersForCompany)?.name}</h2>

                            <div className={styles.userList}>
                                {getCompanyUsers(managingUsersForCompany).map(u => (
                                    <div key={u.id} className={styles.userRow}>
                                        {editingUserId === u.id ? (
                                            <div className={styles.editModeBody} style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginTop: 0 }}>
                                                <input
                                                    className={styles.editInput}
                                                    type="email"
                                                    value={editUserEmail}
                                                    onChange={e => setEditUserEmail(e.target.value)}
                                                    autoFocus
                                                />
                                                <select
                                                    className={styles.editInput}
                                                    style={{ width: 'auto' }}
                                                    value={editUserRole}
                                                    onChange={e => setEditUserRole(e.target.value as any)}
                                                >
                                                    <option value="admin">Client Admin</option>
                                                    <option value="distributor">Distributor</option>
                                                    <option value="retailer">Retailer</option>
                                                </select>
                                                <button className={styles.confirmBtn} onClick={saveEditUser}><Check size={16} /></button>
                                                <button className={styles.cancelIconBtn} onClick={cancelEditUser}><X size={16} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <span className={styles.userEmail}>{u.email}</span>
                                                    <span className={styles.userRoleBadge}>{u.role}</span>
                                                </div>
                                                <div className={styles.cardActionsSmall} style={{ opacity: 1 }}>
                                                    <button onClick={() => startEditUser(u)} className={styles.iconBtn}><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteUser(u.id)} className={`${styles.iconBtn} ${styles.danger}`}><Trash2 size={16} /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {!isAddingUser ? (
                                <button className={styles.addBtn} onClick={() => setIsAddingUser(true)}>
                                    <Plus size={16} /> Add User
                                </button>
                            ) : (
                                <form onSubmit={handleAddUser} className={styles.addUserForm} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input
                                            type="text"
                                            value={newUserEmail}
                                            onChange={e => {
                                                setNewUserEmail(e.target.value);
                                                setUserAlertError(null);
                                            }}
                                            placeholder="User Email"
                                            autoFocus
                                        />
                                        <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as any)}>
                                            <option value="admin">Client Admin</option>
                                            <option value="distributor">Distributor</option>
                                            <option value="retailer">Retailer</option>
                                        </select>
                                    </div>
                                    {userAlertError && <div style={{ color: 'var(--color-rose)', fontSize: '0.875rem' }}>{userAlertError}</div>}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <button type="submit" className={styles.saveBtn} style={{ padding: '8px 16px' }}>Save User</button>
                                        <button type="button" className={styles.cancelBtn} onClick={() => {
                                            setIsAddingUser(false);
                                            setUserAlertError(null);
                                        }} style={{ padding: '8px 16px' }}>Cancel</button>
                                    </div>
                                </form>
                            )}

                            <button className={styles.closeModalBtn} onClick={() => {
                                setManagingUsersForCompany(null);
                                setIsAddingUser(false);
                            }}>
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Modals for Custom Confirmation (bypassing native browser suppression) */}
                {confirmDeleteCompany && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px' }}>
                            <h2 style={{ marginTop: 0, color: 'white' }}>Delete Company?</h2>
                            <p style={{ color: 'var(--color-text-secondary)', margin: '1rem 0' }}>Are you sure you want to delete this Company and ALL associated data? This cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={confirmExecuteDeleteCompany} style={{ padding: '8px 16px', background: 'var(--color-rose)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Delete Company</button>
                                <button onClick={() => setConfirmDeleteCompany(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {confirmDeleteUser && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px' }}>
                            <h2 style={{ marginTop: 0, color: 'white' }}>Delete User?</h2>
                            <p style={{ color: 'var(--color-text-secondary)', margin: '1rem 0' }}>Are you sure you want to delete this User?</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={confirmExecuteDeleteUser} style={{ padding: '8px 16px', background: 'var(--color-rose)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Delete User</button>
                                <button onClick={() => setConfirmDeleteUser(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            </div>
        </div>
        </div>
    );
}
