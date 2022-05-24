import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilterTemplateData, ISearchRequestPayload, IValue } from '../../template.model';
import { AnalyticsService } from './../../../../core/analytics/analytics.service';
import { IProductListTableData } from '../finished-product.model';
import { Title } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { UtilsService } from '../../../../shared/utils/utils.service';
import { ProductsService } from '../../products.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { ICustomFieldDisplay } from '../../../../shared/components/additional-information/additional-information.model';
import { ProductCommonComponent } from '../../product-common.component';

@Component({
    selector: 'app-finished-products',
    templateUrl: './finished-products.component.html',
    styleUrls: [
        '../../../../shared/ui-components/tt-table/tt-table.component.scss',
        './finished-products.component.scss'
    ]
})
export class FinishedProductsComponent extends ProductCommonComponent implements OnInit {
    productData: IProductListTableData;
    productFilters: IFilterTemplateData = null;
    pageLoading = true;
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    FILTER_SESSION = `products_filters`;
    SORT_SESSION = `products_sort`;
    SEARCH_SESSION = `products_search`;
    PAGINATION_SESSION = `products_pagination_count`;

    DEFAULT_PAGINATION_SIZE = environment.DEFAULT_PAGINATION_SIZE;

    searchFormControl: FormControl = new FormControl('');

    sortControl: FormControl = new FormControl('name');

    SEARCH_REQ_PAYLOAD: ISearchRequestPayload = {
        filter: null,
        pagination: {
            from: 0,
            size: this.DEFAULT_PAGINATION_SIZE
        },
        sort: {
            sortBy: 'name',
            sortOrder: 'asc'
        }
    };

    paginationCount = 0;
    paginationProgress = false;
    paginationEnd = false;

    customFieldDisplayList: ICustomFieldDisplay[];

    constructor(
        private productService: ProductsService,
        private toastr: CustomToastrService,
        private utils: UtilsService,
        private titleService: Title,
        private router: Router,
        private analyticsService: AnalyticsService
    ) {
        super();
    }

    ngOnInit() {
        this.titleService.setTitle(`TrusTrace | Products`);
        const searchSessionText = this.utils.getSessionStorageValue(this.SEARCH_SESSION);
        this.paginationCount = this.utils.getSessionStorageValue(this.PAGINATION_SESSION) || 0;
        this.searchFormControl.patchValue(searchSessionText ? searchSessionText : '');
        this.productService
            .constructSessionPayload(
                this.FILTER_SESSION,
                this.SORT_SESSION,
                this.SEARCH_SESSION,
                this.PAGINATION_SESSION
            )
            .then(payload => {
                if (payload.sort.sortBy === 'status') {
                    this.sortControl.patchValue(payload.sort.sortOrder === 'asc' ? 'active' : 'inactive');
                } else {
                    this.sortControl.patchValue(payload.sort.sortBy);
                }
                this.SEARCH_REQ_PAYLOAD = payload;
                this.getProducts(false, false, this.getFilters.bind(this));
            });
    }

    getSearchPayload(isPagination: boolean): ISearchRequestPayload {
        const pagination = {
            from: this.paginationCount * this.SEARCH_REQ_PAYLOAD.pagination.size,
            size: this.SEARCH_REQ_PAYLOAD.pagination.size
        };
        if (isPagination) {
            const reqPayload: ISearchRequestPayload = Object.assign({}, this.SEARCH_REQ_PAYLOAD);
            reqPayload.pagination = pagination;
            return reqPayload;
        } else {
            return this.SEARCH_REQ_PAYLOAD;
        }
    }

    getFilters(isPagination: boolean = false): void {
        this.pageLoading = true;

        const filtersPayload: ISearchRequestPayload = {
            ...this.getSearchPayload(isPagination),
            pagination: { from: 0, size: 10000 }
        };
        this.productService.getFinishedProductsFilters(filtersPayload).subscribe(
            data => {
                this.productFilters = data;
                this.pageLoading = false;
            },
            error => this.onHandleError(error, 'Unable to load filters data')
        );
    }

    getProducts(
        isPagination: boolean = false,
        hardRefreshFilters: boolean = false,
        callback?: (isPagination: boolean) => void
    ): any {
        this.pageLoading = true;
        const payload: ISearchRequestPayload = this.getSearchPayload(isPagination);

        this.productService
            .getFinishedProducts(payload)
            .pipe(take(1))
            .subscribe(
                data => {
                    if (data && data.data && data.data.length === 0) {
                        this.paginationEnd = true;
                    } else {
                        this.paginationEnd = false;
                    }
                    if (isPagination) {
                        this.productData.data = data.data;
                        this.paginationProgress = false;
                    } else {
                        this.productData = data;
                        this.paginationCount = this.utils.getSessionStorageValue(this.PAGINATION_SESSION) || 0;
                    }
                    if (data.customFieldDisplayList) {
                        this.customFieldDisplayList = data.customFieldDisplayList;
                    }
                    if (callback && (data.data.length !== 0 || this.productFilters === null || hardRefreshFilters)) {
                        callback(isPagination);
                    } else {
                        this.pageLoading = false;
                    }
                },
                error => this.onHandleError(error, 'Unable to load products data')
            );
    }

