import { AnalyticsService } from './../../core/analytics/analytics.service';
import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { forkJoin, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContextService } from '../..//shared/context.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { IEvidence, IEvidenceTableDetail, INotificationDetail } from './evidence.model';
import { EvidenceService } from './evidence.service';
import { UploadEvidenceComponent } from './upload-evidence/upload-evidence.component';
import FileSaver from 'file-saver';

import { SubmitErrorPopupComponent } from '../transactions/submit-error-popup/submit-error-popup.component';
import { ConfirmDialogComponent } from '../../shared/modals/confirm-dialog/confirm-dialog.component';
import { TcApprovalFlowComponent } from '../task-manager/tc-approval-flow/tc-approval-flow.component';
import { TransactionsService } from '../transactions/transactions.service';
import { ScopeCertificatesService } from '../scope-certificates/scope-certificates.service';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { AuthService } from '../../core/user/auth.service';
@Component({
    selector: 'app-evidence',
    templateUrl: './evidence.component.html',
    styleUrls: ['./evidence.component.scss']
})
export class EvidenceComponent implements OnInit {
    env = environment;

    tabs = ['All Transaction Certificate', 'TC Status'];
    // tabs = ['Transaction Certificate'];
    evidences: IEvidenceTableDetail[] = [];
    activeTab = this.tabs[0];
    userSelectedEvidences: string[] = [];
    deleteErrorDialogClass = 'delete-evidence-error-dialog';

    isEvidenceAvailable = true;
    pageLoading = true;
    fetchingEvidencesData = true;
    disableInfiniteScroll = true;
    closeSortByFilter = false;
    totalCountFlag = false;

    FETCH_SIZE = 50;
    totalCount = 0;
    height = 200;

    evidenceFilters: any = {};
    sortByFilter = {
        sortBy: 'update_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: this.FETCH_SIZE
    };

    refresh: Subscription;

    searchText = '';
    filter_session = 'evidences_filters';
    sortBy_session = 'evidences_sort';
    ANALYTICS_EVENT_EVIDENCES = 'Evidences';
    ANALYTICS_ACTION_EVIDENCES_VIEWED = 'Evidences Page Viewed';

    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    notificationDetail: INotificationDetail = {
        isValid: true,
        message: ''
    };

    get checkAccess(): (name: string) => boolean {
        return this.authService.haveAccess.bind(this.authService);
    }

    constructor(
        private evidenceService: EvidenceService,
        private utilsService: UtilsService,
        private titleService: Title,
        private appContext: ContextService,
        private toastr: CustomToastrService,
        private commonServices: CommonServices,
        private dialog: MatDialog,
        private analyticsService: AnalyticsService,
        private transactionsService: TransactionsService,
        private scService: ScopeCertificatesService,
        private authService: AuthService
    ) {
        this.titleService.setTitle('TrusTrace | Evidence');
    }

