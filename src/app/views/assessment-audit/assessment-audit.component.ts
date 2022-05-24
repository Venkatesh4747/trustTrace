import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { forkJoin, Subscription } from 'rxjs';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { environment as env } from '../../../environments/environment';
import { AuthService } from '../../core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { DataExportEntity, IndexTypeMapper } from '../../shared/const-values';
import { ContextService } from '../../shared/context.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { AuditService } from '../user/settings/company/audit.service';
import { extractionStatus, IExtractionStatus } from './assessment-audit.const';
import { AssessmentAuditService } from './assessment-audit.service';
import { ViewAuditExtractedComponent } from './view-audit-extracted/view-audit-extracted.component';
import { HiggModalComponent } from '../../shared/modals/higg-modal/higg-modal.component';
import { HiggService } from '../../shared/commonServices/higg.service';
import { LongRunningTaskService, payloadType } from '../../shared/commonServices/longRunningTask.service';
import { HttpResponse } from '@angular/common/http';
import { ISyncAuditHttpResponse } from '../../shared/models/higg.model';

const moment = _rollupMoment || _moment;

@Component({
    selector: 'app-assessments',
    templateUrl: './assessment-audit.component.html',
    styleUrls: ['./assessment-audit.component.scss']
})
export class AssessmentAuditComponent implements OnInit, OnDestroy {
    public env = env;
    public moment = moment;
    refresh: Subscription;

