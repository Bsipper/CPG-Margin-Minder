import React from 'react';
import { LayoutDashboard, Settings, Wallet, BarChart3, Tags, BarChartHorizontal, Calculator, FileSpreadsheet, LogOut, Users } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useScenario } from '../../context/ScenarioContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

export type TabId = 'dashboard' | 'setup' | 'cogs' | 'pricing' | 'promos' | 'slotting' | 'compare' | 'admin';

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const { scenarios, activeScenario, switchScenario } = useScenario();
    const { user, logout } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Summary', icon: LayoutDashboard },
        { id: 'setup', label: 'Product Line Setup', icon: Settings },
        { id: 'cogs', label: 'Average COGS', icon: Wallet },
        { id: 'pricing', label: 'Pricing & Margins', icon: BarChart3 },
        { id: 'promos', label: 'Promotion Builder', icon: Tags },
        { id: 'slotting', label: 'Slotting (Fixed Costs)', icon: Calculator },
        { id: 'compare', label: 'Scenario Comparison', icon: BarChartHorizontal },
    ] as const;

    // Conditionally add the ADMIN tab if the user is a super admin
    const navToRender = user?.role === 'super_admin'
        ? [...navItems, { id: 'admin', label: 'ADMIN', icon: Users as any }]
        : navItems;

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo} style={{ padding: '1.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <img src={logo} alt="CPG Margin Minder Logo" className={styles.logoImage} />
            </div>

            <nav className={styles.nav}>
                {navToRender.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id as TabId)}
                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''} ${item.id === 'admin' ? styles.navItemAdmin : ''}`}
                        >
                            <Icon size={20} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className={styles.scenarioSection}>
                <label className={styles.scenarioLabel}>Active Scenario</label>
                <select
                    className={styles.scenarioSelect}
                    value={activeScenario.id}
                    onChange={(e) => switchScenario(e.target.value)}
                >
                    {scenarios.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.footerSection}>
                <button className={styles.signOutBtn} onClick={logout}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
