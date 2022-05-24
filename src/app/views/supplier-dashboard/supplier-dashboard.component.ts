import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { ProfileService } from '../company/profile/profile.service';
import { UploadScopeCertificateComponent } from '../scope-certificates/upload-scope-certificate/upload-scope-certificate.component';
import { CustomToastrService } from './../../shared/commonServices/custom-toastr.service';
import { CertificateRenewalWorkflowComponent } from './../../shared/modals/certificate-renewal-workflow/certificate-renewal-workflow.component';
import { SupplierDashboardService } from './supplier-dashboard.service';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL'
    },
    display: {
        dateInput: 'DD MMM YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD MMM YYYY',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};

const TASK = {
    T_TRACE: 'T_TRACE',
    T_EMS: 'T_EMS',
    ASSESSMENT: 'ASSESSMENT',
    SUPPLIER_ASSOCIATION: 'SUPPLIER_ASSOCIATION',
    TC_CERTIFICATE_APPROVAL: 'TC_CERTIFICATE_APPROVAL',
    SC_CERTIFICATE_APPROVAL: 'SC_CERTIFICATE_APPROVAL',
    FACILITY_CREATION: 'FACILITY_CREATION',
    REASON_FOR_DELAY: 'REASON_FOR_DELAY',
    NOTIFICATION: 'NOTIFICATION',
    SCOPE_CERTIFICATE_NOT_AVAILABLE: 'SCOPE_CERTIFICATE_NOT_AVAILABLE',
    BOM_VALIDATION_FAILURE: 'BOM_VALIDATION_FAILURE',
    MATERIAL_MISMATCH: 'MATERIAL_MISMATCH'
};

const ROUTES = {
    T_TRACE: '/t-trace/product/supplychain/',
    T_EMS: '/t-ems/product/evidencecollection/',
    ASSESSMENT: '/assessments-received',
    SUPPLIER_ASSOCIATION: '/company/associate'
};
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

export type tabs = null | 'approval_status';

