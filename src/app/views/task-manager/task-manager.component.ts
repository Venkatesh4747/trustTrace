import { CustomToastrService } from './../../shared/commonServices/custom-toastr.service';
import { Title } from '@angular/platform-browser';
import { ContextService } from './../../shared/context.service';
import { UtilsService } from './../../shared/utils/utils.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from './../../../environments/environment';
import { ScApprovalFlowComponent } from './sc-approval-flow/sc-approval-flow.component';
import { ScApprovalModalComponent } from './sc-approval-modal/sc-approval-modal.component';
import { ISCReviewRequestPayload, tabs, subModules } from './task-manager.model';
import { TaskManagerService } from './task-manager.service';
import { TcApprovalFlowComponent } from './tc-approval-flow/tc-approval-flow.component';
import { forkJoin, Subscription } from 'rxjs';
import { AuthService } from './../../core/user/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BomValidationFailureFlowComponent } from './bom-validation-failure-flow/bom-validation-failure-flow.component';

@Component({
    selector: 'app-task-manager',
    templateUrl: './task-manager.component.html',
    styleUrls: ['./task-manager.component.scss']
})
export class TaskManagerComponent implements OnInit {
    pageLoading: boolean = true;
    isFetchingTasks: boolean;
    load = false;

    totalTasks: number = 0;
    newTaskCount = 0;
    totalCount = 0;
    FETCH_SIZE = environment.FETCH_SIZE;

    tasks: any = [];

    activeTab: tabs = null;

    tabNames = ['pending_tasks', 'completed_tasks'];

    scReviewRequestPayload: ISCReviewRequestPayload;

    taskFilters: any = {};
    pagination = {
        from: 0,
        size: this.FETCH_SIZE
    };
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    sessionStorage = {
        pending: {
            filter: 'tasks_filters',
            sortBy: 'tasks_sort'
        },
        completed: {
            filter: 'completed_tasks_filters',
            sortBy: 'completed_tasks_sort'
        }
    };

    customFieldDisplayList: any = [];

    routerSubscription: Subscription;

    module = 'TASK_MANAGER';

    tiers = {
        tr_tier1: 'T1',
        tr_tier2: 'T2'
    };