    ngOnInit() {
        this.pageLoading = false;
        this.navigateTo(this.tabs[0]);

        const notificationDetailPayload = {
            module: 'TT_DOCUMENT_TRANSFORMED',
            certType: 'TC'
        };

        this.transactionsService.getNotificationDetail(notificationDetailPayload).subscribe(data => {
            if (data) {
                this.notificationDetail = data;
            }
        });

        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_EVIDENCES_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_EVIDENCES, analyticsOptions);
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.evidences = [];
                this.initialize();
            }
        });
    }

    private fetchEvidenceFilters(payload) {
        this.pageLoading = true;
        this.disableInfiniteScroll = true;
        this.evidenceService.getEvidencesFilter(payload).subscribe(response => {
            this.processEvidencesFilters(response['data']);
        });
    }

    initialize() {
        this.evidences = [];
        this.fetchingEvidencesData = true;
        if (this.utilsService.getSessionStorageValue(this.sortBy_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortBy_session);
        } else {
            this.setSortByFilter();
        }
        const payload = this.getSearchPayload();
        forkJoin([
            this.evidenceService.getEvidencesFilter(payload),
            this.evidenceService.getEvidences(payload)
        ]).subscribe(response => {
            const filtersData = response[0]['data'];
            const evidencesData = response[1]['data'];
            this.processEvidencesFilters(filtersData);
            this.processEvidencesResponse(evidencesData);
        });
    }

    initializeStatusTab() {
        this.evidences = [];
        this.fetchingEvidencesData = true;
        if (this.utilsService.getSessionStorageValue(this.sortBy_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortBy_session);
        } else {
            this.setSortByFilter();
        }
        let payload = this.getSearchPayload();
        payload['filter']['Workflow Status'] = ['Pending', 'Rejected'];
        payload['filter']['Status'] = ['ACTIVE'];
        forkJoin([
            this.evidenceService.getEvidencesFilter(payload),
            this.evidenceService.getEvidences(payload)
        ]).subscribe(response => {
            const filtersData = response[0]['data'];
            const evidencesData = response[1]['data'];
            this.processEvidencesFilters(filtersData);
            this.processEvidencesResponse(evidencesData);
        });
    }

    onScroll(state: string) {
        switch (state) {
            case 'back':
                if (this.pagination.from >= this.FETCH_SIZE) {
                    this.pagination.from = this.pagination.from - this.FETCH_SIZE;
                }
                break;
            case 'next':
                this.pagination.from = this.pagination.from + this.FETCH_SIZE;
                break;
            default:
                console.log('Pagination: Unknown state');
                break;
        }
    }

    handleFilterSelection() {
        this.resetPagination();
        this.getAllEvidences();
    }

    handleCancelClick() {
        this.userSelectedEvidences = [];
    }

    refreshFilter() {
        this.fetchEvidenceFilters(this.getSearchPayload());
    }

    getSearchPayload() {
        const payload = {
            filter: this.getFilteredOptions(),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortBy_session),
            pagination: this.pagination
        };

        payload.filter['Certification Type'] = ['TC'];
        payload['filter']['Status'] = ['ACTIVE'];
        if (this.activeTab === this.tabs[0]) {
            payload['filter']['Workflow Status'] = ['Approved'];
        } else {
            payload['filter']['Workflow Status'] = ['Rejected', 'Pending'];
        }
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }

        return payload;
    }

    getFilteredOptions() {
        const tempFilterOptions = {};
        const options = this.utilsService.getSessionStorageValue(this.filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return tempFilterOptions;
    }

    isAgroup(value) {
        return value.type && value.type === 'group';
    }

    removeSpace(key: any) {
        return 'evidences-' + key.replace(/ /g, '-');
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchEvidenceFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    processEvidencesFilters(data: any) {
        this.evidenceFilters = data;
        this.pageLoading = false;
        this.onResize();
    }

    onResize() {
        setTimeout(() => {
            this.height =
                document.getElementById('filter-bar-wrapper').offsetHeight +
                document.getElementById('evidence-header').offsetHeight;
        }, 0);
    }

    searchEvidence(event) {
        if (event.key === 'Enter') {
            this.resetPagination();
            this.totalCountFlag = true;
            this.getAllEvidences();
        }
    }

    resetPagination() {
        this.pagination = {
            from: 0,
            size: this.FETCH_SIZE
        };
    }

    navigateTo(tabName: string) {
        this.activeTab = tabName;
        if (tabName === this.tabs[0]) {
            this.initialize();
        } else {
            this.initializeStatusTab();
        }
    }

    handleSortBy() {
        this.setSortByFilter();
        this.resetPagination();
        this.getAllEvidences();
    }

    setSortByFilter() {
        switch (this.sortByFilter.sortBy) {
            case 'product_name':
                this.sortByFilter.sortOrder = 'asc';
                break;
            case 'create_ts':
                this.sortByFilter.sortOrder = 'desc';
                break;
        }
        this.utilsService.setSessionStorageValue(this.sortBy_session, this.sortByFilter);
    }

    updateFiltersSelection() {
        return this.utilsService.getSessionStorageValue(this.filter_session) || {};
    }

    hasUserSelectedAllEvidences() {
        return this.evidences.length !== 0 && this.userSelectedEvidences.length === this.evidences.length;
    }
    hasUserSelectedEvidence(evidence_id) {
        return this.userSelectedEvidences.indexOf(evidence_id) !== -1;
    }
    userSelectedAllEvidences($event: MatCheckboxChange) {
        if ($event.checked) {
            this.userSelectedEvidences = [];
            this.evidences.forEach(evidence => {
                this.userSelectedEvidences.push(evidence.id);
            });
        } else {
            this.userSelectedEvidences = [];
        }
    }
    userSelectedEvidence($event: MatCheckboxChange, evidence: IEvidenceTableDetail) {
        if ($event.checked) {
            if (this.userSelectedEvidences.indexOf(evidence.id) === -1) {
                this.userSelectedEvidences.push(evidence.id);
            }
        } else {
            if (this.userSelectedEvidences.indexOf(evidence.id) !== -1) {
                this.userSelectedEvidences.splice(this.userSelectedEvidences.indexOf(evidence.id), 1);
            }
        }
    }

    deleteConfirmationEvidence(selectedEvidences: string[]): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '375px',
            data: {
                class: 'delete-confirmation-evidence',
                title: 'Warning!',
                msg:
                    'Are you sure you want to delete the TC? All associated lots in the draft stage will also be removed.',
                primaryButton: 'Cancel',
                secondaryButton: 'Delete',
                removeMargins: true,
                showClose: false
            }
        });
        dialogRef.afterClosed().subscribe(response => {
            if (response === 'Delete') {
                this.deleteEvidence(selectedEvidences);
            }
        });
    }
    deleteEvidence(selectedEvidences: string[]): void {
        const payload = {
            certType: 'TC',
            documentIds: selectedEvidences
        };
        this.pageLoading = true;
        this.evidenceService.deleteEvidence(payload).subscribe(
            data => {
                this.deletedEvidenceResponse(data);
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('We could not process your request.', 'Error!');
            }
        );
    }

    deletedEvidenceResponse(data: any): void {
        if (data && data.length > 0) {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '375px',
                data: {
                    class: 'delete-confirmation-evidence',
                    title: 'Warning!',
                    msg:
                        "You can't delete the TC since Lot(s) from the Transaction certificate is already used to create a transaction",
                    primaryButton: 'Close',
                    removeMargins: true,
                    showClose: false
                }
            });
            dialogRef.afterClosed().subscribe(event => {
                setTimeout(() => {
                    this.initialize();
                }, 2000);
            });
        } else {
            setTimeout(() => {
                this.toastr.success('Transaction Certificates are successfully deleted.');
                this.initialize();
            }, 2000);
        }
    }

    processEvidencesResponse(data: IEvidence) {
        this.evidences = [];
        if (data['searchResponse'].length > 0) {
            const _evidences = [];
            data['searchResponse'].forEach((searchResult: IEvidenceTableDetail) => {
                const _searchResult = JSON.parse(JSON.stringify(searchResult));
                // _searchResult.transaction_tree = '/orders/' + searchResult.id + '/transaction-tree';
                _evidences.push(_searchResult);
            });
            this.evidences = JSON.parse(JSON.stringify(_evidences));
        }

        this.totalCount = data.totalCount;
        this.closeSortByFilter = false;
        this.pageLoading = false;
        this.fetchingEvidencesData = false;
        if (Object.keys(this.updateFiltersSelection()).length > 0) {
            this.onResize();
        }
    }

    getAllEvidences() {
        this.pageLoading = true;

        this.evidenceService.getEvidences(this.getSearchPayload()).subscribe(
            response => {
                const data = response['data'];
                this.processEvidencesResponse(data);
            },
            () => {
                this.toastr.error(
                    this.env.error_messages.could_not_fetch_data.message,
                    this.env.error_messages.could_not_fetch_data.title
                );
                this.pageLoading = false;
            }
        );
    }

    openUploadEvidence() {
        const uploadEvidenceDialog = this.dialog.open(UploadEvidenceComponent, {
            width: '100vw',
            maxWidth: '98vw',
            height: '97vh',
            panelClass: 'evidence-upload-dialog',
            id: '',
            data: {
                type: 'Transaction',
                showClose: true,
                certificationType: 'TC'
            }
        });
        uploadEvidenceDialog.afterClosed().subscribe(response => {
            this.toastr.clear();
            this.getAllEvidences();
        });
    }

    downloadEvidence(certId: string, fileName: string) {
        this.toastr.info('Requesting file. Please wait');
        this.commonServices.downloadCertificate(certId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
            },
            failResponse => {
                this.toastr.error('File could not be uploaded. Please try after some time.', 'Failed');
            }
        );
    }

    openTransactionCertificateDetailView(evidence, event) {
        if (!event.path[0].className.includes('mat-checkbox')) {
            const transactionCertificateDetailViewDialog = this.dialog.open(TcApprovalFlowComponent, {
                width: '100vw',
                maxWidth: '98vw',
                height: '97vh',
                panelClass: 'tc-approval-dialog',
                data: {
                    taskId: evidence.id,
                    certId: evidence.cert_id,
                    type: 'Transaction',
                    showClose: true,
                    certificationType: 'TC',
                    showActionButtons: false,
                    actionType: 'View',
                    fromPage: 'Transaction Certificate'
                }
            });
            transactionCertificateDetailViewDialog.afterClosed().subscribe(response => {
                this.getAllEvidences();
            });
        }
    }

    allowUpload() {
        let flag = true;
        const errorMsg = `You don't have a valid SC please upload a SC to upload Transaction Certificates`;
        this.scService.hasValidSC().subscribe(resp => {
            flag = resp;
            if (flag) {
                this.openUploadEvidence();
            } else {
                this.toastr.error(errorMsg);
            }
        });
    }
}
