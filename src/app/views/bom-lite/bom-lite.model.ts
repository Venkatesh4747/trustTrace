export interface IValue {
    id: string;
    value: string;
}

export interface INumberName {
    number: string;
    name: string;
}

export interface IProductMaterialItem {
    code: string;
    facility_code: string;
    supplier_id: string;
}

export interface IYieldDetail {
    value: string;
    uom_width: string;
    uom_quantity_unit: string;
    uom_length: string;
    uom_quantity: string;
    uom_length_unit: string;
    uom_width_unit: string;
    uom_weight: string;
    uom_weight_unit: string;
    uom_thickness: string;
    uom_thickness_unit: string;
}

export interface IBomDetail {
    product: IProductMaterialItem;
    material: IProductMaterialItem;
    year: string;
    part: INumberName;
    name: string;
    season: string;
    id: string;
    brand: string;
    yield: IYieldDetail;
    identifier_tags: string[];
    searchAfterSort: number[];
}

export interface ICustomFieldDisplay {
    name: string;
    id: string;
    order: number;
}

export interface IBom {
    searchResponse: IBomDetail[];
    totalCount: number;
    customFieldDisplayList?: ICustomFieldDisplay[];
}
