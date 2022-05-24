import { CustomToastrService } from './../../shared/commonServices/custom-toastr.service';
import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { forkJoin, Subscription } from 'rxjs';
import { SubmitErrorPopupComponent } from '../transactions/submit-error-popup/submit-error-popup.component';
import { environment } from './../../../environments/environment';
import { AnalyticsService } from './../../core/analytics/analytics.service';
import { CommonServices } from './../../shared/commonServices/common.service';
import { ContextService } from './../../shared/context.service';
import { ImportDataComponent } from './../../shared/modals/import-data/import-data.component';
import { UtilsService } from './../../shared/utils/utils.service';
import { IBom, IBomDetail } from './bom-lite.model';
import { BomLiteService } from './bom-lite.service';

@Component({
    selector: 'app-bom-lite',
    templateUrl: './bom-lite.component.html',
    styleUrls: ['./bom-lite.component.scss']
})
export class BomLiteComponent implements OnInit {
    env = environment;

    refresh: Subscription;

    pageLoading: boolean = true;
    isBomAvailable: boolean = true;
    fetchingBomData: boolean = true;
    totalCountFlag: boolean = false;
    closeSortByFilter: boolean = false;

    totalCount = 0;
    FETCH_SIZE = 50;
    height = 200;

    searchText: string = '';
    filter_session = 'bom_filters';
    sortBy_session = 'bom_sort';
    importDataDialogClass = 'import-bom-data-dialog';
    submitErrorDialogClass = 'submit-bom-error-dialog';
    ANALYTICS_EVENT_BOM_ = 'BOM Lite';
    ANALYTICS_ACTION_BOM__VIEWED = 'BOM Lite Page Viewed';

