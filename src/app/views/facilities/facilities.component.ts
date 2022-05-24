import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as FileSaver from 'file-saver';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { environment as env } from '../../../environments/environment';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { DataExportEntity, ImportStatuses, IndexTypeMapper } from '../../shared/const-values';
import { ContextService } from '../../shared/context.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { FacilitiesService } from './facilities.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../core';
import { Filters, IFacilityProfile, tabs } from './facilities.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Payload } from '../suppliers/sub-supplier-details/sub-supplier-profile.model';
import { ImportComponent } from '../../shared/modals/import/import.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-facilities',
    templateUrl: './facilities.component.html',
    styleUrls: ['./facilities.component.scss']
})
export class FacilitiesComponent implements OnInit, OnDestroy {
    @ViewChild('filterBarWrapper', { read: ElementRef }) filterBarWrapper: ElementRef<HTMLDivElement>;
    public env = env;
    isSubFacilitiesSelected = false;
    subFacilities;
    pageLoading = false;

    @Input() suppliers;
    @Input() subSuppliers;
    @Input() countries;
    @Input() searchText;

    activeTab: tabs = null;
    routerSubscription: Subscription;
    facilities: IFacilityProfile[];
    facilityFilters = {};
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };
    height = 200;
    totalCount = 0;
    totalCountFlag = false;
    isProcessing = false;
    closeSortByFilter = false;
    optionsParam = { key: 'id', value: 'value' };
    sessionStorage = {
        supplierFacilities: {
            filter: 'facility_filters',
            sortBy: 'facility_sort'
        },
        subSupplierFacilities: {
            filter: 'sub_supplier_facility_filters',
            sortBy: 'sub_supplier_facility_sort'
        }
    };
    address = {
        addressLine1: '',
        addressLine2: '',
        country: '',
        countryCode: '',
        state: '',
        city: '',
        zip: '',
        latitude: '',
        longitude: ''
    };
    private EXCEL_FILENAME = 'Facility.xlsx';

    importDialogClass = 'import-facilities';

    ANALYTICS_EVENT_FACILITIES = 'Facilities';
    ANALYTICS_ACTION_FACILITIES_VIEWED = 'Facilities Page Viewed';
    module = 'FACILITY';

    get haveFacilityCreateAccess(): (name: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    constructor(
        private facilitiesService: FacilitiesService,
        public localeService: LocalizationService,
        private utilService: UtilsService,
        private appContext: ContextService,
        private toastr: CustomToastrService,
        private analyticsService: AnalyticsService,
        private commonServices: CommonServices,
        private activeRouter: ActivatedRoute,
        private router: Router,
        private titleService: Title,
        private auth: AuthService,
        private dialog: MatDialog
    ) {}

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
        this.height = this.filterBarWrapper.nativeElement.offsetHeight + 75;
    }

    // TODO refactor this iteration
    ngOnInit(): void {
        this.initializeFragments();
    }

    private initializeFragments(): void {
        this.routerSubscription = this.activeRouter.fragment.subscribe((fragment: tabs) => {
            const currentUrl = this.router.url.split('/');
            if (currentUrl.length < 3) {
                let tempActiveTab;
                tempActiveTab = this.activeTab;
                this.activeTab = fragment;
                if (fragment === 'sub_suppliers_facility') {
                    this.titleService.setTitle('TrusTrace | Sub Suppliers Facilities');
                } else {
                    this.titleService.setTitle('TrusTrace | Suppliers Facilities');
                    this.activeTab = null;
                }
                if (Array.isArray(this.facilities) && tempActiveTab !== this.activeTab) {
                    this.resetPagination();
                    this.initialize();
                    this.pageLoading = true;
                }
            }
            if (!this.pageLoading) {
                this.initialize();
            }
        });
    }

    private initialize(): void {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_FACILITIES_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_FACILITIES, analyticsOptions);
        this.pageLoading = true;
        let sortBy = this.getSession().sortBy;
        if (this.utilService.getSessionStorageValue(sortBy)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(sortBy);
        } else {
            this.setSortByFilter();
        }
        this.fetchFacilityFilters(this.getSearchPayload());
        this.getData();
    }

    private getData(): void {
        if (this.activeTab === 'sub_suppliers_facility') {
            this.getSubSupplierFacilities();
        } else {
            this.getAllFacilities();
        }
    }

    getSession(): Filters {
        if (this.activeTab === 'sub_suppliers_facility') {
            return this.sessionStorage.subSupplierFacilities;
        }
        return this.sessionStorage.supplierFacilities;
    }

    private setSortByFilter(): void {
        if (this.sortByFilter.sortBy === 'name') {
            this.sortByFilter.sortOrder = 'asc';
        } else if (this.sortByFilter.sortBy === 'create_ts') {
            this.sortByFilter.sortOrder = 'desc';
        }
        this.utilService.setSessionStorageValue(this.getSession().sortBy, this.sortByFilter);
    }

    refreshFilter() {
        this.fetchFacilityFilters(this.getSearchPayload());
    }

    private fetchFacilityFilters(payload: Payload): void {
        this.pageLoading = true;
        if (this.activeTab === 'sub_suppliers_facility') {
            payload.filter['Ancestors'] = [this.auth.companyId];
            this.getSubSupplierFacilitiesFilter(payload);
        } else {
            this.getSupplierFacilitiesFilter(payload);
        }
    }

    private getSubSupplierFacilitiesFilter(payload: Payload): void {
        this.facilitiesService.getSubSupplierFacilityFilters(payload).subscribe(
            filterResponse => {
                this.facilityFilters = filterResponse;
                setTimeout(() => {
                    this.height = this.filterBarWrapper.nativeElement.offsetHeight + 75;
                }, 0);
                this.pageLoading = false;
            },
            error => {
                if (error.status === 403) {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                } else {
                    this.onErrorHandle(error, 'sub suppliers facility filter');
                }
                this.pageLoading = false;
            }
        );
    }

    private getSupplierFacilitiesFilter(payload: Payload): void {
        this.facilitiesService.getFacilityFilters(payload).subscribe(
            response => {
                this.facilityFilters = response['data'];
                setTimeout(() => {
                    this.height = this.filterBarWrapper.nativeElement.offsetHeight + 75;
                }, 0);
                this.pageLoading = false;
            },
            error => {
                if (error.status === 403) {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                } else {
                    this.onErrorHandle(error, 'supplier facility filter');
                }
                this.pageLoading = false;
            }
        );
    }

    private onErrorHandle(error: HttpErrorResponse, type: string): void {
        if (error?.error?.hasOwnProperty('message')) {
            this.toastr.error(error.error.message);
        } else {
            this.toastr.error(`Unable to load ${type} data please try again`);
        }
        this.pageLoading = false;
    }

    private getAllFacilities(): void {
        this.pageLoading = true;
        const payload = this.getSearchPayload();
        this.facilitiesService.getAllFacilities(payload).subscribe(
            response => {
                this.facilities = [];
                const data = response['data'];
                if (data['searchResponse'].length > 0) {
                    data['searchResponse'].forEach(searchResult => {
                        searchResult['is_sub_supplier'] = false;
                        this.facilities.push(searchResult);
                    });
                }
                this.totalCount = data.totalCount;
                this.closeSortByFilter = false;
                this.pageLoading = false;
                if (Object.keys(this.updateFiltersSelection()).length > 0) {
                    setTimeout(() => {
                        this.height = this.filterBarWrapper.nativeElement.offsetHeight + 75;
                    });
                }
            },
            () => {
                this.toastr.error('Error while getting all facilities');
                this.pageLoading = false;
            }
        );
    }

    private getSubSupplierFacilities(): void {
        this.pageLoading = true;
        const payload = this.getSearchPayload();
        payload.filter['Ancestors'] = [this.auth.companyId];
        this.facilitiesService.getSubSupplierSFacilities(payload).subscribe(
            response => {
                this.facilities = [];
                const data = response;
                data['searchResponse']?.forEach(searchResult => {
                    searchResult['is_sub_supplier'] = true;
                    this.facilities.push(searchResult);
                });
                this.totalCount = data.totalCount;
                this.closeSortByFilter = false;
                this.pageLoading = false;
                if (Object.keys(this.updateFiltersSelection()).length > 0) {
                    setTimeout(() => {
                        this.height = this.filterBarWrapper.nativeElement.offsetHeight + 75;
                    });
                }
            },
            () => {
                this.toastr.error('Error while getting all sub supplier facilities');
                this.pageLoading = false;
            }
        );
    }

    private getSearchPayload(): Payload {
        const payload = {
            module: this.module,
            filter: this.getFilteredOptions(),
            sort: this.commonServices.getSortbyFilteredOptions(this.getSession().sortBy),
            pagination: this.pagination
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        return payload;
    }

    getCountryCode(countryName: string): string {
        return this.countries.find(_country => _country.name === countryName)?.code?.toLowerCase();
    }

    onScroll(state: string): void {
        const _paginationFrom = this.pagination.from;
        switch (state) {
            case 'back':
                if (this.pagination.from >= env.FETCH_SIZE) {
                    this.pagination.from = this.pagination.from - env.FETCH_SIZE;
                }
                break;
            case 'next':
                if (this.pagination.from + env.FETCH_SIZE < this.totalCount) {
                    this.pagination.from = this.pagination.from + env.FETCH_SIZE;
                }
                break;
            default:
                this.toastr.error('The action you tried to perform is invalid.', 'Invalid action!');
                break;
        }
        if (_paginationFrom !== this.pagination.from) {
            this.getData();
        }
    }

    private resetPagination(): void {
        this.facilities = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }

    handleSortBy(): void {
        this.setSortByFilter();
        this.resetPagination();
        this.getData();
    }

    private updateFiltersSelection(): Filters {
        return this.utilService.getSessionStorageValue(this.getSession().filter) || {};
    }

    handleFilterSelection(): void {
        this.resetPagination();
        this.totalCountFlag = true;
        this.getData();
    }

    searchFacilities(event: KeyboardEvent): void {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.resetPagination();
            this.totalCountFlag = true;
            this.getData();
        }
    }

    resetAllFilters(): void {
        this.utilService.setSessionStorageValue(this.getSession().filter, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchFacilityFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    private getFilteredOptions(): unknown {
        const tempFilterOptions = {};
        const options = this.utilService.getSessionStorageValue(this.getSession().filter);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return tempFilterOptions;
    }

    removeSpace(key: any) {
        return 'facilities-' + key.replace(/ /g, '-');
    }

    downloadFacilitiesDataAsExcel() {
        this.isProcessing = true;
        const filterOption = this.getFilteredOptions();

        const payload = {
            entity: DataExportEntity.FACILITY,
            filter: filterOption,
            type: IndexTypeMapper.FACILITY_PROFILE
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

    navigateToFragments(props = ''): void {
        this.router.navigate(['/facilities'], { fragment: props });
    }

    navigateToFacilityProfile({ supplier_facility_id, company_id, is_sub_supplier }: IFacilityProfile): void {
        if (!is_sub_supplier && supplier_facility_id) {
            this.router.navigate(['/', 'facilities', supplier_facility_id]);
        } else if (is_sub_supplier && company_id && supplier_facility_id) {
            this.router.navigate(['/', 'facilities', supplier_facility_id, company_id]);
        }
    }

    importFacilities(): void {
        const importDialog = this.dialog.open(ImportComponent, {
            panelClass: this.importDialogClass,
            data: {
                titles: {
                    createTitle: 'Create New Facilities',
                    updateTitle: 'Edit Facility Profile',
                    createDesc: '',
                    updateDesc: 'Coming Soon'
                },
                create: {
                    texts: {
                        title: 'Create new facility',
                        downloadText: 'Download template to add your facilities in spreadsheet',
                        downloadBtnText: 'Download Template',
                        editText: 'Edit the information on your spreadsheet application',
                        uploadText: 'Re upload the excel for the facility to be added in your account'
                    },
                    fileName: 'import-facilities',
                    downloadCallBack: this.facilitiesService.downloadData.bind(this.facilitiesService),
                    importCallBack: this.facilitiesService.uploadData.bind(this.facilitiesService)
                },
                update: {
                    texts: {
                        title: 'Edit facility invite',
                        downloadText: 'Download template to edit facility invite in spreadsheet',
                        downloadBtnText: 'Download Template',
                        editText: 'Edit the information on your spreadsheet application',
                        uploadText: 'Re upload the excel for email id changes added in your account'
                    },
                    fileName: 'export-facilities',
                    downloadCallBack: this.facilitiesService.downloadData.bind(this.facilitiesService),
                    importCallBack: this.facilitiesService.uploadData.bind(this.facilitiesService)
                },
                btnTexts: {
                    primaryBtnText: 'Import',
                    secondaryBtnText: 'Cancel'
                },
                handleUploadCompleteCallBack: this.handleImportFacilitiesUploadComplete.bind(this)
            }
        });
        importDialog.afterClosed().subscribe(response => {
            if (response.status === ImportStatuses.IMPORT_COMPLETED) {
                this.handleImportFacilitiesUploadComplete();
            }
        });
    }

    handleImportFacilitiesUploadComplete(): void {
        this.initialize();
        this.toastr.success(
            'The facility data has been imported successfully and the data will reflect in the platform shortly.',
            'Import successful!'
        );
    }

    ngOnDestroy(): void {
        this.routerSubscription?.unsubscribe();
    }
}
