import { environment } from '../../../../environments/environment';
import {
    IFilterTemplateData,
    IProductsDataCollectionTemplate,
    IOptionValueModel,
    ISearchRequestPayload
} from '../template.model';
import * as ProductActions from './products.actions';

const initialState: IProductsModel = {
    filterList: null,
    options: null,
    productsConfig: null,
    productListIsLoading: true,
    submitOnProgress: false,
    loadedProducts: [],
    checkableProductsCount: null,
    loadProductReqPayload: {
        filter: {},
        pagination: {
            from: 0,
            size: environment.DEFAULT_PAGINATION_SIZE
        },
        sort: {
            sortBy: 'create_ts',
            sortOrder: 'desc'
        },
        freeHand: null
    },
    checkedProducts: [],
    lastSubmittedProducts: {
        consumed: true,
        productIds: []
    },
    paginationProgress: false,
    disablePagination: false,
    errorState: {
        haveError: false,
        errorMessage: {}
    },
    paginationCount: 0
};

export interface IProductsModel {
    options: IOptionValueModel[];
    filterList: IFilterTemplateData;
    loadProductReqPayload: ISearchRequestPayload;
    productsConfig: IProductsDataCollectionTemplate;
    productListIsLoading: boolean;
    submitOnProgress: boolean;
    loadedProducts: Array<string>;
    checkableProductsCount: number;
    checkedProducts: Array<string>;
    lastSubmittedProducts: {
        productIds: string[];
        consumed: boolean;
    };
    paginationProgress: boolean;
    disablePagination: boolean;
    errorState: {
        haveError: boolean;
        errorMessage: any;
    };
    paginationCount: number;
}