    onHandleError(error: any, customErrorMessage: string): void {
        if (error && error.error && error.error.message) {
            this.toastr.error(error.error.message, 'Error');
        } else {
            this.toastr.error(customErrorMessage, 'Error');
        }
        this.pageLoading = false;
        this.paginationProgress = false;
    }

    onSearch(): void {
        const freeHand: string = this.searchFormControl.value;
        if (typeof freeHand === 'string' && freeHand.length < 3 && freeHand.trim().length !== 0) return;
        if (freeHand && freeHand.trim() !== '') {
            this.SEARCH_REQ_PAYLOAD = {
                ...this.SEARCH_REQ_PAYLOAD,
                freeHand
            };
            this.utils.setSessionStorageValue(this.SEARCH_SESSION, freeHand);
        } else {
            delete this.SEARCH_REQ_PAYLOAD.freeHand;
            this.utils.setSessionStorageValue(this.SEARCH_SESSION, '');
        }
        this.analyticsService.trackEvent('Products', {
            'Action Performed': `Searched product with ${freeHand}`
        });
        this.getProducts(false, false, this.getFilters.bind(this));
    }

    onPaginate(paginate: 'back' | 'forward'): void {
        switch (paginate) {
            case 'back':
                if (!this.paginationProgress && this.paginationCount !== 0) {
                    this.paginationProgress = true;
                    this.paginationCount -= 1;
                    this.utils.setSessionStorageValue(this.PAGINATION_SESSION, this.paginationCount);
                    this.getProducts(true);
                }
                break;
            case 'forward':
                if (!this.paginationProgress) {
                    this.paginationProgress = true;
                    this.paginationCount += 1;
                    this.utils.setSessionStorageValue(this.PAGINATION_SESSION, this.paginationCount);
                    this.getProducts(true);
                }
                break;
            default:
                break;
        }
    }

    onFilter(): void {
        this.productService
            .constructSessionPayload(
                this.FILTER_SESSION,
                this.SORT_SESSION,
                this.SEARCH_SESSION,
                this.PAGINATION_SESSION
            )
            .then(payload => {
                this.SEARCH_REQ_PAYLOAD = payload;
                this.getProducts();
            });
    }

    onSort(): void {
        if (this.sortControl.value === 'active' || this.sortControl.value === 'inactive') {
            this.SEARCH_REQ_PAYLOAD.sort.sortBy = 'status';
            this.SEARCH_REQ_PAYLOAD.sort.sortOrder = this.sortControl.value === 'active' ? 'asc' : 'desc';
        } else {
            this.SEARCH_REQ_PAYLOAD.sort.sortBy = this.sortControl.value;
            this.SEARCH_REQ_PAYLOAD.sort.sortOrder = 'asc';
        }
        this.utils.setSessionStorageValue(this.SORT_SESSION, this.SEARCH_REQ_PAYLOAD.sort);
        this.utils.setSessionStorageValue(this.PAGINATION_SESSION, 0);
        this.getProducts(false, false, this.getFilters.bind(this));
    }

    resetAllFilters(): void {
        delete this.SEARCH_REQ_PAYLOAD['filter'];
        this.utils.setSessionStorageValue(this.FILTER_SESSION, {});
        this.utils.setSessionStorageValue(this.PAGINATION_SESSION, 0);
        this.SEARCH_REQ_PAYLOAD.pagination.from = 0;
        this.getProducts(false, true, this.getFilters.bind(this));
    }

    refreshFilter(): void {
        this.productService
            .constructSessionPayload(
                this.FILTER_SESSION,
                this.SORT_SESSION,
                this.SEARCH_SESSION,
                this.PAGINATION_SESSION
            )
            .then(payload => {
                this.SEARCH_REQ_PAYLOAD = payload;
                this.getFilters(false);
            });
    }

    getValues(obj: IValue[]): string {
        return obj.map(s => s.value).join(', ');
    }

    isGroup(value): boolean {
        return value.type && value.type === 'group' ? true : false;
    }

    navigateToProductDetailPage(item: any, sortId: string[]) {
        const productId = item.companyId + '_' + item.product.id;
        this.analyticsService.trackEvent('Navigate to Product Detail Page', {
            'Action Performed': `Clicked on product with id ${item.product.id}`
        });
        if (sortId && sortId.length > 0) {
            this.router.navigate(['/products/finished', productId], { queryParams: { searchAfter: sortId } });
        } else {
            this.router.navigate(['/products/finished', productId]);
        }
    }

    simulateBtnClicked(): void {
        this.analyticsService.trackEvent('Simulate button clicked', {
            'Action Performed': 'Simulate button clicked by RETAILER'
        });
    }
}
