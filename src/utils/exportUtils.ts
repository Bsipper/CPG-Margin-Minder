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
        head: [['Tier', 'Margin %', 'Gross Profit ($/Case)', 'Sell Price ($/Case)']],
        body: [
            ['Manufacturer', fmtPct(res.profitability.manufacturerGrossMarginPercent), fmtCurrency(res.profitability.manufacturerGrossProfitDollars), fmtCurrency(res.base.manufacturerSellPriceToDistributor)],
            ['Distributor', fmtPct(res.profitability.distributorMarginPercent), fmtCurrency(res.profitability.distributorGrossProfitDollars), fmtCurrency(res.base.distributorPriceToRetailer)],
            ['Retailer', fmtPct(res.profitability.retailerMarginPercent), fmtCurrency(res.profitability.retailerGrossProfitDollars), fmtCurrency(res.base.retailPricePerCase)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
    });

    // Save PDF
    doc.save(`${scenario.product.name.replace(/\\s+/g, '_')}_Margin_Report.pdf`);
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

    const csvContent = rows.map(e => e.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${scenario.product.name.replace(/\\s+/g, '_')}_Economics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
