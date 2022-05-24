import { CustomToastrService } from './../../shared/commonServices/custom-toastr.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Subscription, forkJoin } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { AuthService } from '../../core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { ContextService } from '../../shared/context.service';
import { ImportDataComponent } from '../../shared/modals/import-data/import-data.component';
import { UploadTransactionDocumentsComponent } from '../../shared/modals/upload-transaction-documents/upload-transaction-documents.component';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import {
    INotificationDetail,
    ITierConfigPayload,
    ITierValue,
    ITransaction,
    ITransactionDetail,
    SEARCH_CONTEXT,
    TRANSACTION_TYPE
} from './transactions.model';
import { TransactionsService } from './transactions.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SubmitErrorPopupComponent } from './submit-error-popup/submit-error-popup.component';
import { ConfirmDialogComponent } from '../../shared/modals/confirm-dialog/confirm-dialog.component';
import { ScopeCertificatesService } from '../scope-certificates/scope-certificates.service';
import { BomValidationFailureFlowComponent } from '../task-manager/bom-validation-failure-flow/bom-validation-failure-flow.component';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {
    routerSubscription: Subscription;

    importDialog: any;

    importDataDialogClass = 'import-transactions-data-dialog';
    submitErrorDialogClass = 'submit-draft-transactions-error-dialog';
    tabs = ['submitted_transactions', 'draft_transactions', 'deleted_transactions', 'approval_status'];

    FETCH_SIZE = env.FETCH_SIZE;
    searchText = '';
    filter_session = 'transactions_filters';
    sortby_session = 'transactions_sort';
    tier_session = 'transactions_tier';
    refresh: Subscription;

    pageLoading = true;
    load = false;
    closeSortByFilter = false;
    disableInfiniteScroll = true;
    selectAllTransactions = false;
    ordersFilters: any = {};
    sortByFilter = {
        sortBy: 'update_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: this.FETCH_SIZE
    };
    height = 200;

    transactions: ITransactionDetail[] = [];

    totalCountFlag = false;
    totalCount = 0;
    supplyChainProduct;
    productPromise;

    ANALYTICS_EVENT_TRANSACTIONS = 'Transactions';
    ANALYTICS_ACTION_TRANSACTIONS_VIEWED = 'Transactions Page Viewed';

    qrCodeToPrint: any = '';
    isPrintReady: boolean;
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    // tabs config
    activeTab = this.tabs[0];
    fetchingTransactionsData = true;
    userSelectedTransactions: string[] = [];

    IMG_URL = env.IMG_URL;
    selectedTier: ITierValue = {
        key: '',
        value: ''
    };
    tiers = ['tr_tier1', 'tr_tier2', 'tr_tier3', 'tr_tier4'];
    tiers_associated: ITierValue[] = [];
    tierDownloadPayload: ITierConfigPayload = {
        brandCompanyId: '000000000000000000000000',
        tier: SEARCH_CONTEXT.T1,
        searchContext: `${SEARCH_CONTEXT.T1}_${TRANSACTION_TYPE.INBOUND}`,
        txType: TRANSACTION_TYPE.INBOUND
    };
    tierUploadPayload: ITierConfigPayload = {
        brandCompanyId: '000000000000000000000000',
        tier: SEARCH_CONTEXT.T1,
        searchContext: SEARCH_CONTEXT.T1,
        txType: TRANSACTION_TYPE.INBOUND
    };
    module = 'TT_TRANSACTION';

    notificationDetail: INotificationDetail = {
        isValid: true,
        message: ''
    };

    get checkAccess(): (name: string) => boolean {
        return this.authService.haveAccess.bind(this.authService);
    }

    constructor(
        private transactionsService: TransactionsService,
        private dialog: MatDialog,
        private titleService: Title,
        private utilsService: UtilsService,
        private commonServices: CommonServices,
        private appContext: ContextService,
        private toastr: CustomToastrService,
        private localizationService: LocalizationService,
        private analyticsService: AnalyticsService,
        public authService: AuthService,
        private router: Router,
        private scService: ScopeCertificatesService,
        private activeRouter: ActivatedRoute
    ) {}

    @HostListener('window:resize', ['$event'])
    onResize() {
        /*  setTimeout(() => {
            this.height = document.getElementById('filter-bar-wrapper') + document.getElementById('orders-header');
        }, 0); */
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_TRANSACTIONS_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_TRANSACTIONS, analyticsOptions);

        const notificationDetailPayload = {
            module: 'TT_TRANSACTION',
            certType: null
        };
        this.transactionsService.getNotificationDetail(notificationDetailPayload).subscribe(data => {
            if (data) {
                this.notificationDetail = data;
            }
        });

        this.routerSubscription = this.activeRouter.fragment.subscribe(fragment => {
            const currentUrl = this.router.url.split('/');
            if (currentUrl.length < 3) {
                let tempActiveTab;
                tempActiveTab = this.activeTab;
                this.activeTab = fragment ? fragment : this.tabs[0];
                switch (fragment) {
                    case this.tabs[0]:
                        this.titleService.setTitle('TrusTrace | Submitted Transactions');
                        break;
                    case this.tabs[1]:
                        this.titleService.setTitle('TrusTrace | Draft Transactions');
                        break;
                    case this.tabs[2]:
                        this.titleService.setTitle('TrusTrace | Deleted Transactions');
                        break;
                    case this.tabs[3]:
                        this.titleService.setTitle('TrusTrace | Waiting for approval transactions');
                        break;
                }

                if (
                    this.transactions === null ||
                    this.transactions === undefined ||
                    this.transactions.length === 0 ||
                    tempActiveTab !== this.activeTab
                ) {
                    this.resetPagination();
                    this.initialize();
                    this.load = true;
                }
            }

            if (!this.load) {
                this.initialize();
            }
        });
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.transactions = [];
                this.initialize();
            }
        });
    }

    handleUploadWarningCallBack(ids: string[]) {
        const msgText =
            this.selectedTier.key === this.tiers[0]
                ? `BOM validation failed, Transaction submitted for LO approval with lot ids ${ids.join(', ')}`
                : `Material validation failed. Transaction submitted for LO approval with lot ids ${ids.join(', ')}`;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '375px',
            data: {
                class: 'confirmation-dialog',
                title: 'Warning!',
                msg: msgText,
                primaryButton: 'Okay',
                removeMargins: true,
                showClose: false
            }
        });
        dialogRef.afterClosed().subscribe(response => {
            this.toastr.clear();
            if (response === 'Okay') {
                this.importDialog.close();
                this.router.navigate(['/transactions'], { fragment: 'approval_status' });
            }
        });
    }

    openImportExcelModal() {
        this.importDialog = this.dialog.open(ImportDataComponent, {
            panelClass: this.importDataDialogClass,
            data: {
                fileName: 'Transaction-Import-Template',
                fileType: 'CERT',
                numberOfErrorsToBeShown: 10,
                downloadDataCallBack: this.transactionsService.downloadTransactionsData.bind(
                    this.transactionsService,
                    this.tierDownloadPayload
                ),
                uploadDataCallBack: this.transactionsService.uploadTransactionsData.bind(this.transactionsService),
                handleUploadComplete: false,
                handleUploadWarningCallBack: this.handleUploadWarningCallBack.bind(this),
                uploadResponseProperties: {
                    errorKey: 'errorList',
                    warningKey: 'loApprovalIds'
                },
                filePayload: this.tierUploadPayload,
                texts: {
                    title: 'Import transaction data',
                    subDownloadTitle: 'Download all of the template data, add and upload the Excel sheet',
                    subUploadTitle: 'Upload an Excel sheet to import all of the transaction data into the application',
                    downloadButton: 'Download template data',
                    uploadSuccess:
                        'Transactions imported successfully and available as draft. Please review and submit them',
                    uploadError:
                        'Kindly check MLM ID/Article no,Facility code,Quantity in Kgs,Quantity in UOM,Production No,Date,Invoice number,Input material type'
                }
            }
        });
        this.importDialog.afterClosed().subscribe(response => {
            this.toastr.clear();
            if (response.event === 'Close') {
                this.selectAllTransactions = false;
                this.initialize();
            }
        });
    }

    initialize() {
        this.userSelectedTransactions = [];
        this.fetchingTransactionsData = true;
        this.transactions = [];
        if (this.utilsService.getSessionStorageValue(this.sortby_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortby_session);
        } else {
            this.setSortByFilter();
        }

        // Fetch brand associated from user context
        const brandCompanyId =
            this.authService.user.brandsAssociated && this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : '000000000000000000000000';
        this.tierDownloadPayload.brandCompanyId = brandCompanyId;
        this.tierUploadPayload.brandCompanyId = brandCompanyId;
        this.tiers_associated = this.authService.user.tiersAssociated;

        // Store tier detail in session storage
        if (this.utilsService.getSessionStorageValue(this.tier_session)) {
            this.selectedTier = this.utilsService.getSessionStorageValue(this.tier_session);
            this.tierDownloadPayload.tier = this.selectedTier.key;
            this.tierDownloadPayload.searchContext = `${this.selectedTier.key}_${TRANSACTION_TYPE.INBOUND}`;
            this.tierUploadPayload.searchContext = this.selectedTier.key;
            this.tierUploadPayload.tier = this.selectedTier.key;
        } else {
            if (this.tiers_associated && this.tiers_associated.length > 0) {
                this.selectedTier = this.tiers_associated[0];
                this.handleTierSelection();
            }
        }

        const payload = this.getSearchPayload();
        forkJoin([
            this.transactionsService.getOrdersFilter(payload),
            this.transactionsService.getOrders(payload)
        ]).subscribe(response => {
            const filtersData = response[0]['data'];
            const ordersData = response[1]['data'];
            this.processOrderFilters(filtersData);
            this.processOrdersResponse(ordersData);
            this.fetchingTransactionsData = false;
        });
    }

    navigateTo(tabName: string) {
        this.router.navigate(['/transactions'], { fragment: tabName });
    }

    navigateToTreeView(id: string, event) {
        if (!event.path[0].className.includes('mat-checkbox')) {
            if (this.activeTab === this.tabs[0]) {
                this.router.navigate(['/transactions', id, 'transaction-tree']);
            } else if (this.activeTab === this.tabs[3]) {
                this.fetchWaitingForApprovalTransactionDetailAndView(id);
            }
        }
    }

    removeSpace(key: any) {
        return 'transaction-orders-' + key.replace(/ /g, '-');
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
        this.utilsService.setSessionStorageValue(this.sortby_session, this.sortByFilter);
    }

    processOrderFilters(data: any) {
        this.ordersFilters = data;
        this.pageLoading = false;
        this.onResize();
    }

    private fetchOrderFilters(payload) {
        this.pageLoading = true;
        this.disableInfiniteScroll = true;
        this.transactionsService.getOrdersFilter(payload).subscribe(response => {
            this.processOrderFilters(response['data']);
        });
    }

    private getSearchPayload() {
        const payload = {
            module: this.module,
            filter: this.getFilteredOptions(),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortby_session),
            pagination: this.pagination
        };

        // Specify which (submitted/draft) list of transaction
        // to get based on the tab the user is in.
        switch (this.activeTab) {
            case this.tabs[0]:
                payload.filter['Status'] = ['SUBMITTED'];
                break;
            case this.tabs[1]:
                payload.filter['Status'] = ['DRAFT'];
                break;
            case this.tabs[2]:
                payload.filter['Status'] = ['DELETED'];
                break;
            case this.tabs[3]:
                payload.filter['Status'] = ['WAITING_FOR_APPROVAL', 'REJECTED'];
                break;
        }

        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }

        return payload;
    }

    processOrdersResponse(data: ITransaction) {
        if (data['searchResponse'].length > 0) {
            const _transactions = [];
            data['searchResponse'].forEach((searchResult: ITransactionDetail) => {
                const _searchResult = JSON.parse(JSON.stringify(searchResult));
                _searchResult.transaction_tree = '/orders/' + searchResult.id + '/transaction-tree';
                _transactions.push(_searchResult);
            });
            this.transactions = JSON.parse(JSON.stringify(_transactions));
        }

        this.totalCount = data.totalCount;

        // Set all selected in case select all transactions are selected
        if (this.selectAllTransactions) {
            this.userSelectedTransactions = [];
            this.transactions.forEach(transaction => {
                this.userSelectedTransactions.push(transaction.id);
            });
        }

        this.closeSortByFilter = false;
        this.pageLoading = false;
        this.totalCount = data.totalCount;
        if (Object.keys(this.updateFiltersSelection()).length > 0) {
            this.onResize();
        }
    }

    getAllOrders() {
        this.pageLoading = true;
        this.disableInfiniteScroll = true;
        this.transactionsService.getOrders(this.getSearchPayload()).subscribe(
            response => {
                const data = response['data'];
                this.processOrdersResponse(data);
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
                this.toastr.error('The action you tried to perform is invalid.', 'Invalid action!');
                break;
        }
        this.getAllOrders();
    }

    resetPagination() {
        this.transactions = [];
        this.selectAllTransactions = false;
        this.pagination = {
            from: 0,
            size: this.FETCH_SIZE
        };
    }
    handleSortBy(event) {
        this.selectAllTransactions = false;
        this.setSortByFilter();
        this.resetPagination();
        this.getAllOrders();
    }

    updateFiltersSelection() {
        return this.utilsService.getSessionStorageValue(this.filter_session) || {};
    }

    handleFilterSelection() {
        this.selectAllTransactions = false;
        this.resetPagination();
        this.totalCountFlag = true;
        this.getAllOrders();
    }

    searchTransactions(event) {
        if (event.key === 'Enter') {
            this.selectAllTransactions = false;
            this.resetPagination();
            this.totalCountFlag = true;
            this.getAllOrders();
        }
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchOrderFilters(this.getSearchPayload());
        this.handleFilterSelection();
        this.userSelectedTransactions = [];
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

    refreshFilter() {
        this.fetchOrderFilters(this.getSearchPayload());
    }

    uploadDocuments(transaction: any) {
        this.analyticsService.trackButtonClick(
            'Upload documents',
            'Transactions card view',
            transaction.id,
            transaction.external_id
        );
        this.transactionsService.getRequiredCertificatesList(transaction.id).subscribe(
            response => {
                this.dialog.open(UploadTransactionDocumentsComponent, {
                    width: '500px',
                    height: '825px',
                    data: {
                        transaction: JSON.parse(JSON.stringify(transaction)),
                        certList: JSON.parse(JSON.stringify(response['certList'])),
                        other_documents: JSON.parse(JSON.stringify(response['other_documents'])),
                        quality_report: JSON.parse(JSON.stringify(response['quality_report'])),
                        certificates_to_collect: JSON.parse(JSON.stringify(response['certificates_to_collect'])),
                        entity_type: 'TT_TRANSACTION'
                    }
                });
            },
            errorResponse => {
                console.log(errorResponse);
            }
        );
    }

    userSelectAllTransactions($event: MatCheckboxChange) {
        if ($event.checked) {
            this.userSelectedTransactions = [];
            this.transactions.forEach(transaction => {
                this.userSelectedTransactions.push(transaction.id);
            });
        } else {
            this.userSelectedTransactions = [];
            this.selectAllTransactions = false;
        }
    }

    userSelectTransaction($event: MatCheckboxChange, transaction: ITransactionDetail) {
        if ($event.checked) {
            if (this.userSelectedTransactions.indexOf(transaction.id) === -1) {
                this.userSelectedTransactions.push(transaction.id);
            }
        } else {
            this.selectAllTransactions = false;
            if (this.userSelectedTransactions.indexOf(transaction.id) !== -1) {
                this.userSelectedTransactions.splice(this.userSelectedTransactions.indexOf(transaction.id), 1);
            }
        }
    }

    hasUserSelectedTransaction(transaction_id) {
        return this.userSelectedTransactions.indexOf(transaction_id) !== -1;
    }

    hasUserSelectedAllTransactions() {
        return this.transactions.length !== 0 && this.userSelectedTransactions.length === this.transactions.length;
    }

    hasUserSelectedAllDraftTransaction() {
        return this.selectAllTransactions;
    }

    handleSelectAllTransactions($event: MatCheckboxChange) {
        if ($event.checked) {
            this.selectAllTransactions = true;
            this.userSelectedTransactions = [];
            this.transactions.forEach(transaction => {
                this.userSelectedTransactions.push(transaction.id);
            });
        } else {
            this.userSelectedTransactions = [];
            this.selectAllTransactions = false;
        }
    }

    handleCancelClick() {
        this.userSelectedTransactions = [];
    }

    submitDraftTransactions() {
        this.pageLoading = true;
        let submitDraftTransaction;
        this.selectAllTransactions
            ? (submitDraftTransaction = this.transactionsService.submitAllDraftOrders())
            : (submitDraftTransaction = this.transactionsService.submitDraftOrders(this.userSelectedTransactions));
        submitDraftTransaction.subscribe(
            data => {
                this.pageLoading = false;
                this.selectAllTransactions
                    ? this.submitConfirmationTransaction(data)
                    : this.processSubmittedResponse(data);
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('We could not process your request.', 'Error!');
            }
        );
    }
    deleteDraftTransactions(selectedTransaction: string[]): void {
        this.pageLoading = true;
        this.transactionsService.deleteSelectedTransactions(selectedTransaction).subscribe(
            data => {
                this.deletedTransactionResponse(data);
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('We could not process your request.', 'Error!');
            }
        );
    }

    deleteSubmittedTransactions(selectedTransaction: string[]): void {
        this.pageLoading = true;
        this.transactionsService.deleteSelectedSubmittedTransactions(selectedTransaction).subscribe(
            data => {
                this.deletedTransactionResponse(data);
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('We could not process your request.', 'Error!');
            }
        );
    }

    submitConfirmationTransaction(data: any): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '375px',
            data: {
                title: 'Submission in progress.',
                msg: 'Please check after sometime.',
                primaryButton: 'Ok',
                removeMargins: true,
                showClose: false
            }
        });
        dialogRef.afterClosed().subscribe(() => {
            this.processSubmittedResponse(data);
        });
    }
    deleteConfirmationTransaction(selectedTransactions: string[]): void {
        const msgText =
            this.activeTab === this.tabs[1]
                ? 'Are you sure you want to delete? All trailing transactions will also be deleted.'
                : 'Are you sure you want to delete?';
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '375px',
            data: {
                class: 'delete-confirmation-draft-transaction',
                title: 'Warning!',
                msg: msgText,
                primaryButton: 'Cancel',
                secondaryButton: 'Delete',
                removeMargins: true,
                showClose: false
            }
        });
        dialogRef.afterClosed().subscribe(response => {
            if (response === 'Delete') {
                this.activeTab === this.tabs[1]
                    ? this.deleteDraftTransactions(selectedTransactions)
                    : this.deleteSubmittedTransactions(selectedTransactions);
            }
        });
    }

    processSubmittedResponse(data: any): void {
        if (data && data.length > 0 && data[0].errorMsg !== null) {
            const submitErrorDialog = this.dialog.open(SubmitErrorPopupComponent, {
                panelClass: this.submitErrorDialogClass,
                data: {
                    submitErrors: JSON.parse(JSON.stringify(data))
                }
            });
            submitErrorDialog.afterClosed().subscribe(event => {
                this.pageLoading = true;
                this.initialize();
            });
        } else {
            this.toastr.success('Transactions are successfully submitted.');
            this.pageLoading = true;
            this.initialize();
        }
    }
    deletedTransactionResponse(data: any): void {
        if (data && data.length > 0 && data[0].errorMsg !== null) {
            const submitErrorDialog = this.dialog.open(SubmitErrorPopupComponent, {
                panelClass: this.submitErrorDialogClass,
                data: {
                    submitErrors: JSON.parse(JSON.stringify(data))
                }
            });
            submitErrorDialog.afterClosed().subscribe(event => {
                setTimeout(() => {
                    this.initialize();
                }, 2000);
            });
        } else {
            setTimeout(() => {
                this.toastr.success('Transactions are successfully deleted.');
                this.initialize();
            }, 2000);
        }
    }

    fetchWaitingForApprovalTransactionDetailAndView(id: string) {
        this.pageLoading = true;
        this.transactionsService.getWaitingApprovalTransactionDetail(id).subscribe(
            transactionData => {
                this.pageLoading = false;
                this.openBOMValidationFailureModal(transactionData);
            },
            failResponse => {
                this.toastr.error('Unable to fetch data. Please try after some time.', 'Failed');
                this.pageLoading = false;
            }
        );
    }

    openBOMValidationFailureModal(data: any) {
        const bomValidationFailureFlow = this.dialog.open(BomValidationFailureFlowComponent, {
            width: '100vw',
            maxWidth: '98vw',
            height: '97vh',
            panelClass: 'bom-validation-dialog',
            data: {
                task: JSON.parse(JSON.stringify(data)),
                type: 'BOM Validation Failure',
                showClose: true,
                showCloseButton: true,
                showActionButtons: false,
                actionType: 'View'
            }
        });
        bomValidationFailureFlow.afterClosed().subscribe(response => {
            this.router.navigate(['/transactions'], { fragment: this.tabs[3] });
        });
    }

    ngOnDestroy() {
        if (this.refresh) {
            this.refresh.unsubscribe();
        }
    }

    noDataConversion(date) {
        return this.commonServices.convertToDate(date);
    }

    handleTierSelection() {
        this.utilsService.setSessionStorageValue(this.tier_session, this.selectedTier);
        this.tierDownloadPayload.tier = this.selectedTier.key;
        this.tierUploadPayload.tier = this.selectedTier.key;
        this.tierDownloadPayload.searchContext = `${this.selectedTier.key}_${TRANSACTION_TYPE.INBOUND}`;
        this.tierUploadPayload.searchContext = this.selectedTier.key;
    }

    compareTierSelection = (option, value): boolean => {
        return option.key === value.key;
    };

    allowTransactions(type: string) {
        this.pageLoading = true;
        let flag = true;
        const errorMsg = `You don't have a valid SC please upload a SC to create Transaction`;
        this.scService.hasValidSC().subscribe(resp => {
            flag = resp;
            if ('record-transaction' === type) {
                if (flag) {
                    const url = this.router.url;
                    this.router.navigate([url + '/record']);
                } else {
                    this.toastr.error(errorMsg);
                }
            } else if ('import-transaction' === type) {
                if (flag) {
                    this.openImportExcelModal();
                } else {
                    this.toastr.error(errorMsg);
                }
            } else if ('submit-draft-transaction' === type) {
                if (flag) {
                    this.submitDraftTransactions();
                } else {
                    this.toastr.error(errorMsg);
                }
            }
            this.pageLoading = false;
        });
    }
}
