import { CustomToastrService } from './../../shared/commonServices/custom-toastr.service';
import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import FileSaver from 'file-saver';
import { forkJoin } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { InformationConfirmDialogComponent } from '../../shared/modals/information-confirm-dialog/information-confirm-dialog.component';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/user/auth.service';
import { ConfirmDialogComponent } from '../../shared/modals/confirm-dialog/confirm-dialog.component';
import { EvidenceService } from '../evidence/evidence.service';
import { IScopeCertificateTableDetail } from '../scope-certificates/scope-certificates.model';
import { SupplierDashboardService } from '../supplier-dashboard/supplier-dashboard.service';
import { AnalyticsService } from './../../core/analytics/analytics.service';
import { CommonServices } from './../../shared/commonServices/common.service';
import { ContextService } from './../../shared/context.service';
import { CertificateRenewalWorkflowComponent } from './../../shared/modals/certificate-renewal-workflow/certificate-renewal-workflow.component';
import { UtilsService } from './../../shared/utils/utils.service';
import { ScopeCertificateDetailViewComponent } from './scope-certificate-detail-view/scope-certificate-detail-view.component';
import { ScopeCertificatesService } from './scope-certificates.service';
import { UploadScopeCertificateComponent } from './upload-scope-certificate/upload-scope-certificate.component';

export interface ISubmitApprovalComments {
    selectedComments: string[];
    otherComments: string;
    resolutionDate: string;
}
export interface ISubmitApprovalRequestPayload {
    id: string;
    certType: string;
    workflowStatus: string;
    workflowType: string;
    fromCompanyId: string;
    toCompanyId: string;
    certId: string;
    comments: ISubmitApprovalComments;
    notifyTT: boolean;
}

@Component({
    selector: 'app-scope-certificates',
    templateUrl: './scope-certificates.component.html',
    styleUrls: ['./scope-certificates.component.scss']
})
export class ScopeCertificatesComponent implements OnInit {
    env = environment;
    tabs = ['All Scope Certificate', 'SC Status'];
    activeTab = this.tabs[0];
    userSelectedSC: string[] = [];

    scopeCertificates = [];

    isScopeCertificatesAvailable = true;
    pageLoading = true;
    fetchingScopeCertificatesData = true;
    disableInfiniteScroll = true;
    closeSortByFilter = false;
    totalCountFlag = false;
    submitApprovalRequestPayload: ISubmitApprovalRequestPayload;
    FETCH_SIZE = 50;
    totalCount = 0;
    height = 200;

    scopeCertificatesFilters: any = {};
    sortByFilter = {
        sortBy: 'update_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: this.FETCH_SIZE
    };
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    refresh: Subscription;

    searchText = '';
    filter_session = 'scopeCertificates_filters';
    sortBy_session = 'scopeCertificates_sort';
    ANALYTICS_EVENT_SCOPE_CERTIFICATE = 'Scope Certificates';
    ANALYTICS_ACTION_SCOPE_CERTIFICATE_VIEWED = 'Scope Certificates Page Viewed';
    delayReasons = [
        { id: 1, title: 'Delay', name: 'Scope Certification application is under proceeding', checked: false }
    ];

    get checkAccess(): (name: string) => boolean {
        return this.authService.haveAccess.bind(this.authService);
    }

    constructor(
        private scopeCertificatesService: ScopeCertificatesService,
        private utilsService: UtilsService,
        private titleService: Title,
        private appContext: ContextService,
        private toastr: CustomToastrService,
        private commonServices: CommonServices,
        private dialog: MatDialog,
        private analyticsService: AnalyticsService,
        private sdService: SupplierDashboardService,
        private router: Router,
        private authService: AuthService,
        private evidenceService: EvidenceService
    ) {
        this.titleService.setTitle('TrusTrace | Scope Certificates');
    }

