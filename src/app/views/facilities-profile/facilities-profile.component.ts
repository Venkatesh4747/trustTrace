import { TitleCasePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../environments/environment';
import { environment as env } from '../../../environments/environment';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { AssessmentTemplateService } from '../assessment-template/assessment-template.service';
import { AssessmentsService } from '../assessments-launched/assessments.service';
import { ProfileService } from '../company/profile/profile.service';
import { Todo_Status } from '../suppliers/suppliers.const';
import { SuppliersService } from '../suppliers/suppliers.service';

@Component({
    selector: 'app-facilities-profile',
    templateUrl: './facilities-profile.component.html',
    styleUrls: ['./facilities-profile.component.scss']
})
export class FacilitiesProfileComponent implements OnInit {
    lodash = _;
    searchText = '';
    selectType = 'Facilities';
    suppliers;
    subsuppliers;
    pageLoading = true;
    public env = env;
    supplier_status = {
        products: 0,
        materials: 0,
        valueProcesses: 0,
        locations: 0,
        certifications: 0
    };

    filterOptions = {};
    filterPayload = {
        certification: [],
        country: [],
        materials: [],
        rating: [],
        pendingTodo: [],
        vps: []
    };
    supplierFilters = {
        standards: [],
        country: [],
        materials: [],
        rating: [],
        status: [],
        valueProcess: []
    };

    questionnaires: any[] = [];
    questionnaire;
    selected;

    isSupplierFilterOptions = false;
    launchAssessmentModalReady = false;
    isSuppliersSelected = false;
    isSubSuppliersSelected = false;
    isSubFacilitiesSelected = false;

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

    supplier_status_enabled = environment.config.supplier_band;

    sideNavigation;
    currentQuestionnaireId = '';
    @ViewChild('launchQuestionnaireModal', { static: true }) launchQuestionnaireModal;
    @ViewChild('addSupplierModal', { static: true }) addSupplierModal;
    @ViewChild('supplierProfileModal', { static: true }) supplierProfileModal;

    profileData = {
        id: '',
        companyName: '',
        contactPersonName: '',
        contactEmail: '',
        contactMobile: '',
        description: '',
        logo_url: '',
        address: {
            addressLine1: '',
            addressLine2: '',
            country: '',
            countryCode: '',
            state: '',
            city: '',
            zip: '',
            latitude: '',
            longitude: ''
        },
        Facilities: [
            {
                id: '',
                name: '',
                address: {
                    addressLine1: '',
                    addressLine2: '',
                    country: '',
                    countryCode: '',
                    state: '',
                    city: '',
                    zip: '',
                    latitude: '',
                    longitude: '',
                    fullText: ''
                },
                valueProcess: [],
                materials: [],
                standards: []
            }
        ]
    };
    countries: any = [];
    regions: any = [];
    valueProcesses: any = [];
    materials: any = [];
    standards: any = [];
    standardsImage = environment.config.standardsImage;
    viewingFacility: any;
    @ViewChild('facilityInfoModal', { static: true }) facilityInfoModal;
    // Todo property
    taskPayLoad = {
        supplierId: '',
        item: [
            {
                title: ''
            }
        ]
    };
    newTask = {
        title: ''
    };

    todoTask_data = {
        tasks: [],
        id: ''
    };
    todoEditable = [];
    todoStatus = Todo_Status;
    @ViewChild('todoItem', { static: false }) todoItem;
    constructor(
        private titleService: Title,
        private toastr: CustomToastrService,
        private assessmentService: AssessmentsService,
        private supplierService: SuppliersService,
        private questionnaireService: AssessmentTemplateService,
        private titleCase: TitleCasePipe,
        private sideNav: SideNavigationService,
        private companyProfileService: ProfileService,
        private commonServices: CommonServices,
        private analyticsService: AnalyticsService,
        private localeService: LocalizationService,
        private utilService: UtilsService
    ) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Facilities');
    }

    get getDisplayText() {
        return this.localeService.getDisplayText.bind(this.localeService);
    }

    get getStandardImageUrl() {
        return this.utilService.getStandardImageUrl.bind(this.utilService);
    }

    ngOnInit() {
        this.pageLoading = true;
        this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });

        this.commonServices.getCountries().subscribe(response => {
            const data = response['data'];
            this.countries = data.country;
        });

        this.questionnaireService.getAll().subscribe(
            response => {
                const data = response.data;
                this.options = data.classifications_metadata;
                this.companyProfileService.getStandards().subscribe(resp => {
                    const standards_data = resp['data'];
                    this.options['STANDARDS'] = [];
                    for (let i = 0; i < standards_data.length; i++) {
                        this.options['STANDARDS'].push(standards_data[i].id);
                    }
                });
                this.pageLoading = false;
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                }
                this.pageLoading = false;
            }
        );
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

    getCompanyProfile(companyId) {
        this.companyProfileService.getCompanyProfile(companyId).subscribe(resp => {
            const data = resp['data'];
            this.localeService.addToMasterData(resp['data']['masterData']);
            const companyDetails = data.companyDetails;
            this.profileData.id = companyId;

            this.profileData.companyName = companyDetails.name;
            this.profileData.description = companyDetails.description;
            if (companyDetails.hasOwnProperty('contactInfo')) {
                this.profileData.contactPersonName = companyDetails.contactInfo.name;
                this.profileData.contactEmail = companyDetails.contactInfo.email;
                this.profileData.contactMobile = companyDetails.contactInfo.phoneNumber;
            }

            if (companyDetails.hasOwnProperty('logoUrl')) {
                this.profileData.logo_url = companyDetails.logoUrl;
            } else {
                this.profileData.logo_url = env.IMG_URL + 'images/nologo.png';
            }

            if (companyDetails.hasOwnProperty('address')) {
                this.profileData.address = JSON.parse(JSON.stringify(companyDetails.address));
            } else {
                this.profileData.address = {
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
            }

            this.profileData.Facilities = data.facilities;

            this.valueProcesses = [];
            this.materials = [];
            this.standards = [];

            // Get unique VPs, Materials and Standards from Facilities
            for (let i = 0; i < this.profileData.Facilities.length; i++) {
                if (this.profileData.Facilities[i].address.country) {
                    this.profileData.Facilities[i].address.countryCode = this.getCountryCode(
                        this.profileData.Facilities[i].address.country
                    );
                }

                this.profileData.Facilities[i].address.fullText = '';

                if (this.profileData.Facilities[i].address.addressLine1) {
                    this.profileData.Facilities[i].address.fullText +=
                        this.profileData.Facilities[i].address.addressLine1 + ' ';
                }

                if (this.profileData.Facilities[i].address.addressLine2) {
                    this.profileData.Facilities[i].address.fullText +=
                        this.profileData.Facilities[i].address.addressLine2 + ' ';
                }

                if (this.profileData.Facilities[i].address.city) {
                    this.profileData.Facilities[i].address.fullText +=
                        this.profileData.Facilities[i].address.city + ' ';
                }

                if (this.profileData.Facilities[i].address.zip) {
                    this.profileData.Facilities[i].address.fullText += this.profileData.Facilities[i].address.zip;
                }

                let regionUniqueCheckFlag = true;

                for (let j = 0; j < this.regions.length; j++) {
                    if (this.regions[j].country === this.profileData.Facilities[i].address.country) {
                        regionUniqueCheckFlag = false;
                        break;
                    }
                }

                if (
                    (this.regions.length === 0 || regionUniqueCheckFlag) &&
                    this.profileData.Facilities[i].address.country
                ) {
                    this.regions.push({
                        countryCode: this.getCountryCode(this.profileData.Facilities[i].address.country),
                        country: this.profileData.Facilities[i].address.country
                    });
                }

                const facility = this.profileData.Facilities[i].valueProcess;
                const material = this.profileData.Facilities[i].materials;
                const standard = this.profileData.Facilities[i].standards || [];

                if (facility && Array.isArray(facility)) {
                    for (let j = 0; j < facility.length; j++) {
                        if (this.valueProcesses.indexOf(facility[j]) === -1) {
                            this.valueProcesses.push(this.localeService.getDisplayText(facility[j]));
                        }
                    }
                }

                if (material && Array.isArray(material)) {
                    for (let j = 0; j < material.length; j++) {
                        if (this.materials.indexOf(material[j]) === -1) {
                            this.materials.push(this.localeService.getDisplayText(material[j]));
                        }
                    }
                }

                if (standard && Array.isArray(standard)) {
                    for (let j = 0; j < standard.length; j++) {
                        if (this.standards.indexOf(standard[j]) === -1) {
                            this.standards.push(standard[j]);
                        }
                    }
                }
            }

            this.supplierService.getTodoTask(companyId).subscribe(response => {
                this.processTodoResponse(response);
            });

            this.supplierProfileModal.show();
        });
    }
    processTodoResponse(response) {
        const data = response['data'];
        if (!!data) {
            this.todoTask_data = data;
            this.todoTask_data.tasks = data.item;
        }
    }

    public openSupplierProfileModal(supplierId) {
        this.getCompanyProfile(supplierId);
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
            () => {
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
        if (this.questionnaires.length === 0) {
            this.questionnaireService.getAll().subscribe(response => {
                const data = response.data;
                this.localeService.addToMasterData(response.data.masterData);
                for (let i = 0; i < data.questionnaire.length; i++) {
                    this.questionnaires.push(data.questionnaire[i]);
                }

                this.selected = this.questionnaires[0];
                this.questionnaire = 0;
                this.initFilterOptions(this.selected);

                this.options = data.classifications_metadata;
                this.filterQuestionsHeading.push({
                    id: 'MATERIAL',
                    value: 'Material'
                });

                this.filterQuestionsHeading.push({
                    id: 'VALUE_PROCESS',
                    value: 'Value Process'
                });

                this.filterQuestionsHeading.push({
                    id: 'SUB_GROUP',
                    value: 'Sub Group'
                });

                this.filterQuestionsHeading.push({
                    id: 'LEVEL',
                    value: 'Difficulty Level'
                });

                this.launchAssessmentModalReady = true;
                this.launchAssessmentModalLoading[supplier.id] = false;
                setTimeout(() => {
                    this.launchAssessmentModal.show();
                });
                return;
            });
        } else {
            this.selected = this.questionnaires[0];
            this.questionnaire = 0;
            this.launchAssessmentModalReady = true;
            this.filterCounter = this.materialState;
            this.launchAssessmentModalLoading[supplier.id] = false;
            this.initFilterOptions(this.selected);
            setTimeout(() => {
                this.launchAssessmentModal.show();
            });
        }
    }

    public openLaunchQuestionnaireModal(questionnaire) {
        this.response = [];
        this.filterStep = 0;
        this.selectedQuestions = 0;
        this.selectedFilters = {};
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
            () => {
                this.toastr.success('Assessment launched');
                this.analyticsService.trackEvent('Assessment Launched', { Origin: 'Suppliers' });
                this.launchQuestionnaireModal.hide();
                this.modalLaunchingBusy = false;
            },
            () => {
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

    openAddSupplierModal() {
        this.addSupplierModal.show();
    }

    openFacilityInfoModal(facility) {
        this.viewingFacility = facility;
        this.facilityInfoModal.show();
    }

    closeSupplierProfileModal() {
        this.supplierProfileModal.hide();
        this.todoTask_data = {
            tasks: [],
            id: ''
        };
    }

    createTodo() {
        if (this.newTask.title !== '') {
            if (this.todoTask_data.id === null || this.todoTask_data.id === '') {
                const payload = {
                    supplierId: this.profileData.id,
                    item: [
                        {
                            title: this.newTask.title,
                            itemStatus: this.todoStatus.NOT_COMPLETED
                        }
                    ]
                };
                this.supplierService.createTask(payload).subscribe(resp => {
                    this.processTodoResponse(resp);
                    this.toastr.success('A new task created successfully', 'Success');
                    this.analyticsService.trackEvent('Todo Task', {
                        Origin: 'Suppliers page',
                        'Supplier Id': this.profileData.id,
                        'Action Performed': 'Add'
                    });
                });
            } else {
                const payload = {
                    id: this.todoTask_data.id,
                    supplierId: this.profileData.id,
                    item: [
                        {
                            title: this.newTask.title,
                            itemStatus: this.todoStatus.NOT_COMPLETED
                        }
                    ]
                };
                this.supplierService.addTaskItem(payload).subscribe(resp => {
                    this.processTodoResponse(resp);
                    this.toastr.success('A new Todo added successfully', 'Success');
                    this.analyticsService.trackEvent('Todo Task', {
                        Origin: 'Suppliers page',
                        'Supplier Id': this.profileData.id,
                        'Action Performed': 'Add'
                    });
                });
            }
        } else {
            this.toastr.success('please add the todo', '');
        }

        this.resetNewTask();
    }

    resetNewTask() {
        this.newTask = {
            title: ''
        };
    }

    removeTodo(itemId, index) {
        this.supplierService.removeTodo(itemId).subscribe(() => {
            this.todoTask_data.tasks.splice(index, 1);
            this.toastr.success('Todo deleted successfully', 'Success');
            this.analyticsService.trackEvent('Todo Task', {
                Origin: 'Suppliers page',
                'Supplier Id': this.profileData.id,
                'Action Performed': 'Delete'
            });
        });
    }

    editTodo(index) {
        this.todoEditable[index] = true;
    }

    updateTodo(item1, index) {
        const payLoad = {
            id: this.todoTask_data.id,
            item: [
                {
                    itemId: item1.itemId,
                    title: item1.title,
                    itemStatus: item1.itemStatus
                }
            ]
        };
        this.supplierService.editTodo(payLoad).subscribe(resp => {
            this.processTodoResponse(resp);
            this.toastr.success('Todo edited successfully', 'Success');
            this.analyticsService.trackEvent('Todo Task', {
                Origin: 'Suppliers page',
                'Supplier Id': this.profileData.id,
                'Action Performed': 'Update'
            });

            this.todoEditable[index] = false;
        });
    }

    saveTodoStatus(event, task) {
        let payload = {};
        if (event.target.checked) {
            payload = {
                id: this.todoTask_data.id,
                item: [
                    {
                        itemId: task.itemId,
                        title: task.title,
                        itemStatus: this.todoStatus.COMPLETED
                    }
                ]
            };
        } else {
            payload = {
                id: this.todoTask_data.id,
                item: [
                    {
                        itemId: task.itemId,
                        title: task.title,
                        itemStatus: this.todoStatus.NOT_COMPLETED
                    }
                ]
            };
        }
        this.supplierService.editTodo(payload).subscribe(resp => {
            this.processTodoResponse(resp);
            this.toastr.success('Todo status updated', 'Success');
        });
    }
}
