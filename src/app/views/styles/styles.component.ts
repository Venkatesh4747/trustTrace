import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { environment as env } from '../../../environments/environment';
import { AuthService } from '../../core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { DataExportEntity, IndexTypeMapper } from '../../shared/const-values';
import { ContextService } from '../../shared/context.service';
import { ConfirmationModalComponent } from '../../shared/modals/confirmation-modal/confirmation-modal.component';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { StylesService } from './styles.service';
import { ImportComponent } from './../../shared/modals/import/import.component';
import { steps } from '../../shared/models/import.model';

@Component({
    selector: 'app-styles',
    templateUrl: './styles.component.html',
    styleUrls: ['./styles.component.scss']
})
export class StylesComponent implements OnInit, OnDestroy {
    public env = env;

    sideNavigation;
    pageLoading = false;
    closeSortByFilter = false;
    searchText = '';
    productsList: any = [];
    styleFilters = {};
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    module = 'STYLE';
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };
    height = 200;
    totalCount = 0;
    totalCountFlag = false;
    refresh: Subscription;
    isProcessing = false;

    filter_session = 'styles_filters';
    sortby_session = 'styles_sort';
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };
    ANALYTICS_EVENT_STYLE = 'Style';
    ANALYTICS_ACTION_STYLE_VIEWED = 'Style Page Viewed';
    private EXCEL_FILENAME = 'Style.xlsx';

    constructor(
        private _formBuilder: FormBuilder,
        private sideNav: SideNavigationService,
        private stylesService: StylesService,
        private toastr: CustomToastrService,
        private router: Router,
        private utils: UtilsService,
        public localeService: LocalizationService,
        private titleService: Title,
        private appContext: ContextService,
        private analyticsService: AnalyticsService,
        private commonServices: CommonServices,
        private dialog: MatDialog,
        private authService: AuthService
    ) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Styles');
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 'ArrowRight':
                    this.onScroll('next');
                    break;
                case 'ArrowLeft':
                    this.onScroll('back');
                    break;
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 130;
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_STYLE_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_STYLE, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.initialize();
            }
        });
    }

    get checkAccess(): (name: string) => boolean {
        return this.authService.haveAccess.bind(this.authService);

    }

    getProductComplianceIconUrl(imageName: string): string {
        return this.utils.getProductComplianceIconUrl(imageName);
    }

    removeSpace(key: any) {
        return 'styles-' + key.replace(/ /g, '-');
    }

    initialize() {
        this.pageLoading = true;

        if (this.utils.getSessionStorageValue(this.sortby_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortby_session);
        } else {
            this.setSortByFilter();
        }

        this.fetchStyleFilters(this.getSearchPayload());
        // Get all products
        this.getAllProducts();
    }

    setSortByFilter() {
        if (this.sortByFilter.sortBy === 'name') {
            this.sortByFilter.sortOrder = 'asc';
        } else if (this.sortByFilter.sortBy === 'create_ts') {
            this.sortByFilter.sortOrder = 'desc';
        }
        this.utils.setSessionStorageValue(this.sortby_session, this.sortByFilter);
    }

    getAllProducts() {
        this.pageLoading = true;
        this.stylesService.getAllProducts(this.getSearchPayload()).subscribe(
            response => {
                const data = response['data'];
                if (data['searchResponse'].length > 0) {
                    this.productsList = data['searchResponse'];
                }
                this.totalCount = data.totalCount;
                this.pageLoading = false;
                if (Object.keys(this.updateFiltersSelection()).length > 0) {
                    setTimeout(() => {
                        this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 130;
                    });
                }
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
                } else {
                    this.toastr.error(
                        env.error_messages.could_not_fetch_data.message,
                        env.error_messages.could_not_fetch_data.title
                    );
                }
                this.pageLoading = false;
            }
        );
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
            this.getAllProducts();
        }
    }

    resetPagination() {
        this.productsList = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }

    handleSortBy() {
        this.setSortByFilter();
        this.closeSortByFilter = false;
        this.resetPagination();
        this.getAllProducts();
    }
    updateFiltersSelection() {
        return this.utils.getSessionStorageValue(this.filter_session) || {};
    }

    handleFilterSelection() {
        this.resetPagination();
        this.totalCountFlag = true;
        this.getAllProducts();
    }

    searchStyle(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.resetPagination();
            this.totalCountFlag = true;
            this.getAllProducts();
        }
    }

    resetAllFilters() {
        this.utils.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchStyleFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    getFilteredOptions() {
        const tempFilterOptions = {};
        const options = this.utils.getSessionStorageValue(this.filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return tempFilterOptions;
    }

    isAGroup(value): boolean {
        return value.type && value.type === 'group';
    }

    refreshFilter() {
        this.fetchStyleFilters(this.getSearchPayload());
    }

    viewStyle(id: string, $event): void {
        if ($event.target.nodeName === 'I' || $event.target.nodeName === 'A') {
            return;
        }
        this.router.navigate(['/styles', id]);
    }

    archiveAudit(id: string): void {
        console.log('prosss',id);

        this.analyticsService.trackEvent(`Archive Style - ${id}`, {
            Origin: 'Style list',
            Action: 'Archive style clicked'
        });
        if (this.authService.haveAccess('STYLE_ARCHIVE')) {
            const dialogRef = this.dialog.open(ConfirmationModalComponent, {
                width: '375px',
                data: {
                    groupId: id,
                    title: 'Archive Style',
                    description: `${this.commonServices.getTranslation(
                        'Are you sure you want to archive this style'
                    )}?`,
                    buttonName: 'Archive Style',
                    isEnable: true,
                    showClose: true
                }
            });
            dialogRef.componentInstance.handleDelete.pipe(take(1)).subscribe(() => {
                dialogRef.close();
                this.stylesService.archiveStyle(id).subscribe(
                    () => {
                        this.removeStyle(id); // remove style from local props
                        this.toastr.success('The style archived successfully', 'Success');
                        this.pageLoading = true;
                        setTimeout(() => {
                            this.initialize();
                        }, 2000); // due to elastic search delay temp fix
                    },
                    () => {
                        this.toastr.error('Unable to archive style, Please try again', 'Error');
                    }
                );
            });
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    public removeStyle = (styleId: string): any =>
        (this.productsList = this.productsList.filter(data => data.id !== styleId));

    getProductDisplayName(product) {
        if (!product) {
            return '';
        }
        let displayName = '';
        if (product.name) {
            displayName += product.name;
        }

        if (product.code) {
            displayName += '-' + product.code;
        }
        return displayName;
    }

    ngOnDestroy() {
        if (this.refresh) {
            this.refresh.unsubscribe();
        }
    }

    downloadStyleDataAsExcel() {
        this.isProcessing = true;
        const filterOption = this.getFilteredOptions();

        const payload = {
            entity: DataExportEntity.STYLE,
            filter: filterOption,
            type: IndexTypeMapper.STYLE
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

    private fetchStyleFilters(payload) {
        this.pageLoading = true;
        this.stylesService.getProductsTemplateFilter(payload).subscribe(response => {
            this.styleFilters = response['data'];
            console.log('111111',this.styleFilters);

            setTimeout(() => {
                this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 130;
            }, 0);
            this.pageLoading = false;
        });
    }

    private getSearchPayload() {
        const payload = {
            filter: this.getFilteredOptions(),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortby_session),
            pagination: this.pagination,
            module: this.module
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        return payload;
    }

    private onDownloadErrorHandle(data: any): void {
        if (data.hasOwnProperty('error') && data.error.hasOwnProperty('error')) {
            this.toastr.error(`Failed to download file. Error: ${data.error.error}`);
        } else {
            this.toastr.error(`Failed to download file. Please try again later.`);
        }
        this.isProcessing = false;
    }

    importStyles(): void {
        this.dialog.open(ImportComponent, {
            panelClass: '',
            data: {
                titles: {
                    createTitle: 'Create New Styles',
                    updateTitle: 'Updating existing styles',
                    updateDesc: 'Coming Soon'
                },
                create: {
                    texts: {
                        title: 'Create/Edit styles',
                        downloadText: 'Download template to add/edit your styles in spreadsheet',
                        downloadBtnText: 'Download Template',
                        editText: 'Edit the information on your spreadsheet application',
                        uploadText: 'Re upload the excel for the styles to be updated in your account'
                    },
                    fileName: 'import-styles',
                    downloadCallBack: this.stylesService.downloadData.bind(this.stylesService),
                    importCallBack: this.stylesService.uploadData.bind(this.stylesService)
                },
                update: {
                    texts: {
                        title: 'Update existing styles',
                        downloadText: 'Download your existing style data from your account',
                        downloadBtnText: 'Download Template',
                        editText: 'Edit the information on your spreadsheet application',
                        uploadText: 'Re upload the excel to your account to update your styles'
                    },
                    fileName: 'export-styles',
                    downloadCallBack: this.stylesService.downloadData.bind(this.stylesService),
                    importCallBack: this.stylesService.uploadData.bind(this.stylesService)
                },
                btnTexts: {
                    primaryBtnText: 'Import',
                    secondaryBtnText: 'Cancel'
                },
                handleUploadCompleteCallBack: this.handleImportStylesUploadComplete.bind(this),
                step: steps.CREATE
            }
        });
    }

    handleImportStylesUploadComplete(): void {
        this.initialize();
        this.toastr.success('The styles data has been imported successfully.', 'Import successful!');
    }
}
