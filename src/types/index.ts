export type UserRole = 'super_admin' | 'admin' | 'distributor' | 'retailer';

export interface Company {
    id: string;
    name: string;
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    companyId: string;
    hasAcceptedTerms?: boolean;
}

export interface Product {
    id: string;
    companyId: string;
    name: string;
    sku: string;
    casePack: number;
    sizeOunces?: string;
    category?: string;
    
    // Freight & Logistics setup
    weightPerCase?: number;
    palletsPerTruckload?: number;
    casesPerPallet?: number;
    palletDimensions?: string;
    freightClass?: string;

    // Supplier Costing
    supplierBaseCost?: number;
    supplierGrossMargin?: number;
}

export type CostInputMethod = 'itemized' | 'total' | 'supplier';

export interface COGSItem {
    id: string;
    name: string;
    cost: number;
}

export interface COGS {
    inputMethod: CostInputMethod;
    totalCaseCost: number; // Used if inputMethod === 'total'
    lineItems: COGSItem[]; // Used if inputMethod === 'itemized'
}

export interface Margins {
    targetManufacturerMargin: number; // e.g., 40 for 40%
    distributorMargin: number;        // e.g., 25 for 25%
    retailerMargin: number;           // e.g., 35 for 35%

    // Optional deductions (percentages off manufacturer sell price)
    freightAllowance: number;
    tradeSpend: number;
    variableSellingExpense: number;
    brokerFee: number;
}

export type PromoType = 'bogo' | 'percent_invoice' | 'dollar_case' | 'scan_allowance' | 'tpr' | 'custom';

export interface Promotion {
    id: string;
    name: string;
    retailerName?: string;
    type: PromoType;

    // Specific values based on PromoType
    // For bogo: buy X get Y free
    buyX?: number;
    getY?: number;

    // For percentage off, $ off, or TPR
    discountValue?: number; // e.g., 10 for 10% or $10

    // Additional fixed costs
    fixedCosts?: number;

    // Funding split (must sum to 100%)
    manufacturerFunding: number;
    distributorFunding: number;
    retailerFunding: number;

    // ROI Calculator fields
    baselineCases?: number;
    liftCases?: number;
}

export interface SlottingFee {
    id: string;
    description: string;
    retailerName?: string;
    totalAmount: number; // Flat fee
    freeCasesPerStore?: number;
    numberOfStores?: number;
    numberOfSkus?: number;
    projectedVolume?: number; // For ROI calc
}

export interface FreightQuote {
    id: string;
    origin: string;
    destination: string;
    shipmentType: string; // e.g. '1 Pallet', '5 Pallets', 'Full Truckload'
    pallets?: number;
    quoteTotal: number;
    carrier?: string;
    transitDays?: number;
    notes?: string;
}

export interface Scenario {
    id: string;
    productId: string;
    name: string;
    product: Product;
    cogs: COGS;
    margins: Margins;
    promotions: Promotion[];
    slottingFees: SlottingFee[];
    freightQuotes?: FreightQuote[];
    activeFreightQuoteId?: string;
    lastModified: number; // timestamp
}

export interface BasePricingOutputs {
    cogsPerUnit: number;
    cogsPerCase: number;
    baseCogsPerCase: number;
    activeFreightCostPerCase: number;
    manufacturerSellPriceToDistributor: number;
    distributorPriceToRetailer: number;
    suggestedRetailPricePerUnit: number;
    retailPricePerCase: number;
}

export interface ProfitabilityOutputs {
    manufacturerGrossProfitDollars: number;
    manufacturerGrossMarginPercent: number;

    // Contribution Margin variables (after deductions)
    manufacturerContributionMarginDollars: number;
    manufacturerContributionMarginPercent: number;

    distributorGrossProfitDollars: number;
    distributorMarginPercent: number;

    retailerGrossProfitDollars: number;
    retailerMarginPercent: number;
}

export interface PromotionOutputs {
    promoCostPerCase: number;
    promoCostPerUnit: number;

    // Net costs by party
    manufacturerNetPromoCostDollars: number;
    manufacturerNetPromoCostPercent: number;
    distributorNetPromoCostDollars: number;
    distributorNetPromoCostPercent: number;
    retailerNetPromoCostDollars: number; // although typically retailer just passes discount to consumer, but prompt asks for "retailer-funded portion $"

    // Post-promo profitability
    postPromoManufacturerContributionMarginDollars: number;
    postPromoManufacturerContributionMarginPercent: number;
    postPromoDistributorMarginDollars: number;
    postPromoDistributorMarginPercent: number;
}

export interface CalculationResult {
    base: BasePricingOutputs;
    profitability: ProfitabilityOutputs;
    promotions: Record<string, PromotionOutputs>; // keyed by promo ID
    // If no promos or to get aggregate impact
    aggregatePostPromo?: PromotionOutputs;
}
