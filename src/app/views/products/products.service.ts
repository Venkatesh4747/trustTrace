import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilsService } from '../../shared/utils/utils.service';
import { IFinishedProductDetail, IProductListTableData } from './finished-products-list/finished-product.model';
import { ICreateLabelAndProgramReqPayload, SupplierProductCount } from './labels-and-programs/labels-and-program.model';
import { IRetailerDeclarationSubmitResponce } from './product-detail/product-detail.model';
import { IProductListAutocompleteReq } from './simulation/simulation.model';
import {
    IBulkUpdatePayload,
    IDeActivateOrReActivatePayload,
    IFilterTemplateData,
    IOptionValueModel,
    IProductDetailRequestPayload,
    ISearchRequestPayload,
    ProductAutoSaveRequestPayload
} from './template.model';
import { IDownloadFileRequestPayload, IRerunIntegrationPayload } from './integration/integration.model';

@Injectable()
export class ProductsService {
    constructor(private http: HttpClient, private utils: UtilsService) {}

    public getProductConfig(payload: any) {
        return this.http
            .post(environment.api.products.productConfig, payload)
            .pipe(map((response: any) => response.data));
    }

    public getTableHeaders(payload: any) {
        const filters = {
            '': { value: [], isMandatory: false },
            Product: { value: [], isMandatory: false },
            'Product Label': { value: [], isMandatory: false },
            'Country / Region of Packaging': { value: [], isMandatory: true },
            Ingredients: { value: [], isMandatory: true },
            'Ingredient Label': { value: [], isMandatory: false },
            'Production Method': { value: [], isMandatory: false },
            'Country / Region of Origin': { value: [], isMandatory: false }
        };
        return new Observable((observer: Observer<any>) => {
            observer.next(filters);
        });
    }

    public getFilters(payload: any) {
        return this.http.post(environment.api.products.filters, payload).pipe(map((response: any) => response.data));
    }

    public getOptions(): Observable<IOptionValueModel[]> {
        return this.http
            .get<IOptionValueModel[]>(environment.api.products.options)
            .pipe(map((response: any) => response.data));
    }

    public submitData(ids: string[]) {
        return this.http.put(environment.api.products.submitData, { payload: ids });
    }

    public saveData(payload: any): Observable<any> {
        return this.http.put(environment.api.products.saveData, payload);
    }

    public saveData_v1(productId: string, taskId: string, payload: ProductAutoSaveRequestPayload): Observable<any> {
        const url = environment.api.products.saveData_v1.replace('$productId', productId).replace('$taskId', taskId);
        return this.http.put(url, payload);
    }

    public bulkUpdate(payload: IBulkUpdatePayload): Observable<any> {
        return this.http.post(environment.api.products.bulkUpdate, payload);
    }

    public getFinishedProducts(payload: ISearchRequestPayload): Observable<IProductListTableData> {
        return this.http.post<any>(environment.api.products.finishedProductsList, payload).pipe(map(data => data.data));
    }

    public getFinishedProductsFilters(payload: ISearchRequestPayload): Observable<IFilterTemplateData> {
        return this.http
            .post<any>(environment.api.products.finishedProductsFilters, payload)
            .pipe(map(data => data.data));
    }

