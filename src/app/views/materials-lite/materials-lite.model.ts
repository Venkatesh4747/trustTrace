export interface IValue {
    id: string;
    value: string;
}

export interface IMaterialComposition {
    id: string;
    value: string;
    composition: string;
}

export interface ISupplierDetail {
    id: string;
    reference_id: string;
    name: string;
    facility_id: string;
    facility_reference_id: string;
    facility_name: string;
}

export interface IMaterialsDetail {
    product_type: IValue;
    supplier: ISupplierDetail[];
    material_composition: IMaterialComposition[];
    internal_article_number: string;
    internal_article_name: string;
    identifier_tags: string[];
    id: string;
    searchAfterSort: number[];
}

export interface ICustomFieldDisplay {
    name: string;
    id: string;
    order: number;
}

export interface IMaterials {
    searchResponse: IMaterialsDetail[];
    totalCount: number;
    customFieldDisplayList?: ICustomFieldDisplay[];
}
