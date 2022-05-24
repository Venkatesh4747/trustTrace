import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { forkJoin, Subscription } from 'rxjs';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { environment as env } from '../../../environments/environment';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { ContextService } from '../../shared/context.service';
import { ConfirmDialogComponent } from '../../shared/modals/confirm-dialog/confirm-dialog.component';
import { ImportDataComponent } from '../../shared/modals/import-data/import-data.component';
import { UtilsService } from '../../shared/utils/utils.service';
import { IPO, IPODetail } from './po-management.model';
import { PoManagementService } from './po-management.service';

@Component({
    selector: 'app-po-management',
    templateUrl: './po-management.component.html',
    styleUrls: ['./po-management.component.scss']
})
export class PoManagementComponent implements OnInit {
    refresh: Subscription;

    pageLoading = true;
    isPOAvailable = true;
    fetchingPOData = true;
    totalCountFlag = false;
    closeSortByFilter = false;

    totalCount = 0;
    FETCH_SIZE = 50;
    height = 200;

    searchText = '';
    filter_session = 'po_filters';
    sortBy_session = 'po_sort';
    importDataDialogClass = 'import-po-data-dialog';
    submitErrorDialogClass = 'submit-po-error-dialog';
    ANALYTICS_EVENT_PO_MANAGEMENT = 'PO Management';
    ANALYTICS_ACTION_PO_MANAGEMENT_VIEWED = 'PO Management Page Viewed';

