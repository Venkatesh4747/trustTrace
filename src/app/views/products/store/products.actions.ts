import { Action } from '@ngrx/store';
import {
    IBulkUpdatePayload,
    IFilterTemplateData,
    IProductsDataCollectionTemplate,
    IProductTaskViewData,
    ITasks
} from '../template.model';

export const FETCH_PRODUCTS_FILTERS = `[PRODUCT] Fetch_Products_Filters`;

export const LOAD_PRODUCTS_FILTERS = `[PRODUCT] Load_Products_Filters`;

export const FETCH_PRODUCTS_OPTIONS = `[PRODUCT] Fetch_Products_Options`;

export const LOAD_PRODUCTS_OPTIONS = `[PRODUCT] Load_Products_Options`;

export const ADD_LOADED_PRODUCT = `[PRODUCT] Add_Loaded_Product`;

export const ON_FILTER_PRODUCT = `[PRODUCT] On_Filter_Product`;

export const LOAD_CHECKED_PRODUCT = `[PRODUCT] Load_Checked_Product`;

export const SUBMIT_PRODUCT_START = `[PRODUCT] Submit_Start`;

export const SUBMIT_PRODUCT_SUCCESS = `[PRODUCT] Submit_Success`;

export const FETCH_PRODUCTS = `[PRODUCT] Fetch_Products`;

export const LOAD_PRODUCTS = `[PRODUCT] Load_Products`;

export const CLEAR_SUBMITTED_PRODUCTS = `[PRODUCT] Clear_Submitted_Products`;

export const UPDATE_AUTO_SAVED = `[PRODUCT] Update_Auto_Saved`;

export const DESTROY = `[PRODUCT] Destroy`;

export const CONFIG_LOADED = `[PRODUCT] Load_Config_Success`;

export const BULK_UPDATE = `[PRODUCT] Bulk_Update`;

export const ON_PAGINATION = `[PRODUCT] On_Pagination`;

export const ATTACH_PRODUCTS = `[PRODUCT] Attach_Products`;

export const DISABLE_PAGINATION = `[PRODUCT] Disable_Pagination`;

export const PRODUCT_SAVED = `[PRODUCT] Product_Saved`;

export const ON_ERROR = `[PRODUCT] On_Error`;

export const SET_PAGINATION_COUNT = `[PRODUCT] Set_Pagination_count`;

export const ON_REFRESH = `[PRODUCT] On_Refresh`;

export const SUBMIT_ALL = `[PRODUCT] Submit_all`;
export class FetchFilters implements Action {
    readonly type = FETCH_PRODUCTS_FILTERS;
    constructor() {}
}

export class LoadFilters implements Action {
    readonly type = LOAD_PRODUCTS_FILTERS;
    constructor(public filters: IFilterTemplateData) {}
}

export class FetchProducts implements Action {
    readonly type = FETCH_PRODUCTS;
    constructor() {}
}

export class LoadProducts implements Action {
    readonly type = LOAD_PRODUCTS;
    constructor(public products: IProductsDataCollectionTemplate) {}
}

export class FetchOptions implements Action {
    readonly type = FETCH_PRODUCTS_OPTIONS;
    constructor() {}
}

export class LoadOptions implements Action {
    readonly type = LOAD_PRODUCTS_OPTIONS;
    constructor(public options: any) {}
}

export class AddLoadedProduct implements Action {
    readonly type = ADD_LOADED_PRODUCT;
    constructor(public taskId: string) {}
}

export class OnFilterProduct implements Action {
    readonly type = ON_FILTER_PRODUCT;
    constructor(public filters: any, public search: string) {}
}

export class LoadCheckedProduct implements Action {
    readonly type = LOAD_CHECKED_PRODUCT;
    constructor(public selectedList: Array<string>) {}
}

export class SubmitProductStart implements Action {
    readonly type = SUBMIT_PRODUCT_START;
    constructor(public submittableProductIds: string[]) {}
}

export class SubmitProductSuccess implements Action {
    readonly type = SUBMIT_PRODUCT_SUCCESS;
    constructor(public productIds: string[]) {}
}

export class ClearSubmittedProducts implements Action {
    readonly type = CLEAR_SUBMITTED_PRODUCTS;
    constructor() {}
}

export class ConfigLoaded implements Action {
    readonly type = CONFIG_LOADED;
    constructor() {}
}

export class BulkUpdate implements Action {
    readonly type = BULK_UPDATE;
    constructor(public payload: IBulkUpdatePayload) {}
}

export class Destroy implements Action {
    readonly type = DESTROY;
    constructor() {}
}

export class UpdateAutoSaved implements Action {
    readonly type = UPDATE_AUTO_SAVED;
    constructor(public timestamp: number) {}
}

export class onPagination implements Action {
    readonly type = ON_PAGINATION;
    constructor() {}
}

export class AttachProducts implements Action {
    readonly type = ATTACH_PRODUCTS;
    constructor(public products: ITasks[]) {}
}

export class DisablePagination implements Action {
    readonly type = DISABLE_PAGINATION;
}

export class ProductSaved implements Action {
    readonly type = PRODUCT_SAVED;
    constructor(public taskId: string) {}
}

export class OnError implements Action {
    readonly type = ON_ERROR;
    constructor(public key: string, public errorMessage: any) {}
}

export class SetPaginationCount implements Action {
    readonly type = SET_PAGINATION_COUNT;
    constructor(public count: number) {}
}

export class OnRefresh implements Action {
    readonly type = ON_REFRESH;
    constructor(public isHardRefresh: boolean = false) {}
}

export class SubmitAll implements Action {
    readonly type = SUBMIT_ALL;
    constructor() {}
}

export type Actions =
    | FetchFilters
    | LoadFilters
    | FetchProducts
    | LoadProducts
    | FetchOptions
    | LoadOptions
    | AddLoadedProduct
    | ClearSubmittedProducts
    | OnFilterProduct
    | LoadCheckedProduct
    | ConfigLoaded
    | SubmitProductStart
    | Destroy
    | UpdateAutoSaved
    | BulkUpdate
    | SubmitAll
    | SubmitProductSuccess
    | AttachProducts
    | onPagination
    | DisablePagination
    | ProductSaved
    | SetPaginationCount
    | OnError
    | OnRefresh;
