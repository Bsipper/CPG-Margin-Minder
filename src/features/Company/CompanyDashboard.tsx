import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MockDB } from '../../api/mockDb';
import { Product, User, UserRole } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Package, LogOut, Edit2, Trash2, X, Check, Users } from 'lucide-react';
import styles from './CompanyDashboard.module.css';

interface Props {
    overrideCompanyId?: string;
    onSelectProduct: (productId: string) => void;
    onBack?: () => void;
}

export function CompanyDashboard({ overrideCompanyId, onSelectProduct, onBack }: Props) {
    const { user, logout } = useAuth();
    const targetCompanyId = overrideCompanyId || user?.companyId || '';

    // Product State
    const [products, setProducts] = useState<Product[]>(MockDB.getProducts(targetCompanyId));
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [editProductName, setEditProductName] = useState('');

    // User State (Only for Admins)
    const canManageProducts = user?.role === 'admin' || user?.role === 'super_admin';
    const canManageUsers = user?.role === 'admin'; // Super admins manage users in their own dashboard

    const [companyUsers, setCompanyUsers] = useState<User[]>(
        MockDB.getUsers().filter(u => u.companyId === targetCompanyId && u.role !== 'super_admin')
    );
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('distributor');

    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editUserEmail, setEditUserEmail] = useState('');
    const [editUserRole, setEditUserRole] = useState<UserRole>('distributor');

    if (!user) return null;

    // --- Product Handlers ---
    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProductName.trim()) return;

        const newProd: Product = {
            id: `prod_${uuidv4()}`,
            companyId: targetCompanyId,
            name: newProductName,
            sku: `SKU-${Math.floor(Math.random() * 10000)}`,
            casePack: 12
        };

        MockDB.saveProduct(newProd);
        setProducts(MockDB.getProducts(targetCompanyId));
        setNewProductName('');
        setIsAddingProduct(false);
    };

    const handleDeleteProduct = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this Product Line? This cannot be undone.')) {
            MockDB.deleteProduct(id);
            setProducts(MockDB.getProducts(targetCompanyId));
        }
    };

    const startEditProduct = (e: React.MouseEvent, p: Product) => {
        e.stopPropagation();
        setEditingProductId(p.id);
        setEditProductName(p.name);
    };

    const cancelEditProduct = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProductId(null);
        setEditProductName('');
    };

    const saveEditProduct = (e: React.MouseEvent, p: Product) => {
        e.stopPropagation();
        if (!editProductName.trim()) return;

        const updated = { ...p, name: editProductName };
        MockDB.saveProduct(updated);
        setProducts(MockDB.getProducts(targetCompanyId));
        setEditingProductId(null);
        setEditProductName('');
    };

    // --- User Handlers ---
    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail.trim()) return;

        const newUser: User = {
            id: `usr_${uuidv4()}`,
            email: newUserEmail,
            role: newUserRole,
            companyId: targetCompanyId,
            hasAcceptedTerms: false
        };

        MockDB.saveUser(newUser);
        setCompanyUsers(MockDB.getUsers().filter(u => u.companyId === targetCompanyId && u.role !== 'super_admin'));
        setNewUserEmail('');
        setIsAddingUser(false);
    };

    const handleDeleteUser = (id: string, email: string) => {
        if (confirm(`Are you sure you want to revoke access for ${email}?`)) {
            MockDB.deleteUser(id);
            setCompanyUsers(MockDB.getUsers().filter(u => u.companyId === targetCompanyId && u.role !== 'super_admin'));
        }
    };

    const startEditUser = (u: User) => {
        setEditingUserId(u.id);
        setEditUserEmail(u.email);
        setEditUserRole(u.role);
    };

    const cancelEditUser = () => {
        setEditingUserId(null);
        setEditUserEmail('');
    };

    const saveEditUser = (u: User) => {
        if (!editUserEmail.trim()) return;

        const updated = { ...u, email: editUserEmail, role: editUserRole };
        MockDB.saveUser(updated);
        setCompanyUsers(MockDB.getUsers().filter(u => u.companyId === targetCompanyId && u.role !== 'super_admin'));
        setEditingUserId(null);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1>Product Lines {overrideCompanyId && "(Super Admin View)"}</h1>
                        <p>Welcome back, {user.email} (Role: {user.role})</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {onBack ? (
                            <button className={styles.logoutBtn} onClick={onBack}>
                                &larr; Back to Clients
                            </button>
                        ) : (
                            <button className={styles.logoutBtn} onClick={logout}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.sectionHeader}>
                    <h2>Available Product Lines</h2>
                    {canManageProducts && (
                        <button className={styles.addBtn} onClick={() => setIsAddingProduct(true)}>
                            <Plus size={16} /> Add Product Line
                        </button>
                    )}
                </div>

                {isAddingProduct && canManageProducts && (
                    <form onSubmit={handleAddProduct} className={styles.addForm}>
                        <input
                            type="text"
                            value={newProductName}
                            onChange={e => setNewProductName(e.target.value)}
                            placeholder="E.g., Honey Roasted Peanuts"
                            autoFocus
                        />
                        <button type="submit" className={styles.saveBtn}>Save</button>
                        <button type="button" className={styles.cancelBtn} onClick={() => setIsAddingProduct(false)}>Cancel</button>
                    </form>
                )}

                <div className={styles.productGrid}>
                    {products.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Package size={32} className={styles.emptyIcon} />
                            <p>No product lines found for your company.</p>
                        </div>
                    ) : (
                        products.map(p => (
                            <div key={p.id} className={styles.productCard} onClick={() => {
                                if (editingProductId !== p.id) onSelectProduct(p.id)
                            }}>
                                <div className={styles.cardHeader}>
                                    <Package className={styles.cardIcon} size={24} />
                                    {canManageProducts && editingProductId !== p.id && (
                                        <div className={styles.cardActions}>
                                            <button onClick={(e) => startEditProduct(e, p)} className={styles.iconBtn}><Edit2 size={16} /></button>
                                            <button onClick={(e) => handleDeleteProduct(e, p.id)} className={`${styles.iconBtn} ${styles.danger}`}><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </div>

                                {editingProductId === p.id ? (
                                    <div className={styles.editModeBody} onClick={e => e.stopPropagation()}>
                                        <input
                                            className={styles.editInput}
                                            value={editProductName}
                                            onChange={e => setEditProductName(e.target.value)}
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') saveEditProduct(e as any, p);
                                                if (e.key === 'Escape') cancelEditProduct(e as any);
                                            }}
                                        />
                                        <div className={styles.editActions}>
                                            <button className={styles.confirmBtn} onClick={(e) => saveEditProduct(e, p)}><Check size={16} /></button>
                                            <button className={styles.cancelIconBtn} onClick={cancelEditProduct}><X size={16} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3>{p.name}</h3>
                                        <p>SKU: {p.sku}</p>
                                        <span className={styles.openBtn}>View Scenarios &rarr;</span>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {canManageUsers && (
                    <div className={styles.userSection}>
                        <div className={styles.sectionHeader} style={{ marginTop: '3rem' }}>
                            <h2>Company Users</h2>
                            <button className={styles.addBtn} onClick={() => setIsAddingUser(true)}>
                                <Plus size={16} /> Add User
                            </button>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                            Manage the distributors and retailers who have access to your product lines.
                        </p>

                        {isAddingUser && (
                            <form onSubmit={handleAddUser} className={styles.addForm}>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                />
                                <select
                                    value={newUserRole}
                                    onChange={e => setNewUserRole(e.target.value as UserRole)}
                                    className={styles.roleSelect}
                                >
                                    <option value="distributor">Distributor</option>
                                    <option value="retailer">Retailer</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button type="submit" className={styles.saveBtn}>Save</button>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddingUser(false)}>Cancel</button>
                            </form>
                        )}

                        <div className={styles.tableCard}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Terms Accepted</th>
                                        <th align="right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companyUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className={styles.emptyTableText}>No users added yet.</td>
                                        </tr>
                                    ) : (
                                        companyUsers.map(u => (
                                            <tr key={u.id}>
                                                {editingUserId === u.id ? (
                                                    <>
                                                        <td>
                                                            <input
                                                                className={styles.editInputLine}
                                                                value={editUserEmail}
                                                                onChange={e => setEditUserEmail(e.target.value)}
                                                                onKeyDown={e => e.key === 'Enter' && saveEditUser(u)}
                                                                autoFocus
                                                            />
                                                        </td>
                                                        <td>
                                                            <select
                                                                value={editUserRole}
                                                                onChange={e => setEditUserRole(e.target.value as UserRole)}
                                                                className={styles.roleSelectLine}
                                                            >
                                                                <option value="distributor">Distributor</option>
                                                                <option value="retailer">Retailer</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td>-</td>
                                                        <td align="right">
                                                            <div className={styles.tableActions}>
                                                                <button className={styles.saveActionText} onClick={() => saveEditUser(u)}>Save</button>
                                                                <button className={styles.cancelActionText} onClick={cancelEditUser}>Cancel</button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{u.email}</td>
                                                        <td><span className={styles.roleBadge}>{u.role}</span></td>
                                                        <td>
                                                            {u.hasAcceptedTerms ?
                                                                <span className={styles.acceptedTag}>Yes</span> :
                                                                <span className={styles.pendingTag}>Pending</span>
                                                            }
                                                        </td>
                                                        <td align="right">
                                                            {user.id !== u.id && (
                                                                <div className={styles.tableActions}>
                                                                    <button className={styles.iconBtn} onClick={() => startEditUser(u)} title="Edit Role">
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                    <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDeleteUser(u.id, u.email)} title="Remove Access">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