    customFieldDisplayList: any = [];
    posFilters: any = {};
    sortByFilter = {
        sortBy: 'delivery_date',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    pos: IPODetail[] = [];
    tempPos: IPODetail[] = [];
    // sortByValues = ['quantity_high_to_low', 'quantity_low_to_high', 'delivery_date'];
    sortByValues = [
        {
            key: 'delivery_date',
            value: 'Delivery Date'
        },
        {
            key: 'update_ts',
            value: 'Newly Added'
        }
    ];

    userSelectedPos = [];

    IMG_URL = env.IMG_URL;

    constructor(
        private toastr: CustomToastrService,
        private poService: PoManagementService,
        private commonServices: CommonServices,
        private utilsService: UtilsService,
        private dialog: MatDialog,
        private titleService: Title,
        private analyticsService: AnalyticsService,
        private appContext: ContextService,
        private router: Router
    ) {
        this.titleService.setTitle('TrusTrace | PO Management');
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_PO_MANAGEMENT_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_PO_MANAGEMENT, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.pos = [];
                this.initialize();
            }
        });
    }

    getAllPOs() {
        this.pageLoading = true;

        this.poService.getPOs(this.getSearchPayload()).subscribe(
            response => {
                const data = response['data'];
                this.processPOsResponse(data);
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
        return 'po-management-' + key.replace(/ /g, '-');
    }

    refreshFilter() {
        this.fetchPOFilters(this.getSearchPayload());
    }

    processPOFilters(data: any) {
        this.posFilters = data;
        this.pageLoading = false;
    }

    processPOsResponse(data: IPO) {
        if (data['searchResponse'].length > 0) {
            const _pos = [];
            data['searchResponse'].forEach((searchResult: IPODetail) => {
                const _searchResult = JSON.parse(JSON.stringify(searchResult));
                _pos.push(_searchResult);
            });
            this.pos = JSON.parse(JSON.stringify(_pos));
        }

        this.totalCount = data.totalCount;
        if (data.customFieldDisplayList) {
            this.customFieldDisplayList = data.customFieldDisplayList;
        }
        this.closeSortByFilter = false;
        this.pageLoading = false;
        this.fetchingPOData = false;
    }

    fetchPOFilters(payload) {
        this.pageLoading = true;
        this.poService.getPOsFilter(payload).subscribe(response => {
            this.processPOFilters(response['data']);
        });
    }

    getSearchPayload() {
        const payload = {
            filter: this.getFilteredOptions(),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortBy_session),
            pagination: this.pagination
        };

        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }

        return payload;
    }

    resetPagination() {
        this.pos = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }

    handleFilterSelection() {
        this.resetPagination();
        this.getAllPOs();
    }

    handleDateFilterSelection(eventData: any) {
        this.resetPagination();
        this.getAllPOs();
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchPOFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    searchPOs(event) {
        if (event.key === 'Enter') {
            this.resetPagination();
            this.getAllPOs();
        }
    }

    setSortByFilter() {
        switch (this.sortByFilter.sortBy) {
            case this.sortByValues[0].key:
                this.sortByFilter.sortOrder = 'desc';
                break;
            case this.sortByValues[1].key:
                this.sortByFilter.sortOrder = 'desc';
                break;
            // case this.sortByValues[2].key:
            //     this.sortByFilter.sortOrder = 'desc';
            //     break;
        }
        this.utilsService.setSessionStorageValue(this.sortBy_session, this.sortByFilter);
    }

    handleSortBy(event) {
        this.setSortByFilter();
        this.resetPagination();
        this.getAllPOs();
    }

    hasUserSelectedAllPos() {
        return this.pos.length !== 0 && this.userSelectedPos.length === this.pos.length;
    }

    handleSelectAllPOs($event) {
        if ($event.checked) {
            this.userSelectedPos = [];
            this.pos.forEach(po => {
                const selectedPO = {
                    poNumber: po.transaction_id,
                    sellerGLN: po.seller_gln.id
                };
                this.userSelectedPos.push(selectedPO);
            });
        } else {
            this.userSelectedPos = [];
        }
    }

    hasUserSelectedPo(poId: string) {
        return this.userSelectedPos.some(po => po.poNumber === poId);
    }

    deleteFromUserSelectedPos(po: IPODetail) {
        if (this.userSelectedPos.some(poItem => poItem.poNumber === po.transaction_id)) {
            const index = this.userSelectedPos.map(poData => poData.poNumber).indexOf(po.transaction_id);
            this.userSelectedPos.splice(index, 1);
        }
    }

    addToUserSelectedPos(po: IPODetail) {
        if (!this.userSelectedPos.some(poItem => poItem.poNumber === po.transaction_id)) {
            const selectedPO = {
                poNumber: po.transaction_id,
                sellerGLN: po.seller_gln.id
            };
            this.userSelectedPos.push(selectedPO);
        }
    }

    handlePOSelect($event: MatCheckboxChange, po: IPODetail) {
        if ($event.checked) {
            // this.userSelectedPos = [];
            this.addToUserSelectedPos(po);
        } else {
            this.deleteFromUserSelectedPos(po);
        }
    }

    onScroll(state: string) {
        switch (state) {
            case 'back':
                if (this.pagination.from >= env.FETCH_SIZE) {
                    this.pagination.from = this.pagination.from - env.FETCH_SIZE;
                }
                break;
            case 'next':
                this.pagination.from = this.pagination.from + env.FETCH_SIZE;
                break;
            default:
                this.toastr.error('The action you tried to perform is invalid.', 'Invalid action!');
                break;
        }
        this.getAllPOs();
    }

    initialize() {
        this.userSelectedPos = [];
        this.fetchingPOData = true;
        this.pos = [];
        if (this.utilsService.getSessionStorageValue(this.sortBy_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortBy_session);
        } else {
            this.setSortByFilter();
        }

        const payload = this.getSearchPayload();
        forkJoin([this.poService.getPOsFilter(payload), this.poService.getPOs(payload)]).subscribe(response => {
            const filtersData = response[0]['data'];
            const posData = response[1]['data'];
            this.processPOFilters(filtersData);
            this.processPOsResponse(posData);
        });
    }

    openImportExcelModal() {
        const importDialog = this.dialog.open(ImportDataComponent, {
            panelClass: this.importDataDialogClass,
            data: {
                fileName: 'PO-Management-Import-Template',
                fileType: 'CERT',
                numberOfErrorsToBeShown: 10,
                downloadDataCallBack: this.poService.downloadPOData.bind(this.poService),
                uploadDataCallBack: this.poService.uploadPOData.bind(this.poService),
                handleUploadComplete: false,
                uploadResponseProperties: {
                    errorKey: 'errors'
                },
                texts: {
                    title: 'Import purchase order data',
                    subDownloadTitle: 'Download all of the template data, add/modify and re upload the Excel sheet',
                    subUploadTitle: 'Upload an Excel sheet to import all of the PO data into the application',
                    downloadButton: 'Download template data',
                    uploadSuccess: 'PO data imported successfully'
                }
            }
        });
        importDialog.afterClosed().subscribe(response => {
            if (response.event === 'Close') {
                this.initialize();
            }
        });
    }

    deletePOs() {
        const deleteConfirmationDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Warning!',
                class: 'po-management-confirm-dialog',
                msg: 'Are you sure you want to delete? Deleting will remove all of its associated Purchase Orders',
                primaryButton: 'Cancel',
                secondaryButton: 'Delete',
                showClose: false
            }
        });
        deleteConfirmationDialog.afterClosed().subscribe(response => {
            if (response) {
                const responseArray = response.split(',');
                if (responseArray[0] === 'Delete') {
                    this.poService.deletePOs(this.userSelectedPos).subscribe(
                        response => {
                            if (response['status'] === 'SUCCESS') {
                                setTimeout(() => {
                                    this.initialize();
                                }, 2000);
                                this.toastr.success('PO items are successfully deleted.');
                            } else {
                                this.pageLoading = false;
                                this.toastr.error(
                                    'We could not process your request. Please try after sometime.',
                                    'Error!'
                                );
                            }
                        },
                        error => {
                            this.pageLoading = false;
                            this.toastr.error(
                                'We could not process your request. Please try after sometime.',
                                'Error!'
                            );
                        }
                    );
                }
            }
        });
    }

    handleCancelClick() {
        this.userSelectedPos = [];
    }

    navigateToDetailPage(poId: string, styleId: string, event): void {
        if (!event.path[0].className.includes('mat-checkbox')) {
            this.router.navigate(['/', 'po-management', poId, styleId]);
        }
    }
}
