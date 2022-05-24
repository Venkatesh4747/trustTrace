export interface ArticleComposition {
    type: string;
    name: string;
    code: string;
    colors: string[];
    quantity: number;
    units: string;
}
export interface ShipmentDetails {
    po: string;
    orderedQty: QtyComposition;
    trId: number;
    supplyChain: SupplyChainDetail[];
}
export interface SupplyChainDetail {
    country: string;
    product: string;
    state: string;
    supplierName: string;
}
export interface MaterialComposition {
    material: string;
    percent: number;
}
export interface QtyComposition {
    quantity: number;
    unit: string;
}
export interface FilterOptions {
    season: string[];
    year: string[];
    material: string[];
    certification: string[];
    productGroup: string[];
    color: string[];
    recurringType: string[];
}
export interface ColorCompositions {
    id: string;
    name: string;
    code: ColorCode[];
}
export interface ColorCode {
    id: string;
    value: string;
}
