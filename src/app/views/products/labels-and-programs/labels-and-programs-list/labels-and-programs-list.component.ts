import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilterTemplateData, ISearchRequestPayload } from '../../template.model';
import { AnalyticsService } from './../../../../core/analytics/analytics.service';

import { Title } from '@angular/platform-browser';
import { UtilsService } from '../../../../shared/utils/utils.service';

import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

import { AuthService } from '../../../../../app/core';
import { CommonServices } from '../../../../shared/commonServices/common.service';
import { ProductsService } from '../../products.service';
import { ILabelListTableData } from '../labels-and-program.model';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-label-program',
    templateUrl: './labels-and-programs-list.component.html',
    styleUrls: ['./labels-and-programs-list.component.scss']
})
export class LabelsAndProgramsListComponent implements OnInit {
    labelData: ILabelListTableData;
    filters: IFilterTemplateData = null;
    pageLoading = true;
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    FILTER_SESSION = `labels_filters`;
    SORT_SESSION = `labels_sort`;
    SEARCH_SESSION = `labels_search`;
    PAGINATION_SESSION = `labels_pagination_count`;

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

    get hasLabelEditAccess(): boolean {
        return this.authService.haveAccess('LABELS_AND_PROGRAMS_UPDATE');
    }

    paginationCount = 0;
    paginationProgress = false;
    paginationEnd = false;
    env = environment;

    constructor(
        private productService: ProductsService,
        private toastr: CustomToastrService,
        private utils: UtilsService,
        private titleService: Title,
        private router: Router,
        private analyticsService: AnalyticsService,
        private authService: AuthService,
        private commonService: CommonServices
    ) {}

    ngOnInit(): void {
        this.titleService.setTitle(`TrusTrace | Labels and Programs`);
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
                this.sortControl.patchValue(payload.sort.sortBy);
                this.SEARCH_REQ_PAYLOAD = payload;
                this.getLabelsAndPrograms(false, false, this.getFilters.bind(this));
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
        this.productService.getLabelsAndProgramsFilters(filtersPayload).subscribe(
            data => {
                this.filters = data;
                this.pageLoading = false;
            },
            error => this.onHandleError(error, 'Unable to load filters data')
        );
    }

    getLabelsAndPrograms(
        isPagination: boolean = false,
        hardRefreshFilters: boolean = false,
        callback?: (isPagination: boolean) => void
    ): any {
        this.pageLoading = true;
        const payload: ISearchRequestPayload = this.getSearchPayload(isPagination);

        this.productService.getLabelsAndPrograms(payload).subscribe(
            data => {
                if (data?.data.searchResponse?.length === 0) {
                    this.paginationEnd = true;
                } else {
                    this.paginationEnd = false;
                }
                if (isPagination) {
                    this.labelData.searchResponse = data.data.searchResponse;
                    this.paginationProgress = false;
                } else {
                    this.labelData = data.data;
                    this.paginationCount = this.utils.getSessionStorageValue(this.PAGINATION_SESSION) || 0;
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
            error => this.onHandleError(error, 'Unable to load labels data')
        );
    }

    onHandleError(error: any, customErrorMessage: string): void {
        if (error?.error?.message) {
            this.toastr.error(error.error.message, 'Error');
        } else {
            this.toastr.error(customErrorMessage, 'Error');
        }
        this.pageLoading = false;
        this.paginationProgress = false;
    }

    onSearch(): void {
        const freeHand: string = this.searchFormControl.value;
        if (typeof freeHand === 'string' && freeHand.length < 3 && freeHand.trim().length !== 0) {
            return;
        }
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
        this.analyticsService.trackEvent('Labels', {
            'Action Performed': `Searched label with ${freeHand}`
        });
        this.getLabelsAndPrograms(false, false, this.getFilters.bind(this));
    }

    onPaginate(paginate: 'back' | 'forward'): void {
        switch (paginate) {
            case 'back':
                if (!this.paginationProgress && this.paginationCount !== 0) {
                    this.paginationProgress = true;
                    this.paginationCount -= 1;
                    this.utils.setSessionStorageValue(this.PAGINATION_SESSION, this.paginationCount);
                    this.getLabelsAndPrograms(true);
                }
                break;
            case 'forward':
                if (!this.paginationProgress) {
                    this.paginationProgress = true;
                    this.paginationCount += 1;
                    this.utils.setSessionStorageValue(this.PAGINATION_SESSION, this.paginationCount);
                    this.getLabelsAndPrograms(true);
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
                this.getLabelsAndPrograms();
            });
    }

    onSort(): void {
        if (this.sortControl.value === 'name') {
            this.SEARCH_REQ_PAYLOAD.sort.sortOrder = 'asc';
        } else if (this.sortControl.value === 'create_ts') {
            this.SEARCH_REQ_PAYLOAD.sort.sortOrder = 'desc';
        }
        this.SEARCH_REQ_PAYLOAD.sort.sortBy = this.sortControl.value;
        this.utils.setSessionStorageValue(this.SORT_SESSION, this.SEARCH_REQ_PAYLOAD.sort);
        this.utils.setSessionStorageValue(this.PAGINATION_SESSION, 0);
        this.getLabelsAndPrograms(false, false, this.getFilters.bind(this));
    }

    resetAllFilters(): void {
        delete this.SEARCH_REQ_PAYLOAD['filter'];
        this.utils.setSessionStorageValue(this.FILTER_SESSION, {});
        this.utils.setSessionStorageValue(this.PAGINATION_SESSION, 0);
        this.getLabelsAndPrograms(false, true, this.getFilters.bind(this));
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

    getValues(supplierList: string[], labelType: string): string {
        if (labelType === 'General') {
            return this.commonService.getTranslation(supplierList.join(', '));
        } else {
            return supplierList.join(', ');
        }
    }

    isGroup(value): boolean {
        return value.type && value.type === 'group' ? true : false;
    }

    navigateToLabelUpdatePage(labelId: string): void {
        this.analyticsService.trackEvent('Navigate to label update Page', {
            'Action Performed': `Clicked on label with id ${labelId}`
        });
        this.router.navigate(['/products/labels/update', labelId]);
    }
}