    customFieldDisplayList: any = [];
    bomFilters: any = {};
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: this.FETCH_SIZE
    };
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    bomItems: IBomDetail[] = [];
    // sortByValues = ['quantity_high_to_low', 'quantity_low_to_high', 'create_ts'];
    sortByValues = [
        {
            key: 'create_ts',
            value: 'Newly Added'
        }
    ];

    userSelectedBom = [];
    module = 'BOM';
    constructor(
        private toastr: CustomToastrService,
        private bomService: BomLiteService,
        private commonServices: CommonServices,
        private utilsService: UtilsService,
        private dialog: MatDialog,
        private titleService: Title,
        private analyticsService: AnalyticsService,
        private appContext: ContextService
    ) {
        this.titleService.setTitle('TrusTrace | BOM');
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_BOM__VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_BOM_, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.bomItems = [];
                this.initialize();
            }
        });
    }

    getAllBom() {
        this.pageLoading = true;

        this.bomService.getBom(this.getSearchPayload()).subscribe(
            response => {
                const data = response['data'];
                this.processBomResponse(data);
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
        return 'bom-lite-' + key.replace(/ /g, '-');
    }

    refreshFilter() {
        this.fetchBomFilters(this.getSearchPayload());
    }

    processBomFilters(data: any) {
        this.bomFilters = data;
        this.pageLoading = false;
    }

    processBomResponse(data: IBom) {
        if (data['searchResponse'].length > 0) {
            const _boms = [];
            data['searchResponse'].forEach((searchResult: IBomDetail) => {
                const _searchResult = JSON.parse(JSON.stringify(searchResult));
                _boms.push(_searchResult);
            });
            this.bomItems = JSON.parse(JSON.stringify(_boms));
        }

        this.totalCount = data.totalCount;
        if (data.customFieldDisplayList) {
            this.customFieldDisplayList = data.customFieldDisplayList;
        }
        this.closeSortByFilter = false;
        this.pageLoading = false;
    }

    fetchBomFilters(payload) {
        this.pageLoading = true;
        this.bomService.getBomFilter(payload).subscribe(response => {
            this.processBomFilters(response['data']);
        });
    }

    getSearchPayload() {
        const payload = {
            module: this.module,
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
        this.bomItems = [];
        this.pagination = {
            from: 0,
            size: this.FETCH_SIZE
        };
    }

    handleFilterSelection() {
        this.resetPagination();
        this.getAllBom();
    }

    handleDateFilterSelection(eventData: any) {
        this.resetPagination();
        this.getAllBom();
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchBomFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    searchBom(event) {
        if (event.key === 'Enter') {
            this.resetPagination();
            this.getAllBom();
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
        this.getAllBom();
    }

    hasUserSelectedAllBom() {
        if (this.userSelectedBom.length > 0) {
            return true;
        }
    }

    handleSelectAllBom($event) {
        if ($event.checked) {
            this.userSelectedBom = [];
            this.bomItems.forEach(bom => {
                this.userSelectedBom.push(bom.id);
            });
        } else {
            this.userSelectedBom = [];
        }
    }

    hasUserSelectedBom() {
        if (this.userSelectedBom.length > 0) {
            return true;
        }
    }

    handlePOSelect($event: MatCheckboxChange, bom: IBomDetail) {
        if ($event.checked) {
            this.userSelectedBom = [];
            if (this.userSelectedBom.indexOf(bom.id) === -1) {
                this.userSelectedBom.push(bom.id);
            }
        } else {
            if (this.userSelectedBom.indexOf(bom.id) !== -1) {
                this.userSelectedBom.splice(this.userSelectedBom.indexOf(bom.id), 1);
            }
        }
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
        this.getAllBom();
    }

    initialize() {
        this.fetchingBomData = true;
        this.bomItems = [];
        if (this.utilsService.getSessionStorageValue(this.sortBy_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortBy_session);
        } else {
            this.setSortByFilter();
        }

        const payload = this.getSearchPayload();
        forkJoin([this.bomService.getBomFilter(payload), this.bomService.getBom(payload)]).subscribe(response => {
            const filtersData = response[0]['data'];
            const bomData = response[1]['data'];
            this.processBomFilters(filtersData);
            this.processBomResponse(bomData);
            this.fetchingBomData = false;
        });
    }

    openImportExcelModal() {
        const importDialog = this.dialog.open(ImportDataComponent, {
            panelClass: this.importDataDialogClass,
            data: {
                fileName: 'Bom-Import-Template',
                fileType: 'CERT',
                numberOfErrorsToBeShown: 10,
                downloadDataCallBack: this.bomService.downloadBomData.bind(this.bomService),
                uploadDataCallBack: this.bomService.uploadBomData.bind(this.bomService),
                handleUploadComplete: false,
                texts: {
                    title: 'Import bom library data',
                    subDownloadTitle: 'Download all of the template data, add/modify and re upload the Excel sheet',
                    subUploadTitle:
                        'Upload an Excel sheet to import all of the Product Library data into the application',
                    downloadButton: 'Download template data',
                    uploadSuccess:
                        'Product library data are imported successfully and available as draft. Please review and submit them'
                }
            }
        });
        importDialog.afterClosed().subscribe(response => {
            if (response.event === 'Close') {
                this.initialize();
            }
        });
    }

    submitBom() {
        this.bomService.submitBom(this.userSelectedBom).subscribe(
            data => {
                if (data.length > 0) {
                    const submitErrorDialog = this.dialog.open(SubmitErrorPopupComponent, {
                        panelClass: this.submitErrorDialogClass,
                        data: {
                            submitErrors: JSON.parse(JSON.stringify(data))
                        }
                    });
                } else {
                    setTimeout(() => {
                        this.initialize();
                    }, 2000);
                    this.toastr.success('Bom are successfully submitted.');
                }
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('We could not process your request.', 'Error!');
            }
        );
    }

    handleCancelClick() {
        this.userSelectedBom = [];
    }

    navigateToDetailPage(bom: IBomDetail) {
        this.commonServices.navigateToUrlWithLocationBack(['/', 'bom-lite', bom.id]);
    }

    checkYieldValues(values: string[], ind: number): boolean {
        let bomItem;
        let returnVal = true;

        values.forEach(val => {
            bomItem = this.bomItems[ind].yield;
            if (
                returnVal &&
                bomItem[val] &&
                bomItem[val] !== '0.0' &&
                bomItem[val] !== '0' &&
                bomItem[val] !== null &&
                bomItem[val] !== 'null'
            ) {
                returnVal = true;
            } else {
                returnVal = false;
            }
        });

        return returnVal;
    }
}