@Component({
    selector: 'app-supplier-dashboard',
    templateUrl: './supplier-dashboard.component.html',
    styleUrls: ['./supplier-dashboard.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ]
})
export class SupplierDashboardComponent implements OnInit {
    routerSubscription: Subscription;

    load = false;

    dropdownList = [];

    ml_name = 'suppliermultiselect';
    priority = 'Priority';
    task_description = 'Task Description';
    sent_by = 'Sent By';
    sent_date = 'Sent Date';
    last_edited = 'Last Edited';
    request_type = 'Request Type';
    filter_session = 'supplier dashboard multiselect';
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    totalTaskCount = 0;
    newTaskCount = 0;
    tasks: any = [];
    selectedTask: any;

    moment = moment;
    pageLoading: boolean = true;
    isFetchingTasks: boolean = true;

    submitApprovalRequestPayload: ISubmitApprovalRequestPayload;

    ANALYTICS_EVENT_PAGE = 'Supplier Dashboard';
    ANALYTICS_ACTION_VIEW_ACTION = 'Supplier Dashboard Page viewed';

    delayReasons = [
        { id: 1, title: 'Delay', name: 'CB delay auditing​', checked: false },
        { id: 2, title: 'Delay', name: 'Vendor late application', checked: false },
        { id: 3, title: 'Delay', name: 'Correction Action Plan is not completed in time​', checked: false },
        { id: 4, title: 'Other', name: 'Other', checked: false }
    ];

    tabNames = ['pending_tasks', 'approval_status'];

    activeTab: tabs = null;

    constructor(
        private sdService: SupplierDashboardService,
        private router: Router,
        private analyticsService: AnalyticsService,
        private auth: AuthService,
        private profileService: ProfileService,
        public localeService: LocalizationService,
        private commonService: CommonServices,
        private dialog: MatDialog,
        private toastr: CustomToastrService,
        private activeRouter: ActivatedRoute,
        private titleService: Title
    ) {
        if (this.auth.user.subscriptionType === 'BRAND') {
            this.router.navigate(['dashboard']);
        }
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_VIEW_ACTION;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_PAGE, analyticsOptions);

        this.routerSubscription = this.activeRouter.fragment.subscribe((fragment: tabs) => {
            const currentUrl = this.router.url.split('/');
            if (currentUrl.length < 3) {
                let tempActiveTab;
                tempActiveTab = this.activeTab;
                this.activeTab = fragment;
                switch (fragment) {
                    case this.tabNames[1]:
                        this.titleService.setTitle('TrusTrace | Approval Status');
                        break;
                    default:
                        this.titleService.setTitle('TrusTrace | Pending Tasks');
                        this.activeTab = null;
                        break;
                }
                if (
                    this.tasks === null ||
                    this.tasks === undefined ||
                    this.tasks.length === 0 ||
                    tempActiveTab !== this.activeTab
                ) {
                    // this.resetPagination();
                    this.initialize();
                    this.load = true;
                }
            }
            if (!this.load) {
                this.initialize();
            }
            this.pageLoading = false;
        });
    }

    initialize() {
        this.isFetchingTasks = true;
        this.tasks = [];
        this.activeTab === this.tabNames[1] ? this.initializeApprovalStatus() : this.initializePendingTasks();
    }

    initializePendingTasks() {
        const dataPrepArray: Array<Observable<any>> = [];

        const payload = {
            filter: {
                'To Company': [this.auth.companyId]
            },
            sort: { sortBy: 'create_ts', sortOrder: 'desc' },
            pagination: { from: 0, size: 100 }
        };
        dataPrepArray.push(this.sdService.getTasks(payload));
        // START: Patch to add certificate-expiry to pending task
        dataPrepArray.push(this.profileService.getCompanyProfile(this.auth.user.companyId));
        // END: Patch to add certificate-expiry to pending task

        forkJoin(dataPrepArray).subscribe(
            ([pendingTask, companyProfile]) => {
                this.tasks = JSON.parse(JSON.stringify(pendingTask.searchResponse));
                this.totalTaskCount = pendingTask.totalCount;
                this.newTaskCount = 0;
                // START: Patch to add certificate-expiry to pending task
                const facilities = companyProfile.data.companyDetails.facility;
                this.localeService.addToMasterData(companyProfile.data.masterData);

                facilities.forEach(facility => {
                    if (facility.hasOwnProperty('certificateList')) {
                        const certificates = facility.certificateList;

                        certificates.forEach(certificate => {
                            if (certificate.hasOwnProperty('expiryDate')) {
                                const expiry_date = moment(certificate.expiryDate);
                                const today = new Date();

                                if (expiry_date.isBefore(today)) {
                                    // /company/edit-facility/5ee0af7f16040a1cf1f87fd0
                                    this.tasks.unshift({
                                        description: `${this.localeService.getDisplayText(
                                            certificate.typeId
                                        )} expired for Facility ${certificate.facilityName}`,
                                        link: `/company/edit-facility/${facility.id}`,
                                        sent_date: '',
                                        task_type: {
                                            id: 'CERT-EXPIRY',
                                            value: 'Certificate Expiry'
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
                // END: Patch to add certificate-expiry to pending task
                this.getTaskCount(this.tasks);
                this.isFetchingTasks = false;
            },
            failResponse => {
                if (failResponse.status === 403) {
                    this.isFetchingTasks = false;
                    this.router.navigate(['/']);
                }
            }
        );

        // Table Header Fixed Script
        // window.onload = function() {
        //     const tableCont = document.querySelector('#table-cont');
        //     /**
        //      * scroll handle
        //      * @param {event} e -- scroll event
        //      */
        //     function scrollHandle(e) {
        //         const scrollTop = this.scrollTop;
        //         this.querySelector('thead').style.transform = 'translateY(' + scrollTop + 'px)';
        //     }
        //     tableCont.addEventListener('scroll', scrollHandle);
        // };
    }

    initializeApprovalStatus() {
        const dataPrepArray: Array<Observable<any>> = [];

        const payload = {
            filter: {
                Supplier: [this.auth.companyId]
            },
            sort: { sortBy: 'create_ts', sortOrder: 'desc' },
            pagination: { from: 0, size: 100 }
        };
        dataPrepArray.push(this.sdService.getTasks(payload));
        // START: Patch to add certificate-expiry to pending task
        dataPrepArray.push(this.profileService.getCompanyProfile(this.auth.user.companyId));
        // END: Patch to add certificate-expiry to pending task

        forkJoin(dataPrepArray).subscribe(
            response => {
                this.tasks = JSON.parse(JSON.stringify(response[0].searchResponse));
                this.totalTaskCount = response[0].totalCount;
                this.newTaskCount = 0;

                // START: Patch to add certificate-expiry to pending task
                const facilities = response[1].data.companyDetails.facility;
                this.localeService.addToMasterData(response[1].data.masterData);

                facilities.forEach(facility => {
                    if (facility.hasOwnProperty('certificateList')) {
                        const certificates = facility.certificateList;

                        certificates.forEach(certificate => {
                            if (certificate.hasOwnProperty('expiryDate')) {
                                const expiry_date = moment(certificate.expiryDate);
                                const today = new Date();

                                if (expiry_date.isBefore(today)) {
                                    // /company/edit-facility/5ee0af7f16040a1cf1f87fd0
                                    this.tasks.unshift({
                                        description: `${this.localeService.getDisplayText(
                                            certificate.typeId
                                        )} expired for Facility ${certificate.facilityName}`,
                                        link: `/company/edit-facility/${facility.id}`,
                                        sent_date: '',
                                        task_type: {
                                            id: 'CERT-EXPIRY',
                                            value: 'Certificate Expiry'
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
                // END: Patch to add certificate-expiry to pending task
                this.getTaskCount(this.tasks);
                this.isFetchingTasks = false;
            },
            failResponse => {
                if (failResponse.status === 403) {
                    this.isFetchingTasks = false;
                    this.router.navigate(['/']);
                }
            }
        );
    }

    navigateTo(props: string = '') {
        this.router.navigate(['/supplier-dashboard'], { fragment: props });
    }

    //function has been introduced for hanlding S.no in approval tab
    taskApprovalCounter(tasksArray): any[] {
        return tasksArray.filter(task => task.status !== 40);
    }

    onMenuClick(menuItemClicked): void {
        this.analyticsService.trackEvent(menuItemClicked + ' menu clicked');
    }

    onActionButtonClicked(buttonName, description = 'none') {
        this.analyticsService.trackEvent(buttonName + ' clicked', {
            Description: description,
            'Action Performed': buttonName + ' clicked'
        });
    }

    handleUploadScopeCertificateSubmitHandler(status: string): void {
        if (status === 'SUBMIT_SUCCESS') {
            this.submitApprovalRequestPayload.workflowStatus = 'APPROVED';
            this.sdService.submitScopeCertificate(this.submitApprovalRequestPayload).subscribe(
                response => {
                    this.toastr.success('Reason for delay submitted successfully', 'Success');
                    this.router.navigate(['/supplier-dashboard']);
                    this.initialize();
                },
                failResponse => {
                    this.toastr.error('Something went wrong. Please try after sometime!', 'Error');
                }
            );
        }
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
                certificationType: 'SC',
                submitHandler: this.handleUploadScopeCertificateSubmitHandler.bind(this),
                taskId: this.selectedTask.task_id
            }
        });
        uploadScopeCertificatesDialog.afterClosed().subscribe(response => {
            this.handleUploadScopeCertificateSubmitHandler(response);
        });
    }

    handleCertificateRenewalSubmit(reasonType: string, submitCallBackPayload, task) {
        this.submitApprovalRequestPayload.id = task.id;
        this.submitApprovalRequestPayload.comments.resolutionDate = submitCallBackPayload.resolutionDate;
        if (reasonType === 'Delay') {
            submitCallBackPayload.reasons.forEach(reason => {
                if (reason.checked) {
                    /* if (reason.name === "Scope Certification application is under proceeding") {
                        this.submitApprovalRequestPayload.workflowType = 'TRANSACTION_ACCESS';
                    } */
                    this.submitApprovalRequestPayload.comments.selectedComments.push(reason.name);
                }
            });
        } else {
            submitCallBackPayload.reasons.forEach(reason => {
                if (reason.title === 'Delay') {
                    if (reason.checked) {
                        /*  if (reason.name === "Scope Certification application is under proceeding") {
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
                this.toastr.success('Reason for delay submitted successfully', 'Success');
                this.router.navigate(['/supplier-dashboard']);
                this.initialize();
            },
            failResponse => {
                this.toastr.error('Something went wrong. Please try after sometime!', 'Error');
            }
        );
    }

    openCertificateRenewalModal(comments: string, task) {
        const certificateRenewalWorkflowComponent = this.dialog.open(CertificateRenewalWorkflowComponent, {
            panelClass: 'scope-certificate-renewal',
            data: {
                uploadCallBack: this.handleCertificateRenewalUpload.bind(this),
                submitCallBack: this.handleCertificateRenewalSubmit.bind(this),
                task: task,
                options: this.delayReasons,
                showOtherOption: true,
                isDateEnabled: true,
                comments: comments,
                texts: {
                    titleL: 'Renew Scope certificate ?',
                    subTitleL: 'Upload new scope certificate and extract.',
                    titleR: 'Choose or enter the reason for delay'
                }
            }
        });

        certificateRenewalWorkflowComponent.afterClosed().subscribe(() => {
            this.delayReasons.forEach(delay => {
                delay.checked = false;
            });
        });
    }

    handleNotificationViewButtonClick(task: any) {
        this.submitApprovalRequestPayload = {
            id: task.task_id,
            certType: null,
            workflowStatus: 'APPROVED',
            workflowType: 'NOTIFICATION',
            fromCompanyId: task.from_company.id,
            toCompanyId: task.to_company.id,
            certId: task.cert_id,
            comments: {
                selectedComments: [],
                otherComments: '',
                resolutionDate: ''
            },
            notifyTT: false
        };

        this.sdService.submitScopeCertificate(this.submitApprovalRequestPayload).subscribe(
            response => {
                const taskIndex = this.tasks.findIndex(taskItem => taskItem.task_id === task.task_id);
                this.tasks.splice(taskIndex, 1);
            },
            failResponse => {
                this.toastr.error('Something went wrong. Please try after sometime!', 'Error');
            }
        );
    }

    handleScopeCertificateButtonClick(task: any) {
        this.selectedTask = JSON.parse(JSON.stringify(task));
        this.submitApprovalRequestPayload = {
            id: task.task_id,
            certType: 'SC',
            workflowStatus: 'PENDING',
            workflowType: 'REASON_FOR_DELAY',
            fromCompanyId: task.to_company.id,
            toCompanyId: task.from_company.id,
            certId: task.cert_id,
            comments: {
                selectedComments: [],
                otherComments: '',
                resolutionDate: ''
            },
            notifyTT: false
        };
        this.sdService.getTaskDetail(task.task_id).subscribe(
            data => {
                this.submitApprovalRequestPayload.id = task.id;
                this.openCertificateRenewalModal(data.comments, task);
            },
            failResponse => {
                this.toastr.error('Something went wrong. Please try after sometime!', 'Error');
            }
        );
    }

    getYesterdayDate() {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return new Date(date.setDate(date.getDate() - 1));
    }

    getTaskCount(tasks: any) {
        let completedTasks = 0;
        const yesterdayDate = this.getYesterdayDate();
        tasks.forEach(task => {
            if (task.create_ts) {
                task.create_ts = this.commonService.formatDate(task.create_ts);
            }
            switch (task.task_type.id) {
                case TASK.T_TRACE:
                    if (task.status === 20 || task.status === 30) {
                        task.link = `${ROUTES.T_TRACE + task.task_id}/edit`;
                        if (task.create_ts && new Date(task.create_ts) >= yesterdayDate) {
                            this.newTaskCount++;
                        }
                    } else {
                        completedTasks++;
                        task.link = ROUTES.T_TRACE + task.task_id;
                    }
                    break;
                case TASK.T_EMS:
                    if (task.status === 20 || task.status === 30) {
                        task.link = `${ROUTES.T_EMS + task.task_id}/edit`;
                        if (task.create_ts && new Date(task.create_ts) >= yesterdayDate) {
                            this.newTaskCount++;
                        }
                    } else {
                        completedTasks++;
                        task.link = ROUTES.T_EMS + task.task_id;
                    }
                    break;
                case TASK.ASSESSMENT:
                    if (task.status === 20 || task.status === 30) {
                        task.link = ROUTES.ASSESSMENT;
                        task.queryParams = {
                            id: task.task_id
                        };
                        if (task.create_ts && new Date(task.create_ts) >= yesterdayDate) {
                            this.newTaskCount++;
                        }
                    } else {
                        completedTasks++;
                        task.link = ROUTES.ASSESSMENT;
                        task.queryParams = {
                            id: task.task_id
                        };
                    }
                    break;
                case TASK.SUPPLIER_ASSOCIATION:
                    if (task.status === 15) {
                        task.link = ROUTES.SUPPLIER_ASSOCIATION;
                        task.queryParams = {
                            code: task.task_id
                        };
                        if (task.create_ts && new Date(task.create_ts) >= yesterdayDate) {
                            this.newTaskCount++;
                        }
                    }
                    break;
                case TASK.REASON_FOR_DELAY:
                case TASK.TC_CERTIFICATE_APPROVAL:
                case TASK.SC_CERTIFICATE_APPROVAL:
                case TASK.FACILITY_CREATION:
                case TASK.NOTIFICATION:
                case TASK.SCOPE_CERTIFICATE_NOT_AVAILABLE:
                case TASK.BOM_VALIDATION_FAILURE:
                case TASK.MATERIAL_MISMATCH:
                    if (task.status !== 30) {
                        completedTasks++;
                    } else {
                        if (task.create_ts && new Date(task.create_ts) >= yesterdayDate) {
                            this.newTaskCount++;
                        }
                    }
                    break;
                default:
                    break;
            }
        });
        this.totalTaskCount = this.totalTaskCount - completedTasks;
    }
}
