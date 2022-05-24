import { ImportComponent } from './../../shared/modals/import/import.component';
import { TitleCasePipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { environment as env } from '../../../environments/environment';
import { AuthService } from '../../core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';

import { ContextService } from '../../shared/context.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { AssessmentTemplateService } from '../assessment-template/assessment-template.service';
import { AssessmentsService } from '../assessments-launched/assessments.service';
import { ProfileService } from '../company/profile/profile.service';

import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { amplitude, DataExportEntity, ImportStatuses, IndexTypeMapper } from '../../shared/const-values';
import { AddSupplierV2ModalComponent } from '../../shared/modals/add-supplier-v2/add-supplier-v2.component';
import {
    getAddSupplierModelDefaultTemplate,
    IAddSupplierModelData,
    IAddSupplierResponse
} from '../../shared/modals/add-supplier-v2/add-supplier-v2.model';
import { MultiIndustryService } from '../../shared/multi-industry-support/multi-industry.service';
import {
    ISupplierConflicts,
    ISupplierListEvents,
    ISupplierListProfileData,
    tabs,
    tabNames,
    ISubSupplierProfileData
} from './supplier.model';
import { SuppliersService } from './suppliers.service';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-suppliers',
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit, OnDestroy {
    @ViewChild('filterBarWrapper') filterBarWrapper: ElementRef<HTMLDivElement>;
    // tabs config
    activeTab: tabs = null; //null = default supplier list
    tabs = tabNames;
    routerSubscription: Subscription;

    lodash = _;
    searchText = '';
    suppliers: any = [];
    subSuppliers: ISupplierListProfileData[] = [];
    supplierConflicts: ISupplierConflicts[] = [];

    IMG_URL = env.IMG_URL;

    sessionStorage = {
        invited: {
            filter: 'invited_supplier_filter',
            sortBy: 'invited_supplier_sort'
        },
        unInvited: {
            filter: 'un_invited_supplier_filter',
            sortBy: 'un_invited_supplier_sort'
        },
        subSupplier: {
            filter: 'sub_supplier_filter',
            sortBy: 'sub_supplier_sort'
        }
    };

    pageLoading = true;
    public env = env;

    isProcessing = false;
    isSubSupplierProcessing = false;
    isSupplierLinkingProcessing = false;

    supplierFilters = {};
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
    closeSortByFilter = false;
    optionsParam = { key: 'id', value: 'value' };

    questionnaires: any[] = [];
    questionnaire;
    selected;

    launchAssessmentModalReady = false;
    isSuppliersSelected = true;

    @ViewChild('launchAssessmentModal', { static: false }) launchAssessmentModal;
    options: any;
    filterQuestionsHeading = [];
    filterCounter: number;
    selectedFilters: any;
    selectedQuestions = 0;

    selectedSupplierTab = true;
    searchSupplierTerm;
    searchFacilityTerm;
    launchAssessmentModalLoading = [];

    response = [];
    selectedFacilities = [];
    selectedSuppliers = [];
    markedSuppliers = [];
    markedFacilities = [];
    facilities: any;
    modalLaunchingBusy = false;

    minDate = new Date();
    bsValue: Date = new Date();
    colorTheme = 'theme-blue';
    bsConfig: Partial<BsDatepickerConfig>;
    selectedQuestionsLoading: boolean;
    private materialState: number;
    filterStep: number;
    load = false;

    supplier_status_enabled = env.config.supplier_band;

    currentQuestionnaireId = '';

    @ViewChild('launchQuestionnaireModal', { static: true }) launchQuestionnaireModal;

    countries: any = [];
    regions: any = [];
    valueProcesses: any = [];
    materials: any = [];
    standards: any = [];
    standardsImage = env.config.standardsImage;
    viewingFacility: any;

    private EXCEL_FILENAME = 'Supplier.xlsx';
    private SUPPLIER_LINKING_EXCEL_FILENAME = 'Supplier_Linking.xlsx';

    importDialogClass = 'import-suppliers';

    noAuthorizationMessage = env.error_messages.no_authorization;

    get isNotFoodIndustry(): boolean {
        return this.multiIndustryService.industry !== 'food';
    }

    get haveSupplierCreateAccess(): boolean {
        return this.auth.haveAccess('SUPPLIER_CREATE');
    }

    module = 'SUPPLIER';
    constructor(
        private titleService: Title,
        private toastr: CustomToastrService,
        private assessmentService: AssessmentsService,
        private supplierService: SuppliersService,
        private questionnaireService: AssessmentTemplateService,
        private titleCase: TitleCasePipe,
        private companyProfileService: ProfileService,
        private commonServices: CommonServices,
        private analyticsService: AnalyticsService,
        public localeService: LocalizationService,
        public utilsService: UtilsService,
        private appContext: ContextService,
        private activeRouter: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private multiIndustryService: MultiIndustryService,
        private auth: AuthService
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
    onResize(event) {
        this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 150;
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = amplitude.supplier.suppliersList;
        this.analyticsService.trackEvent(amplitude.supplier.title, analyticsOptions);
        this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });

        this.commonServices.getCountries().subscribe(response => {
            const data = response['data'];
            this.countries = data.country;
        });

        this.questionnaireService.getAll().subscribe(response => {
            const data = response.data;
            this.options = data.classifications_metadata;
            this.companyProfileService.getStandards().subscribe(resp => {
                const standards_data = resp['data'];
                this.options['STANDARDS'] = [];
                for (let i = 0; i < standards_data.length; i++) {
                    this.options['STANDARDS'].push(standards_data[i].id);
                }
            });
        });
        // router config
        this.routerSubscription = this.activeRouter.fragment.subscribe((fragment: tabs) => {
            const currentUrl = this.router.url.split('/');
            if (currentUrl.length < 3) {
                let tempActiveTab;
                tempActiveTab = this.activeTab;
                this.activeTab = fragment;
                switch (fragment) {
                    case 'un_invited_suppliers':
                        this.titleService.setTitle('TrusTrace | Un Invited Suppliers');
                        break;
                    case 'sub_suppliers':
                        this.titleService.setTitle('TrusTrace | Sub Suppliers');
                        break;
                    case 'supplier_conflicts':
                        this.titleService.setTitle('TrusTrace | Supplier conflicts');
                        break;
                    default:
                        this.titleService.setTitle('TrusTrace | Suppliers');
                        this.activeTab = null;
                        break;
                }
                if (
                    this.suppliers === null ||
                    this.suppliers === undefined ||
                    this.suppliers.length === 0 ||
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
    }

    get checkAccess(): (name: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    removeSpace(key: any) {
        return 'suppliers-' + key.replace(/ /g, '-');
    }

    initialize(): void {
        this.pageLoading = true;
        if (this.activeTab === 'supplier_conflicts') {
            this.suppliers = [];
            this.getSupplierConflicts();
        } else {
            const sortBy = this.getSession().sortBy;
            if (this.utilsService.getSessionStorageValue(sortBy)) {
                this.sortByFilter = this.commonServices.getSortbyFilteredOptions(sortBy);
            } else {
                this.setSortByFilter();
            }
            this.fetchSupplierFilters(this.getSearchPayload());
            console.log('searchPay',this.getSearchPayload());

            this.getData();
        }
    }

    getData(): void {
        if (this.activeTab !== 'sub_suppliers') {
            this.getAllSuppliersProfile();
        } else {
            this.getAllSubSuppliersProfile();
        }
    }

    getSession(): any {
        switch (this.activeTab) {
            case 'un_invited_suppliers':
                return this.sessionStorage.unInvited;
            case 'sub_suppliers':
                return this.sessionStorage.subSupplier;
            default:
                return this.sessionStorage.invited;
        }
    }

    setSortByFilter() {
        switch (this.sortByFilter.sortBy) {
            case 'supplier_name':
                this.sortByFilter.sortOrder = 'asc';
                break;
            case 'create_ts':
                this.sortByFilter.sortOrder = 'desc';
                break;
            case 'supplier_association_status.id':
                this.sortByFilter.sortOrder = 'asc';
                break;
            case 'supplier_association_status.id_desc':
                this.sortByFilter.sortOrder = 'desc';
                break;
            default:
                break;
        }
        this.utilsService.setSessionStorageValue(this.getSession().sortBy, this.sortByFilter);
    }

    private fetchSupplierFilters(payload) {
        this.pageLoading = true;
        switch (this.activeTab) {
            case 'un_invited_suppliers':
                payload.filter['Supplier Type'] = [10];
                this.supplierService.getUninvitedSupplierFilters(payload).subscribe(
                    response => this.setSupplierFilterData(response['data']),
                    error => {
                        if (error.status === 403) {
                            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                        } else {
                            this.onErrorHandle(error, 'suppliers filter');
                        }
                    }
                );
                break;

            case 'sub_suppliers':
                payload.filter['Supplier Type'] = [10, 15, 20];
                payload['collapse'] = 'supplier_id';
                payload.filter['Ancestors'] = [this.auth.companyId];
                this.supplierService.getSubSupplierFilters(payload).subscribe(
                    response => this.setSupplierFilterData(response['data']),
                    error => {
                        if (error.status === 403) {
                            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                        } else {
                            this.onErrorHandle(error, 'sub suppliers filter');
                        }
                    }
                );
                break;

            default:
                payload.filter['Supplier Type'] = [15, 20];
                this.supplierService.getAcceptedAndUnAcceptedSupplierFilters(payload).subscribe(
                    response => this.setSupplierFilterData(response['data']),
                    error => {
                        if (error.status === 403) {
                            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                        } else {
                            this.onErrorHandle(error, 'Uninvited suppliers filter');
                        }
                    }
                );
                break;
        }
    }

    private setSupplierFilterData(data: any): void {
        this.supplierFilters = data;
        console.log('supppppppsss',this.supplierFilters);

        setTimeout(() => {
            this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 150;
        }, 0);
        this.pageLoading = false;
    }

    private onErrorHandle(error: any, type: string): void {
        if (error.error && error.error.hasOwnProperty('message')) {
            this.toastr.error(error.error.message);
        } else {
            this.toastr.error(`Unable to load ${type} data please try again`);
        }
        this.pageLoading = false;
    }

    getAllSuppliersProfile() {
        this.pageLoading = true;
        const payload = this.getSearchPayload();
        console.log('payzzzz',payload);


        if (this.activeTab === 'un_invited_suppliers') {
                payload.filter['Supplier Type'] = [10];
                console.log('filter',   payload);
                console.log('ansssssssssss',   payload.filter['Supplier Type']);

        } else if (this.activeTab === 'terminated_suppliers') {
            payload.filter['Supplier Type'] = [60];
        } else if (!payload.filter['Supplier Type']) {
            console.log('elseNot',payload);

            payload.filter['Supplier Type'] = [15, 20];
        }
        this.supplierService.getAllSuppliersProfile(payload).subscribe(

            response => {
                console.log('555566666',payload);
                this.suppliers = [];
                const data = response['data'];
                if (data['searchResponse'].length > 0) {
                    data['searchResponse'].forEach(searchResult => {
                        const supplier: ISupplierListProfileData = {
                            supplier_uid: '',
                            id: '',
                            supplier_logo: '',
                            name: '',
                            contact_email: '',
                            contact_phone_no: '',
                            status: null,
                            supplier_country: '',
                            supplier_state: '',
                            supplier_city: '',
                            facility_count: 0,
                            style_count: 0,
                            raw_material_count: 0,
                            product_count: 0,
                            ingredient_count: 0,
                            grade: '',
                            company_id: '',
                            supplier_id: '',
                            score: '',
                            grade_score: '',
                            reference_id: ''
                        };
                        supplier.supplier_uid = searchResult.supplier_uid;
                        supplier.id = searchResult.supplier_id;
                        supplier.supplier_logo = searchResult['supplier_logo'];
                        supplier.name = searchResult['supplier_name'];
                        supplier.reference_id = searchResult['reference_id'];
                        supplier.contact_email = searchResult['contact_email'];
                        supplier.contact_phone_no = searchResult['contact_phone_no'];
                        supplier.status = searchResult['supplier_association_status']['id']
                            ? searchResult['supplier_association_status']['id']
                            : null;

                        supplier.supplier_country = searchResult['supplier_country'];
                        supplier.company_id = searchResult['company_id'];
                        supplier.supplier_id = searchResult['supplier_id'];
                        supplier.supplier_state = searchResult['supplier_state'];
                        supplier.supplier_city = searchResult['supplier_city'];
                        supplier.facility_count = searchResult['facility_count'];
                        supplier.style_count = searchResult['style_count'];
                        supplier.raw_material_count = searchResult['raw_material_count'];
                        supplier.product_count = searchResult['product_count'];
                        supplier.ingredient_count = searchResult['ingredient_count'];
                        supplier.grade = undefined === searchResult['grade'] ? null : searchResult['grade'];
                        supplier.score = undefined === searchResult['score'] ? null : searchResult['score'];
                        supplier.grade_score =
                            undefined === searchResult['grade']
                                ? null
                                : searchResult['grade'] === 'Not Available'
                                ? searchResult['grade']
                                : undefined === searchResult['score']
                                ? 'Not Available'
                                : searchResult['grade'] + ' - ' + searchResult['score'];
                        this.suppliers.push(supplier);
                    });
                }
                this.totalCount = data.totalCount;
                this.closeSortByFilter = false;
                this.pageLoading = false;
                if (Object.keys(this.updateFiltersSelection()).length > 0) {
                    setTimeout(() => {
                        this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 150;
                    });
                }
            },
            failResponse => {
                this.failResponse(failResponse);
            }
        );
    }

    getSupplierConflicts(): void {
        this.supplierConflicts = [];
        this.supplierService.getSupplierConflicts().subscribe(data => {
            this.supplierConflicts = data;
            this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 150;
            this.pageLoading = false;
        });
    }
    getAllSubSuppliersProfile(): void {
        this.pageLoading = true;
        const payload = this.getSearchPayload();
        payload.collapse = 'supplier_id';
        payload.filter['Ancestors'] = [this.auth.companyId];
        this.supplierService.getAllSubSuppliersProfile(payload).subscribe(
            response => {
                this.suppliers = [];
                const data = response['data'];
                if (data['searchResponse'].length > 0) {
                    data['searchResponse'].forEach(searchResult => {
                        let supplier: ISubSupplierProfileData;
                        Object.keys(searchResult).forEach(key => {
                            if (searchResult) {
                                supplier = searchResult;
                                searchResult.is_sub_supplier = true;
                            }
                        });
                        supplier.name = searchResult['supplier_name'];
                        supplier.status = searchResult['supplier_association_status']['id'] || null;
                        this.suppliers.push(supplier);
                    });
                }
                this.totalCount = data.totalCount;
                this.closeSortByFilter = false;
                if (Object.keys(this.updateFiltersSelection()).length) {
                    setTimeout(() => {
                        this.height = this.filterBarWrapper.nativeElement.offsetHeight + 150;
                    });
                }
                this.pageLoading = false;
            },
            failResponse => {
                this.failResponse(failResponse);
            }
        );
    }

    private failResponse(failResponse: HttpErrorResponse): void {
        if (failResponse.status === 403) {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
        } else {
            this.toastr.error(
                env.error_messages.could_not_fetch_data.message,
                env.error_messages.could_not_fetch_data.title
            );
        }
        this.pageLoading = false;
    }

    private     getSearchPayload() {
        const payload = {
            module: this.module,
            filter: this.getFilteredOptions(),
            sort: this.commonServices.getSortbyFilteredOptions(this.getSession().sortBy),
            pagination: this.pagination,
            collapse: ''
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        if (payload.sort.sortBy === 'supplier_association_status.id_desc') {
            payload.sort.sortBy = 'supplier_association_status.id';
        }
        return payload;
    }

    isSupplierDataEmpty() {
        if (this.suppliers && this.suppliers.length === 0) {
            return true;
        }
        return false;
    }

    populateDefaultValueForSuppliers(suppliers) {
        if (suppliers !== undefined) {
            for (let i = 0; i < suppliers.length; i++) {
                if (!suppliers[i].logoUrl) {
                    suppliers[i].logoUrl = env.IMG_URL + 'images/nologo.png';
                }

                if (!suppliers[i].hasOwnProperty('contactInfo')) {
                    suppliers[i]['contactInfo'] = {};
                }

                if (!suppliers[i].hasOwnProperty('contactInfo') || !suppliers[i].contactInfo.hasOwnProperty('email')) {
                    suppliers[i].contactInfo.email = '-';
                }

                if (
                    !suppliers[i].hasOwnProperty('contactInfo') ||
                    !suppliers[i].contactInfo.hasOwnProperty('phoneNumber')
                ) {
                    suppliers[i].contactInfo.phoneNumber = '-';
                }
            }
            return suppliers;
        }
    }

    getStandardImageName(standardName) {
        const standard = standardName.toLowerCase();

        return this.standardsImage[standard];
    }

    getCountryCode(countryName) {
        if (Array.isArray(this.countries) && this.countries.length > 0) {
            for (let i = 0; i < this.countries.length; i++) {
                if (this.countries[i].name === countryName) {
                    return this.countries[i].code.toLowerCase();
                }
            }
        }
        return false;
    }

    public checkFilter(event, title, filterStep, option) {
        title = this.titleCase.transform(title);
        title = title.replace(/\s/g, '');
        title = title[0].toLowerCase() + title.substring(1);
        if (!this.selectedFilters.hasOwnProperty(title)) {
            this.selectedFilters[title] = [];
        }
        const optionExists = this.selectedFilters[title].indexOf(option);
        if (!event.target.checked) {
            this.selectedFilters[title].splice(optionExists, 1);
        } else {
            this.selectedFilters[title].push(option);
        }

        this.selectedQuestionsLoading = true;

        this.questionnaireService.getQuestionCount(this.selectedFilters).subscribe(
            response => {
                const data = response.data;
                this.selectedQuestions = data.question_count;
                this.selectedQuestionsLoading = false;
            },
            failResponse => {
                console.log(failResponse);
                this.selectedQuestionsLoading = false;
            }
        );
    }

    triggerCheckbox(id, i) {
        const el = document.getElementById(id + '-' + i);
        el.click();
    }

    public filterCount(slideDirection) {
        if (!this.selectedFilters.hasOwnProperty('material') || this.selectedFilters['material'].length <= 0) {
            this.toastr.info('No material selected');
            return false;
        }

        if (slideDirection === 'left') {
            this.filterStep--;
            if (this.filterStep < 0) {
                this.filterStep = this.filterQuestionsHeading.length - 1;
            }
        } else if (
            slideDirection === 'right' &&
            Array.isArray(this.selectedFilters['material']) &&
            this.selectedFilters['material'].length > 0
        ) {
            if (this.filterStep === 0) {
                this.questionnaireService.getValueProcess(this.selectedFilters['material']).subscribe(response => {
                    const data = response.data;
                    this.options['VALUE_PROCESS'] = data.valueProcess;
                });
            } else if (this.filterStep === 1) {
                if (!this.selectedFilters['valueProcess'] || !Array.isArray(this.selectedFilters['valueProcess'])) {
                    this.selectedFilters['valueProcess'] = [];
                }
                this.questionnaireService
                    .getSubGroup(this.selectedFilters['material'], this.selectedFilters['valueProcess'])
                    .subscribe(response => {
                        const data = response.data;
                        this.options['SUB_GROUP'] = data.subGroup;
                    });
            }
            this.filterStep++;
            if (this.filterStep > this.filterQuestionsHeading.length - 1) {
                this.filterStep = 0;
            }
            // if (this.filterCounter > (this.filterQuestionsHeading.length - 1)) {
            //   this.filterCounter = 0;
            // }
        }
    }

    deleteSelectedSupplier(supplierId: string) {
        this.selectedSuppliers = this.selectedSuppliers.filter(item => {
            return item.id !== supplierId;
        });
        this.markedSuppliers[supplierId] = false;
    }

    onSelectSupplier(element: any, event: any, supplierId: string, thrash: boolean) {
        if (this.selectedSuppliers === undefined) {
            this.selectedSuppliers = [];
        } else {
            const existing_supplier = this.selectedSuppliers.find(o => o.id === supplierId);
            if (existing_supplier) {
                this.deleteSelectedSupplier(supplierId);
                return;
            }
        }

        if (!thrash) {
            const supplier = this.suppliers.find(o => o.id === supplierId);
            if (supplier) {
                this.selectedSuppliers.push(supplier);
                this.markedSuppliers[supplierId] = true;
            } else {
                this.deleteSelectedSupplier(supplierId);
            }
        } else {
            this.deleteSelectedSupplier(supplierId);
        }
    }

    deleteSelectedFacility(facilityId: string) {
        this.selectedFacilities = this.selectedFacilities.filter(item => {
            return item.id !== facilityId;
        });
        this.markedFacilities[facilityId] = false;
    }

    onSelectFacility(element: any, event: any, facilityId: string, thrash: boolean) {
        const existing_facility = this.selectedFacilities.find(o => o.id === facilityId);
        if (existing_facility) {
            this.deleteSelectedFacility(facilityId);
            return;
        }

        if (!thrash) {
            const facility = this.facilities.find(o => o.id === facilityId);
            if (facility) {
                this.selectedFacilities.push(facility);
                this.markedFacilities[facilityId] = true;
            } else {
                this.deleteSelectedFacility(facilityId);
            }
        } else {
            this.deleteSelectedFacility(facilityId);
        }
    }

    initFilterOptions(questionnaire) {
        this.selectedFilters = questionnaire.classificationFilter;
        this.filterStep = 0;
        this.response = [];
        for (const key in questionnaire.classificationFilter) {
            if (questionnaire.classificationFilter.hasOwnProperty(key)) {
                questionnaire.classificationFilter[key].forEach(value => {
                    this.response[value] = true;
                });
            }
        }

        this.selectedQuestionsLoading = true;
        this.questionnaireService.getQuestionCount(questionnaire.classificationFilter).subscribe(
            response => {
                const data = response.data;
                this.selectedQuestions = data.question_count;
                this.selectedQuestionsLoading = false;
            },
            failResponse => {
                this.selectedQuestionsLoading = false;
            }
        );
    }

    openLaunchAssessmentModal(supplier) {
        this.selected = null;
        this.response = [];
        this.filterStep = 0;
        this.selectedFilters = {};
        this.markedSuppliers = [];
        this.markedSuppliers[supplier.id] = true;
        this.selectedSuppliers = [];
        this.selectedSuppliers.push(supplier);
        this.launchAssessmentModalReady = false;
        this.launchAssessmentModalLoading[supplier.id] = true;
        this.assessmentService.getSuppliersFacilities().subscribe(response => {
            const data = response.data;
            this.facilities = data.facility;
        });
        if (this.questionnaires.length === 0) {
            this.questionnaireService.getAll().subscribe(
                response => {
                    const data = response.data;
                    this.localeService.addToMasterData(response.data.masterData);
                    for (let i = 0; i < data.questionnaire.length; i++) {
                        this.questionnaires.push(data.questionnaire[i]);
                    }

                    this.selected = this.questionnaires[0];
                    if (this.questionnaires.length > 0) {
                        this.questionnaire = 0;
                        this.initFilterOptions(this.selected);

                        this.options = data.classifications_metadata;
                        this.filterQuestionsHeading.push({
                            id: 'MATERIAL',
                            value: 'Material',
                            label: 'Material'
                        });

                        this.filterQuestionsHeading.push({
                            id: 'VALUE_PROCESS',
                            value: 'Value Process',
                            label: 'Value Process'
                        });

                        this.filterQuestionsHeading.push({
                            id: 'SUB_GROUP',
                            value: 'Sub Group',
                            label: 'Sub Group'
                        });

                        this.filterQuestionsHeading.push({
                            id: 'LEVEL',
                            value: 'Level',
                            label: 'Difficulty Level'
                        });

                        this.launchAssessmentModalReady = true;
                        this.launchAssessmentModalLoading[supplier.id] = false;
                        setTimeout(() => {
                            this.launchAssessmentModal.show();
                        });
                        return;
                    } else {
                        this.launchAssessmentModalReady = true;
                        this.launchAssessmentModalLoading[supplier.id] = false;
                        this.toastr.error('Assessment does not exists to launch', 'failed');
                    }
                },
                () => {
                    this.launchAssessmentModalReady = true;
                    this.launchAssessmentModalLoading[supplier.id] = false;
                    this.toastr.error('Oops! The requested action failed.');
                }
            );
        } else {
            this.selected = this.questionnaires[0];
            if (this.questionnaires.length > 0) {
                this.questionnaire = 0;
                this.launchAssessmentModalReady = true;
                this.filterCounter = this.materialState;
                this.launchAssessmentModalLoading[supplier.id] = false;
                this.initFilterOptions(this.selected);
                setTimeout(() => {
                    this.launchAssessmentModal.show();
                });
            } else {
                this.launchAssessmentModalReady = true;
                this.launchAssessmentModalLoading[supplier.id] = false;
                this.toastr.error('Assessment does not exists to launch', 'failed');
            }
        }
    }

    public openLaunchQuestionnaireModal(questionnaire) {
        this.markedSuppliers = [];
        this.selectedSuppliers = [];
        this.markedFacilities = [];
        this.selectedFacilities = [];
        this.currentQuestionnaireId = questionnaire.id;
        this.response['questionnaire_name'] = questionnaire.name;
        this.launchQuestionnaireModal.show();
    }

    public launchQuestionnaire() {
        const selectedFilters =
            this.selectedFilters &&
            this.selectedFilters['valueProcess'] &&
            this.selectedFilters['valueProcess'].length > 0;

        if (this.selectedSuppliers.length <= 0 && this.selectedFacilities.length <= 0) {
            this.toastr.error('Please selected suppliers / facilities to launch the assessment to');
            return;
        }

        if (!this.response['target_date'] || this.response['target_date'] === '') {
            this.toastr.error('Please fill date');
            return;
        }

        const payload = {
            questionnaire: {
                name: this.selected.name,
                description: this.selected.description,
                classificationFilter: this.selected.classificationFilter
            },
            assessment: {
                dueDate: new Date(this.response['target_date']).getTime(),
                name: this.response['assessment_name']
            },
            assessmentToCreate: [
                {
                    supplier: this.selectedSuppliers.map(a => a.id),
                    facility: this.selectedFacilities.map(a => a.id),
                    vpToAssess: selectedFilters ? this.selectedFilters['valueProcess'] : this.options['VALUE_PROCESS']
                }
            ]
        };

        payload.questionnaire['id'] = this.selected.id;

        this.modalLaunchingBusy = true;

        this.assessmentService.launchAssessment(payload).subscribe(
            response => {
                this.toastr.success('Assessment launched');
                this.analyticsService.trackEvent(amplitude.supplier.assessmentLaunched, {
                    Origin: amplitude.supplier.title
                });
                this.launchQuestionnaireModal.hide();
                this.modalLaunchingBusy = false;
            },
            failResponse => {
                this.modalLaunchingBusy = false;
                this.toastr.error('Oops! The requested action failed.');
            }
        );
    }

    toCamelCase(str) {
        return str
            .split(' ')
            .map(function(word, index) {
                // If it is the first word make sure to lowercase all the chars.
                if (index === 0) {
                    return word.toLowerCase();
                }
                // If it is not the first word only upper case the first char and lowercase the rest.
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');
    }

    openAddSupplierModalV2() {
        if (this.auth.haveAccess('SUPPLIER_CREATE')) {
            console.log('Authsssss',this.auth);

            const DIALOG_DATA: IAddSupplierModelData = getAddSupplierModelDefaultTemplate();

            // Analytics
            this.analyticsService.trackEvent(amplitude.supplier.addSupplierClicked, {
                Origin: amplitude.supplier.title,
                Action: amplitude.supplier.addSupplierClicked
            });

            const dialogRef = this.dialog.open(AddSupplierV2ModalComponent, {
                data: DIALOG_DATA
            });

            dialogRef
                .afterClosed()
                .pipe(take(1))
                .subscribe((modelData: IAddSupplierResponse) => {
                    if (modelData.status === 'SUCCESS') {
                        this.pageLoading = true;
                        setTimeout(() => {
                            this.pageLoading = false;
                            this.handleSortBy();
                        }, 1000); //elastic search update delay
                        // success
                    } else {
                        // error
                    }
                });
        } else {
            this.toastr.info(this.noAuthorizationMessage, 'Insufficient permission');
            return;
        }
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

    resetPagination() {
        this.suppliers = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }

    refreshFilter() {
        this.fetchSupplierFilters(this.getSearchPayload());
    }

    handleSortBy() {
        this.setSortByFilter();
        this.resetPagination();
        this.getData();
    }

    updateFiltersSelection() {
        const filter = this.getSession().filter;
        return this.utilsService.getSessionStorageValue(filter) || {};
    }

    handleFilterSelection() {
        this.resetPagination();
        this.totalCountFlag = true;
        this.analyticsService.trackEvent('Filter', {
            Origin: amplitude.supplier.title,
            Action: 'Filter used'
        });
        this.getData();
    }

    searchSuppliers(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.resetPagination();
            this.totalCountFlag = true;
            console.log('anasssss',this.analyticsService);
            this.analyticsService.trackEvent('Search', {

                Origin: amplitude.supplier.title,
                Action: `Search Performed with ${this.searchText}`
            });
            this.getData();
        }
    }

    resetAllFilters() {
        const filter = this.getSession().filter;
        this.utilsService.setSessionStorageValue(filter, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchSupplierFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    getFilteredOptions() {
        const filter = this.getSession().filter;
        console.log('sesssionnnnnssss1',this.getSession());
        console.log('sesssionnnnnssss2',filter);
        const tempFilterOptions = {};
        const options = this.utilsService.getSessionStorageValue(filter);
        console.log('ullllllll1',this.utilsService);
        console.log('ullllllll2',this.utilsService.getSessionStorageValue(filter));

        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }

        return tempFilterOptions;
    }

    navigateTo(props: string = '') {
        this.router.navigate(['/suppliers'], { fragment: props });
    }

    ngOnDestroy() {
        this.routerSubscription.unsubscribe();
    }

    handleEvents(event: ISupplierListEvents) {
        switch (event.eventType) {
            case 'openAssessmentModel':
                this.openLaunchAssessmentModal(event.data);
                break;
            case 'totalCountEvent':
                this.totalCount = event.data;
                break;
            default:
                break;
        }
    }

    importSuppliers() {
        const importDialog = this.dialog.open(ImportComponent, {
            panelClass: this.importDialogClass,
            data: {
                titles: {
                    createTitle: 'Create New Suppliers',
                    updateTitle: 'Edit supplier invite',
                    createDesc: '',
                    updateDesc: 'Coming Soon'
                },
                create: {
                    texts: {
                        title: 'Create new supplier',
                        downloadText: 'Download template to add your suppliers in spreadsheet',
                        downloadBtnText: 'Download Template',
                        editText: 'Edit the information on your spreadsheet application',
                        uploadText: 'Re upload the excel for the supplier to be added in your account'
                    },
                    fileName: 'import-suppliers',
                    downloadCallBack: this.supplierService.downloadData.bind(this.supplierService),
                    importCallBack: this.supplierService.uploadData.bind(this.supplierService)
                },
                update: {
                    texts: {
                        title: 'Edit supplier invite',
                        downloadText: 'Download template to edit supplier invite in spreadsheet',
                        downloadBtnText: 'Download Template',
                        editText: 'Edit the information on your spreadsheet application',
                        uploadText: 'Re upload the excel for email id changes added in your account'
                    },
                    fileName: 'export-suppliers',
                    downloadCallBack: this.supplierService.downloadData.bind(this.supplierService),
                    importCallBack: this.supplierService.uploadData.bind(this.supplierService)
                },
                btnTexts: {
                    primaryBtnText: 'Import',
                    secondaryBtnText: 'Cancel'
                },
                handleUploadCompleteCallBack: this.handleImportSuppliersUploadComplete.bind(this)
            }
        });
        importDialog.afterClosed().subscribe(response => {
            if (response.status === ImportStatuses.IMPORT_COMPLETED) {
                this.handleImportSuppliersUploadComplete(response.data);
            }
        });
    }

    handleImportSuppliersUploadComplete(data: any): void {
        this.initialize();
        this.toastr.success(
            'The supplier data has been imported successfully and the data will reflect in the platform shortly.',
            'Import successful!'
        );
        if (data.status === ImportStatuses.WARNING) {
            this.toastr.warning(
                'There are conflicts with the updated supplier data, please check the supplier conflicts tab for further details.',
                'Supplier Conflicts!',
                { timeOut: 5000 }
            );
        }
    }

    downloadSupplierDataAsExcel() {
        this.isProcessing = true;
        const filterOption = this.getFilteredOptions();

        const payload = {
            entity: DataExportEntity.SUPPLIER,
            filter: filterOption,
            type: IndexTypeMapper.SUPPLIER_PROFILE
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

    downloadSubSupplierDataAsExcel(): void {
        this.isSubSupplierProcessing = true;
        const filterOption = this.getFilteredOptions();

        const payload = {
            entity: DataExportEntity.SUPPLIER,
            filter: filterOption,
            type: IndexTypeMapper.SUB_SUPPLIER_PROFILE
        };
        payload.filter['Supplier Type'] = [10, 15, 20];
        payload['collapse'] = 'supplier_id';
        payload.filter['Ancestors'] = [this.auth.companyId];

        this.commonServices.exportDataAsExcel(payload).subscribe(
            (response: any) => {
                this.isSubSupplierProcessing = false;
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, this.EXCEL_FILENAME);
            },
            error => {
                this.onDownloadErrorHandle(error);
            }
        );
    }

    downloadSupplierLinkingDataAsExcel(): void {
        this.isSupplierLinkingProcessing = true;
        const filterOption = this.getFilteredOptions();

        const payload = {
            entity: DataExportEntity.SUPPLIER_LINKING,
            filter: filterOption,
            type: IndexTypeMapper.SUPPLIER_PROFILE
        };
        this.commonServices.exportDataAsExcel(payload).subscribe(
            (response: any) => {
                this.isSupplierLinkingProcessing = false;
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, this.SUPPLIER_LINKING_EXCEL_FILENAME);
            },
            error => {
                this.onDownloadErrorHandle(error);
            }
        );
    }

    get getImage(): (iconName: string) => string {
        return this.utilsService.getcdnImage.bind(this.utilsService);
    }

    private onDownloadErrorHandle(data: any): void {
        if (data.hasOwnProperty('error') && data.error.hasOwnProperty('error')) {
            this.toastr.error(`Failed to download file. Error: ${data.error.error}`);
        } else {
            this.toastr.error(`Failed to download file. Please try again later.`);
        }
        this.isProcessing = false;
    }
}
