import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { calculateEconomics } from '../../engine/calculations';
import { Copy, Plus, Trash2, RotateCcw } from 'lucide-react';
import styles from './ScenarioComparison.module.css';
import { v4 as uuidv4 } from 'uuid';

export function ScenarioComparison() {
    const { scenarios, duplicateScenario, deleteScenario, switchScenario, activeScenario, saveScenario, resetToDefaults, isPresentationMode } = useScenario();

    const fmtCurrency = (val: number) => `$${val.toFixed(2)}`;
    const fmtPct = (val: number) => `${(val * 100).toFixed(1)}%`;

    // We only compare up to 3 scenarios across the grid if there are many, or just show all if < 4.
    const displayScenarios = scenarios.slice(0, 4);

    const handleCreateNew = () => {
        const newId = uuidv4();
        saveScenario({
            ...activeScenario,
            id: newId,
            name: `New Scenario (${scenarios.length + 1})`,
            lastModified: Date.now()
        });
        switchScenario(newId);
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerActions}>
                <div className={styles.info}>
                    <p>Compare key profitability metrics across your saved scenarios side by side. <strong>To edit a scenario's numbers, click its 'Activate' icon and make changes using the tabs on the left.</strong></p>
                </div>
                <div className={styles.actionBtns}>
                    <button className={styles.btnSecondary} onClick={handleCreateNew}>
                        <Copy size={16} /> Duplicate Active
                    </button>
                    <button className={styles.btnDanger} onClick={resetToDefaults}>
                        <RotateCcw size={16} /> Reset All
                    </button>
                </div>
            </div>

            <div className={styles.comparisonGrid}>
                {/* Row Headers */}
                <div className={styles.metricCol}>
                    <div className={styles.headerCell}>Metrics</div>
                    <div className={styles.sectionTitle}>Product Economics</div>
                    <div className={styles.cell}>Manufacturer SRP</div>
                    <div className={styles.cell}>Avg COGS / Case</div>

                    <div className={styles.sectionTitle}>Margins (%)</div>
                    <div className={styles.cell}>Mfg Gross Margin %</div>
                    <div className={styles.cell}>Distributor Margin %</div>
                    <div className={styles.cell}>Retailer Margin %</div>

                    <div className={styles.sectionTitle}>Profitability ($ / Case)</div>
                    <div className={styles.cell}>Mfg Gross Profit</div>
                    <div className={styles.cell}>Trade/Promo Expense</div>
                    <div className={styles.cellRowHighlight}>Contribution Margin</div>
                </div>

                {/* Data Columns */}
                {displayScenarios.map(scen => {
                    const res = calculateEconomics(scen);
                    const isActive = scen.id === activeScenario.id;

                    return (
                        <div key={scen.id} className={isActive ? styles.dataColActive : styles.dataCol}>
                            <div className={styles.headerCell}>
                                <div className={styles.scenName} title={scen.name}>{scen.name}</div>
                                <div className={styles.scenActions}>
                                    {!isActive && (
                                        <button onClick={() => switchScenario(scen.id)} className={styles.iconBtn} title="Activate">
                                            <span className={styles.activateText}>Activate</span>
                                        </button>
                                    )}
                                    <button onClick={() => duplicateScenario(scen.id)} className={styles.iconBtn} title="Duplicate">
                                        <Copy size={16} />
                                    </button>
                                    <button onClick={() => deleteScenario(scen.id)} className={styles.iconBtnDel} title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.sectionPlaceholder} />
                            <div className={styles.cell}>{fmtCurrency(res.base.suggestedRetailPricePerUnit)}</div>
                            <div className={styles.cell}>{isPresentationMode ? '***' : fmtCurrency(res.base.cogsPerCase)}</div>

                            <div className={styles.sectionPlaceholder} />
                            <div className={styles.cell}>{isPresentationMode ? '***' : fmtPct(res.profitability.manufacturerGrossMarginPercent)}</div>
                            <div className={styles.cell}>{fmtPct(res.profitability.distributorMarginPercent)}</div>
                            <div className={styles.cell}>{fmtPct(res.profitability.retailerMarginPercent)}</div>

                            <div className={styles.sectionPlaceholder} />
                            <div className={styles.cell}>{isPresentationMode ? '***' : fmtCurrency(res.profitability.manufacturerGrossProfitDollars)}</div>
                            <div className={styles.cell}>{fmtCurrency(res.aggregatePostPromo?.promoCostPerCase || 0)}</div>
                            <div className={styles.cellContentHighlight}>
                                {isPresentationMode ? '***' : fmtCurrency(res.profitability.manufacturerContributionMarginDollars)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
