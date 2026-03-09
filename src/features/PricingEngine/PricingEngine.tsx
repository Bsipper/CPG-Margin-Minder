import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Slider } from '../../components/ui/Slider';
import { Input } from '../../components/ui/Input';
import { AIChatBox } from './AIChatBox';
import { Info, Lock } from 'lucide-react';
import styles from './PricingEngine.module.css';
import { Margins } from '../../types';

function FlexibleMarginInput({
    label,
    marginPct,
    cogsOrBuyPrice,
    profitDollars,
    onChangePct,
    warningText,
    maxPct = 99
}: {
    label: string;
    marginPct: number;
    cogsOrBuyPrice: number;
    profitDollars: number;
    onChangePct: (pct: number) => void;
    warningText?: string;
    maxPct?: number;
}) {
    const [mode, setMode] = React.useState<'pct' | 'dollar'>('pct');

    const handleDollarChange = (valStr: string) => {
        const d = parseFloat(valStr) || 0;
        const sellPrice = cogsOrBuyPrice + d;
        const pct = sellPrice > 0 ? (d / sellPrice) * 100 : 0;
        onChangePct(pct);
    };

    return (
        <div className={styles.flexibleInputWrapper}>
            <div className={styles.flexHeader}>
                <span className={styles.flexibleLabel}>{label}</span>
                <div className={styles.modeToggle}>
                    <button
                        className={mode === 'pct' ? styles.toggleActive : styles.toggleInactive}
                        onClick={() => setMode('pct')}
                        title="Set Margin Percentage"
                    >%</button>
                    <button
                        className={mode === 'dollar' ? styles.toggleActive : styles.toggleInactive}
                        onClick={() => setMode('dollar')}
                        title="Set Target Profit $"
                    >$</button>
                </div>
            </div>

            {mode === 'pct' ? (
                <div className={styles.modeArea}>
                    <Slider
                        label=""
                        value={marginPct}
                        onChange={(e) => onChangePct(parseFloat(e.target.value) || 0)}
                        min={0} max={maxPct}
                        warningText={warningText}
                    />
                </div>
            ) : (
                <div className={styles.modeAreaDollar}>
                    <Input
                        type="number"
                        min={0}
                        step="0.01"
                        prefix="$"
                        value={profitDollars ? profitDollars.toFixed(2) : ''}
                        onChange={(e) => handleDollarChange(e.target.value)}
                        helperText={warningText}
                        fullWidth
                    />
                </div>
            )}
        </div>
    );
}