    get checkAccess(): (name: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    constructor(
        private taskManagerService: TaskManagerService,
        private dialog: MatDialog,
        private toastr: CustomToastrService,
        private utilsService: UtilsService,
        private appContext: ContextService,
        private auth: AuthService,
        private router: Router,
        private activeRouter: ActivatedRoute,
        private titleService: Title
    ) {
        if (this.auth.user.subscriptionType === 'SUPPLIER') {
            this.router.navigate(['supplier-dashboard']);
        }
    }

    ngOnInit() {
        // router config
        this.routerSubscription = this.activeRouter.fragment.subscribe((fragment: tabs) => {
            const currentUrl = this.router.url.split('/');
            if (currentUrl.length < 3) {
                let tempActiveTab;
                tempActiveTab = this.activeTab;
                this.activeTab = fragment;
                switch (fragment) {
                    case this.tabNames[1]:
                        this.titleService.setTitle('TrusTrace | Completed Tasks');
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
        });
    }

    initialize() {
        this.isFetchingTasks = true;
        this.tasks = [];

        this.activeTab === this.tabNames[1] ? this.initializeCompletedTasks() : this.initializePendingTasks();
    }

    initializePendingTasks() {
        const payload = this.getSearchPayload();

        forkJoin([
            this.taskManagerService.getTasksFilter(payload),
            this.taskManagerService.getTasks(payload)
        ]).subscribe(response => {
            const filtersData = response[0]['data'];
            const taskData = response[1];
            this.processTaskFilters(filtersData);
            this.processTaskResponse(taskData);
        });
    }

    initializeCompletedTasks() {
        const payload = this.getSearchPayload();

        forkJoin([
            this.taskManagerService.getTasksFilter(payload),
            this.taskManagerService.getTaskHistory(payload)
        ]).subscribe(response => {
            const filtersData = response[0]['data'];
            const taskData = response[1];
            this.processTaskFilters(filtersData);
            this.processTaskResponse(taskData);
        });
    }

    navigateTo(props: string = '') {
        this.router.navigate(['/task-manager'], { fragment: props });
    }

    fetchTaskFilters(payload) {
        this.pageLoading = true;
        this.taskManagerService.getTasksFilter(payload).subscribe(response => {
            this.processTaskFilters(response['data']);
        });
    }

    processTaskFilters(data: any) {
        this.taskFilters = data;
        this.pageLoading = false;
    }

    getFilteredOptions() {
        const filter = this.getSession().filter;
        const tempFilterOptions = {};
        const options = this.utilsService.getSessionStorageValue(filter);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }

        if (this.activeTab === this.tabNames[1]) {
            tempFilterOptions['Status'] = [40];
        } else {
            tempFilterOptions['Status'] = [30];
            tempFilterOptions['To Company'] = [this.auth.companyId];
        }

        return tempFilterOptions;
    }

    getSearchPayload() {
        const payload = {
            module: this.module,
            indexTypeMapper: this.activeTab === this.tabNames[1] ? subModules[1] : subModules[0],
            filter: this.getFilteredOptions(),
            sort: { sortBy: 'create_ts', sortOrder: 'desc' },
            pagination: this.pagination
        };

        return payload;
    }

    handleFilterSelection() {
        this.fetchTasks();
    }

    isAGroup(value) {
        return value.type && value.type === 'group';
    }

    removeSpace(key: any) {
        return 'task-manager-' + key.replace(/ /g, '-');
    }

    resetAllFilters() {
        const filter = this.getSession().filter;
        this.utilsService.setSessionStorageValue(filter, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchTaskFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    refreshFilter() {
        this.fetchTaskFilters(this.getSearchPayload());
    }

    getSession(): any {
        switch (this.activeTab) {
            case this.tabNames[1]:
                return this.sessionStorage.completed;
            default:
                return this.sessionStorage.pending;
        }
    }

    processTaskResponse(responseData: any) {
        this.tasks = responseData['searchResponse'];
        this.totalTasks = responseData['totalCount'];
        this.newTaskCount = 0;
        if (responseData['customFieldDisplayList']) {
            this.customFieldDisplayList = responseData['customFieldDisplayList'];
        }
        this.pageLoading = false;
        this.isFetchingTasks = false;
        this.fetchNewTasksCount(this.tasks);
    }

    fetchTasks() {
        this.tasks = [];
        this.isFetchingTasks = true;
        const payload = {
            module: this.module,
            filter: this.getFilteredOptions(),
            sort: { sortBy: 'create_ts', sortOrder: 'desc' },
            pagination: this.pagination
        };

        let fetchTask;
        this.activeTab === this.tabNames[1]
            ? (fetchTask = this.taskManagerService.getTaskHistory(payload))
            : (fetchTask = this.taskManagerService.getTasks(payload));

        fetchTask.subscribe(
            response => {
                this.processTaskResponse(response);
            },
            failResponse => {
                this.pageLoading = false;
                this.isFetchingTasks = false;
            }
        );
    }

    handleReviewClick(task: any) {
        switch (task.task_type.id) {
            case 'TC_CERTIFICATE_APPROVAL':
                this.openTCApprovalModal(task);
                break;
            case 'SC_CERTIFICATE_APPROVAL':
            case 'FACILITY_CREATION':
            case 'REASON_FOR_DELAY':
            case 'SCOPE_CERTIFICATE_NOT_AVAILABLE':
                this.openSCApprovalFlowModal(task);
                break;
            case 'BOM_VALIDATION_FAILURE':
            case 'MATERIAL_MISMATCH':
                this.fetchWaitingForApprovalTransactionDetailAndView(task);
                break;
        }
    }

    openTCApprovalModal(task) {
        const tcApprovalModal = this.dialog.open(TcApprovalFlowComponent, {
            width: '100vw',
            maxWidth: '98vw',
            height: '97vh',
            panelClass: 'tc-approval-dialog',
            data: {
                task: task,
                taskId: task.task_id,
                certId: task.cert_id,
                type: 'Transaction',
                showClose: true,
                certificationType: 'TC',
                fromCompanyId: task.from_company.id,
                toCompanyId: task.to_company.id,
                showActionButtons: this.activeTab === this.tabNames[1] ? false : true
            }
        });
        tcApprovalModal.afterClosed().subscribe(response => {
            this.fetchTasks();
        });
    }

    openSCApprovalModal(task: any) {
        const scApprovalModal = this.dialog.open(ScApprovalModalComponent, {
            width: '500px',
            maxWidth: '500px',
            height: '500px',
            panelClass: 'sc-approval-dialog',
            data: {
                task: JSON.parse(JSON.stringify(task)),
                type: 'Scope Certificate',
                showClose: true,
                certificationType: 'SC'
            }
        });
        scApprovalModal.afterClosed().subscribe(response => {
            this.fetchTasks();
        });
    }

    openSCApprovalFlowModal(task: any) {
        const scApprovalFlow = this.dialog.open(ScApprovalFlowComponent, {
            width: '100vw',
            maxWidth: '98vw',
            height: '97vh',
            panelClass: 'tc-approval-dialog',
            data: {
                task: JSON.parse(JSON.stringify(task)),
                type: 'Scope Certificate',
                showClose: true,
                certificationType: 'SC',
                isSCAvailable: task.cert_id ? true : false,
                showActionButtons: this.activeTab === this.tabNames[1] ? false : true,
                actionType: this.activeTab === this.tabNames[1] ? 'View' : 'Review'
            }
        });
        scApprovalFlow.afterClosed().subscribe(response => {
            this.fetchTasks();
        });
    }

    fetchWaitingForApprovalTransactionDetailAndView(task: any) {
        this.pageLoading = true;

        this.taskManagerService.getEntityForWaitingApprovalTransaction(task.task_id).subscribe(taskObject => {
            this.taskManagerService.getWaitingApprovalTransactionDetail(taskObject.entityId).subscribe(
                transactionData => {
                    this.pageLoading = false;

                    // changing fromCompany and toCompany to add Notification to Supplier
                    const fromCompany = JSON.parse(JSON.stringify(taskObject.toCompany));
                    const toCompany = JSON.parse(JSON.stringify(taskObject.fromCompany));
                    taskObject.fromCompany = fromCompany;
                    taskObject.toCompany = toCompany;

                    this.openBOMValidationFailureModal(task, transactionData, taskObject);
                },
                failResponse => {
                    this.toastr.error('Unable to fetch data. Please try after some time.', 'Failed');
                    this.pageLoading = false;
                }
            );
        });
    }

    openBOMValidationFailureModal(taskHistory: any, transactionData: any, taskObject: any) {
        const bomValidationFailureFlow = this.dialog.open(BomValidationFailureFlowComponent, {
            width: '100vw',
            maxWidth: '98vw',
            height: '97vh',
            panelClass: 'bom-validation-dialog',
            data: {
                task: JSON.parse(JSON.stringify(transactionData)),
                taskHistory: JSON.parse(JSON.stringify(taskHistory)),
                taskRequestPayload: JSON.parse(JSON.stringify(taskObject)),
                type: 'BOM Validation Failure',
                showClose: true,
                showCloseButton: false,
                showActionButtons: this.activeTab === this.tabNames[1] ? false : true,
                actionType: this.activeTab === this.tabNames[1] ? 'View' : 'Review'
            }
        });
        bomValidationFailureFlow.afterClosed().subscribe(response => {
            this.fetchTasks();
        });
    }

    ngOnDestroy() {
        this.routerSubscription.unsubscribe();
    }

    fetchNewTasksCount(tasks) {
        const yesterdayDate = this.getYesterdayDate();
        tasks.forEach(task => {
            if (task.create_ts && new Date(task.create_ts) >= yesterdayDate) {
                this.newTaskCount++;
            }
        });
    }

    getYesterdayDate() {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return new Date(date.setDate(date.getDate() - 1));
    }
}
