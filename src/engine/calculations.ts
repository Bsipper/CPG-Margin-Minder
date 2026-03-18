import { Scenario, CalculationResult, Promotion, PromotionOutputs } from '../types';

export function calculateEconomics(scenario: Scenario): CalculationResult {
    const { product, cogs, margins, promotions } = scenario;

    const casePack = product.casePack || 12;

    // 1. Calculate Base COGS
    let baseCaseCost = 0;
    
    if (cogs.inputMethod === 'supplier' && product.supplierBaseCost !== undefined && product.supplierBaseCost > 0) {
        // Driven by Product Line Setup: Supplier Cost + Supplier Margin
        const marginDec = (product.supplierGrossMargin || 0) / 100;
        baseCaseCost = marginDec < 1 ? product.supplierBaseCost / (1 - marginDec) : 0;
    } else if (cogs.inputMethod === 'total') {
        baseCaseCost = cogs.totalCaseCost || 0;
    } else {
        baseCaseCost = cogs.lineItems.reduce((acc, item) => acc + (item.cost || 0), 0);
    }

    // Calculate Active Freight Cost
    let activeFreightCostPerCase = 0;
    if (scenario.activeFreightQuoteId && scenario.freightQuotes) {
        const activeQuote = scenario.freightQuotes.find(q => q.id === scenario.activeFreightQuoteId);
        if (activeQuote && activeQuote.quoteTotal > 0 && activeQuote.pallets) {
            const casesPerPallet = product.casesPerPallet || 1;
            const totalCases = activeQuote.pallets * casesPerPallet;
            if (totalCases > 0) {
                activeFreightCostPerCase = activeQuote.quoteTotal / totalCases;
            }
        }
    }

    const totalCaseCost = baseCaseCost + activeFreightCostPerCase;
    const cogsPerUnit = totalCaseCost / casePack;

    // 2. Base Pricing Calculations (Margins input as e.g. 40 for 40%)
    const mfgMarginDec = (margins.targetManufacturerMargin || 0) / 100;
    const distMarginDec = (margins.distributorMargin || 0) / 100;
    const retMarginDec = (margins.retailerMargin || 0) / 100;

    // Manufacturer (Wholesale)
    // manufacturer_sell_price = COGS_case / (1 - manufacturer_margin)
    const mfgPriceToDist = mfgMarginDec < 1
        ? totalCaseCost / (1 - mfgMarginDec)
        : 0;

    // Distributor
    // distributor_price_to_retailer = manufacturer_sell_price / (1 - distributor_margin)
    const distPriceToRet = distMarginDec < 1 && mfgPriceToDist > 0
        ? mfgPriceToDist / (1 - distMarginDec)
        : 0;

    // Retailer
    // retail_price = distributor_price_to_retailer / (1 - retailer_margin)
    const retailPricePerCase = retMarginDec < 1 && distPriceToRet > 0
        ? distPriceToRet / (1 - retMarginDec)
        : 0;

    const srPricePerUnit = retailPricePerCase / casePack;

    // 3. Profitability Calculations

    // Manufacturer
    const mfgGrossProfit = mfgPriceToDist - totalCaseCost;
    const mfgActualGrossMargin = mfgPriceToDist > 0 ? (mfgGrossProfit / mfgPriceToDist) : 0;

    // Deductions from Manufacturer (Freights, Trade Spend, etc. are typically % of Gross Sales)
    const freightCost = mfgPriceToDist * ((margins.freightAllowance || 0) / 100);
    const tradeSpendCost = mfgPriceToDist * ((margins.tradeSpend || 0) / 100);
    const variableSellingExp = mfgPriceToDist * ((margins.variableSellingExpense || 0) / 100);
    const brokerFee = mfgPriceToDist * ((margins.brokerFee || 0) / 100);

    const mfgVariableCosts = totalCaseCost + freightCost + tradeSpendCost + variableSellingExp + brokerFee;
    const mfgContributionMargin = mfgPriceToDist - mfgVariableCosts;
    const mfgContributionMarginPct = mfgPriceToDist > 0 ? (mfgContributionMargin / mfgPriceToDist) : 0;

    // Distributor
    const distGrossProfit = distPriceToRet - mfgPriceToDist; // mfgPriceToDist is their acquisition cost
    const distActualMargin = distPriceToRet > 0 ? (distGrossProfit / distPriceToRet) : 0;

    // Retailer
    const retGrossProfit = retailPricePerCase - distPriceToRet; // distPriceToRet is their acquisition cost
    const retActualMargin = retailPricePerCase > 0 ? (retGrossProfit / retailPricePerCase) : 0;

    // 4. Promotions Calculations
    const promoOutputs: Record<string, PromotionOutputs> = {};

    let totalMfgPromoCost = 0;
    let totalDistPromoCost = 0;
    let totalRetPromoCost = 0;

    promotions.forEach(promo => {
        let promoCostPerCase = 0;

        // Calculate total discount value per case
        if (promo.type === 'percent_invoice') {
            promoCostPerCase = mfgPriceToDist * ((promo.discountValue || 0) / 100);
        } else if (promo.type === 'dollar_case' || promo.type === 'scan_allowance') {
            promoCostPerCase = promo.discountValue || 0;
        } else if (promo.type === 'bogo') {
            const buyX = promo.buyX || 1;
            const getY = promo.getY || 1;
            const totalUnits = buyX + getY;
            const effectiveDiscountPct = getY / totalUnits;

            // BOGO reduces effective retail price, cost is borne by somebody based on wholesale value typically
            // We will model it as discount value on the case equivalents
            promoCostPerCase = mfgPriceToDist * effectiveDiscountPct;
        } else if (promo.type === 'tpr') {
            // Temporary Price Reduction per unit
            promoCostPerCase = (promo.discountValue || 0) * casePack;
        } else {
            promoCostPerCase = promo.discountValue || 0; // custom fallback
        }

        // Allocate discount
        const mfgRatio = (promo.manufacturerFunding || 0) / 100;
        const distRatio = (promo.distributorFunding || 0) / 100;
        const retRatio = (promo.retailerFunding || 0) / 100; // sum to 100% usually

        const mfgNetPromoCost = promoCostPerCase * mfgRatio;
        const distNetPromoCost = promoCostPerCase * distRatio;
        const retNetPromoCost = promoCostPerCase * retRatio;

        totalMfgPromoCost += mfgNetPromoCost;
        totalDistPromoCost += distNetPromoCost;
        totalRetPromoCost += retNetPromoCost;

        promoOutputs[promo.id] = {
            promoCostPerCase,
            promoCostPerUnit: promoCostPerCase / casePack,
            manufacturerNetPromoCostDollars: mfgNetPromoCost,
            manufacturerNetPromoCostPercent: mfgPriceToDist > 0 ? (mfgNetPromoCost / mfgPriceToDist) : 0,
            distributorNetPromoCostDollars: distNetPromoCost,
            distributorNetPromoCostPercent: distPriceToRet > 0 ? (distNetPromoCost / distPriceToRet) : 0,
            retailerNetPromoCostDollars: retNetPromoCost,

            // Post-promo impact for this specific promotion
            postPromoManufacturerContributionMarginDollars: mfgContributionMargin - mfgNetPromoCost,
            postPromoManufacturerContributionMarginPercent: mfgPriceToDist > 0 ? ((mfgContributionMargin - mfgNetPromoCost) / mfgPriceToDist) : 0,
            postPromoDistributorMarginDollars: distGrossProfit - distNetPromoCost,
            postPromoDistributorMarginPercent: distPriceToRet > 0 ? ((distGrossProfit - distNetPromoCost) / distPriceToRet) : 0
        };
    });

    return {
        base: {
            cogsPerUnit,
            cogsPerCase: totalCaseCost,
            baseCogsPerCase: baseCaseCost,
            activeFreightCostPerCase,
            manufacturerSellPriceToDistributor: mfgPriceToDist,
            distributorPriceToRetailer: distPriceToRet,
            retailPricePerCase,
            suggestedRetailPricePerUnit: srPricePerUnit,
        },
        profitability: {
            manufacturerGrossProfitDollars: mfgGrossProfit,
            manufacturerGrossMarginPercent: mfgActualGrossMargin,
            manufacturerContributionMarginDollars: mfgContributionMargin,
            manufacturerContributionMarginPercent: mfgContributionMarginPct,
            distributorGrossProfitDollars: distGrossProfit,
            distributorMarginPercent: distActualMargin,
            retailerGrossProfitDollars: retGrossProfit,
            retailerMarginPercent: retActualMargin
        },
        promotions: promoOutputs,
        aggregatePostPromo: {
            promoCostPerCase: totalMfgPromoCost + totalDistPromoCost + totalRetPromoCost,
            promoCostPerUnit: (totalMfgPromoCost + totalDistPromoCost + totalRetPromoCost) / casePack,

            manufacturerNetPromoCostDollars: totalMfgPromoCost,
            manufacturerNetPromoCostPercent: mfgPriceToDist > 0 ? (totalMfgPromoCost / mfgPriceToDist) : 0,
            distributorNetPromoCostDollars: totalDistPromoCost,
            distributorNetPromoCostPercent: distPriceToRet > 0 ? (totalDistPromoCost / distPriceToRet) : 0,
            retailerNetPromoCostDollars: totalRetPromoCost,

            postPromoManufacturerContributionMarginDollars: mfgContributionMargin - totalMfgPromoCost,
            postPromoManufacturerContributionMarginPercent: mfgPriceToDist > 0 ? ((mfgContributionMargin - totalMfgPromoCost) / mfgPriceToDist) : 0,
            postPromoDistributorMarginDollars: distGrossProfit - totalDistPromoCost,
            postPromoDistributorMarginPercent: distPriceToRet > 0 ? ((distGrossProfit - totalDistPromoCost) / distPriceToRet) : 0
        }
    };
}
