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
import { IMaterials, IMaterialsDetail } from './materials-lite.model';
import { MaterialsLiteService } from './materials-lite.service';

@Component({
    selector: 'app-materials-lite',
    templateUrl: './materials-lite.component.html',
    styleUrls: ['./materials-lite.component.scss']
})
export class MaterialsLiteComponent implements OnInit {
    env = environment;

    refresh: Subscription;

    pageLoading: boolean = true;
    isMaterialsAvailable: boolean = true;
    fetchingMaterialsData: boolean = true;
    totalCountFlag: boolean = false;
    closeSortByFilter: boolean = false;

    totalCount = 0;
    FETCH_SIZE = 50;
    height = 200;

    searchText: string = '';
    filter_session = 'materials_filters';
    sortBy_session = 'materials_sort';
    importDataDialogClass = 'import-material-data-dialog';
    submitErrorDialogClass = 'submit-material-error-dialog';
    ANALYTICS_EVENT_Materials_MANAGEMENT = 'Materials Lite';
    ANALYTICS_ACTION_Materials_MANAGEMENT_VIEWED = 'Materials Lite Page Viewed';

    customFieldDisplayList: any = [];
    materialsFilters: any = {};
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: this.FETCH_SIZE
    };
    optionsParam = { key: 'id', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    materials: IMaterialsDetail[] = [];
    // sortByValues = ['quantity_high_to_low', 'quantity_low_to_high', 'create_ts'];
    sortByValues = [
        {
            key: 'create_ts',
            value: 'Newly Added'
        }
    ];

    userSelectedMaterials = [];
    module = 'MATERIAL_LIBRARY_LITE';

    constructor(
        private toastr: CustomToastrService,
        private materialsService: MaterialsLiteService,
        private commonServices: CommonServices,
        private utilsService: UtilsService,
        private dialog: MatDialog,
        private titleService: Title,
        private analyticsService: AnalyticsService,
        private appContext: ContextService
    ) {
        this.titleService.setTitle('TrusTrace | Materials');
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[
            this.analyticsService.PROPERTY_ACTION_PERFORMED
        ] = this.ANALYTICS_ACTION_Materials_MANAGEMENT_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_Materials_MANAGEMENT, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.materials = [];
                this.initialize();
            }
        });
    }

    getAllMaterials() {
        this.pageLoading = true;

        this.materialsService.getMaterials(this.getSearchPayload()).subscribe(
            response => {
                const data = response['data'];
                this.processMaterialsResponse(data);
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
        return 'materials-lite-' + key.replace(/ /g, '-');
    }

    refreshFilter() {
        this.fetchMaterialsFilters(this.getSearchPayload());
    }

    processMaterialsFilters(data: any) {
        this.materialsFilters = data;
        this.pageLoading = false;
    }

    processMaterialsResponse(data: IMaterials) {
        if (data['searchResponse'].length > 0) {
            const _materials = [];
            data['searchResponse'].forEach((searchResult: IMaterialsDetail) => {
                const _searchResult = JSON.parse(JSON.stringify(searchResult));
                _materials.push(_searchResult);
            });
            this.materials = JSON.parse(JSON.stringify(_materials));
        }

        this.totalCount = data.totalCount;
        if (data.customFieldDisplayList) {
            this.customFieldDisplayList = data.customFieldDisplayList;
        }
        this.closeSortByFilter = false;
        this.pageLoading = false;
    }

    fetchMaterialsFilters(payload) {
        this.pageLoading = true;
        this.materialsService.getMaterialsFilter(payload).subscribe(response => {
            this.processMaterialsFilters(response['data']);
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
        this.materials = [];
        this.pagination = {
            from: 0,
            size: this.FETCH_SIZE
        };
    }

    handleFilterSelection() {
        this.resetPagination();
        this.getAllMaterials();
    }

    handleDateFilterSelection(eventData: any) {
        this.resetPagination();
        this.getAllMaterials();
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchMaterialsFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    searchMaterials(event) {
        if (event.key === 'Enter') {
            this.resetPagination();
            this.getAllMaterials();
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
        this.getAllMaterials();
    }

    hasUserSelectedAllMaterials() {
        if (this.userSelectedMaterials.length > 0) {
            return true;
        }
    }

    handleSelectAllMaterials($event) {
        if ($event.checked) {
            this.userSelectedMaterials = [];
            this.materials.forEach(material => {
                this.userSelectedMaterials.push(material.id);
            });
        } else {
            this.userSelectedMaterials = [];
        }
    }

    hasUserSelectedMaterials() {
        if (this.userSelectedMaterials.length > 0) {
            return true;
        }
    }

    handlePOSelect($event: MatCheckboxChange, material: IMaterialsDetail) {
        if ($event.checked) {
            this.userSelectedMaterials = [];
            if (this.userSelectedMaterials.indexOf(material.id) === -1) {
                this.userSelectedMaterials.push(material.id);
            }
        } else {
            if (this.userSelectedMaterials.indexOf(material.id) !== -1) {
                this.userSelectedMaterials.splice(this.userSelectedMaterials.indexOf(material.id), 1);
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
        this.getAllMaterials();
    }

    initialize() {
        this.fetchingMaterialsData = true;
        this.materials = [];
        if (this.utilsService.getSessionStorageValue(this.sortBy_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortBy_session);
        } else {
            this.setSortByFilter();
        }

        const payload = this.getSearchPayload();
        forkJoin([
            this.materialsService.getMaterialsFilter(payload),
            this.materialsService.getMaterials(payload)
        ]).subscribe(response => {
            const filtersData = response[0]['data'];
            const materialsData = response[1]['data'];
            this.processMaterialsFilters(filtersData);
            this.processMaterialsResponse(materialsData);
            this.fetchingMaterialsData = false;
        });
    }

    openImportExcelModal() {
        const importDialog = this.dialog.open(ImportDataComponent, {
            panelClass: this.importDataDialogClass,
            data: {
                fileName: 'Materials-Import-Template',
                fileType: 'CERT',
                numberOfErrorsToBeShown: 10,
                downloadDataCallBack: this.materialsService.downloadMaterialData.bind(this.materialsService),
                uploadDataCallBack: this.materialsService.uploadMaterialData.bind(this.materialsService),
                handleUploadComplete: false,
                texts: {
                    title: 'Import material library data',
                    subDownloadTitle: 'Download all of the template data, add/modify and re upload the Excel sheet',
                    subUploadTitle:
                        'Upload an Excel sheet to import all of the Material Library data into the application',
                    downloadButton: 'Download template data',
                    uploadSuccess:
                        'Material library data are imported successfully and available as draft. Please review and submit them'
                }
            }
        });
        importDialog.afterClosed().subscribe(response => {
            this.toastr.clear();
            if (response.event === 'Close') {
                this.initialize();
            }
        });
    }

    submitMaterials() {
        this.materialsService.submitMaterials(this.userSelectedMaterials).subscribe(
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
                    this.toastr.success('Materials are successfully submitted.');
                }
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('We could not process your request.', 'Error!');
            }
        );
    }

    handleCancelClick() {
        this.userSelectedMaterials = [];
    }

    navigateToDetailPage(material: IMaterialsDetail) {
        this.commonServices.navigateToUrlWithLocationBack(['/', 'materials-lite', material.id]);
    }
}
