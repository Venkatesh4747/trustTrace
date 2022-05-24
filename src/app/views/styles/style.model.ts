export class Certification {
    id: string;
    mandatory: boolean;
}

export class SustainabilityLabel {
    id: string;
    mandatory: boolean;
}

export class MaterialComp {
    id: string;
    value: number;
}

export class ProductCategory {
    id: string;
    group: string;
}

export class Size {
    size: string;
    fits: Array<string>;
    lengths: Array<string>;
}

export class Variant {
    color: string;
    sizes: Array<Size>;
}

export class Quantity {
    quantity: number;
    unit: string;
}

export class Article {
    unique_search: string;
    id_type: string;
}

export class Bom {
    article: string;
    usedIn: Array<string>;
    qty: Quantity;
    areaOfUsage: string;
}

export class BomView {
    article: Array<Article>;
    usedIn: Array<string>;
    qty: Quantity;
}

export class Style {
    name: string;
    productUniqueCode: string;
    code: string;
    year: string;
    season: string;
    productType: string;
    quanity:string;
    certifications: Array<Certification>;
    sustainabilityLabels: Array<SustainabilityLabel>;
    materialComp: Array<MaterialComp>;
    productCategories: Array<ProductCategory>;
    variants: Array<Variant>;
    bom: Array<Bom>;
    supplyChain: Array<SupplyChain>;
    imagesId: string;
    styleImageNames: Array<string>;
    billOfMaterials: Array<BomView>;
}

export class SupplyChain {
    productType: string;
    suppliers: Array<SupplyChainSupplier>;
}

export class SupplyChainSupplier {
    id: string;
}
