import React, { useState } from 'react';
import type { TabId } from './Sidebar';
import { Sidebar } from './Sidebar';
import styles from './MainLayout.module.css';
import { useScenario } from '../../context/ScenarioContext';
import { useAuth } from '../../context/AuthContext';

import { Dashboard } from '../../features/Dashboard/Dashboard';
import { ProductSetup } from '../../features/ProductSetup/ProductSetup';
import { COGSBuilder } from '../../features/COGSBuilder/COGSBuilder';
import { FreightEngine } from '../../features/FreightEngine/FreightEngine';
import { PricingEngine } from '../../features/PricingEngine/PricingEngine';
import { PromotionBuilder } from '../../features/PromotionBuilder/PromotionBuilder';
import { SlottingFees } from '../../features/SlottingFees/SlottingFees';
import { ScenarioComparison } from '../../features/ScenarioComparison/ScenarioComparison';
import { SuperAdminDashboard } from '../../features/SuperAdmin/SuperAdminDashboard';

import { Download, LayoutTemplate, ArrowLeft } from 'lucide-react';
import { exportScenarioToPDF, exportScenarioToCSV } from '../../utils/exportUtils';

export function MainLayout({ onBackToProducts, onGoToAdmin }: { onBackToProducts: () => void, onGoToAdmin?: () => void }) {
    const [activeTab, setActiveTab] = useState<TabId>('setup');
    const { activeScenario, isPresentationMode } = useScenario();
    const { user } = useAuth();

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'setup': return <ProductSetup />;
            case 'cogs': return <COGSBuilder />;
            case 'freight': return <FreightEngine />;
            case 'pricing': return <PricingEngine />;
            case 'promos': return <PromotionBuilder />;
            case 'slotting': return <SlottingFees />;
            case 'compare': return <ScenarioComparison />;
            case 'admin':
                if (user?.role === 'super_admin') {
                    // For now, onSelectCompany can just switch context or do nothing since we are inside it
                    return <SuperAdminDashboard onSelectCompany={() => { }} />;
                }
                return <Dashboard />;
            default: return <Dashboard />;
        }
    };

    const getTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Summary Dashboard';
            case 'setup': return 'Product Line Setup';
            case 'cogs': return 'Average COGS';
            case 'freight': return 'Freight Quotes Calculator';
            case 'pricing': return 'Pricing & Margins';
            case 'promos': return 'Promotion Builder';
            case 'slotting': return 'Slotting Fees & Break-Even ROI';
            case 'compare': return 'Scenario Comparison';
            case 'admin': return 'System Administration';
            default: return 'CPG Margin Minder';
        }
    };

    return (
        <div className={styles.layout}>
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onGoHome={onBackToProducts} onGoAdmin={onGoToAdmin} />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--color-primary)' }}>{activeScenario.product.name}</span>
                            <span>&bull;</span>
                            <span>{activeScenario.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 className={styles.title}>{getTitle()}</h1>
                            {isPresentationMode && (
                                <span className={styles.presentationBadge}>Restricted Analytics View</span>
                            )}
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button
                            className={styles.exportBtn}
                            onClick={() => exportScenarioToCSV(activeScenario)}
                            title="Export to CSV"
                        >
                            <Download size={16} /> CSV
                        </button>
                        <button
                            className={styles.exportBtnPrimary}
                            onClick={() => exportScenarioToPDF(activeScenario)}
                            title="Export Report to PDF"
                        >
                            <Download size={16} /> PDF
                        </button>
                    </div>
                </header>

                <div className={styles.scrollArea}>
                    <div className="container">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
}
