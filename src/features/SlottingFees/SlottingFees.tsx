import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';
import styles from './SlottingFees.module.css';
import { v4 as uuidv4 } from 'uuid';
import { SlottingFee } from '../../types';

export function SlottingFees() {
    const { activeScenario, updateActiveScenario, results } = useScenario();
    const { slottingFees } = activeScenario;

    const addFee = () => {
        updateActiveScenario(prev => ({
            ...prev,
            slottingFees: [...(prev.slottingFees || []), { id: uuidv4(), description: 'New Fee', totalAmount: 5000 }]
        }));
    };

    const updateFee = (id: string, field: keyof SlottingFee, value: string | number) => {
        updateActiveScenario(prev => ({
            ...prev,
            slottingFees: (prev.slottingFees || []).map(f => f.id === id ? { ...f, [field]: value } : f)
        }));
    };

    const deleteFee = (id: string) => {
        updateActiveScenario(prev => ({
            ...prev,
            slottingFees: (prev.slottingFees || []).filter(f => f.id !== id)
        }));
    };

    const mfgWholesalePrice = results?.base?.manufacturerSellPriceToDistributor || 0;
    const distPriceToRetailer = results?.base?.distributorPriceToRetailer || 0;
    const cogsPerCase = results?.base?.cogsPerCase || 0;

    const calculateFeeTotal = (fee: any) => {
        const flat = fee.totalAmount || 0;
        const numSkus = fee.numberOfSkus || 1; // Default to 1 to prevent multiplying by 0 incorrectly if undefined
        // Priority D: Free fill valuation should use COGS, not retail/distributor price
        const freeCasesCost = numSkus * (fee.freeCasesPerStore || 0) * (fee.numberOfStores || 0) * cogsPerCase;
        return flat + freeCasesCost;
    };

    const feesArray = slottingFees || [];
    const totalSlottingFees = feesArray.reduce((sum, f) => sum + calculateFeeTotal(f), 0);
    const mfgContributionMargin = results?.profitability?.manufacturerContributionMarginDollars || 0;

    // Break-even cases
    const breakEvenCases = mfgContributionMargin > 0 ? Math.ceil(totalSlottingFees / mfgContributionMargin) : 0;
    const breakEvenUnits = breakEvenCases * (activeScenario.product.casePack || 1);

    const fmtCurrency = (val: number) => `$${val.toFixed(2)}`;

    return (
        <div className={styles.container}>
            <Card>
                <CardHeader
                    title="Slotting Fees & Retail Allowances"
                    subtitle="Calculate the break-even ROI on fixed fees required to get your product on shelf."
                />

                <div className={styles.feesList}>
                    {feesArray.length === 0 ? (
                        <p className={styles.emptyText}>No slotting fees added yet.</p>
                    ) : (
                        feesArray.map(fee => (
                            <div key={fee.id} className={styles.feeCard}>
                                <div className={styles.feeHeader}>
                                    <div className={styles.inputGroupTop}>
                                        <Input
                                            label="Retailer Name"
                                            value={fee.retailerName || ''}
                                            onChange={e => updateFee(fee.id, 'retailerName', e.target.value)}
                                            placeholder="e.g. Whole Foods"
                                        />
                                        <Input
                                            label="Fee Description"
                                            value={fee.description}
                                            onChange={e => updateFee(fee.id, 'description', e.target.value)}
                                            placeholder="e.g. Free Fill, Shelf Slotting"
                                        />
                                    </div>
                                    <button className={styles.deleteBtn} onClick={() => deleteFee(fee.id)} title="Remove Fee">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className={styles.feeDetails}>
                                    <div className={styles.feeDetailCol}>
                                        <h4>Flat Fees</h4>
                                        <Input
                                            label="Flat Slotting Amount"
                                            type="number"
                                            min={0}
                                            step="100"
                                            prefix="$"
                                            value={fee.totalAmount || ''}
                                            onChange={e => updateFee(fee.id, 'totalAmount', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className={styles.feeDivider} />
                                    <div className={styles.feeDetailCol}>
                                        <h4>Free Cases (Free Fill)</h4>
                                        <div className={styles.freeFillInputs} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr)', gap: '0.5rem', alignItems: 'center' }}>
                                            <Input
                                                label="# of SKUs"
                                                type="number"
                                                min={1}
                                                value={fee.numberOfSkus || ''}
                                                onChange={e => updateFee(fee.id, 'numberOfSkus', Math.max(1, parseFloat(e.target.value) || 1))}
                                            />
                                            <div className={styles.mathSymbol} style={{ paddingTop: '1.25rem', textAlign: 'center' }}>&times;</div>
                                            <Input
                                                label="Cases/Store"
                                                type="number"
                                                min={0}
                                                value={fee.freeCasesPerStore || ''}
                                                onChange={e => updateFee(fee.id, 'freeCasesPerStore', parseFloat(e.target.value) || 0)}
                                            />
                                            <div className={styles.mathSymbol} style={{ paddingTop: '1.25rem', textAlign: 'center' }}>&times;</div>
                                            <Input
                                                label="# of Stores"
                                                type="number"
                                                min={0}
                                                value={fee.numberOfStores || ''}
                                                onChange={e => updateFee(fee.id, 'numberOfStores', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className={styles.freeFillCosts} style={{ marginTop: '1rem', background: 'var(--color-surface-base)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Cost Per Store:</span>
                                            <strong style={{ color: 'var(--color-text-main)', fontSize: '1.125rem' }}>
                                                {fmtCurrency((fee.numberOfSkus || 1) * (fee.freeCasesPerStore || 0) * cogsPerCase)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.feeDivider} style={{ width: '100%', height: '1px', margin: 'var(--space-2) 0' }} />

                                <div className={styles.feeROISection}>
                                    <div className={styles.feeDetailCol} style={{ flex: 1 }}>
                                        <h4>ROI Calculation</h4>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <Input
                                                label="Projected Annual Volume (Cases)"
                                                type="number"
                                                min={0}
                                                value={fee.projectedVolume || ''}
                                                onChange={e => updateFee(fee.id, 'projectedVolume', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.feeDetailCol} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                        {(() => {
                                            const feeTotal = calculateFeeTotal(fee);
                                            const volume = fee.projectedVolume || 0;
                                            const expectedProfitFromVolume = volume * mfgContributionMargin;

                                            // Net Profit from the slotting investment specifically
                                            const netProfit = expectedProfitFromVolume - feeTotal;

                                            // ROI: If no fee is paid, there's no "investment" return, it's just organic profit.
                                            let roiPercent = 0;
                                            if (feeTotal > 0) {
                                                roiPercent = (netProfit / feeTotal) * 100;
                                            } else if (volume > 0 && feeTotal === 0) {
                                                // If there's volume and zero fee, ROI is technically infinite, but we'll show 0% or N/A
                                                // Let's keep it at 0 to avoid +100% confusion when no money was actually spent.
                                                roiPercent = 0;
                                            }

                                            const isProfitable = netProfit >= 0;

                                            return (
                                                <div className={styles.feeROIKPIs} style={{ display: 'flex', gap: '1rem', background: 'var(--color-surface-base)', padding: '1rem', borderRadius: '0.5rem' }}>
                                                    <div className={styles.roiMetric} style={{ flex: 1 }}>
                                                        <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Net Profit</span>
                                                        <strong style={{ fontSize: '1.25rem', color: isProfitable ? 'var(--color-emerald)' : 'var(--color-red)' }}>
                                                            {fmtCurrency(netProfit)}
                                                        </strong>
                                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                                            ({fmtCurrency(expectedProfitFromVolume)} sales profit &minus; {fmtCurrency(feeTotal)} cost)
                                                        </span>
                                                    </div>
                                                    <div className={styles.roiMetric} style={{ flex: 1 }}>
                                                        <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>ROI</span>
                                                        <strong style={{ fontSize: '1.25rem', color: isProfitable && roiPercent !== 0 ? 'var(--color-emerald)' : (roiPercent === 0 ? 'var(--color-text-main)' : 'var(--color-red)') }}>
                                                            {feeTotal === 0 ? 'N/A' : `${roiPercent > 0 ? '+' : ''}${roiPercent.toFixed(1)}%`}
                                                        </strong>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className={styles.feeCardTotal}>
                                    Total Cost to Manufacturer: <span>{fmtCurrency(calculateFeeTotal(fee))}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.actions}>
                    <button className={styles.addBtn} onClick={addFee}>
                        <Plus size={16} /> Add Slotting Fee
                    </button>
                </div>
            </Card>

            <Card className={styles.summaryCard}>
                <CardHeader title="Break-Even Analysis" subtitle="How many cases/units you need to sell to recoup the fixed cost." />

                <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Total Fixed Promos / Slotting</span>
                        <span className={styles.valueHighlight}>{fmtCurrency(totalSlottingFees)}</span>
                    </div>

                    <div className={styles.summaryItem}>
                        <span className={styles.label}>Contribution Margin (per case)</span>
                        <span className={styles.value}>{fmtCurrency(mfgContributionMargin)}</span>
                    </div>

                    <div className={styles.connector}>&divide;</div>

                    <div className={styles.summaryBlock}>
                        <h3>Required Sales to Break Even</h3>
                        {mfgContributionMargin <= 0 ? (
                            <p className={styles.errorText}>Your contribution margin is zero or negative. You can never break even on slotting fees until your unit economics are profitable.</p>
                        ) : (
                            <div className={styles.breakEvenResults}>
                                <div className={styles.resultItem}>
                                    <span className={styles.bigNumber}>{breakEvenCases.toLocaleString()}</span>
                                    <span className={styles.resultLabel}>Cases</span>
                                </div>
                                <div className={styles.resultItem}>
                                    <span className={styles.bigNumber}>{breakEvenUnits.toLocaleString()}</span>
                                    <span className={styles.resultLabel}>Units</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
