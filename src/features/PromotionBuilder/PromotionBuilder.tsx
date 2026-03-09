import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Slider } from '../../components/ui/Slider';
import { Plus, Trash2, Tag, Copy } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { PromoType, Promotion } from '../../types';
import styles from './PromotionBuilder.module.css';

export function PromotionBuilder() {
    const { activeScenario, updateActiveScenario, results, isPresentationMode } = useScenario();
    const { promotions } = activeScenario;
    const promoOuts = results.promotions;

    const fmtCurrency = (val: number) => `$${val.toFixed(2)}`;

    const addPromotion = () => {
        const newPromo: Promotion = {
            id: uuidv4(),
            name: 'New Promotion',
            retailerName: '',
            type: 'tpr',
            discountValue: 0,
            fixedCosts: 0,
            manufacturerFunding: 100,
            distributorFunding: 0,
            retailerFunding: 0,
            baselineCases: 100,
            liftCases: 50
        };
        updateActiveScenario(prev => ({
            ...prev,
            promotions: [...prev.promotions, newPromo]
        }));
    };

    const clonePromotion = (promo: Promotion) => {
        const clonedPromo: Promotion = {
            ...promo,
            id: uuidv4(),
            name: `${promo.name} (Copy)`
        };
        updateActiveScenario(prev => ({
            ...prev,
            promotions: [...prev.promotions, clonedPromo]
        }));
    };

    const removePromotion = (id: string) => {
        updateActiveScenario(prev => ({
            ...prev,
            promotions: prev.promotions.filter(p => p.id !== id)
        }));
    };

    const updatePromo = (id: string, field: keyof Promotion, value: any) => {
        updateActiveScenario(prev => ({
            ...prev,
            promotions: prev.promotions.map(p =>
                p.id === id ? { ...p, [field]: value } : p
            )
        }));
    };

    const promoTypes: { value: PromoType; label: string }[] = [
        { value: 'percent_invoice', label: '% off Invoice' },
        { value: 'dollar_case', label: '$ off Case' },
        { value: 'scan_allowance', label: 'Scan Allowance ($)' },
        { value: 'tpr', label: 'TPR ($ off Unit)' },
        { value: 'bogo', label: 'Buy X Get Y Free' },
        { value: 'custom', label: 'Custom Flat $' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.overviewCards}>
                <StatCard
                    title="Total Promo Cost / Case"
                    value={fmtCurrency(results.aggregatePostPromo?.promoCostPerCase || 0)}
                    highlight
                />
                {!isPresentationMode ? (
                    <StatCard
                        title="Mfg Funded Total"
                        value={fmtCurrency(results.aggregatePostPromo?.manufacturerNetPromoCostDollars || 0)}
                    />
                ) : (
                    <StatCard
                        title="Mfg Funded Total"
                        value="***"
                        subtitle="Redacted"
                    />
                )}
            </div>

            <div className={styles.headerRow}>
                <div className={styles.headerInfo}>
                    <h2>Trade Promotions</h2>
                    <p>Model the financial impact of distinct trade events.</p>
                </div>
                <button className={styles.addBtn} onClick={addPromotion}>
                    <Plus size={18} /> Add Promotion
                </button>
            </div>

            <div className={styles.promoList}>
                {promotions.length === 0 && (
                    <div className={styles.emptyState}>
                        <Tag size={48} className={styles.emptyIcon} />
                        <p>No active promotions.</p>
                        <p className={styles.emptySub}>Click the button above to add a new promotion block.</p>
                    </div>
                )}

                {promotions.map(promo => {
                    const out = promoOuts[promo.id];
                    if (!out) return null;

                    return (
                        <Card key={promo.id} className={styles.promoCard}>
                            <div className={styles.cardTop}>
                                <div className={styles.leftCol}>
                                    <div className={styles.nameRow}>
                                        <Input
                                            value={promo.name}
                                            onChange={(e) => updatePromo(promo.id, 'name', e.target.value)}
                                            label="Promo Name"
                                            className={styles.nameInput}
                                        />
                                        <Input
                                            value={promo.retailerName || ''}
                                            onChange={(e) => updatePromo(promo.id, 'retailerName', e.target.value)}
                                            label="Retailer Name (Optional)"
                                            className={styles.nameInput}
                                        />
                                    </div>

                                    <div className={styles.typeRow}>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.label}>Type</label>
                                            <select
                                                value={promo.type}
                                                onChange={(e) => updatePromo(promo.id, 'type', e.target.value as PromoType)}
                                                className={styles.select}
                                            >
                                                {promoTypes.map(pt => (
                                                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {promo.type === 'bogo' ? (
                                            <>
                                                <Input
                                                    label="Buy Qty"
                                                    type="number" min={1}
                                                    value={promo.buyX || 1}
                                                    onChange={(e) => updatePromo(promo.id, 'buyX', parseInt(e.target.value) || 1)}
                                                />
                                                <Input
                                                    label="Get Free Qty"
                                                    type="number" min={1}
                                                    value={promo.getY || 1}
                                                    onChange={(e) => updatePromo(promo.id, 'getY', parseInt(e.target.value) || 1)}
                                                />
                                            </>
                                        ) : (
                                            <Input
                                                label="Value ($ or %)"
                                                type="number"
                                                min={0} step="0.01"
                                                value={promo.discountValue || 0}
                                                onChange={(e) => updatePromo(promo.id, 'discountValue', parseFloat(e.target.value) || 0)}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className={styles.rightCol}>
                                    <div className={styles.summaryBlock}>
                                        <p className={styles.summaryTitle}>Promo Impact Per Case</p>
                                        <p className={styles.summaryValue}>{fmtCurrency(out.promoCostPerCase)}</p>
                                        <p className={styles.summarySub}>({fmtCurrency(out.promoCostPerUnit)}/unit)</p>
                                    </div>
                                    <div className={styles.actionButtons}>
                                        <button onClick={() => clonePromotion(promo)} className={styles.actionBtn} title="Clone Promo">
                                            <Copy size={20} />
                                        </button>
                                        <button onClick={() => removePromotion(promo.id)} className={`${styles.actionBtn} ${styles.danger}`} title="Remove Promo">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fundingSplitTitle}>Funding Split (Must sum to 100%)</div>
                            <div className={styles.splitRow}>
                                <div className={styles.sliderBox}>
                                    <Slider
                                        label="Manufacturer"
                                        value={promo.manufacturerFunding}
                                        onChange={(e) => updatePromo(promo.id, 'manufacturerFunding', parseFloat(e.target.value))}
                                        min={0} max={100}
                                        disabled={isPresentationMode}
                                    />
                                    <div className={styles.partyCost}>{isPresentationMode ? '***' : fmtCurrency(out.manufacturerNetPromoCostDollars)}</div>
                                </div>

                                <div className={styles.sliderBox}>
                                    <Slider
                                        label="Distributor"
                                        value={promo.distributorFunding}
                                        onChange={(e) => updatePromo(promo.id, 'distributorFunding', parseFloat(e.target.value))}
                                        min={0} max={100}
                                    />
                                    <div className={styles.partyCost}>{fmtCurrency(out.distributorNetPromoCostDollars)}</div>
                                </div>

                                <div className={styles.sliderBox}>
                                    <Slider
                                        label="Retailer"
                                        value={promo.retailerFunding}
                                        onChange={(e) => updatePromo(promo.id, 'retailerFunding', parseFloat(e.target.value))}
                                        min={0} max={100}
                                    />
                                    <div className={styles.partyCost}>{fmtCurrency(out.retailerNetPromoCostDollars)}</div>
                                </div>
                            </div>

                            <div className={styles.roiSection}>
                                <h4>ROI Calculator</h4>
                                <div className={styles.roiInputs}>
                                    <Input
                                        label="Baseline Volume (Cases)"
                                        type="number" min={0}
                                        value={promo.baselineCases || 0}
                                        onChange={(e) => updatePromo(promo.id, 'baselineCases', parseInt(e.target.value) || 0)}
                                    />
                                    <Input
                                        label="Promotional Lift (Cases)"
                                        type="number" min={0}
                                        value={promo.liftCases || 0}
                                        onChange={(e) => updatePromo(promo.id, 'liftCases', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className={styles.roiGrid}>
                                    {(() => {
                                        const baseCases = promo.baselineCases || 0;
                                        const lift = promo.liftCases || 0;
                                        const totalCases = baseCases + lift;

                                        const calcTierROI = (marginBefore: number, promoCost: number, sellPrice: number) => {
                                            const profitWithoutPromo = baseCases * marginBefore;
                                            const profitWithPromo = (totalCases * (marginBefore - promoCost));
                                            const incrementalProfit = profitWithPromo - profitWithoutPromo;
                                            const isProfitable = incrementalProfit >= 0;

                                            const totalRevenue = totalCases * sellPrice;
                                            const marginPercent = totalRevenue > 0 ? (profitWithPromo / totalRevenue) * 100 : 0;

                                            const totalInvestment = (promoCost * totalCases);
                                            const roiPercent = totalInvestment > 0 ? (incrementalProfit / totalInvestment) * 100 : (incrementalProfit > 0 ? 100 : 0);
                                            return { profitWithPromo, incrementalProfit, isProfitable, roiPercent, marginPercent };
                                        };

                                        const mfg = calcTierROI(results.profitability.manufacturerContributionMarginDollars, out.manufacturerNetPromoCostDollars, results.base.manufacturerSellPriceToDistributor);
                                        const dist = calcTierROI(results.profitability.distributorGrossProfitDollars, out.distributorNetPromoCostDollars, results.base.distributorPriceToRetailer);
                                        const ret = calcTierROI(results.profitability.retailerGrossProfitDollars, out.retailerNetPromoCostDollars, results.base.retailPricePerCase);

                                        const renderROICard = (title: string, data: any) => {
                                            if (isPresentationMode && title === 'Company') {
                                                return (
                                                    <div className={styles.roiResults}>
                                                        <h5>{title}</h5>
                                                        <div className={styles.roiMetrics}>
                                                            <div className={styles.roiMetric}>
                                                                <span>Total Profit</span>
                                                                <strong>***</strong>
                                                            </div>
                                                            <div className={styles.roiMetric}>
                                                                <span>Margin %</span>
                                                                <strong>***</strong>
                                                            </div>
                                                            <div className={styles.roiMetric}>
                                                                <span>Inc. Profit</span>
                                                                <strong>***</strong>
                                                            </div>
                                                            <div className={styles.roiMetric}>
                                                                <span>ROI</span>
                                                                <strong>***</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className={styles.roiResults}>
                                                    <h5>{title}</h5>
                                                    <div className={styles.roiMetrics}>
                                                        <div className={styles.roiMetric}>
                                                            <span>Total Profit</span>
                                                            <strong>
                                                                {fmtCurrency(data.profitWithPromo)}
                                                            </strong>
                                                        </div>
                                                        <div className={styles.roiMetric}>
                                                            <span>Margin %</span>
                                                            <strong>
                                                                {data.marginPercent.toFixed(1)}%
                                                            </strong>
                                                        </div>
                                                        <div className={styles.roiMetric}>
                                                            <span>Inc. Profit</span>
                                                            <strong className={data.incrementalProfit >= 0 ? styles.positiveText : styles.negativeText}>
                                                                {fmtCurrency(data.incrementalProfit)}
                                                            </strong>
                                                        </div>
                                                        <div className={styles.roiMetric}>
                                                            <span>ROI</span>
                                                            <strong className={data.roiPercent >= 0 ? styles.positiveText : styles.negativeText}>
                                                                {data.roiPercent > 0 ? '+' : ''}{data.roiPercent.toFixed(1)}%
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        };

                                        return (
                                            <>
                                                {renderROICard('Company', mfg)}
                                                {renderROICard('Distributor', dist)}
                                                {renderROICard('Retailer', ret)}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {(promo.manufacturerFunding + promo.distributorFunding + promo.retailerFunding !== 100) && (
                                <p className={styles.warning}>Funding split does not equal 100%.</p>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
