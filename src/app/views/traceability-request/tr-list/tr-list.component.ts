import { Router } from '@angular/router';
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core';
import { forkJoin, Subscription } from 'rxjs';
import { TraceabilityRequestService } from '../traceability-request.service';
import { ContextService } from '../../../shared/context.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { Title } from '@angular/platform-browser';
import { environment as env } from '../../../../environments/environment';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../../../shared/modals/confirmation-modal/confirmation-modal.component';
import { take } from 'rxjs/operators';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
@Component({
    selector: 'app-tr-list',
    templateUrl: './tr-list.component.html',
    styleUrls: ['./tr-list.component.scss']
})
export class TrListComponent implements OnInit, OnDestroy {
    public env = env;

    pageLoading = false;
    closeSortByFilter = false;
    disableInfiniteScroll = false;
    totalCountFlag = false;
    refresh: Subscription;
    height = 200;
    totalCount = 0;

    searchText = '';
    filter_session = 't_trace_filters';
    sortby_session = 't_trace_sort';

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
    module = 'T_TRACE';

    ANALYTICS_EVENT_T_TRACE = 'T-Trace';
    ANALYTICS_ACTION_T_TRACE_VIEWED = 'T-Trace Page Viewed';

    get userData(): any {
        return this.authService.user;
    }

    constructor(
        private titleService: Title,
        public utilsService: UtilsService,
        private appContext: ContextService,
        private trs: TraceabilityRequestService,
        private commonServices: CommonServices,
        private authService: AuthService,
        private toastr: CustomToastrService,
        private router: Router,
        private dialog: MatDialog,
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
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_T_TRACE_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_TRACE, analyticsOptions);
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
        return 'T-Trace-' + key.replace(/ /g, '-');
    }

    setSortByFilter() {
        switch (this.sortByFilter.sortBy) {
            case 'entity_details.name':
                this.sortByFilter.sortOrder = 'asc';
                break;
            case 'create_ts':
                this.sortByFilter.sortOrder = 'desc';
                break;
            case 'overall_supply_chain_tr_status':
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

    refreshFilter() {
        this.fetchTRFilters(this.getSearchPayload());
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

    //Get Icon tool tip text based on the condition
    getIconTooltipText(icon: string, isEditClosed: boolean): string {
        let text = '';

        switch (icon) {
            case 'archive':
                text = this.commonServices.getTranslation('Only requests initiated by you can be archived');
                break;
            case 'edit':
                text = this.commonServices.getTranslation(
                    isEditClosed ? 'Editing option is disabled by the person who launched the request' : 'Edit Request'
                );
                break;
            case 'lock':
                const isBrand = this.userData.subscriptionType === 'BRAND';
                if (isEditClosed && isBrand) {
                    text = this.commonServices.getTranslation('Unlock T-Trace');
                } else if (!isEditClosed && isBrand) {
                    text = this.commonServices.getTranslation('Lock T-Trace');
                } else if (!isBrand) {
                    text = this.commonServices.getTranslation('Only Brand can lock or unlock T-Trace');
                }
                break;
            default:
                break;
        }
        return text;
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
            this.router.navigate(['/', 't-trace', 'product', 'evidencecollection', tr.id, 'tree']);
        } else {
            this.router.navigate(['/', 't-trace', 'product', 'supplychain', tr.id, 'tree']);
        }
    }

    navigateToEdit(id: string, isEdit: boolean): void {
        if (isEdit) {
            this.router.navigate(['/', 't-trace', 'product', 'supplychain', id, 'edit']);
        }
    }

    archiveRequest(id: string): void {
        if (this.authService.haveAccess('TTRACE_ARCHIVE')) {
            const dialogRef = this.dialog.open(ConfirmationModalComponent, {
                width: '375px',
                data: {
                    groupId: id,
                    title: `Archive Request`,
                    description: `${this.commonServices.getTranslation(
                        'Are you sure you want to archive this T-Trace Request'
                    )}?`,
                    buttonName: 'Archive Request',
                    isEnable: true,
                    showClose: true
                }
            });
            dialogRef.componentInstance.handleDelete.pipe(take(1)).subscribe(() => {
                dialogRef.close();
                this.trs.archiveTr(id).subscribe(
                    () => {
                        this.removeTr(id);
                        this.toastr.success('The T-Trace Request archived successfully', 'Success');
                        setTimeout(() => {
                            this.pageLoading = true;
                            this.trList = [];
                            this.initialize();
                        }, 1000);
                    },
                    error => {
                        this.toastr.error('Unable to archive  T-Trace Request,Please try again', 'Error');
                    }
                );
            });
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    public removeTr = (trId: string): any => (this.trList = this.trList.filter(data => data.id !== trId));

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
                        ? 'The T-Trace has been locked successfully'
                        : 'The T-Trace has been unlocked successfully';
                    this.toastr.success(message, 'Success');
                }, 1000);
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('Error in processing the request. Please try again after sometime.', 'Error');
            }
        );
    }

    analyticsCardClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_TRACE + ' Card#Clicked', analyticsOptions);
    }

    analyticsFiltersClicked() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = 'Filters Selected';
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_TRACE + '-Filters', analyticsOptions);
    }

    analyticsResetFiltersClicked() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = 'Reset Filters Clicked';
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_TRACE + '-Filters', analyticsOptions);
    }

    analyticsSearchTyping() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = 'Search Request Typing';
        analyticsOptions[this.analyticsService.SEARCH_TERM] = this.searchText;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_TRACE + '-Search', analyticsOptions);
    }

    analyticsSearchEnterPressed() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = 'Search Request Enter Pressed';
        analyticsOptions[this.analyticsService.SEARCH_TERM] = this.searchText;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_TRACE + '-Search', analyticsOptions);
    }

    analyticsTreeViewIconClicked() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = 'Tree View Icon Clicked';
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_TRACE + ' Card Tree-View-Icon#Clicked',
            analyticsOptions
        );
    }

    analyticsNewTraceabilityRequestClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_TRACE + ' New-Traceability-Request#Clicked',
            analyticsOptions
        );
    }
    ngOnDestroy() {
        if (this.refresh) {
            this.refresh.unsubscribe();
        }
    }
}
