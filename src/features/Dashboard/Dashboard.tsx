import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { StatCard, Card, CardHeader } from '../../components/ui/Card';
import styles from './Dashboard.module.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

// Formatters
const fmtCurrency = (val: number) => `$${val.toFixed(2)}`;
const fmtPct = (val: number) => `${(val * 100).toFixed(1)}%`;

export function Dashboard() {
    const { results, activeScenario, isPresentationMode } = useScenario();

    const b = results.base;
    const p = results.profitability;
    const agg = results.aggregatePostPromo;
    const margins = activeScenario.margins;

    // Calculate deductions in dollars
    const mfgPriceToDist = b.manufacturerSellPriceToDistributor;
    const freightCost = mfgPriceToDist * ((margins.freightAllowance || 0) / 100);
    const tradeSpendCost = mfgPriceToDist * ((margins.tradeSpend || 0) / 100);
    const variableSellingExp = mfgPriceToDist * ((margins.variableSellingExpense || 0) / 100);
    const brokerFee = mfgPriceToDist * ((margins.brokerFee || 0) / 100);

    // Trade Investment Calculations (Slotting + Promos)
    const mfgWholesalePrice = b.manufacturerSellPriceToDistributor;
    const distPriceToRetailer = b.distributorPriceToRetailer;

    const calculateFeeTotal = (fee: any) => {
        const flat = fee.totalAmount || 0;
        const numSkus = fee.numberOfSkus || 1;
        const freeCasesCost = numSkus * (fee.freeCasesPerStore || 0) * (fee.numberOfStores || 0) * distPriceToRetailer;
        return flat + freeCasesCost;
    };
    const totalSlottingDollars = (activeScenario.slottingFees || []).reduce((sum, f) => sum + calculateFeeTotal(f), 0);

    let totalPromoDollars = 0;
    let totalPromoVolume = 0;
    activeScenario.promotions.forEach(promo => {
        const out = results.promotions[promo.id];
        if (out) {
            const volume = (promo.baselineCases || 0) + (promo.liftCases || 0);
            totalPromoVolume += volume;
            totalPromoDollars += (out.manufacturerNetPromoCostDollars * volume) + (promo.fixedCosts || 0);
        }
    });

    const grandTotalInvestment = totalSlottingDollars + totalPromoDollars;
    
    // Priority A: Use projected annual volume from Slotting Fees as the primary denominator
    const totalProjectedVolume = (activeScenario.slottingFees || []).reduce((sum, f) => sum + (f.projectedVolume || 0), 0);
    const volumeForInvestment = totalProjectedVolume > 0 ? totalProjectedVolume : totalPromoVolume;
    
    const averageInvestmentPerCase = volumeForInvestment > 0 ? (grandTotalInvestment / volumeForInvestment) : 0;
    const totalGrossRevenue = volumeForInvestment * mfgWholesalePrice;
    const investmentPercentOfRevenue = totalGrossRevenue > 0 ? (grandTotalInvestment / totalGrossRevenue) : 0;

    const marginSplitData = [
        { name: 'Freight', value: Number(freightCost.toFixed(2)), fill: '#ef4444' },
        { name: 'Trade Spend', value: Number(tradeSpendCost.toFixed(2)), fill: '#f97316' },
        { name: 'Variable Exp', value: Number(variableSellingExp.toFixed(2)), fill: '#eab308' },
        { name: 'Broker Fee', value: Number(brokerFee.toFixed(2)), fill: '#8b5cf6' },
        { name: 'Mfg Profit', value: Number(p.manufacturerContributionMarginDollars.toFixed(2)), fill: 'var(--color-primary)' },
        { name: 'Dist Profit', value: Number(p.distributorGrossProfitDollars.toFixed(2)), fill: 'var(--color-emerald)' },
        { name: 'Retail Profit', value: Number(p.retailerGrossProfitDollars.toFixed(2)), fill: 'var(--color-amber)' }
    ].filter(d => d.value > 0);

    // Remove COGS and Mfg Profit if presentation mode is on
    const filteredMarginSplitData = isPresentationMode
        ? marginSplitData.filter(d => d.name === 'Dist Profit' || d.name === 'Retail Profit')
        : marginSplitData;

    const COLORS = ['#94A3B8', '#ef4444', '#f97316', '#eab308', '#8b5cf6', '#4F46E5', '#10B981', '#F59E0B'];

    // Promo Funding Split Data for Pie Chart
    const hasPromo = agg && agg.promoCostPerCase > 0;
    const promoSplitData = hasPromo ? [
        { name: 'Mfg Funded', value: Number(agg.manufacturerNetPromoCostDollars.toFixed(2)) },
        { name: 'Dist Funded', value: Number(agg.distributorNetPromoCostDollars.toFixed(2)) },
        { name: 'Retailer Funded', value: Number(agg.retailerNetPromoCostDollars.toFixed(2)) },
    ].filter(d => d.value > 0) : [];

    const PROMO_COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

    return (
        <div className={styles.dashboard}>
            <header className={styles.scenarioHeader}>
                <h2>{activeScenario.product.name}</h2>
                <p className={styles.skuBadge}>SKU: {activeScenario.product.sku} | Case Pack: {activeScenario.product.casePack}</p>
            </header>

            <section className={styles.kpiGrid}>
                <StatCard
                    title="Average COGS (Per Unit)"
                    value={fmtCurrency(b.cogsPerUnit)}
                    subtitle={`${fmtCurrency(b.cogsPerCase)} per case`}
                />
                <StatCard
                    title="Mfg Price to Dist (Per Case)"
                    value={fmtCurrency(b.manufacturerSellPriceToDistributor)}
                    subtitle={fmtCurrency(b.manufacturerSellPriceToDistributor / activeScenario.product.casePack) + ' per unit'}
                />
                <StatCard
                    title="Dist Price to Retail (Per Case)"
                    value={fmtCurrency(b.distributorPriceToRetailer)}
                    subtitle={fmtCurrency(b.distributorPriceToRetailer / activeScenario.product.casePack) + ' per unit'}
                />
                <StatCard
                    highlight
                    title="SRP (Suggested Retail Price)"
                    value={fmtCurrency(b.suggestedRetailPricePerUnit)}
                    subtitle={`${fmtPct(p.retailerMarginPercent)} Retailer Margin`}
                />
            </section>

            <section className={styles.kpiGridAlt}>
                {!isPresentationMode ? (
                    <StatCard
                        title="Mfg Gross Margin"
                        value={`${(p.manufacturerGrossMarginPercent * 100).toFixed(1)}%`}
                        subtitle={`$${p.manufacturerGrossProfitDollars.toFixed(2)} / case`}
                        trend={p.manufacturerGrossMarginPercent < 0 ? 'down' : 'up'}
                    />
                ) : (
                    <StatCard
                        title="Mfg Gross Margin"
                        value="***"
                        subtitle="Redacted (Presentation Mode)"
                    />
                )}
                <StatCard
                    title="Mfg Contribution Margin"
                    value={fmtPct(p.manufacturerContributionMarginPercent)}
                    subtitle={`${fmtCurrency(p.manufacturerContributionMarginDollars)} per case`}
                    trend={p.manufacturerContributionMarginPercent < 0 ? 'down' : 'up'}
                />
                {hasPromo && (
                    <StatCard
                        title="Total Promo Cost (Per Case)"
                        value={fmtCurrency(agg.promoCostPerCase)}
                        subtitle="Across all active promos"
                        trend="down"
                    />
                )}
            </section>

            <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontSize: '1.25rem' }}>
                    Grand Total Investment (Slotting + Promos)
                </h3>
                <section className={styles.kpiGrid}>
                    <StatCard
                        title="Total Dollar Impact"
                        value={isPresentationMode ? '***' : fmtCurrency(grandTotalInvestment)}
                        subtitle={isPresentationMode ? 'Redacted' : `Slotting: ${fmtCurrency(totalSlottingDollars)} | Promos: ${fmtCurrency(totalPromoDollars)}`}
                    />
                    <StatCard
                        title="% of Projected Revenue"
                        value={isPresentationMode ? '***' : fmtPct(investmentPercentOfRevenue)}
                        subtitle={`Based on projected promo volume`}
                        trend={investmentPercentOfRevenue > 0.3 ? 'down' : 'up'}
                    />
                    <StatCard
                        title="Average Cost Per Case"
                        value={isPresentationMode ? '***' : fmtCurrency(averageInvestmentPerCase)}
                        subtitle={isPresentationMode ? 'Redacted' : 'Blended cost over projected volume'}
                        highlight
                    />
                </section>
            </div>

            <div className={styles.chartsGrid}>
                <Card className={styles.chartCard}>
                    <CardHeader title="Per-Case Value Chain Split" subtitle={isPresentationMode ? "Visualizing Distributor & Retailer share" : "Where every dollar goes per case"} />
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filteredMarginSplitData} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                                <XAxis type="number" tickFormatter={(val) => `$${val}`} />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip formatter={(val: any) => `$${Number(val).toFixed(2)}`} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                                    {filteredMarginSplitData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {hasPromo && (
                    <Card className={styles.chartCard}>
                        <CardHeader title="Promo Funding Split" subtitle="Who pays for the discounts" />
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart margin={{ top: 20, right: 80, left: 80, bottom: 20 }}>
                                    <Pie
                                        data={promoSplitData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={(entry: any) => `${entry.name}: ${fmtCurrency(entry.value)}`}
                                    >
                                        {promoSplitData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PROMO_COLORS[index % PROMO_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => fmtCurrency(Number(v))} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
