import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from '../../../../core/analytics/analytics.service';
import { UtilsService } from '../../../../shared/utils/utils.service';
import { environment } from '../../../../../environments/environment';
import { ProductsService } from '../../products.service';
import { IFilterTemplateData, ISearchRequestPayload } from '../../template.model';
import {
    IMiddlewareProductIntegrationData,
    IMiddlewareProductList,
    IRerunIntegrationPayload
} from '../integration.model';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { AuthService } from '../../../../../app/core';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
@Component({
    selector: 'app-integration-product-list',
    templateUrl: './integration-product-list.component.html',
    styleUrls: [
        './integration-product-list.component.scss',
        '../../finished-products-list/finished-products/finished-products.component.scss'
    ]
})
export class IntegrationProductListComponent implements OnInit {
    middlewareProductList: IMiddlewareProductIntegrationData;
    filters: IFilterTemplateData = null;
    pageLoading = true;
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    INTEGRATION_LOG_FILTER_KEY = `integration_status_filters`;
    INTEGRATION_LOG_SORT_KEY = `integration_status_sort`;
    INTEGRATION_LOG_SEARCH_KEY = `integration_status_search`;
    INTEGRATION_LOG_PAGINATION_KEY = `integration_status_pagination_count`;

    PAGINATION_SIZE = environment.DEFAULT_PAGINATION_SIZE;

    searchFormControl: FormControl = new FormControl(null);
    sortControl: FormControl = new FormControl('name');

    INTEGRATION_LOG_SEARCH_PAYLOAD: ISearchRequestPayload = {
        filter: null,
        pagination: {
            from: 0,
            size: this.PAGINATION_SIZE
        },
        sort: {
            sortBy: 'name',
            sortOrder: 'asc'
        }
    };

    paginationCount = 0;
    paginationEnd = false;
    env = environment;

    get hasIntegrationUpdateAccess(): boolean {
        return this.authService.haveAccess('PRODUCT_INTEGRATION_UPDATE');
    }

    constructor(
        private productService: ProductsService,
        private toastrService: CustomToastrService,
        private utilsService: UtilsService,
        private titleService: Title,
        private analyticsService: AnalyticsService,
        private router: Router,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.titleService.setTitle('TrusTrace | Integration Status');
        const searchSessionText = this.utilsService.getSessionStorageValue(this.INTEGRATION_LOG_SEARCH_KEY);
        this.paginationCount = this.utilsService.getSessionStorageValue(this.INTEGRATION_LOG_PAGINATION_KEY) || 0;
        this.searchFormControl.patchValue(searchSessionText ? searchSessionText : '');
        this.productService
            .constructSessionPayload(
                this.INTEGRATION_LOG_FILTER_KEY,
                this.INTEGRATION_LOG_SORT_KEY,
                this.INTEGRATION_LOG_SEARCH_KEY,
                this.INTEGRATION_LOG_PAGINATION_KEY
            )
            .then(requestPayload => {
                this.sortControl.patchValue(requestPayload.sort.sortBy);
                this.INTEGRATION_LOG_SEARCH_PAYLOAD = requestPayload;
                this.getProductIntegrationStatusList(false, false, this.getProductIntegrationLogFilters.bind(this));
            });
    }

    getSearchPayload(isPagination: boolean): ISearchRequestPayload {
        const pagination = {
            from: this.paginationCount * this.INTEGRATION_LOG_SEARCH_PAYLOAD.pagination.size,
            size: this.INTEGRATION_LOG_SEARCH_PAYLOAD.pagination.size
        };
        if (isPagination) {
            const reqPayload: ISearchRequestPayload = Object.assign({}, this.INTEGRATION_LOG_SEARCH_PAYLOAD);
            reqPayload.pagination = pagination;
            return reqPayload;
        } else {
            return this.INTEGRATION_LOG_SEARCH_PAYLOAD;
        }
    }

    getProductIntegrationLogFilters(isPagination: boolean = false): void {
        this.pageLoading = true;
        const filterPayload: ISearchRequestPayload = {
            ...this.getSearchPayload(isPagination),
            pagination: { from: 0, size: 10000 }
        };
        this.productService.getProductIntegrationLogFilters(filterPayload).subscribe(
            data => {
                this.filters = data;
                this.pageLoading = false;
            },
            () => {
                this.pageLoading = false;
                this.toastrService.error('Unable to load integration log filters', 'Server Error');
            }
        );
    }

    getProductIntegrationStatusList(
        isPagination: boolean = false,
        hardRefreshFilters: boolean = false,
        callback?: (isPagination: boolean) => void
    ): void {
        this.pageLoading = true;
        const payload: ISearchRequestPayload = this.getSearchPayload(isPagination);

        this.productService.getProductIntegrationLogData(payload).subscribe(
            data => {
                if (data?.data.searchResponse?.length === 0) {
                    this.paginationEnd = true;
                } else {
                    this.paginationEnd = false;
                }
                if (isPagination) {
                    this.middlewareProductList.searchResponse = data.data.searchResponse;
                } else {
                    this.middlewareProductList = data.data;
                    this.paginationCount =
                        this.utilsService.getSessionStorageValue(this.INTEGRATION_LOG_PAGINATION_KEY) || 0;
                }
                if (
                    callback &&
                    (data?.data.searchResponse?.length !== 0 || this.filters === null || hardRefreshFilters)
                ) {
                    callback(isPagination);
                } else {
                    this.pageLoading = false;
                }
            },
            () => {
                this.toastrService.error('Unable to fetch integration status data', 'Failed');
                this.pageLoading = false;
            }
        );
    }