export function ProductReducer(state: IProductsModel = initialState, action: ProductActions.Actions) {
    switch (action.type) {
        case ProductActions.LOAD_PRODUCTS_FILTERS:
            return { ...state, filterList: action.filters };
        case ProductActions.FETCH_PRODUCTS:
            let f_errorState = JSON.parse(JSON.stringify(state.errorState));
            if (f_errorState.haveError && f_errorState.errorMessage['LOAD_FILTER']) {
                f_errorState = errorState('LOAD_FILTER', f_errorState);
            }
            return {
                ...state,
                submitOnProgress: false,
                productsConfig: null,
                productListIsLoading: true,
                errorState: f_errorState,
                paginationProgress: false,
                disablePagination: false
            };

        case ProductActions.LOAD_PRODUCTS:
            let productClone: any = null;
            let loading = false;
            if (action.products && action.products.tasks) {
                productClone = action.products;
                loading = true;
            }
            let p_errorState = JSON.parse(JSON.stringify(state.errorState));
            if (p_errorState.haveError && p_errorState.errorMessage['LOAD_PRODUCTS']) {
                p_errorState = errorState('LOAD_PRODUCTS', p_errorState);
            }
            return {
                ...state,
                productsConfig: productClone,
                productListIsLoading: loading,
                checkedProducts: [],
                checkableProductsCount: 0,
                errorState: p_errorState
            };
        case ProductActions.LOAD_PRODUCTS_OPTIONS:
            let o_errorState = JSON.parse(JSON.stringify(state.errorState));
            if (o_errorState.haveError && o_errorState.errorMessage['LOAD_OPTIONS']) {
                o_errorState = errorState('LOAD_OPTIONS', o_errorState);
            }
            return {
                ...state,
                options: action.options,
                errorState: o_errorState
            };
        case ProductActions.ADD_LOADED_PRODUCT:
            const set = new Set([...state.loadedProducts, action.taskId]);
            return {
                ...state,
                loadedProducts: Array.from(set)
            };
        case ProductActions.ON_FILTER_PRODUCT:
            let payload = JSON.parse(JSON.stringify(state.loadProductReqPayload));
            if (action.filters !== 'IGNORE_FILTERS') {
                payload.filter = action.filters;
            }
            if (action.search !== 'IGNORE_SEARCH') {
                payload.freeHand = action.search && action.search.trim() !== '' ? action.search : null;
            }
            payload.pagination.from = 0;
            return {
                ...state,
                loadProductReqPayload: payload,
                paginationCount: 0
            };
        case ProductActions.SUBMIT_PRODUCT_START:
            return {
                ...state,
                submitOnProgress: true
            };
        case ProductActions.SUBMIT_PRODUCT_SUCCESS:
            const submittedState = { consumed: false, productIds: action.productIds };
            let s_errorState = JSON.parse(JSON.stringify(state.errorState));
            if (s_errorState.haveError && s_errorState.errorMessage['SUBMIT']) {
                s_errorState = errorState('SUBMIT', s_errorState);
            }
            return {
                ...state,
                submitOnProgress: false,
                lastSubmittedProducts: submittedState,
                errorState: s_errorState
            };
        case ProductActions.CLEAR_SUBMITTED_PRODUCTS:
            const ids = state.lastSubmittedProducts.productIds;
            const productsConfigClone = JSON.parse(JSON.stringify(state.productsConfig));
            productsConfigClone.tasks.forEach(task => {
                if (ids.includes(task.id)) {
                    task.status = 'SUBMITTED';
                }
            });
            const checkableProducts = getSubmittableProductCount(productsConfigClone.tasks);

            const consumed = { consumed: true, productIds: state.lastSubmittedProducts.productIds };
            return {
                ...state,
                lastSubmittedProducts: consumed,
                checkableProductsCount: checkableProducts,
                productsConfig: productsConfigClone
            };
        case ProductActions.CONFIG_LOADED:
            const checkableProductsCount = getSubmittableProductCount(state.productsConfig.tasks);
            return {
                ...state,
                productListIsLoading: false,
                paginationProgress: false,
                submitOnProgress: false,
                loadedProducts: [],
                checkableProductsCount: checkableProductsCount,
                loadProductReqPayload: {
                    ...state.loadProductReqPayload,
                    pagination: {
                        from: state.loadProductReqPayload.pagination.size * state.paginationCount,
                        size: environment.DEFAULT_PAGINATION_SIZE
                    }
                }
            };

        case ProductActions.LOAD_CHECKED_PRODUCT:
            const ckProductsCount = getSubmittableProductCount(state.productsConfig.tasks);
            return {
                ...state,
                checkedProducts: action.selectedList,
                checkableProductsCount: ckProductsCount
            };

        case ProductActions.UPDATE_AUTO_SAVED:
            let productsConfig = JSON.parse(JSON.stringify(state.productsConfig));
            productsConfig.autoSaveDate = action.timestamp;
            return {
                ...state,
                productsConfig
            };
        case ProductActions.BULK_UPDATE:
            return {
                ...state,
                submitOnProgress: true,
                paginationCount: 0
            };
        case ProductActions.SUBMIT_ALL:
            return {
                ...state,
                submitOnProgress: true,
                paginationCount: 0
            };
        case ProductActions.ON_REFRESH:
            let payloadCopy = JSON.parse(JSON.stringify(state.loadProductReqPayload));
            payloadCopy.filter = {};
            return {
                ...state,
                loadProductReqPayload: action.isHardRefresh ? payloadCopy : state.loadProductReqPayload,
                paginationCount: 0
            };
        case ProductActions.ON_PAGINATION:
            return {
                ...state,
                paginationProgress: true
            };
        case ProductActions.PRODUCT_SAVED:
            let proConfig: IProductsDataCollectionTemplate = JSON.parse(JSON.stringify(state.productsConfig));
            proConfig.tasks.forEach(task => {
                if (action.taskId === task.id) {
                    task.status = 'DRAFT';
                }
            });
            const ccProductsCount = getSubmittableProductCount(proConfig.tasks);
            return {
                ...state,
                productsConfig: proConfig,
                checkableProductsCount: ccProductsCount
            };

        case ProductActions.SET_PAGINATION_COUNT:
            return {
                ...state,
                paginationCount: action.count,
                productsConfig: null,
                productListIsLoading: true
            };

        case ProductActions.DISABLE_PAGINATION:
            return {
                ...state,
                disablePagination: true,
                paginationProgress: false
            };
        case ProductActions.ON_ERROR:
            let error = JSON.parse(JSON.stringify(state.errorState));
            error.haveError = true;
            error.errorMessage[action.key] = action.errorMessage;

            return {
                ...state,
                errorState: error,
                submitOnProgress: false,
                paginationProgress: false
            };
        case ProductActions.DESTROY:
            return { ...initialState };
        default:
            return state;
    }
}

function getSubmittableProductCount(tasks) {
    if (!Array.isArray(tasks)) {
        return [];
    }
    return tasks.reduce((accumulator: any, task: any) => {
        if (task.status !== 'SUBMITTED') {
            accumulator = accumulator + 1;
        }
        return accumulator;
    }, 0);
}

function errorState(state, key) {
    state.errorMessage[key] = null;
    state.haveError = Object.keys(state.errorMessage).some(keys => state.errorMessage[key] !== null);
}