    ngOnInit() {
        this.pageLoading = false;

        const analyticsOptions = {};
        analyticsOptions[
            this.analyticsService.PROPERTY_ACTION_PERFORMED
        ] = this.ANALYTICS_ACTION_SCOPE_CERTIFICATE_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_SCOPE_CERTIFICATE, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.scopeCertificates = [];
                this.initialize();
            }
        });
    }

    initialize() {
        this.userSelectedSC = [];
        this.scopeCertificates = [];
        this.fetchingScopeCertificatesData = true;
        if (this.utilsService.getSessionStorageValue(this.sortBy_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortBy_session);
        } else {
            this.setSortByFilter();
        }
        const payload = this.getSearchPayload();
        payload['filter']['Workflow Status'] = ['Approved'];
        payload['filter']['Status'] = ['ACTIVE'];
        forkJoin([
            this.scopeCertificatesService.getScopeCertificatesFilter(payload),
            this.scopeCertificatesService.getScopeCertificates(payload)
        ]).subscribe(response => {
            const filtersData = response[0]['data'];
            const scopeCertificatesData = response[1]['data'];
            this.processScopeCertificatesFilters(filtersData);
            this.processScopeCertificatesResponse(scopeCertificatesData);
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

    getAllScopeCertificates() {
        this.pageLoading = true;

        this.scopeCertificatesService.getScopeCertificates(this.getSearchPayload()).subscribe(
            response => {
                const data = response['data'];
                this.processScopeCertificatesResponse(data);
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

    fetchScopeCertificatesFilters(payload) {
        this.pageLoading = true;
        this.disableInfiniteScroll = true;
        this.scopeCertificatesService.getScopeCertificatesFilter(payload).subscribe(response => {
            this.processScopeCertificatesFilters(response['data']);
        });
    }

    searchScopeCertificate(event) {
        if (event.key === 'Enter') {
            this.resetPagination();
            this.totalCountFlag = true;
            this.getAllScopeCertificates();
        }
    }

    resetPagination() {
        this.pagination = {
            from: 0,
            size: this.FETCH_SIZE
        };
    }

    handleFilterSelection() {
        this.resetPagination();
        this.getAllScopeCertificates();
    }

    refreshFilter() {
        this.fetchScopeCertificatesFilters(this.getSearchPayload());
    }

    getSearchPayload() {
        const payload = {
            filter: this.getFilteredOptions(),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortBy_session),
            pagination: this.pagination
        };

        payload.filter['Certification Type'] = ['SC'];
        payload['filter']['Status'] = ['ACTIVE'];
        if (this.activeTab === this.tabs[0]) {
            payload['filter']['Workflow Status'] = ['Approved'];
        } else {
            payload['filter']['Workflow Status'] = ['Pending', 'Rejected', 'Expired'];
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

    isAGroup(value) {
        return value.type && value.type === 'group';
    }

    removeSpace(key: any) {
        return 'scope-certificates-' + key.replace(/ /g, '-');
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchScopeCertificatesFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    processScopeCertificatesFilters(data: any) {
        this.scopeCertificatesFilters = data;
        this.pageLoading = false;
        this.onResize();
    }

    processScopeCertificatesResponse(data: any) {
        this.scopeCertificates = [];
        if (data['searchResponse'].length > 0) {
            const _scopeCertificates = [];
            data['searchResponse'].forEach(searchResult => {
                const _searchResult = JSON.parse(JSON.stringify(searchResult));
                _scopeCertificates.push(_searchResult);
            });
            this.scopeCertificates = JSON.parse(JSON.stringify(_scopeCertificates));
        }

        this.totalCount = data.totalCount;
        this.closeSortByFilter = false;
        this.pageLoading = false;
        this.fetchingScopeCertificatesData = false;
        if (Object.keys(this.updateFiltersSelection()).length > 0) {
            this.onResize();
        }
    }

    handleSortBy() {
        this.setSortByFilter();
        this.resetPagination();
        this.getAllScopeCertificates();
    }

    setSortByFilter() {
        switch (this.sortByFilter.sortBy) {
            case 'valid_until':
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

    onResize() {
        setTimeout(() => {
            this.height =
                document.getElementById('filter-bar-wrapper').offsetHeight +
                document.getElementById('scope-certificates-header').offsetHeight;
        }, 0);
    }

    openUploadScopeCertificate() {
        const uploadScopeCertificatesDialog = this.dialog.open(UploadScopeCertificateComponent, {
            width: '100vw',
            maxWidth: '98vw',
            height: '97vh',
            panelClass: 'scope-certificate-upload-dialog',
            id: '',
            data: {
                type: 'Scope Certificate',
                showClose: true,
                certificationType: 'SC'
            }
        });
        uploadScopeCertificatesDialog.afterClosed().subscribe(response => {
            this.toastr.clear();
            this.getAllScopeCertificates();
        });
    }

    downloadScopeCertificate(certId: string, fileName: string) {
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

    openScopeCertificateDetailView(id: string, certId: string, fileName: string, event) {
        if (!event.path[0].className.includes('mat-checkbox')) {
            const scopeCertificateDetailViewDialog = this.dialog.open(ScopeCertificateDetailViewComponent, {
                width: '100vw',
                maxWidth: '98vw',
                height: '97vh',
                panelClass: 'scope-certificate-detail-view-dialog',
                data: {
                    id: id,
                    certId: certId,
                    fileName: fileName,
                    showClose: true
                }
            });
            scopeCertificateDetailViewDialog.afterClosed().subscribe(response => {
                this.toastr.clear();
                this.getAllScopeCertificates();
            });
        }
    }

    initializeStatusTab() {
        this.scopeCertificates = [];
        this.fetchingScopeCertificatesData = true;
        if (this.utilsService.getSessionStorageValue(this.sortBy_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortBy_session);
        } else {
            this.setSortByFilter();
        }
        let payload = this.getSearchPayload();
        payload['filter']['Workflow Status'] = ['Pending', 'Rejected', 'Expired'];
        payload['filter']['Status'] = ['ACTIVE'];
        forkJoin([
            this.scopeCertificatesService.getScopeCertificatesFilter(payload),
            this.scopeCertificatesService.getScopeCertificates(payload)
        ]).subscribe(response => {
            const filtersData = response[0]['data'];
            const scopeCertificatesData = response[1]['data'];
            this.processScopeCertificatesFilters(filtersData);
            this.processScopeCertificatesResponse(scopeCertificatesData);
        });
    }

    navigateTo(tabName: string) {
        this.activeTab = tabName;
        if (tabName === this.tabs[0]) {
            this.initialize();
        } else {
            this.initializeStatusTab();
        }
    }

    openCertificateRenewalModal() {
        this.submitApprovalRequestPayload = {
            id: null,
            certType: 'SC',
            workflowStatus: 'PENDING',
            workflowType: null,
            fromCompanyId: this.authService.user.companyId,
            toCompanyId: this.authService.user.brandsAssociated[0],
            certId: null,
            comments: {
                selectedComments: [],
                otherComments: '',
                resolutionDate: ''
            },
            notifyTT: false
        };
        const certificateRenewalWorkflowComponent = this.dialog.open(CertificateRenewalWorkflowComponent, {
            panelClass: 'scope-certificate-renewal',
            data: {
                uploadCallBack: this.handleCertificateRenewalUpload.bind(this),
                submitCallBack: this.handleCertificateRenewalSubmit.bind(this),
                options: this.delayReasons,
                showOtherOption: true,
                isDateEnabled: true,
                texts: {
                    titleL: 'Upload new Scope certificate ?',
                    subTitleL: 'Upload new scope certificate and extract.',
                    titleR: ''
                }
            }
        });

        certificateRenewalWorkflowComponent.afterClosed().subscribe(() => {
            this.delayReasons.forEach(delay => {
                delay.checked = false;
            });
        });
    }

    handleCertificateRenewalUpload() {
        const uploadScopeCertificatesDialog = this.dialog.open(UploadScopeCertificateComponent, {
            width: '100vw',
            maxWidth: '98vw',
            height: '97vh',
            panelClass: 'scope-certificate-upload-dialog',
            id: '',
            data: {
                type: 'Scope Certificate',
                showClose: true,
                certificationType: 'SC'
            }
        });

        uploadScopeCertificatesDialog.afterClosed().subscribe(() => {
            this.toastr.clear();
            if (this.activeTab === this.tabs[0]) {
                this.initialize();
            } else {
                this.initializeStatusTab();
            }
        });
    }

    handleCertificateRenewalSubmit(reasonType: string, reasons) {
        this.submitApprovalRequestPayload.workflowType = 'SCOPE_CERTIFICATE_NOT_AVAILABLE';
        this.submitApprovalRequestPayload.comments.resolutionDate = reasons.resolutionDate;
        if (reasonType === 'Delay') {
            reasons.reasons.forEach(reason => {
                if (reason.checked) {
                    /* if (reason.name === "Scope Certification application is under proceeding") {
                        this.submitApprovalRequestPayload.workflowType = 'TRANSACTION_ACCESS';
                    } */
                    this.submitApprovalRequestPayload.comments.selectedComments.push(reason.name);
                }
            });
        } else {
            reasons.reasons.forEach(reason => {
                if (reason.title === 'Delay') {
                    if (reason.checked) {
                        /* if (reason.name === "Scope Certification application is under proceeding") {
                            this.submitApprovalRequestPayload.workflowType = 'TRANSACTION_ACCESS';
                        } */
                        this.submitApprovalRequestPayload.comments.selectedComments.push(reason.name);
                    }
                } else {
                    this.submitApprovalRequestPayload.comments.otherComments = reason.name;
                }
            });
        }

        this.sdService.submitScopeCertificate(this.submitApprovalRequestPayload).subscribe(
            response => {
                this.toastr.success('Request submitted successfully', 'Success');
                this.router.navigate(['/scope-certificates']);
                if (this.activeTab === this.tabs[0]) {
                    this.initialize();
                } else {
                    this.initializeStatusTab();
                }
            },
            failResponse => {
                this.toastr.error('Something went wrong. Please try after sometime!', 'Error');
            }
        );
    }

    handleUploadScopeCertificateSubmitHandler(status: string): void {
        if (status === 'SUBMIT_SUCCESS') {
            this.submitApprovalRequestPayload.workflowStatus = 'APPROVED';
            this.sdService.submitScopeCertificate(this.submitApprovalRequestPayload).subscribe(
                response => {
                    this.toastr.success('Reason for delay submitted successfully', 'Success');
                    if (this.activeTab === this.tabs[0]) {
                        this.initialize();
                    } else {
                        this.initializeStatusTab();
                    }
                },
                failResponse => {
                    this.toastr.error('Something went wrong. Please try after sometime!', 'Error');
                }
            );
        }
    }

    hasUserSelectedAllEvidences() {
        return this.scopeCertificates.length !== 0 && this.userSelectedSC.length === this.scopeCertificates.length;
    }
    hasUserSelectedEvidence(evidence_id) {
        return this.userSelectedSC.indexOf(evidence_id) !== -1;
    }
    userSelectedAllEvidences($event: MatCheckboxChange) {
        if ($event.checked) {
            this.userSelectedSC = [];
            this.scopeCertificates.forEach(evidence => {
                this.userSelectedSC.push(evidence.id);
            });
        } else {
            this.userSelectedSC = [];
        }
    }
    userSelectedEvidence($event: MatCheckboxChange, scope: IScopeCertificateTableDetail) {
        if ($event.checked) {
            if (this.userSelectedSC.indexOf(scope.id) === -1) {
                this.userSelectedSC.push(scope.id);
            }
        } else {
            if (this.userSelectedSC.indexOf(scope.id) !== -1) {
                this.userSelectedSC.splice(this.userSelectedSC.indexOf(scope.id), 1);
            }
        }
    }

    deleteConfirmationEvidence(selectedEvidences: string[]): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '375px',
            data: {
                class: 'delete-confirmation-evidence',
                title: 'Warning!',
                msg: 'Are you sure you want to delete the selected Scope Certificates?',
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
            certType: 'SC',
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
            const transactionIds = data.map(d => d.transactionId).join(',');
            const dialogDataObj = {
                title: 'Cannot delete these Scope Certificates as they are already linked to a transaction.',
                msg: transactionIds
            };
            const dialogData = [];
            dialogData.push(dialogDataObj);

            const dialogRef = this.dialog.open(InformationConfirmDialogComponent, {
                width: '450px',
                panelClass: 'tc-upload-confirmation-dialog',
                data: {
                    dialogData: dialogData,
                    buttonText: 'Close',
                    showClose: false,
                    isMultiple: true
                }
            });
            dialogRef.afterClosed().subscribe(event => {
                setTimeout(() => {
                    this.initialize();
                }, 2000);
            });
        } else {
            setTimeout(() => {
                this.toastr.success('Scope Certificates are successfully deleted.');
                this.initialize();
            }, 2000);
        }
    }

    handleCancelClick() {
        this.userSelectedSC = [];
    }
}