    constructSessionPayload(
        filterSession: string,
        sortSession: string,
        searchSession: string = null,
        paginationSession: string = null
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const payload: ISearchRequestPayload = {
                filter: null,
                pagination: {
                    from: 0,
                    size: environment.DEFAULT_PAGINATION_SIZE
                },
                sort: {
                    sortBy: 'name',
                    sortOrder: 'asc'
                }
            };

            // FILTER
            const FILTERS_SESSION_VALUE = this.utils.getSessionStorageValue(filterSession);
            if (FILTERS_SESSION_VALUE) {
                payload.filter = FILTERS_SESSION_VALUE;
            } else {
                const SET_FILTERS_SESSION_VALUE = {};
                this.utils.setSessionStorageValue(filterSession, SET_FILTERS_SESSION_VALUE);
            }

            // SORT
            const SORT_SESSION_VALUE = this.utils.getSessionStorageValue(sortSession);
            if (SORT_SESSION_VALUE) {
                payload.sort = SORT_SESSION_VALUE;
            } else {
                const SET_FILTERS_SESSION_VALUE = payload.sort;
                this.utils.setSessionStorageValue(sortSession, SET_FILTERS_SESSION_VALUE);
            }

            // Search
            if (searchSession) {
                const SEARCH_SESSION_VALUE = this.utils.getSessionStorageValue(searchSession);
                if (SEARCH_SESSION_VALUE) {
                    payload.freeHand = SEARCH_SESSION_VALUE;
                } else {
                    this.utils.setSessionStorageValue(searchSession, '');
                }
            }

            // Pagination
            this.setPaginationSessionValue(paginationSession, payload);

            // Refactor filters non null values
            const filter = {};
            if (payload.filter) {
                Object.keys(payload.filter).forEach(key => {
                    if (payload.filter[key] !== null && payload.filter[key].length > 0) {
                        filter[key] = payload.filter[key];
                    }
                });
            }
            payload.filter = filter;
            resolve(payload);
        });
    }

    private setPaginationSessionValue(paginationSession: string, payload: ISearchRequestPayload): void {
        if (paginationSession) {
            const PAGINATION_SESSION_VALUE = this.utils.getSessionStorageValue(paginationSession);
            if (PAGINATION_SESSION_VALUE) {
                payload.pagination.from = PAGINATION_SESSION_VALUE * environment.DEFAULT_PAGINATION_SIZE;
            } else {
                this.utils.setSessionStorageValue(paginationSession, 0);
            }
        }
    }

    public getFinishedProductDetail(
        payload: IProductDetailRequestPayload,
        productId: string
    ): Observable<IFinishedProductDetail> {
        let url = environment.api.products.finishedProductDetailTemp;
        url = url.replace('$productId', productId);
        return this.http.post<any>(url, payload).pipe(map(response => response.data));
    }

    public downloadProductData() {
        const url = environment.api.products.downloadProductData;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public uploadProductData(payload: any) {
        const formData = new FormData();
        formData.append('file', payload);
        return this.http.post<any>(environment.api.products.uploadProductData, formData);
    }

    public getScoreHistory(versionId: string, canUpdateScore: boolean): Observable<any> {
        let url = environment.api.products.getScoreHistory;
        url = url.replace('$versionId', versionId) + '?canUpdateScore=' + canUpdateScore;
        return this.http.get(url).pipe(map((response: any) => response.data));
    }

    public getVersionHistoriesSupplier(payload: any): Observable<any> {
        const url = environment.api.products.getVersionHistoriesSupplier;
        return this.http.post(url, payload).pipe(map((response: any) => response.data));
    }

    public getScoreHistorySupplier(versionId: string, canUpdateScore: boolean): Observable<any> {
        let url = environment.api.products.getScoreHistorySupplier;
        url = url.replace('$versionId', versionId) + '?canUpdateScore=' + canUpdateScore;
        return this.http.get(url).pipe(map((response: any) => response.data));
    }

    public editScore(payload: any): Observable<any> {
        const url = environment.api.products.editScore;
        return this.http.put(url, payload);
    }

    public getCustomFieldInfo(payload: any): Observable<any> {
        const url = environment.api.products.getScoreInfo;
        return this.http.post(url, payload).pipe(map((response: any) => response.data['custom-field-data']));
    }

    public getECScoreData(payload: any): Observable<any> {
        const url = environment.api.products.brandProductScoreEcData;
        return this.http.post(url, payload).pipe(map((response: any) => response.data['custom-field-data']));
    }

    public getProductTaskDetail(payload: any): Observable<any> {
        const url = environment.api.products.productTaskDetail;
        return this.http.post(url, payload).pipe(map((response: any) => response.data));
    }

    public simulationGetProductAutoCompleteListBrand(payload: IProductListAutocompleteReq): Observable<any> {
        const url = environment.api.products.simulationProductAutoCompleteListBrand;
        return this.http.post(url, payload);
    }

    public simulationGetProductAutoCompleteListRetailer(payload: IProductListAutocompleteReq): Observable<any> {
        const url = environment.api.products.simulationProductAutoCompleteListRetailer;
        return this.http.post(url, payload);
    }

    public simulationGetProductTask(productId: string): Observable<any> {
        const url = environment.api.products.simulationGetProductTask.replace('$productId', productId);
        return this.http.get(url);
    }

    public simulateProduct(payload: any): Observable<any> {
        const url = environment.api.products.productTaskSimulation;
        return this.http.post(url, payload);
    }

    public getVersionHistories(payload: any): Observable<any> {
        const url = environment.api.products.getVersionHistories;
        return this.http.post(url, payload).pipe(map((response: any) => response.data));
    }

    public getScoreToEdit(productId: string, canUpdateScore: boolean): Observable<any> {
        let url = environment.api.products.getLatestScoreToEdit;
        url = url.replace('$productId', productId) + '?canUpdateScore=' + canUpdateScore;
        return this.http.get(url).pipe(map((response: any) => response.data));
    }

    public retailerSupplierDeclarationEdit(
        productId: string,
        taskId: string,
        payload: ProductAutoSaveRequestPayload
    ): Observable<IRetailerDeclarationSubmitResponce> {
        const url = environment.api.products.retailerSupplierDeclarationEdit
            .replace('$productId', productId)
            .replace('$taskId', taskId);
        return this.http.put(url, payload).pipe(map((response: any) => response.data));
    }

    public updateShowApiScore(productId, payload: IDeActivateOrReActivatePayload): Observable<any> {
        const url = environment.api.products.updateShowApiScore.replace('$productId', productId);
        return this.http.put(url, payload).pipe(map(resp => resp['data']));
    }

    public submitAllProducts(): Observable<any> {
        const url = environment.api.products.submitAllProducts;
        return this.http.put(url, null);
    }

    public getLabelsAndProgramConfig(): Observable<any> {
        return this.http.get(environment.api.products.labelsAndProgramConfig).pipe(map(resp => resp['data']));
    }

    public getMasterLabelList(labelType: 'Product' | 'Ingredient'): Observable<any> {
        return this.http
            .get(environment.api.products.getLabelsList.replace('$labelType', labelType))
            .pipe(map(resp => resp['data']));
    }
    public getLabelConfig(labelId: string): Observable<any> {
        return this.http
            .get(environment.api.products.getLabelConfig.replace('$labelId', labelId))
            .pipe(map(resp => resp['data']));
    }
    public createLabel(payload: ICreateLabelAndProgramReqPayload): Observable<any> {
        return this.http.post(environment.api.products.createLabel, payload);
    }

    public getLabelsAndPrograms(payload: ISearchRequestPayload): Observable<any> {
        return this.http.post(environment.api.products.supplierProgramAndLabelsList, payload);
    }

    public getLabelsAndProgramsFilters(payload: ISearchRequestPayload): Observable<IFilterTemplateData> {
        return this.http
            .post<any>(environment.api.products.supplierProgramAndLabelsFilterList, payload)
            .pipe(map(resp => resp['data']));
    }

    public getProductCountForLabel(labelId: string): Observable<any> {
        return this.http
            .get(environment.api.products.getProductCount.replace('$labelId', labelId))
            .pipe(map(res => res['data']));
    }

    public deactivateLabel(labelId: string): Observable<any> {
        return this.http.patch(environment.api.products.deactivateLabel.replace('$labelId', labelId), null);
    }

    public getLabelData(labelId: string): Observable<any> {
        return this.http
            .get(environment.api.products.getLabelData.replace('$labelId', labelId))
            .pipe(map(res => res['data']));
    }

    public updateLabel(labelId: string, payload: any): Observable<any> {
        return this.http.patch(environment.api.products.updateLabel.replace('$labelId', labelId), payload);
    }

    public getSupplierProductCount(removedSuppliers: string[], labelId: string): Observable<SupplierProductCount> {
        return this.http
            .post(environment.api.products.getSupplierProductCount.replace('$labelId', labelId), removedSuppliers)
            .pipe(map((response: any) => response.data));
    }

    public syncScore(productId: string): Observable<any> {
        return this.http.get(environment.api.products.getReTriggerScore.replace('$productId', productId));
    }

    public getProductsCount(productId: string, scoreDeactivateType: string): Observable<any> {
        return this.http
            .get(
                environment.api.products.getProductsCount
                    .replace('$productId', productId)
                    .replace('$apiScoreDeactivateType', scoreDeactivateType)
            )
            .pipe(map(resp => resp['data']));
    }

    public getReactivateType(productId: string): Observable<any> {
        return this.http
            .get(environment.api.products.getReactivateOptions.replace('$productId', productId))
            .pipe(map(resp => resp['data']));
    }
    public getProductIntegrationLogData(payload: ISearchRequestPayload): Observable<any> {
        return this.http.post(environment.api.products.productIntegrationLogList, payload);
    }

    public getProductIntegrationLogFilters(payload: ISearchRequestPayload): Observable<IFilterTemplateData> {
        return this.http
            .post<any>(environment.api.products.productIntegrationLogFilters, payload)
            .pipe(map(resp => resp['data']));
    }

    public downloadProductLogData(productNumber: string): Observable<any> {
        const url = environment.api.products.downloadProductLog.replace('$productNumber', productNumber);
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public reRunProductIntegrationProcess(payload: IRerunIntegrationPayload): Observable<any> {
        const url = environment.api.products.reRunIntegrationProcess;
        return this.http.post(url, payload);
    }

    public getProductionIntegrationDetailData(productNumber: string): Observable<any> {
        return this.http
            .get(environment.api.products.getProductionIntegrationDetailData.replace('$productNumber', productNumber))
            .pipe(map(resp => resp['data']));
    }

    public downloadintegrationLogData(fileId: IDownloadFileRequestPayload): Observable<any> {
        return this.http.post(environment.api.products.getDownloadintegrationLogData, fileId, {
            responseType: 'blob' as 'blob'
        });
    }
}
