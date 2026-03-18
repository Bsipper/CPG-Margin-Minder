import React, { useState } from 'react';
import { LayoutDashboard, Settings, Wallet, BarChart3, Tags, BarChartHorizontal, Calculator, FileSpreadsheet, LogOut, Users, Truck, Home } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useScenarioOptional } from '../../context/ScenarioContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

export type TabId = 'home' | 'dashboard' | 'setup' | 'cogs' | 'freight' | 'pricing' | 'promos' | 'slotting' | 'compare' | 'admin';

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    onGoHome?: () => void;
    onGoAdmin?: () => void;
}

export function Sidebar({ activeTab, onTabChange, onGoHome, onGoAdmin }: SidebarProps) {
    const scenarioContext = useScenarioOptional();
    const { user, logout } = useAuth();
    const [showLockMessage, setShowLockMessage] = useState(false);

    const workspaceNav = [
        { id: 'setup', label: 'Product Line Setup', icon: Settings },
        { id: 'cogs', label: 'Average COGS', icon: Wallet },
        { id: 'freight', label: 'Freight Quotes', icon: Truck },
        { id: 'pricing', label: 'Pricing & Margins', icon: BarChart3 },
        { id: 'promos', label: 'Promotion Builder', icon: Tags },
        { id: 'slotting', label: 'Slotting (Fixed Costs)', icon: Calculator },
        { id: 'compare', label: 'Scenario Comparison', icon: BarChartHorizontal },
        { id: 'dashboard', label: 'Summary', icon: LayoutDashboard },
    ] as const;

    const globalNav = [
        { id: 'home', label: 'Home (All Products)', icon: Home }
    ];
    if (user?.role === 'super_admin') {
        globalNav.push({ id: 'admin', label: 'ADMIN (Clients)', icon: Users as any });
    }

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo} style={{ padding: '1.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <img src={logo} alt="CPG Margin Minder Logo" className={styles.logoImage} />
            </div>

            <nav className={styles.nav}>
                {globalNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'home' && onGoHome) onGoHome();
                                else if (item.id === 'admin' && onGoAdmin) onGoAdmin();
                                else onTabChange(item.id as TabId);
                            }}
                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''} ${item.id === 'admin' ? styles.navItemAdmin : ''}`}
                            style={item.id === 'home' ? { marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem', fontWeight: 600 } : {}}
                        >
                            <Icon size={20} />
                            {item.label}
                        </button>
                    );
                })}

                {workspaceNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isDisabled = !scenarioContext;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (isDisabled) {
                                    setShowLockMessage(true);
                                    return;
                                }
                                onTabChange(item.id as TabId);
                            }}
                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                            style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed', filter: 'grayscale(100%)' } : {}}
                        >
                            <Icon size={20} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {scenarioContext && (
                <div className={styles.scenarioSection}>
                    <label className={styles.scenarioLabel}>Active Scenario</label>
                    <select
                        className={styles.scenarioSelect}
                        value={scenarioContext.activeScenario.id}
                        onChange={(e) => scenarioContext.switchScenario(e.target.value)}
                    >
                        {scenarioContext.scenarios.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.footerSection}>
                <button className={styles.signOutBtn} onClick={logout}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>

            {showLockMessage && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ marginTop: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Settings size={24} style={{ color: 'var(--color-primary)' }} />
                            Tool Locked
                        </h2>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '1rem 0' }}>
                            Please click the blue <strong>"Manage Products &rarr;"</strong> button on one of the company cards in the center of the screen. Then, click a <strong>Product Card</strong> to enter its workspace and unlock these calculation tools!
                        </p>
                        <button
                            onClick={() => setShowLockMessage(false)}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