    onSearch(): void {
        const freeHand: string = this.searchFormControl.value;
        if (typeof freeHand === 'string' && freeHand.length < 3 && freeHand.trim().length !== 0) {
            return;
        }
        if (freeHand && freeHand.trim() !== '') {
            this.INTEGRATION_LOG_SEARCH_PAYLOAD = {
                ...this.INTEGRATION_LOG_SEARCH_PAYLOAD,
                freeHand
            };
            this.utilsService.setSessionStorageValue(this.INTEGRATION_LOG_SEARCH_KEY, freeHand);
        } else {
            delete this.INTEGRATION_LOG_SEARCH_PAYLOAD.freeHand;
            this.utilsService.setSessionStorageValue(this.INTEGRATION_LOG_SEARCH_KEY, '');
        }
        this.analyticsService.trackEvent('Middle ware Product search', {
            'Action Performed': `Searched product with ${freeHand}`
        });
        this.getProductIntegrationStatusList(false, false, this.getProductIntegrationLogFilters.bind(this));
    }

    onPaginate(paginate: 'back' | 'forward'): void {
        switch (paginate) {
            case 'back':
                if (this.paginationCount !== 0) {
                    this.paginationCount -= 1;
                    this.utilsService.setSessionStorageValue(this.INTEGRATION_LOG_PAGINATION_KEY, this.paginationCount);
                    this.getProductIntegrationStatusList(true);
                }
                break;
            case 'forward':
                this.paginationCount += 1;
                this.utilsService.setSessionStorageValue(this.INTEGRATION_LOG_PAGINATION_KEY, this.paginationCount);
                this.getProductIntegrationStatusList(true);
                break;
            default:
                break;
        }
    }

    async onFilter(): Promise<void> {
        this.INTEGRATION_LOG_SEARCH_PAYLOAD = await this.productService.constructSessionPayload(
            this.INTEGRATION_LOG_FILTER_KEY,
            this.INTEGRATION_LOG_SORT_KEY,
            this.INTEGRATION_LOG_SEARCH_KEY,
            this.INTEGRATION_LOG_PAGINATION_KEY
        );
        this.getProductIntegrationStatusList();
    }

    onSort(): void {
        this.INTEGRATION_LOG_SEARCH_PAYLOAD.sort.sortBy = this.sortControl.value;
        this.utilsService.setSessionStorageValue(
            this.INTEGRATION_LOG_SORT_KEY,
            this.INTEGRATION_LOG_SEARCH_PAYLOAD.sort
        );
        this.getProductIntegrationStatusList(false, false, this.getProductIntegrationLogFilters.bind(this));
    }

    resetAllFilters(): void {
        delete this.INTEGRATION_LOG_SEARCH_PAYLOAD['filter'];
        this.utilsService.setSessionStorageValue(this.INTEGRATION_LOG_FILTER_KEY, {});
        this.getProductIntegrationStatusList(false, true, this.getProductIntegrationLogFilters.bind(this));
    }

    async refreshFilter(): Promise<void> {
        this.INTEGRATION_LOG_SEARCH_PAYLOAD = await this.productService.constructSessionPayload(
            this.INTEGRATION_LOG_FILTER_KEY,
            this.INTEGRATION_LOG_SORT_KEY,
            this.INTEGRATION_LOG_SEARCH_KEY,
            this.INTEGRATION_LOG_PAGINATION_KEY
        );
        this.getProductIntegrationLogFilters(false);
    }

    getValues(values: string[]): string {
        return values.join(', ');
    }

    isGroup(value): boolean {
        return value.type && value.type === 'group' ? true : false;
    }

    downloadData(productId: string): void {
        this.toastrService.info('Requesting file. Please wait');
        this.pageLoading = true;
        this.productService.downloadProductLogData(productId).subscribe(
            data => {
                this.pageLoading = false;
                const blob = new Blob([data], { type: environment.downloadFileType.json });
                saveAs(blob, 'middleware_product_' + productId);
            },
            () => {
                this.pageLoading = false;
                this.toastrService.error('Unable to download file', 'Server Error');
            }
        );
    }

    reRunProductIntegrationProcess(product: IMiddlewareProductList): void {
        this.pageLoading = true;
        const payload: IRerunIntegrationPayload = {
            module: 'PRODUCT',
            processor: 'RETRIGGER_INTEGRATION',
            company_id: product.id.split('_')[0],
            data: {
                product_numbers: [product.product_number]
            }
        };
        this.productService.reRunProductIntegrationProcess(payload).subscribe(
            () => {
                this.pageLoading = false;
                this.toastrService.success('Product retriggered successfully', 'Success');
            },
            () => {
                this.pageLoading = false;
                this.toastrService.error('Unable to retrigger product', 'Failed');
            }
        );
    }

    navigateToIntegrationDetailPage(productNumber: string): void {
        this.router.navigate(['/products/integration/detail'], {
            queryParams: { productNumber: productNumber }
        });
    }
}