    height = 200;
    totalCount = 0;
    filter_session = 'audits_filters';
    sortby_session = 'audits_sort';
    searchText = '';
    isLinear = false;
    pageLoading = true;
    closeSortByFilter = false;
    // totalCountFlag = false;
    audits = [];
    drafts = [];
    filterOptions: any = {};
    auditsFilters: any = {};
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };

    draftsPagination = {
        from: 0,
        size: env.FETCH_SIZE
    };

    optionsParam = { key: 'id', value: 'value' };
    filterPromise;
    isProcessing = false;
    isDataAvailable = false;
    tabDetail = 'Audits';

    DRAFTS_TAB_NAME = 'Drafts';
    AUDITS_TAB_NAME = 'Audits';
    notificationCount = 0;
    private EXCEL_FILENAME = 'New audit info with subcategory.xlsx';
    canEnableHiggSync = true;
    canShowDisabledTooltip = false;
    higgLongRunningSubscription$: Subscription;
    asynHiggLongRunningPayload: payloadType = {
        status: ['IN_PROGRESS'],
        taskType: ['HIGG_DATA_INTEGRATION_FEM', 'HIGG_DATA_INTEGRATION_FSLM']
    };

    constructor(
        private toastr: CustomToastrService,
        private assessmentAuditService: AssessmentAuditService,
        private utilsService: UtilsService,
        private analyticsService: AnalyticsService,
        private localizationService: LocalizationService,
        private titleService: Title,
        private appContext: ContextService,
        private commonServices: CommonServices,
        private auditService: AuditService,
        private dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private auth: AuthService,
        private higgService: HiggService,
        private longRunningTaskService: LongRunningTaskService
    ) {
        this.titleService.setTitle('TrusTrace | Audit');
        this.analyticsService.trackEvent('Assessment Audit Page', { Action: 'Assessment audit page visited' });
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 'ArrowRight':
                    this.tabDetail === this.DRAFTS_TAB_NAME ? this.onDraftScroll('next') : this.onScroll('next');
                    break;
                case 'ArrowLeft':
                    this.tabDetail === this.DRAFTS_TAB_NAME ? this.onDraftScroll('back') : this.onScroll('back');
                    break;
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.height =
            document.getElementById('filter-bar-wrapper').offsetHeight +
            document.getElementById('audits-header').offsetHeight;
    }

    get authServiceHaveAccess(): (accessType: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    ngOnInit() {
        this.longPollingApiInvoke();

        this.activatedRoute.fragment.subscribe(fragment => {
            this.resetDraftsNotificationCount();
            this.pagination = {
                from: 0,
                size: env.FETCH_SIZE
            };
            if (fragment) {
                this.changeTab(fragment);
            } else {
                this.tabDetail = this.AUDITS_TAB_NAME;
                this.initAudits();
            }
        });
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.audits = [];
                this.initAudits();
            }
        });
    }

    removeSpace(key: any) {
        return 'assessment-audit-' + key.replace(/ /g, '-');
    }

    resetDraftsNotificationCount() {
        this.auditService.getFacilityAuditDrafts(this.formVerificationPendingCountPayload()).subscribe(response => {
            this.notificationCount = response.totalCount;
        });
    }

    fetchAuditFilters(payload) {
        this.pageLoading = true;
        this.assessmentAuditService.getAuditsFilter(payload).subscribe((response: any) => {
            this.auditsFilters = response['data'];
            setTimeout(() => {
                this.height =
                    document.getElementById('filter-bar-wrapper').offsetHeight +
                    document.getElementById('audits-header').offsetHeight;
            }, 0);
            this.pageLoading = false;
        });
    }

    initAudits() {
        this.pageLoading = true;
        this.analyticsService.trackEvent('Assessment Audit Page - Audit Tab', {
            Action: 'Assessment audit page audits tab visited'
        });
        if (this.utilsService.getSessionStorageValue(this.sortby_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortby_session);
        } else {
            this.setSortByFilter();
        }
        const payload = this.formPayload();
        forkJoin([
            this.assessmentAuditService.getAuditsFilter(),
            this.assessmentAuditService.getAudits(payload)
        ]).subscribe(
            response => {
                this.auditsFilters = response[0]['data'];
                this.processAuditsResponse(response[1]['data']);
                this.onResize();
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                }
                this.pageLoading = false;
            }
        );
    }

    initAuditFilter() {
        this.assessmentAuditService.getAuditsFilter().subscribe((response: any) => {
            this.auditsFilters = response['data'];
        });
    }
    formPayload() {
        this.pageLoading = true;
        const payload = {
            filter: this.commonServices.getFilteredOptions(this.filter_session),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortby_session),
            pagination: this.pagination
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        if (this.sortByFilter.sortBy === 'name') {
            this.sortByFilter.sortOrder = 'asc';
        }
        if (this.sortByFilter.sortBy === 'create_ts') {
            this.sortByFilter.sortOrder = 'desc';
        }
        return payload;
    }

    processAuditsResponse(data: any) {
        this.audits = [];
        this.drafts = [];
        this.localizationService.addToMasterData(data['masterData']);
        if (data['searchResponse'].length > 0) {
            data['searchResponse'].forEach(searchResult => {
                if (this.tabDetail === this.AUDITS_TAB_NAME) {
                    if (this.audits === undefined) {
                        this.audits = [];
                    }
                    this.audits.push(searchResult);
                } else {
                    if (this.drafts === undefined) {
                        this.drafts = [];
                    }
                    this.drafts.push(searchResult);
                }
                this.isDataAvailable = true;
            });
        }
        this.totalCount = data.totalCount;
        this.closeSortByFilter = false;
        this.pageLoading = false;
    }

    getAllAudits() {
        if (this.tabDetail === this.AUDITS_TAB_NAME) {
            const payload = this.formPayload();
            // Get all Audits
            this.assessmentAuditService.getAudits(payload).subscribe(response => {
                this.processAuditsResponse(response['data']);
                this.onResize();
            });
        } else {
            this.getFacilityAuditDrafts();
        }
    }

    setSortByFilter() {
        if (this.sortByFilter.sortBy === 'name') {
            this.sortByFilter.sortOrder = 'asc';
        }
        if (this.sortByFilter.sortBy === 'create_ts') {
            this.sortByFilter.sortOrder = 'desc';
        }
        this.utilsService.setSessionStorageValue(this.sortby_session, this.sortByFilter);
    }

    private getSearchPayload() {
        const payload = {
            filter: this.commonServices.getFilteredOptions(this.filter_session),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortby_session),
            pagination: this.pagination
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        return payload;
    }

    getDate(date_val) {
        return this.utilsService.getDate(date_val);
    }

    // Edit an audit
    editAudit(auditId) {
        if (this.authServiceHaveAccess('AUDIT_UPDATE')) {
            this.router.navigate(['/assessment-audit', auditId, 'edit']);
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    // Delete an audit
    deleteAudit(auditId, index) {
        if (this.authServiceHaveAccess('AUDIT_ARCHIVE')) {
            this.assessmentAuditService.deleteAudit(auditId).subscribe(
                () => {
                    this.audits.splice(index, 1);
                    this.totalCount--;
                    setTimeout(() => {
                        this.fetchAuditFilters(this.getSearchPayload());
                    }, 2000);
                    this.analyticsService.trackEvent('Assessment Audit Page', {
                        AuditId: auditId,
                        Action: 'Audit Removed'
                    });
                    this.toastr.success('Audit Removed', 'Success');
                },
                () => {
                    this.toastr.error('Audit could not be removed.', 'Error');
                }
            );
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    deleteDraft(draft, index) {
        if (this.authServiceHaveAccess('AUDIT_DRAFT_ARCHIVE')) {
            this.assessmentAuditService.deleteDraft(draft.id).subscribe(
                () => {
                    this.drafts.splice(index, 1);
                    this.totalCount--;
                    this.analyticsService.trackEvent('Assessment Audit Page - Drafts Tab', {
                        DraftId: draft.id,
                        Action: `Audit Draft with id ${draft.id} Removed`
                    });
                    this.toastr.success('Audit Draft Removed', 'Success');
                    if (draft.status === 20 || draft.status === 30) {
                        this.notificationCount -= 1;
                    }
                },
                () => {
                    this.toastr.error('Audit Draft could not be removed.', 'Error');
                }
            );
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
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
            this.getAllAudits();
        }
    }

    refreshFilter() {
        this.fetchAuditFilters(this.getSearchPayload());
    }

    onDraftScroll(state: string) {
        const _paginationFrom = this.draftsPagination.from;
        switch (state) {
            case 'back':
                if (this.draftsPagination.from >= env.FETCH_SIZE) {
                    this.draftsPagination.from = this.draftsPagination.from - env.FETCH_SIZE;
                }
                break;
            case 'next':
                if (this.draftsPagination.from + env.FETCH_SIZE <= this.totalCount) {
                    this.draftsPagination.from = this.draftsPagination.from + env.FETCH_SIZE;
                }
                break;
            default:
                this.toastr.error('The action you tried to perform is invalid.', 'Invalid action!');
                break;
        }
        if (_paginationFrom !== this.pagination.from) {
            this.getAllAudits();
        }
    }

    resetPagination() {
        if (this.tabDetail === this.AUDITS_TAB_NAME) {
            this.audits = [];
            this.pagination = {
                from: 0,
                size: env.FETCH_SIZE
            };
        } else if (this.tabDetail === this.DRAFTS_TAB_NAME) {
            this.drafts = [];
            this.draftsPagination = {
                from: 0,
                size: env.FETCH_SIZE
            };
        }
    }

    handleSortBy() {
        this.setSortByFilter();
        this.resetPagination();
        this.getAllAudits();
    }

    updateFiltersSelection() {
        return this.utilsService.getSessionStorageValue(this.filter_session);
    }

    handleFilterSelection() {
        this.resetPagination();
        // this.totalCountFlag = true;
        this.getAllAudits();
    }

    searchAudit(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.resetPagination();
            // this.totalCountFlag = true;
            this.getAllAudits();
        }
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchAuditFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    downloadAuditDataAsExcel() {
        this.isProcessing = true;
        const filterOption = this.commonServices.getFilteredOptions(this.filter_session);

        const payload = {
            entity: DataExportEntity.AUDIT,
            filter: filterOption,
            type: IndexTypeMapper.FACILITY_AUDIT
        };
        this.commonServices.exportDataAsExcel(payload).subscribe(
            (response: any) => {
                this.isProcessing = false;
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, this.EXCEL_FILENAME);
            },
            error => {
                this.onDownloadErrorHandle(error);
            }
        );
    }

    private onDownloadErrorHandle(data: any): void {
        if (data.hasOwnProperty('error') && data.error.hasOwnProperty('error')) {
            this.toastr.error(`Failed to download file. Error: ${data.error.error}`);
        } else {
            this.toastr.error(`Failed to download file. Please try again later.`);
        }
        this.isProcessing = false;
    }

    formDraftsPayload() {
        this.pageLoading = true;
        return {
            filter: { Status: [10, 20, 30] },
            sort: {
                sortBy: 'create_ts',
                sortOrder: 'desc'
            },
            pagination: this.draftsPagination
        };
    }

    formVerificationPendingCountPayload() {
        return {
            filter: { Status: [20, 30] },
            pagination: {
                from: 0,
                size: 0
            }
        };
    }

    getFacilityAuditDrafts() {
        this.pageLoading = true;
        const payload = this.formDraftsPayload();
        this.auditService.getFacilityAuditDrafts(payload).subscribe(response => {
            this.processAuditsResponse(response);
            this.onResize();
        });
    }

    getExtractionStatus(statusCode: IExtractionStatus): string {
        switch (statusCode) {
            case extractionStatus.EXTRACTION_PENDING:
                return 'Extraction in progress';
            case extractionStatus.VERIFICATION_PENDING:
                return 'Verification Pending';
            case extractionStatus.FAILED:
                return 'Extraction Failed';
            case extractionStatus.COMPLETED:
                return 'Completed';
            case extractionStatus.DELETED:
                return 'Deleted';
            default:
                return 'Invalid status';
        }
    }

    getStatusColor(statusCode: IExtractionStatus): { [key: string]: boolean } {
        return {
            'extraction-pending': statusCode === extractionStatus.EXTRACTION_PENDING,
            'verification-pending': statusCode === extractionStatus.VERIFICATION_PENDING,
            'extraction-failed': statusCode === extractionStatus.FAILED,
            'extraction-completed': statusCode === extractionStatus.COMPLETED,
            'extraction-deleted': statusCode === extractionStatus.DELETED
        };
    }

    routeToTab(tabName) {
        if (tabName === this.tabDetail) {
            return 0;
        }
        this.audits = [];
        if (tabName === this.AUDITS_TAB_NAME) {
            this.router.navigate(['/assessment-audit']);
        } else {
            this.router.navigate(['/assessment-audit'], { fragment: tabName });
        }
    }

    changeTab(tabName: string) {
        this.tabDetail = tabName;
        this.resetPagination();
        if (tabName === this.DRAFTS_TAB_NAME) {
            this.getFacilityAuditDrafts();
        } else if (tabName === this.AUDITS_TAB_NAME) {
            this.audits = [];
            this.initAudits();
        }
    }

    openExtractedFile(id: string, statusCode: IExtractionStatus, $event) {
        if ($event.target.nodeName === 'IMG') {
            return;
        }
        switch (statusCode) {
            case extractionStatus.COMPLETED:
                return this.toastr.success('Audit Already Created', 'Success');
            case extractionStatus.DELETED:
                return this.toastr.error('Draft is already deleted', 'Error');
            case extractionStatus.EXTRACTION_PENDING:
                return this.toastr.info('Extraction still in progress please try after some time', 'Info');
            // case extractionStatus.FAILED:
            //     return this.toastr.info('Extraction failed please enter data manually', 'Info');
        }

        this.dialog.open(ViewAuditExtractedComponent, {
            width: '100vw',
            data: {
                auditId: id
            }
        });
    }
    ngOnDestroy() {
        if (this.refresh) {
            this.refresh.unsubscribe();
        }

        if (this.higgLongRunningSubscription$) {
            this.higgLongRunningSubscription$.unsubscribe();

            this.longRunningTaskService.destroy.next();
            this.longRunningTaskService.destroy.complete();
        }
    }

    private showSyncAuditData(): void {
        const higgModal = this.dialog.open(HiggModalComponent, {
            width: '370px',
            height: '240px',
            data: {
                type: 'mappModal',
                btnType: 'primary',
                eventType: 'sync audit',
                title: 'Fetching Assessments...',
                description: `The platform is fetching Assessments from Higg, once after successful completion you will receive an email confirmation.`
            }
        });

        higgModal.afterClosed().subscribe(() => {
            this.initAudits();
        });
    }

    private syncAuditData(): void {
        this.pageLoading = true;
        this.higgService.syncAuditData().subscribe(
            (syncAuditResponse: HttpResponse<ISyncAuditHttpResponse>) => {
                this.pageLoading = false;
                const responseBody = syncAuditResponse.body.data;
                const errorMsg = responseBody.hasOwnProperty('errors')
                    ? responseBody.errors.message
                    : 'Error fetching data.';

                if (
                    (syncAuditResponse.status === 202 || syncAuditResponse.status === 200) &&
                    !responseBody.hasOwnProperty('errors')
                ) {
                    this.showSyncAuditData();
                    return;
                }

                this.canEnableHiggSync = true;
                this.pageLoading = false;
                this.toastr.error(errorMsg, 'Error');
            },
            errorResponse => {
                this.pageLoading = false;
                this.toastr.error('Error fetching data.', 'Error');
            }
        );
    }

    togglePopOverHandler(showPopover: boolean): void {
        this.canShowDisabledTooltip = showPopover;
    }

    private triggerHiggSyncLongRunningTask(): void {
        const intervalTimer = 10000;
        this.higgLongRunningSubscription$ = this.longRunningTaskService
            .initLongRunningTask(this.asynHiggLongRunningPayload, intervalTimer)
            .subscribe(
                (apiResponse: boolean) => {
                    this.canEnableHiggSync = !apiResponse;
                },
                errorResp => {
                    this.canEnableHiggSync = true;
                    this.toastr.error('Error fetching data.', 'Error');
                }
            );
    }

    longPollingApiInvoke(verifyOnClick = false): void {
        if ((!this.canEnableHiggSync && verifyOnClick) || !this.authServiceHaveAccess('HIGG_READ')) return;

        if (verifyOnClick) {
            //async operation will run in background.
            //if the sync btn is clicked, it will run
            //parallely irrespective of async call
            this.canEnableHiggSync = false;
            this.syncAuditData();
            return;
        }

        this.triggerHiggSyncLongRunningTask();
    }
}
