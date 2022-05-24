import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../core/user/auth.service';
import { ContextService } from './../../shared/context.service';

import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { DataExportEntity, IndexTypeMapper, ImportStatuses } from '../../shared/const-values';
import { ConfirmDialogComponent } from '../../shared/modals/confirm-dialog/confirm-dialog.component';
import { ConfirmationModalComponent } from '../../shared/modals/confirmation-modal/confirmation-modal.component';
import { MultiIndustryService } from '../../shared/multi-industry-support/multi-industry.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { environment as env } from './../../../environments/environment';
import { SideNavigationService } from './../../shared/side-navigation/side-navigation.service';
import { MaterialLibraryService } from './material-library.service';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { ImportComponent } from '../../shared/modals/import/import.component';
import { IImportApiResponse, steps } from '../../shared/models/import.model';

@Component({
    selector: 'app-material-library',
    templateUrl: './material-library.component.html',
    styleUrls: ['./material-library.component.scss']
})
export class MaterialLibraryComponent implements OnInit, OnDestroy {
    sideNavigation;
    refresh: Subscription;
    module = 'ML';
    pageLoading = false;
    isMaterialsAvailable = false;
    closeSortByFilter = false;
    searchText = '';
    filter_session = 'ml_filters';
    sortby_session = 'ml_sort';
    optionsParam = { key: 'id', value: 'value' };

