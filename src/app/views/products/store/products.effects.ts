import { Actions, ofType, Effect } from '@ngrx/effects';
import * as productActions from './products.actions';
import { switchMap, catchError, map, withLatestFrom } from 'rxjs/operators';
import { ProductsService } from '../products.service';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { FILTER_SESSION, ProductState } from './store';
import { Store } from '@ngrx/store';
import { UtilsService } from '../../../shared/utils/utils.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Injectable()
export class ProductsEffects {
    @Effect()
    FetchFilters = this.actions$.pipe(
        ofType(productActions.FETCH_PRODUCTS_FILTERS),
        withLatestFrom(this.store.select('Products')),
        switchMap(([action, storeData]) => {
            let payload: any = {
                filter: {},
                pagination: { from: 0, size: 10000 },
                sort: { sortBy: 'create_ts', sortOrder: 'desc' }
            };

            let haveValue = false;
            Object.keys(storeData.loadProductReqPayload.filter).forEach(key => {
                if (storeData.loadProductReqPayload.filter[key]) {
                    payload.filter[key] = storeData.loadProductReqPayload.filter[key];
                    haveValue = true;
                }
            });
            if (!haveValue) {
                payload = {};
            }

            return this.productService.getFilters(payload).pipe(
                catchError(error => of(new productActions.OnError('LOAD_FILTER', error))),
                map(filters => {
                    if (filters.errorMessage) {
                        return filters;
                    }
                    return new productActions.LoadFilters(filters);
                })
            );
        })
    );

    @Effect()
    FetchOptions = this.actions$.pipe(
        ofType(productActions.FETCH_PRODUCTS_OPTIONS),
        switchMap((filterData: productActions.FetchOptions) => {
            return this.productService.getOptions().pipe(
                catchError(error => of(new productActions.OnError('LOAD_OPTIONS', error))),
                map(options => {
                    if (options['errorMessage']) {
                        return options;
                    }
                    return new productActions.LoadOptions(options);
                })
            );
        })
    );

    @Effect()
    LoadProduct = this.actions$.pipe(
        ofType(productActions.FETCH_PRODUCTS),
        withLatestFrom(this.store.select('Products')),
        switchMap(([action, storeData]) => {
            let payload: any = JSON.parse(JSON.stringify(storeData.loadProductReqPayload));
            let haveValue = false;
            payload.filter = {};
            Object.keys(storeData.loadProductReqPayload.filter).forEach(key => {
                if (storeData.loadProductReqPayload.filter[key]) {
                    payload.filter[key] = storeData.loadProductReqPayload.filter[key];
                    haveValue = true;
                }
            });
            if (!haveValue) {
                payload.filter = {};
            }
            return this.productService.getProductConfig(payload).pipe(
                catchError(error => of(new productActions.OnError('LOAD_PRODUCTS', error))),
                map(products => {
                    if (products.errorMessage) {
                        return products;
                    }
                    return new productActions.LoadProducts(products);
                })
            );
        })
    );
    @Effect()
    SubmitProduct = this.actions$.pipe(
        ofType(productActions.SUBMIT_PRODUCT_START),
        switchMap((submitProduct: productActions.SubmitProductStart) => {
            return this.productService.submitData(submitProduct.submittableProductIds).pipe(
                catchError(error => of(new productActions.OnError('SUBMIT', error))),
                map(error => {
                    if (error['errorMessage']) {
                        return error;
                    }
                    return new productActions.SubmitProductSuccess(submitProduct.submittableProductIds);
                })
            );
        })
    );
    @Effect()
    LoadFilterOnSubmit = this.actions$.pipe(
        ofType(productActions.SUBMIT_PRODUCT_SUCCESS),
        switchMap(() => [new productActions.FetchFilters()])
    );

    @Effect()
    LoadFilter = this.actions$.pipe(
        ofType(productActions.ON_FILTER_PRODUCT),
        switchMap(() => [new productActions.FetchProducts()])
    );

    @Effect()
    Refresh = this.actions$.pipe(
        ofType(productActions.ON_REFRESH),
        switchMap((isHardRefresh: boolean) => {
            if (isHardRefresh) {
                this.utilService.removeSessionStorageValue(FILTER_SESSION);
            }
            return [new productActions.FetchProducts(), new productActions.FetchFilters()];
        })
    );

    @Effect()
    SetPagination = this.actions$.pipe(
        ofType(productActions.SET_PAGINATION_COUNT),
        switchMap(() => [new productActions.onPagination()])
    );

    @Effect()
    BulkUpdate = this.actions$.pipe(
        ofType(productActions.BULK_UPDATE),
        switchMap((bulkUpdate: productActions.BulkUpdate) => {
            return this.productService.bulkUpdate(bulkUpdate.payload).pipe(
                catchError(error => of(new productActions.OnError('BULK_UPDATE', error))),
                map(error => {
                    if (error['errorMessage']) {
                        return error;
                    }
                    return new productActions.FetchProducts();
                })
            );
        })
    );

    @Effect()
    Pagination = this.actions$.pipe(
        ofType(productActions.ON_PAGINATION),
        withLatestFrom(this.store.select('Products')),
        switchMap(([action, store]) => {
            let payload = JSON.parse(JSON.stringify(store.loadProductReqPayload));
            payload.pagination.from = store.paginationCount * store.loadProductReqPayload.pagination.size;

            let haveValue = false;
            payload.filter = {};
            Object.keys(store.loadProductReqPayload.filter).forEach(key => {
                if (store.loadProductReqPayload.filter[key]) {
                    payload.filter[key] = store.loadProductReqPayload.filter[key];
                    haveValue = true;
                }
            });
            if (!haveValue) {
                payload.filter = {};
            }
            return this.productService.getProductConfig(payload).pipe(
                catchError(error => of(new productActions.OnError('LOAD_PAGINATION', error))),
                map(result => {
                    if (result.errorMessage) {
                        return result;
                    }
                    if (result.tasks) {
                        return new productActions.LoadProducts(result);
                    } else {
                        return new productActions.DisablePagination();
                    }
                })
            );
        })
    );

    @Effect()
    submitAllProducts = this.actions$.pipe(
        ofType(productActions.SUBMIT_ALL),
        switchMap(() => {
            return this.productService.submitAllProducts().pipe(
                catchError(error => of(new productActions.OnError('SUBMIT_ALL', error))),
                map(error => {
                    if (error['errorMessage']) {
                        return error;
                    }
                    this.toastrService.success('All valid products have been successfully submitted');
                    return new productActions.FetchProducts();
                })
            );
        })
    );

    constructor(
        private actions$: Actions,
        private productService: ProductsService,
        private store: Store<ProductState>,
        private utilService: UtilsService,
        private toastrService: CustomToastrService
    ) {}
}
