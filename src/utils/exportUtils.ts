import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Scenario, CalculationResult } from '../types';
import { calculateEconomics } from '../engine/calculations';

const fmtCurrency = (val: number) => `$${val.toFixed(2)}`;
const fmtPct = (val: number) => `${(val * 100).toFixed(1)}%`;

export function exportScenarioToPDF(scenario: Scenario) {
    const res = calculateEconomics(scenario);
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`Margin Minder Report: ${scenario.product.name}`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`SKU: ${scenario.product.sku} | Case Pack: ${scenario.product.casePack}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    // COGS Table
    autoTable(doc, {
        startY: 45,
        head: [['Cost Economics', 'Per Case', 'Per Unit']],
        body: [
            ['Total Avg COGS', fmtCurrency(res.base.cogsPerCase), fmtCurrency(res.base.cogsPerUnit)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
    });

    // Pricing & Margins Table
    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Tier', 'Target Margin %', 'Gross Profit ($/Case)', 'Sell Price ($/Case)']],
        body: [
            ['Manufacturer', fmtPct(res.profitability.manufacturerGrossMarginPercent), fmtCurrency(res.profitability.manufacturerGrossProfitDollars), fmtCurrency(res.base.manufacturerSellPriceToDistributor)],
            ['Distributor', fmtPct(res.profitability.distributorMarginPercent), fmtCurrency(res.profitability.distributorGrossProfitDollars), fmtCurrency(res.base.distributorPriceToRetailer)],
            ['Retailer', fmtPct(res.profitability.retailerMarginPercent), fmtCurrency(res.profitability.retailerGrossProfitDollars), fmtCurrency(res.base.retailPricePerCase)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
    });

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Manufacturer Deductions', 'Amount ($/Case)']],
        body: [
            ['Freight Allowance', fmtCurrency(res.base.manufacturerSellPriceToDistributor * (scenario.margins.freightAllowance / 100))],
            ['Trade Spend', fmtCurrency(res.base.manufacturerSellPriceToDistributor * (scenario.margins.tradeSpend / 100))],
            ['Broker Fee', fmtCurrency(res.base.manufacturerSellPriceToDistributor * (scenario.margins.brokerFee / 100))],
            ['Pre-Promo Contribution Margin', fmtCurrency(res.profitability.manufacturerContributionMarginDollars)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [100, 116, 139] }
    });

    if (scenario.promotions.length > 0) {
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Promotions', 'Cost Per Case', 'Mfg Funded', 'Dist Funded']],
            body: scenario.promotions.map(p => {
                const out = res.promotions[p.id];
                return [p.name || 'Promo', fmtCurrency(out?.promoCostPerCase || 0), fmtCurrency(out?.manufacturerNetPromoCostDollars || 0), fmtCurrency(out?.distributorNetPromoCostDollars || 0)];
            }),
            theme: 'grid',
            headStyles: { fillColor: [245, 158, 11] }
        });
        
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 5,
            head: [['Post-Promo Cont. Margin', 'Amount ($/Case)']],
            body: [
                ['Total Aggregate Impact', fmtCurrency(res.aggregatePostPromo?.postPromoManufacturerContributionMarginDollars ?? 0)]
            ],
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] }
        });
    }

    // Save PDF
    doc.save(`${scenario.product.name.replace(/\s+/g, '_')}_Margin_Report.pdf`);
}

export function exportScenarioToCSV(scenario: Scenario) {
    const res = calculateEconomics(scenario);

    const rows = [
        ['Metric', 'Value', 'Unit'],
        ['Product Name', scenario.product.name, ''],
        ['SKU', scenario.product.sku, ''],
        ['Case Pack', scenario.product.casePack.toString(), 'Units'],
        ['Avg COGS Per Case', res.base.cogsPerCase.toFixed(2), '$'],
        ['Avg COGS Per Unit', res.base.cogsPerUnit.toFixed(2), '$'],
        ['Mfg Target Margin', scenario.margins.targetManufacturerMargin.toString(), '%'],
        ['Mfg Sell Price to Dist (Case)', res.base.manufacturerSellPriceToDistributor.toFixed(2), '$'],
        ['Mfg Gross Profit (Case)', res.profitability.manufacturerGrossProfitDollars.toFixed(2), '$'],
        ['Mfg Contrib Margin (Case)', res.profitability.manufacturerContributionMarginDollars.toFixed(2), '$'],
        ['Distributor Target Margin', scenario.margins.distributorMargin.toString(), '%'],
        ['Dist Price to Retail (Case)', res.base.distributorPriceToRetailer.toFixed(2), '$'],
        ['Retailer Target Margin', scenario.margins.retailerMargin.toString(), '%'],
        ['Shelf SRP (Case)', res.base.retailPricePerCase.toFixed(2), '$'],
        ['Shelf SRP (Unit)', res.base.suggestedRetailPricePerUnit.toFixed(2), '$'],
        ['Total Promo Cost (Case)', (res.aggregatePostPromo?.promoCostPerCase || 0).toFixed(2), '$'],
    ];

    const escapeCSV = (value: string | number) => {
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvContent = rows.map(r => r.map(escapeCSV).join(",")).join("\n");
    // Priority E Bug 1: Enforce \uFEFF BOM to ensure Excel triggers UTF-8 download explicitly, preventing 0 bytes or rendering failures
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    // Explicit attribute assignment for broader browser compatibility
    link.href = url;
    link.download = `${scenario.product.name.replace(/\s+/g, '_')}_Economics.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}
