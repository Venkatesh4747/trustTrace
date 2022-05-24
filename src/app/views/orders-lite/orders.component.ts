import { Component, HostListener, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { environment as env } from '../../../environments/environment';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { ContextService } from '../../shared/context.service';
import { SupplyChainFlowComponent } from '../../shared/modals/supply-chain-flow/supply-chain-flow.component';
import { UploadTransactionDocumentsComponent } from '../../shared/modals/upload-transaction-documents/upload-transaction-documents.component';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { OrdersService } from './orders.service';
import { AuthService } from '../../core/user/auth.service';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
    public env = env;
    searchText = '';
    filter_session = 'orders_lite_filters';
    sortby_session = 'orders_lite_sort';
    refresh: Subscription;
    pageLoading = true;
    isTransactionsAvailable = true;
    closeSortByFilter = false;
    disableInfiniteScroll = true;
    ordersFilters: any = {};
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };
    height = 200;

    transactions = [];
    totalCountFlag = false;
    totalCount = 0;
    supplyChainProduct;
    productPromise;

    ANALYTICS_EVENT_TRANSACTIONS = 'Transactions';
    ANALYTICS_ACTION_TRANSACTIONS_VIEWED = 'Transactions Page Viewed';

    qrCodeToPrint: any = '';
    isPrintReady: boolean;
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    @ViewChild('printQRCodeComponent', { static: false }) printQRCodeComponent;

    constructor(
        private ordersService: OrdersService,
        private utilsService: UtilsService,
        public commonServices: CommonServices,
        private titleService: Title,
        private appContext: ContextService,
        private toastr: CustomToastrService,
        private dialog: MatDialog,
        private localizationService: LocalizationService,
        private analyticsService: AnalyticsService,
        public authService: AuthService
    ) {
        this.titleService.setTitle('TrusTrace | Transactions');
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        setTimeout(() => {
            this.height =
                document.getElementById('filter-bar-wrapper').offsetHeight +
                document.getElementById('orders-header').offsetHeight;
        }, 0);
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_TRANSACTIONS_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_TRANSACTIONS, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.transactions = [];
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
        forkJoin([this.ordersService.getOrdersFilter(payload), this.ordersService.getOrders(payload)]).subscribe(
            response => {
                const filtersData = response[0]['data'];
                const ordersData = response[1]['data'];
                this.processOrderFilters(filtersData);
                this.processOrdersResponse(ordersData);
            }
        );
    }

    setSortByFilter() {
        switch (this.sortByFilter.sortBy) {
            case 'sml_name':
                this.sortByFilter.sortOrder = 'asc';
                break;
            case 'create_ts':
                this.sortByFilter.sortOrder = 'desc';
                break;
            case 'status':
                this.sortByFilter.sortOrder = 'asc';
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
        this.ordersService.getOrdersFilter(payload).subscribe(response => {
            this.processOrderFilters(response['data']);
        });
    }

    private getSearchPayload() {
        const payload = {
            filter: this.getFilteredOptions(),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortby_session),
            pagination: this.pagination
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        return payload;
    }

    processOrdersResponse(data: any) {
        if (data['searchResponse'].length > 0) {
            data['searchResponse'].forEach(searchResult => {
                searchResult.transaction_tree = '/orders-lite/' + searchResult.id + '/transaction-tree';
                this.transactions.push(searchResult);
            });
            this.disableInfiniteScroll = false;
        }
        // TODO: Remove. Used to auto trigger upload document modal on page-load
        // this.uploadDocuments(this.transactions[0]);
        this.totalCount = data.totalCount;
        this.closeSortByFilter = false;
        this.pageLoading = false;
        if (Object.keys(this.updateFiltersSelection()).length > 0) {
            this.onResize();
        }
    }

    getAllOrders() {
        this.pageLoading = true;
        this.disableInfiniteScroll = true;

        this.ordersService.getOrders(this.getSearchPayload()).subscribe(
            response => {
                const data = response['data'];
                console.log(data);
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
    onScroll() {
        this.pagination.from = this.pagination.from + env.FETCH_SIZE;
        if (!this.disableInfiniteScroll) {
            this.getAllOrders();
        }
    }

    resetPagination() {
        this.transactions = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }
    handleSortBy() {
        this.setSortByFilter();
        this.resetPagination();
        this.getAllOrders();
    }

    updateFiltersSelection() {
        return this.utilsService.getSessionStorageValue(this.filter_session) || {};
    }

    handleFilterSelection() {
        this.resetPagination();
        this.totalCountFlag = true;
        this.getAllOrders();
    }

    searchStyle(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
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

    viewSupplyChainFlow(orderId) {
        this.ordersService.getOrdersSupplyChain(orderId).subscribe(
            (response: any) => {
                this.supplyChainProduct = response.data.data;
                this.localizationService.addToMasterData(response['data'].masterData);
                this.dialog.open(SupplyChainFlowComponent, {
                    width: '700px',
                    height: '825px',
                    data: {
                        supplyChain: this.supplyChainProduct
                    }
                });
            },
            () => {
                this.toastr.error(
                    env.error_messages.could_not_fetch_data.message,
                    env.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    isAgroup(value) {
        return value.type && value.type === 'group' ? true : false;
    }

    refreshFilter() {
        this.fetchOrderFilters(this.getSearchPayload());
    }

    printQR(transaction: any) {
        this.analyticsService.trackButtonClick(
            'Upload documents',
            'Transactions card view',
            transaction.id,
            transaction.external_id
        );
        this.isPrintReady = false;
        if (transaction.unique_code) {
            this.qrCodeToPrint = transaction.unique_code;
            this.isPrintReady = true;
            setTimeout(() => {
                this.printQRCodeComponent.printQRCode();
            }, 100);
            return;
        }
        alert('QR code does not exist for this transaction.');
    }

    uploadDocuments(transaction: any) {
        this.analyticsService.trackButtonClick(
            'Upload documents',
            'Transactions card view',
            transaction.id,
            transaction.external_id
        );
        this.ordersService.getRequiredCertificatesList(transaction.id).subscribe(
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
                        entity_type: 'TRANSACTION_LITE'
                    }
                });
            },
            errorResponse => {
                console.log(errorResponse);
            }
        );
    }
    ngOnDestroy() {
        if (this.refresh) {
            this.refresh.unsubscribe();
        }
    }
}