export function PricingEngine() {
    const { activeScenario, updateActiveScenario, results, isPresentationMode } = useScenario();
    const { margins } = activeScenario;
    const b = results.base;
    const p = results.profitability;

    const updateMargin = (field: keyof Margins, val: number) => {
        updateActiveScenario(prev => ({
            ...prev,
            margins: { ...prev.margins, [field]: val }
        }));
    };

    const fmtCurrency = (val: number) => `$${val.toFixed(2)}`;

    return (
        <div className={styles.container}>
            <Card className={styles.mainCard}>
                <CardHeader
                    title="Margin & Pricing Engine"
                    subtitle="Adjust player margins to see real-time price changes."
                />

                <div className={styles.waterfallView}>

                    {/* Manufacturer Node - Hidden in Presentation Mode */}
                    {!isPresentationMode ? (
                        <div className={styles.tierNode}>
                            <div className={styles.tierLabel}>Manufacturer (You)</div>
                            <FlexibleMarginInput
                                label="Target Gross Margin"
                                marginPct={margins.targetManufacturerMargin}
                                profitDollars={p.manufacturerGrossProfitDollars}
                                cogsOrBuyPrice={b.cogsPerCase}
                                onChangePct={(pct) => updateMargin('targetManufacturerMargin', pct)}
                                warningText={margins.targetManufacturerMargin < 30 ? "Investors usually look for > 40% gross margin." : undefined}
                            />
                            <div className={styles.tierResult}>
                                <span>Wholesale Price:</span>
                                <strong>{fmtCurrency(b.manufacturerSellPriceToDistributor)}</strong>
                            </div>
                            <div className={styles.tooltipRule}>
                                <Info size={14} />
                                <span>Formula: Avg COGS / (1 - Margin%)</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.tierNode}>
                            <div className={styles.tierLabel}>Starting Wholesale</div>
                            <div className={styles.presentationHiddenBox}>
                                <Lock size={16} />
                                <span>Manufacturer Margin Hidden</span>
                            </div>
                            <div className={styles.tierResult} style={{ marginTop: 'auto' }}>
                                <span>Wholesale Price:</span>
                                <strong>{fmtCurrency(b.manufacturerSellPriceToDistributor)}</strong>
                            </div>
                        </div>
                    )}

                    <div className={styles.connector}>→</div>

                    <div className={styles.tierNode}>
                        <div className={styles.tierLabel}>Distributor</div>
                        <FlexibleMarginInput
                            label="Distributor Margin"
                            marginPct={margins.distributorMargin}
                            profitDollars={p.distributorGrossProfitDollars}
                            cogsOrBuyPrice={b.manufacturerSellPriceToDistributor}
                            onChangePct={(pct) => updateMargin('distributorMargin', pct)}
                            warningText={margins.distributorMargin < 20 ? "Distributors rarely accept < 20% margin." : undefined}
                            maxPct={50}
                        />
                        <div className={styles.tierResult}>
                            <span>Price to Retail:</span>
                            <strong>{fmtCurrency(b.distributorPriceToRetailer)}</strong>
                        </div>
                    </div>

                    <div className={styles.connector}>→</div>

                    <div className={styles.tierNode}>
                        <div className={styles.tierLabel}>Retailer</div>
                        <FlexibleMarginInput
                            label="Retailer Margin"
                            marginPct={margins.retailerMargin}
                            profitDollars={p.retailerGrossProfitDollars}
                            cogsOrBuyPrice={b.distributorPriceToRetailer}
                            onChangePct={(pct) => updateMargin('retailerMargin', pct)}
                            warningText={margins.retailerMargin < 30 ? "Retailers typically demand 35-50% margin." : undefined}
                            maxPct={70}
                        />
                        <div className={styles.tierResult}>
                            <span>Shelf SRP / Case:</span>
                            <strong>{fmtCurrency(b.retailPricePerCase)}</strong>
                        </div>
                    </div>
                </div>
            </Card>

            <div className={styles.bottomGrid}>
                <div className={styles.leftCol}>
                    <Card>
                        <CardHeader title="Deductions & Trade" subtitle="% of Manufacturer Wholesale Price" />
                        <div className={styles.slidersList}>
                            <Slider
                                label={`Freight Allowance ${!isPresentationMode ? `($${(b.manufacturerSellPriceToDistributor * (margins.freightAllowance / 100)).toFixed(2)}/case)` : ''}`}
                                value={margins.freightAllowance}
                                onChange={(e) => updateMargin('freightAllowance', parseFloat(e.target.value) || 0)}
                                min={0} max={20}
                            />
                            <Slider
                                label={`Everyday Trade Spend ${!isPresentationMode ? `($${(b.manufacturerSellPriceToDistributor * (margins.tradeSpend / 100)).toFixed(2)}/case)` : ''}`}
                                value={margins.tradeSpend}
                                onChange={(e) => updateMargin('tradeSpend', parseFloat(e.target.value) || 0)}
                                min={0} max={30}
                                warningText={p.manufacturerContributionMarginPercent < 0 ? "Your trade spend is pushing contribution margin negative!" : undefined}
                            />
                            <Slider
                                label={`Broker / Dist Fee ${!isPresentationMode ? `($${(b.manufacturerSellPriceToDistributor * (margins.brokerFee / 100)).toFixed(2)}/case)` : ''}`}
                                value={margins.brokerFee}
                                onChange={(e) => updateMargin('brokerFee', parseFloat(e.target.value) || 0)}
                                min={0} max={15}
                            />

                            {!isPresentationMode && (
                                <div className={styles.totalDeductions}>
                                    <span>Total Deductions</span>
                                    <strong>
                                        {fmtCurrency(b.manufacturerSellPriceToDistributor * ((margins.freightAllowance + margins.tradeSpend + margins.brokerFee) / 100))}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className={styles.liveResults}>
                        <StatCard
                            highlight
                            title="Final SRP (Per Unit)"
                            value={fmtCurrency(b.suggestedRetailPricePerUnit)}
                        />

                        {/* Hide actual profit data in presentation mode */}
                        {!isPresentationMode ? (
                            <>
                                <StatCard
                                    title="Mfg Gross Margin"
                                    value={`${(p.manufacturerGrossMarginPercent * 100).toFixed(1)}%`}
                                    subtitle={`$${p.manufacturerGrossProfitDollars.toFixed(2)}/case`}
                                />
                                <StatCard
                                    title="Mfg Contribution Margin"
                                    value={`${(p.manufacturerContributionMarginPercent * 100).toFixed(1)}%`}
                                    subtitle={`After Trade & Freights ($${p.manufacturerContributionMarginDollars.toFixed(2)}/case)`}
                                />
                            </>
                        ) : (
                            <StatCard
                                title="Mfg Gross Margin"
                                value="***"
                                subtitle="Redacted in Presentation Mode"
                            />
                        )}
                    </div>
                </div>

                <div className={styles.rightCol}>
                    <AIChatBox />
                </div>
            </div>
        </div>
    );
}
