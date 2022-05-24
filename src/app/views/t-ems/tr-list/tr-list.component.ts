import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { forkJoin, Subscription } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { ContextService } from '../../../shared/context.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { TEmsService } from '../t-ems.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { SubscriptionType } from '../../../shared/multi-industry-support/application-menu.model';

@Component({
    selector: 'app-tr-list',
    templateUrl: './tr-list.component.html',
    styleUrls: ['./tr-list.component.scss']
})
export class TrListComponent implements OnInit, OnDestroy {
    public env = env;

    pageLoading = false;
    closeSortByFilter = false;
    totalCountFlag = false;
    refresh: Subscription;

    height = 200;
    totalCount = 0;

    searchText = '';
    filter_session = 't_ems_filters';
    sortby_session = 't_ems_sort';

    trList = [];

    filterOptions: any = {};
    trsFilters: any = {};
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    optionsParam = { key: 'id', value: 'value' };

    module = 'T_EMS';

    ANALYTICS_EVENT_T_EMS = 'T-EMS';
    ANALYTICS_ACTION_T_EMS_VIEWED = 'T-EMS Page Viewed';

    get isBrand(): boolean {
        return (this.authService.user.subscriptionType as SubscriptionType) === 'BRAND';
    }

    constructor(
        private titleService: Title,
        public utilsService: UtilsService,
        private appContext: ContextService,
        private trs: TEmsService,
        private commonServices: CommonServices,
        public authService: AuthService,
        private toastr: CustomToastrService,
        private router: Router,
        private analyticsService: AnalyticsService
    ) {
        this.titleService.setTitle('TrusTrace | Traceability Request');
        this.authService.getUser().subscribe(response => {
            this.authService.setUser(response);
        });
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 'ArrowRight':
                    this.onScroll('next');
                    break;
                case 'ArrowLeft':
                    this.onScroll('back');
                    break;
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        setTimeout(() => {
            this.height =
                document.getElementById('filter-bar-wrapper').offsetHeight +
                document.getElementById('tr-header').offsetHeight;
        }, 0);
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_T_EMS_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_EMS, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.trList = [];
                this.initialize();
            }
        });
    }
    initialize() {
        if (this.utilsService.getSessionStorageValue(this.sortby_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortby_session);
        } else {
            this.setSortByFilter();
        }

        const payload = this.getSearchPayload();
        this.pageLoading = true;
        forkJoin([this.trs.getFilters(payload), this.trs.getAllTrs(payload)]).subscribe(
            response => {
                const filtersData = response[0]['data'];
                const trData = response[1]['data'];
                this.processTRFilters(filtersData);
                this.processTRResponse(trData);
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
                }
                this.pageLoading = false;
            }
        );
    }

    removeSpace(key: any) {
        return 'T-EMS-' + key.replace(/ /g, '-');
    }

    refreshFilter() {
        this.fetchTRFilters(this.getSearchPayload());
    }

    setSortByFilter() {
        switch (this.sortByFilter.sortBy) {
            case 'entity_details.name':
                this.sortByFilter.sortOrder = 'asc';
                break;
            case 'create_ts':
                this.sortByFilter.sortOrder = 'desc';
                break;
            case 'certificate_status':
                this.sortByFilter.sortOrder = 'asc';
                break;
        }
        this.utilsService.setSessionStorageValue(this.sortby_session, this.sortByFilter);
    }

    processTRFilters(data: any) {
        this.trsFilters = data;
        for (const key in this.trsFilters) {
            if (this.trsFilters.hasOwnProperty(key)) {
                this.filterOptions[key] = [];
            }
        }
        this.updateFiltersSelection();
        this.pageLoading = false;
        this.onResize();
    }

    private fetchTRFilters(payload) {
        this.pageLoading = true;
        this.trs.getFilters(payload).subscribe(response => {
            this.processTRFilters(response['data']);
        });
    }

    processTRResponse(data: any) {
        if (data['searchResponse'].length > 0) {
            const _trList = [];
            data['searchResponse'].forEach(searchResult => {
                _trList.push(searchResult);
            });
            this.trList = JSON.parse(JSON.stringify(_trList));
        }
        this.totalCount = data.totalCount;
        this.pageLoading = false;
        if (Object.keys(this.filterOptions).length > 0) {
            this.onResize();
        }
    }

    getAllTrs() {
        this.pageLoading = true;
        const payload = this.getSearchPayload();
        this.trs.getAllTrs(payload).subscribe(
            response => {
                const data = response['data'];
                this.processTRResponse(data);
            },
            () => {
                this.toastr.error(
                    env.error_messages.could_not_fetch_data.message,
                    env.error_messages.could_not_fetch_data.title
                );
                this.pageLoading = false;
            }
        );
    }

    /*
     *@method lockOrUnlockEditRequest
     *Lock or Unlock T-Trace - API request
     */
    lockOrUnlockEditRequest(id: string, isLock: boolean): void {
        let apiRequest = isLock ? this.trs.lockTr(id) : this.trs.unlockTr(id);
        this.pageLoading = true;

        apiRequest.subscribe(
            () => {
                setTimeout(() => {
                    this.appContext.cardViewRefresh.next(true);
                    this.pageLoading = false;
                    let message = isLock
                        ? 'The T-EMS request locked successfully'
                        : 'The T-EMS request unlocked successfully';
                    this.toastr.success(message, 'Success');
                }, 1000);
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('Error in processing the request. Please try again after sometime.', 'Error');
            }
        );
    }

    getIconTooltipText(icon: string, isEditClosed: boolean): string {
        let text = '';

        switch (icon) {
            case 'edit':
                text = this.commonServices.getTranslation(
                    isEditClosed ? 'Editing option is disabled by the person who launched the request' : 'Edit Request'
                );
                break;
            case 'lock':
                if (isEditClosed && this.isBrand) {
                    text = this.commonServices.getTranslation('Unlock T-EMS');
                } else if (!isEditClosed && this.isBrand) {
                    text = this.commonServices.getTranslation('Lock T-EMS');
                } else if (!this.isBrand) {
                    text = this.commonServices.getTranslation('Only Brand can lock or unlock T-EMS');
                }
                break;
            default:
                break;
        }
        return text;
    }

    private getSearchPayload() {
        const payload = {
            filter: this.commonServices.getFilteredOptions(this.filter_session),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortby_session),
            pagination: this.pagination,
            module: this.module
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        return payload;
    }

    updateFiltersSelection() {
        this.filterOptions = this.utilsService.getSessionStorageValue(this.filter_session) || {};
    }

    resetPagination() {
        this.trList = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }

    handleSortBy() {
        this.setSortByFilter();
        this.closeSortByFilter = false;
        this.resetPagination();
        this.getAllTrs();
    }

    handleFilterSelection() {
        this.utilsService.setSessionStorageValue(this.filter_session, this.filterOptions);
        this.resetPagination();
        this.totalCountFlag = true;
        this.getAllTrs();
    }

    searchTR(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            this.analyticsSearchEnterPressed();
            this.resetPagination();
            this.totalCountFlag = true;
            this.getAllTrs();
        }
    }

    resetAllFilters() {
        this.filterOptions = {};
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchTRFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    onScroll(state: string) {
        const _paginationFrom = this.pagination.from;
        switch (state) {
            case 'back':
                if (this.pagination.from >= env.FETCH_SIZE) {
                    this.pagination.from = this.pagination.from - env.FETCH_SIZE;
                }
                break;
            case 'next':
                if (this.pagination.from + env.FETCH_SIZE <= this.totalCount) {
                    this.pagination.from = this.pagination.from + env.FETCH_SIZE;
                }
                break;
            default:
                this.toastr.error('The action you tried to perform is invalid.', 'Invalid action!');
                break;
        }
        if (_paginationFrom !== this.pagination.from) {
            this.getAllTrs();
        }
    }

    navigateTo(tr: any) {
        if (tr.tr_type === 'Product Evidence') {
            this.router.navigate(['/', 't-ems', 'product', 'evidencecollection', tr.id]);
        } else {
            this.router.navigate(['/', 't-ems', 'product', 'supplychain', tr.id]);
        }
    }

    analyticsFiltersClicked() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = 'Filters Selected';
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_EMS + '-Filters', analyticsOptions);
    }

    analyticsResetFiltersClicked() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = 'Reset Filters Clicked';
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_EMS + '-Filters', analyticsOptions);
    }

    analyticsSearchEnterPressed() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = 'Search Request Enter Pressed';
        analyticsOptions[this.analyticsService.SEARCH_TERM] = this.searchText;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_EMS + '-Search', analyticsOptions);
    }

    analyticsCardClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_EMS + ' Card#Clicked', analyticsOptions);
    }

    analyticsNewEvidenceCollectionRequest() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_EMS + ' New-Evidence-Collection-Request#Clicked',
            analyticsOptions
        );
    }
    ngOnDestroy() {
        if (this.refresh) {
            this.refresh.unsubscribe();
        }
    }

    navigateToEdit(id: string, isEdit: boolean): void {
        if (isEdit) {
            this.router.navigate(['/', 't-ems', 'product', 'evidencecollection', id, 'edit']);
        }
    }
}
