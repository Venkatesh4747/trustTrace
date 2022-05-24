export interface IProductListAutocompleteResp {
    productId: string;
    name: string;
    ean?: string;
    sku?: string;
    itemNo?: string;
}

export interface IProductListAutocompleteReq {
    filter: any;
    pagination: { from: number; size: number };
    sort: { sortBy: 'create_ts'; sortOrder: 'desc' | 'asc' };
    freeHand: string;
}

export interface ISimulateReq {
    product_id: string;
    product_labels: string[];
    country_of_manufacturing: string[];
    ingredients: IIngredient[];
}

interface IIngredient {
    ingredient_id: string;
    ingredient_labels: string[];
    production_method: string[];
    country_of_origin: string[];
}
