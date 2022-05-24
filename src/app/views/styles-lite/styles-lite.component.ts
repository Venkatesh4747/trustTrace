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
import { IStyles, IStylesDetail } from './styles-lite.model';
import { StylesLiteService } from './styles-lite.service';

@Component({
    selector: 'app-styles-lite',
    templateUrl: './styles-lite.component.html',
    styleUrls: ['./styles-lite.component.scss']
})
export class StylesLiteComponent implements OnInit {
    env = environment;

    refresh: Subscription;

    pageLoading: boolean = true;
    isStylesAvailable: boolean = true;
    fetchingStylesData: boolean = true;
    totalCountFlag: boolean = false;
    closeSortByFilter: boolean = false;

    totalCount = 0;
    FETCH_SIZE = 50;
    height = 200;

    searchText: string = '';
    filter_session = 'styles_lite_filters';
    sortBy_session = 'styles_lite_sort';
    importDataDialogClass = 'import-style-data-dialog';
    submitErrorDialogClass = 'submit-style-error-dialog';
    ANALYTICS_EVENT_STYLES = 'Styles Lite page';
    ANALYTICS_ACTION_STYLES_VIEWED = 'Styles Lite Page Viewed';

    customFieldDisplayList: any = [];
    stylesFilters: any = {};
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: this.FETCH_SIZE
    };
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    styles: IStylesDetail[] = [];
    // sortByValues = ['quantity_high_to_low', 'quantity_low_to_high', 'create_ts'];
    sortByValues = [
        {
            key: 'create_ts',
            value: 'Newly Added'
        }
    ];

    userSelectedStyles = [];
    module = 'STYLE_LITE';
    constructor(
        private toastr: CustomToastrService,
        private styleService: StylesLiteService,
        private commonServices: CommonServices,
        private utilsService: UtilsService,
        private dialog: MatDialog,
        private titleService: Title,
        private analyticsService: AnalyticsService,
        private appContext: ContextService
    ) {
        this.titleService.setTitle('TrusTrace | Styles');
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_STYLES_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_STYLES, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.styles = [];
                this.initialize();
            }
        });
    }

    getAllStyles() {
        this.pageLoading = true;

        this.styleService.getStyles(this.getSearchPayload()).subscribe(
            response => {
                const data = response['data'];
                this.processStylesResponse(data);
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
        return 'styles-lite-' + key.replace(/ /g, '-');
    }

    refreshFilter() {
        this.fetchStylesFilters(this.getSearchPayload());
    }

    processPOFilters(data: any) {
        this.stylesFilters = data;
        this.pageLoading = false;
    }

    processStylesResponse(data: IStyles) {
        if (data['searchResponse'].length > 0) {
            const _styles = [];
            data['searchResponse'].forEach((searchResult: IStylesDetail) => {
                const _searchResult = JSON.parse(JSON.stringify(searchResult));
                _styles.push(_searchResult);
            });
            this.styles = JSON.parse(JSON.stringify(_styles));
        }

        this.totalCount = data.totalCount;
        if (data.customFieldDisplayList) {
            this.customFieldDisplayList = data.customFieldDisplayList;
        }
        this.closeSortByFilter = false;
        this.pageLoading = false;
    }

    fetchStylesFilters(payload) {
        this.pageLoading = true;
        this.styleService.getStylesFilter(payload).subscribe(response => {
            this.processPOFilters(response['data']);
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
        this.styles = [];
        this.pagination = {
            from: 0,
            size: this.FETCH_SIZE
        };
    }

    handleFilterSelection() {
        this.resetPagination();
        this.getAllStyles();
    }

    handleDateFilterSelection(eventData: any) {
        this.resetPagination();
        this.getAllStyles();
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchStylesFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    searchStyles(event) {
        if (event.key === 'Enter') {
            this.resetPagination();
            this.getAllStyles();
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
        this.getAllStyles();
    }

    hasUserSelectedAllStyles() {
        if (this.userSelectedStyles.length > 0) {
            return true;
        }
    }

    handleSelectAllStyles($event) {
        if ($event.checked) {
            this.userSelectedStyles = [];
            this.styles.forEach(product => {
                this.userSelectedStyles.push(product.id);
            });
        } else {
            this.userSelectedStyles = [];
        }
    }

    hasUserSelectedStyles() {
        if (this.userSelectedStyles.length > 0) {
            return true;
        }
    }

    handlePOSelect($event: MatCheckboxChange, product: IStylesDetail) {
        if ($event.checked) {
            this.userSelectedStyles = [];
            if (this.userSelectedStyles.indexOf(product.id) === -1) {
                this.userSelectedStyles.push(product.id);
            }
        } else {
            if (this.userSelectedStyles.indexOf(product.id) !== -1) {
                this.userSelectedStyles.splice(this.userSelectedStyles.indexOf(product.id), 1);
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
        this.getAllStyles();
    }

    initialize() {
        this.fetchingStylesData = true;
        this.styles = [];
        if (this.utilsService.getSessionStorageValue(this.sortBy_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortBy_session);
        } else {
            this.setSortByFilter();
        }

        const payload = this.getSearchPayload();
        forkJoin([this.styleService.getStylesFilter(payload), this.styleService.getStyles(payload)]).subscribe(
            response => {
                const filtersData = response[0]['data'];
                const stylesData = response[1]['data'];
                this.processPOFilters(filtersData);
                this.processStylesResponse(stylesData);
                this.fetchingStylesData = false;
            }
        );
    }

    openImportExcelModal() {
        const importDialog = this.dialog.open(ImportDataComponent, {
            panelClass: this.importDataDialogClass,
            data: {
                fileName: 'Styles-Import-Template',
                fileType: 'CERT',
                numberOfErrorsToBeShown: 10,
                downloadDataCallBack: this.styleService.downloadStylesData.bind(this.styleService),
                uploadDataCallBack: this.styleService.uploadStylesData.bind(this.styleService),
                handleUploadComplete: false,
                texts: {
                    title: 'Import product library data',
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

    submitStyles() {
        this.styleService.submitStyles(this.userSelectedStyles).subscribe(
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
                    this.toastr.success('Styles are successfully submitted.');
                }
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('We could not process your request.', 'Error!');
            }
        );
    }

    handleCancelClick() {
        this.userSelectedStyles = [];
    }

    navigateToDetailPage(style: IStylesDetail) {
        this.commonServices.navigateToUrlWithLocationBack(['/', 'styles-lite', style.id]);
    }
}