    filterOptions = {};
    materialsFilters = {};
    materialsList: any = [];
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };
    height = 250;
    totalCount = 0;
    totalCountFlag = false;
    isProcessing = false;
    certValueList: any = [];
    overRideProducts = false;
    private EXCEL_FILENAME = 'Raw Materials.xlsx';
    IMG_URL = env.IMG_URL;

    constructor(
        public dialog: MatDialog,
        private titleService: Title,
        private sideNav: SideNavigationService,
        private mtrLibService: MaterialLibraryService,
        private utilsService: UtilsService,
        private router: Router,
        private appContext: ContextService,
        private toastr: CustomToastrService,
        private analyticsService: AnalyticsService,
        private commonServices: CommonServices,
        private multiIndustryService: MultiIndustryService,
        private authService: AuthService
    ) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Raw Materials');
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
    onResize(event?) {
        this.height =
            document.getElementById('filter-bar-wrapper').offsetHeight +
            document.getElementById('material-library-header').offsetHeight;
    }

    ANALYTICS_EVENT_RAW_MATERIALS = 'Raw Materials';
    ANALYTICS_ACTION_RAW_MATERIALS_VIEWED = 'Raw Materials Page Viewed';
    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_RAW_MATERIALS_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_RAW_MATERIALS, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.initialize();
                this.overRideProducts = true;
            }
        });
    }

    get checkAccess(): (name: string) => boolean {
        return this.authService.haveAccess.bind(this.authService);
    }

    removeSpace(key: any) {
        return 'raw-materials-' + key.replace(/ /g, '-');
    }

    initialize() {
        this.pageLoading = true;
        if (this.utilsService.getSessionStorageValue(this.sortby_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortby_session);
        } else {
            this.setSortByFilter();
        }

        this.fetchMLFilters(this.getSearchPayload());
        this.getAllMaterials();
    }

    setSortByFilter() {
        if (this.sortByFilter.sortBy === 'internal_article_name') {
            this.sortByFilter.sortOrder = 'asc';
        } else if (this.sortByFilter.sortBy === 'create_ts') {
            this.sortByFilter.sortOrder = 'desc';
        }
        this.utilsService.setSessionStorageValue(this.sortby_session, this.sortByFilter);
    }

    private fetchMLFilters(payload) {
        this.pageLoading = true;
        this.mtrLibService.getMaterialLibraryFilter(payload).subscribe(response => {
            this.materialsFilters = response['data'];
            this.filterOptions = this.updateFiltersSelection();
            setTimeout(() => {
                this.onResize();
            }, 0);
            this.pageLoading = false;
        });
    }

    getAllMaterials() {
        this.pageLoading = true;
        const payload = this.getSearchPayload();
        this.mtrLibService.getAllMaterials(payload).subscribe(
            response => {
                const data = response['data'];
                if (data['searchResponse'].length > 0) {
                    this.materialsList = data['searchResponse'];
                }
                this.closeSortByFilter = false;
                this.pageLoading = false;
                this.totalCount = data.totalCount;
                if (!this.isMaterialsAvailable && this.materialsList.length > 0) {
                    this.isMaterialsAvailable = true;
                }
                if (Object.keys(this.filterOptions).length > 0) {
                    setTimeout(() => {
                        this.onResize();
                    }, 0);
                }
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastr.info(env.error_messages.no_authorization, 'Insufficient Permission');
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

    private getSearchPayload() {
        const payload = {
            module: this.module,
            filter: this.getFilteredOptions(),
            sort: this.commonServices.getSortbyFilteredOptions(this.sortby_session),
            pagination: this.pagination
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        return payload;
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
            this.getAllMaterials();
        }
    }

    resetPagination() {
        this.materialsList = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }
    handleSortBy() {
        this.setSortByFilter();
        this.resetPagination();
        this.getAllMaterials();
    }
    updateFiltersSelection() {
        this.filterOptions = this.utilsService.getSessionStorageValue(this.filter_session) || {};
        if (this.filterOptions) {
            this.isMaterialsAvailable = true;
        }
        return this.filterOptions;
    }

    handleFilterSelection() {
        this.resetPagination();
        this.totalCountFlag = true;
        this.getAllMaterials();
    }

    searchMaterials(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.resetPagination();
            this.totalCountFlag = true;
            this.getAllMaterials();
        }
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchMLFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    refreshFilter() {
        this.fetchMLFilters(this.getSearchPayload());
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

    showEditDialog(materialId: string) {
        const colorEditDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Edit',
                msg: this.multiIndustryService.getLabel(
                    'Editing this material will affect areas where it was previously used. Are you sure you want to edit?'
                ),
                primaryButton: 'No',
                secondaryButton: 'Yes'
            }
        });
        colorEditDialog.afterClosed().subscribe(response => {
            if (response) {
                const responseArray = response.split(',');
                if (responseArray[0] === 'Yes') {
                    this.router.navigate(['/', 'material-library', materialId, 'edit']);
                }
            }
        });
    }

    archiveMaterial(id: string): void {
        this.analyticsService.trackEvent(`Archive Material - ${id}`, {
            Origin: 'Material list',
            Action: 'Archive material clicked'
        });
        if (this.authService.haveAccess('ML_ARCHIVE')) {
            const dialogRef = this.dialog.open(ConfirmationModalComponent, {
                width: '375px',
                data: {
                    groupId: id,
                    title: 'Archive Material',
                    description: [
                        `${this.commonServices.getTranslation('Are you sure you want to archive this material')}?`,
                        this.commonServices.getTranslation('Any references to this material in styles'),
                        this.commonServices.getTranslation('will not be affected')
                    ],
                    buttonName: 'Archive Material',
                    isEnable: true,
                    showClose: true
                }
            });
            dialogRef.componentInstance.handleDelete.pipe(take(1)).subscribe(data => {
                dialogRef.close();
                this.mtrLibService.archiveMaterial(id).subscribe(
                    data => {
                        this.removeMaterial(id); //remove material from local props
                        this.toastr.success('The material archived successfully', 'Success');
                        this.pageLoading = true;
                        setTimeout(() => {
                            this.overRideProducts = true;
                            this.initialize();
                        }, 2000); // due to elastic search delay temp fix
                    },
                    error => {
                        this.toastr.error('Unable to archive material,Please try again', 'Error');
                    }
                );
            });
        } else {
            this.toastr.info(env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    public removeMaterial = (materialId: string): any =>
        (this.materialsList = this.materialsList.filter(data => data.id !== materialId));

    ngOnDestroy() {
        if (this.refresh) {
            this.refresh.unsubscribe();
        }
    }

    downloadRawMaterialsDataAsExcel() {
        this.isProcessing = true;
        const filterOption = this.getFilteredOptions();

        const payload = {
            entity: DataExportEntity.ML,
            filter: filterOption,
            type: IndexTypeMapper.MATERIAL_LIBRARY
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

    private onDownloadErrorHandle(data: any): void {
        if (data.hasOwnProperty('error') && data.error.hasOwnProperty('error')) {
            this.toastr.error(`Failed to download file. Error: ${data.error.error}`);
        } else {
            this.toastr.error(`Failed to download file. Please try again later.`);
        }
        this.isProcessing = false;
    }

    importMaterial(): void {
        const importDialog = this.dialog.open(ImportComponent, {
            panelClass: '',
            data: {
                titles: {
                    createTitle: 'Create New Material',
                    updateTitle: 'Edit Material',
                    createDesc: '',
                    updateDesc: 'Coming Soon'
                },
                create: {
                    texts: {
                        title: 'Create/Edit materials',
                        downloadText: 'Download template to add/edit your materials in spreadsheet',
                        downloadBtnText: 'Download Template',
                        editText: 'Edit the information on your spreadsheet application',
                        uploadText: 'Re upload the excel for the material to be updated in your account'
                    },
                    fileName: 'import-materials',
                    downloadCallBack: this.mtrLibService.downloadData.bind(this.mtrLibService),
                    importCallBack: this.mtrLibService.uploadData.bind(this.mtrLibService)
                },
                update: {
                    texts: {
                        title: 'Edit material',
                        downloadText: 'Download template to edit material in spreadsheet',
                        downloadBtnText: 'Download Template',
                        editText: 'Edit the information on your spreadsheet application',
                        uploadText: 'Re upload the excel for email id changes added in your account'
                    },
                    fileName: 'export-materials',
                    downloadCallBack: this.mtrLibService.downloadData.bind(this.mtrLibService),
                    importCallBack: this.mtrLibService.uploadData.bind(this.mtrLibService)
                },
                btnTexts: {
                    primaryBtnText: 'Import',
                    secondaryBtnText: 'Cancel'
                },
                handleUploadCompleteCallBack: this.handleImportMaterialUploadComplete(),
                step: steps.CREATE
            }
        });
        importDialog.afterClosed().subscribe((response: IImportApiResponse) => {
            this.handleImportMaterialUploadComplete(response);
        });
    }

    private handleImportMaterialUploadComplete(response?: IImportApiResponse): void {
        if (response?.status === ImportStatuses.IMPORT_COMPLETED) {
            this.initialize();
            this.toastr.success('The material data has been imported successfully.', 'Import successful!');
        }
    }
}
