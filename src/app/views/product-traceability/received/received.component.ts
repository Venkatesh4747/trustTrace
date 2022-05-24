import { Component, OnInit, ViewChild } from '@angular/core';
import * as FileSaver from 'file-saver';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { environment as env } from '../../../../environments/environment';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { SideNavigationService } from '../../../shared/side-navigation/side-navigation.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { AssessmentTemplateService } from '../../assessment-template/assessment-template.service';
import { AssessmentsService } from '../../assessments-received/assessments.service';
import { ProfileService } from '../../company/profile/profile.service';
import { ProductTraceabilityService } from '../product-traceability.service';

@Component({
    selector: 'app-received',
    templateUrl: './received.component.html',
    styleUrls: ['./received.component.scss']
})
export class ReceivedComponent implements OnInit {
    @ViewChild('surveyModal', { static: false }) surveyModal;

    pageLoading = false;
    sideNavigation;
    searchText = '';
    public env = env;
    style = {
        id: '',
        name: '',
        materials: [],
        productLine: '',
        valueProcesses: [],
        trs: 0
    };

    styles = [];

    launched_status_enabled = false;
    launched_status = {
        materials: 0,
        valueProcesses: 0,
        styles: 0,
        seasons: 0,
        suppliers: 0
    };

    certifications_types: any;
    filter_session = 'trReceived_filter';
    trs = [];

    @ViewChild('launchTRModal', { static: false }) launchTRModal;
    @ViewChild('subTRModal', { static: true }) subTRModal;
    @ViewChild('supplierProfileModal', { static: true }) supplierProfileModal;
    launchTRModalLaunchingBusy: boolean;
    garmentSuppliers = ['Supplier 1', 'Supplier 2', 'Supplier 3'];
    TRVPSupplier = [];
    materials: any = [];
    @ViewChild('supplierModal', { static: false }) supplierModal;
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
    regions: any = [];
    valueProcesses: any = [];
    standards: any = [];

    standardsImage = environment.config.standardsImage;
    countries;
    POFileName: any = [];
    TRPOFileId: any = [];
    subTRs: any;
    subTRLoading: boolean;
    trAccepting: any = [];
    trStarting: any = [];
    trResuming: any = [];
    surveyModalTR: any;
    currentSurveyTab: number;
    canProceed: any = [];
    inputs: any;
    inputs_materials: any = [];
    facilities: any;
    processes: any;
    vpToFacility: any = [];
    currentParentTRId: any;
    assessmentId: any;
    surveyQuestions: any = [];
    answered: any = [];
    responses: any = [];
    subGroupTabs: any = [];
    selectedTabName: any;

    // Multi Select Dropdown
    selectedItems = [];
    dropdownSettings = {};
    dropdownSettingsDisabled = {};
    currentTRId: any;
    groupName: string;
    loadingSurveyQuestions: boolean;
    fibreMaterialSelection: boolean;
    multiSelectMaterials: any = [];
    fibreMaterials: any;
    inputs_static: any;
    submittedSupplierInput: boolean;
    units: any = [];
    viewingFacility: any;

    filterOptions = {
        supplierName: [],
        season: [],
        year: [],
        productGroup: [],
        status: []
    };
    trFilters = {
        supplierName: [],
        season: [],
        year: [],
        //  productGroup: [],
        status: []
    };
    @ViewChild('facilityModal', { static: true }) facilityModal;

    constructor(
        private sideNav: SideNavigationService,
        private toastr: CustomToastrService,
        private pts: ProductTraceabilityService,
        private companyProfileService: ProfileService,
        private assessmentService: AssessmentsService,
        public authService: AuthService,
        private qs: AssessmentTemplateService,
        private commonServices: CommonServices,
        private analyticsService: AnalyticsService,
        private localeService: LocalizationService,
        private utilService: UtilsService
    ) {
        this.sideNavigation = sideNav;
    }

    ngOnInit() {
        this.dropdownSettings = {
            singleSelection: false,
            text: 'Select Materials',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: true,
            classes: 'custom-multi-select',
            badgeShowLimit: 1
        };

        this.dropdownSettingsDisabled = {
            singleSelection: false,
            text: 'Select Materials',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: true,
            classes: 'custom-multi-select',
            badgeShowLimit: 1,
            disabled: true
        };
        this.pts.getReceivedTRFilter().subscribe(response => {
            const data = response['data'];
            const trFilter = data.trFilter;
            this.trFilters = {
                supplierName: trFilter.supplierName,
                season: trFilter.season,
                year: trFilter.year,
                status: trFilter.status
            };
            this.getAllReceivedTR();
        });

        this.pageLoading = true;

        this.qs.getAll().subscribe(response => {
            const data = response.data;
            if (data.hasOwnProperty('distinct_classifications_of_company')) {
                this.materials = JSON.parse(JSON.stringify(data.distinct_classifications_of_company.material));
            }

            this.commonServices.getCountries().subscribe(response1 => {
                const data1 = response1['data'];
                this.countries = data1.country;

                this.pageLoading = false;
            });
        });

        this.setCurrentSurveyTab(0);
    }

    InvokeCertificationFileUpload() {
        const element = document.getElementById('file_upload_certification');
        element.click();
    }

    InvokeTRVPFileUpload(vp, k, i) {
        if (this.TRVPSupplier[k][i].supplierId === 'NA') {
            return;
        }
        const element = document.getElementById('file_upload_' + vp + '-' + k + '-' + i);
        element.click();
    }

    openSubTRModal(TRId) {
        this.currentParentTRId = TRId;
        this.subTRModal.show();
        this.subTRLoading = true;
        this.pts.getAllSubTRs(TRId, 'to').subscribe(subTRsResponse => {
            this.subTRs = subTRsResponse['data'];
            for (let i = 0; i < this.subTRs.length; i++) {
                this.subTRs[i].createTs = new Date(this.subTRs[i].createTs).toLocaleString();
                this.subTRs[i]['preview'] = this.subTRs[i].launchedTo !== this.authService.user.companyId;
                if (this.subTRs[i].id === TRId) {
                    this.canProceed[0] = !!this.subTRs[i].supplierInput;
                    this.canProceed[1] = !!this.subTRs[i].vpToFacility;
                    this.canProceed[2] = true;
                }
                if (this.subTRs[i].status) {
                    this.subTRs[i]['statusText'] = this.subTRs[i].status.toLowerCase().replace('_', '');
                }
            }
            this.subTRLoading = false;
        });
    }

    getAllSubTRs() {
        this.pts.getAllSubTRs(this.currentParentTRId, 'to').subscribe(subTRsResponse => {
            this.subTRs = JSON.parse(JSON.stringify(subTRsResponse['data']));
            for (let i = 0; i < this.subTRs.length; i++) {
                this.subTRs[i].createTs = new Date(this.subTRs[i].createTs).toLocaleString();
                this.subTRs[i]['preview'] = this.subTRs[i].launchedTo !== this.authService.user.companyId;
                if (this.subTRs[i].id === this.currentTRId) {
                    this.refreshModalTRData(this.subTRs[i]);
                    this.canProceed[0] = !!this.subTRs[i].supplierInput;
                    this.canProceed[1] = !!this.subTRs[i].vpToFacility;
                    this.canProceed[2] = true;
                }

                if (this.subTRs[i].status) {
                    this.subTRs[i]['statusText'] = this.subTRs[i].status.toLowerCase().replace('_', '');
                }
            }
        });
    }

    refreshModalTRData(tr) {
        this.pts.getMetadata('supplier_input', tr.id).subscribe(
            metadataResponse => {
                const inputs = metadataResponse['data'].metadata.INPUT;
                const materials = metadataResponse['data'].metadata.material;
                const suppliers = metadataResponse['data'].metadata.supplier;
                const units = metadataResponse['data'].metadata.unit;
                this.localeService.addToMasterData(metadataResponse['data'].masterData);
                this.fibreMaterialSelection = !tr.material;

                this.inputs = JSON.parse(JSON.stringify(inputs));
                this.inputs_static = JSON.parse(JSON.stringify(inputs));
                this.garmentSuppliers = JSON.parse(JSON.stringify(suppliers));
                this.units = JSON.parse(JSON.stringify(units));

                for (const materialsKey in materials) {
                    if (!materials.hasOwnProperty(materialsKey)) {
                        continue;
                    }
                    this.inputs_materials[materialsKey] = [];
                    if (Array.isArray(materials[materialsKey])) {
                        for (let j = 0; j < materials[materialsKey].length; j++) {
                            this.inputs_materials[materialsKey].push({
                                id: materials[materialsKey][j],
                                itemName: this.localeService.getDisplayText(materials[materialsKey][j])
                            });
                        }
                    } else {
                        this.inputs_materials[materialsKey].push({
                            id: 'Not Applicable',
                            itemName: 'Not Applicable'
                        });
                    }
                }

                this.TRVPSupplier = [];
                this.selectedItems = [];
                for (let k = 0; k < this.inputs.length; k++) {
                    this.selectedItems[k] = [];
                    this.POFileName[k] = [];
                    this.TRVPSupplier[k] = [];
                    for (let i = 0; i < this.inputs[k].values.length; i++) {
                        this.selectedItems[k][i] = [];
                        this.TRVPSupplier[k][i] = {
                            input: '',
                            material: '',
                            supplierId: '',
                            po: '',
                            poFile: '',
                            quantity: '',
                            unit: ''
                        };
                    }
                }

                if (Object.keys(tr.inputList).length !== 0 && tr.inputList.constructor === Object) {
                    let k = 0;
                    this.inputs = [];
                    for (const key in tr.inputList) {
                        if (tr.inputList.hasOwnProperty(key)) {
                            this.inputs[k] = {
                                values: [],
                                type: key
                            };
                            this.TRVPSupplier[k] = [];
                            this.selectedItems[k] = [];
                            for (let i = 0; i < tr.inputList[key].length; i++) {
                                this.inputs[k].values.push(tr.inputList[key][i].input);
                                if (!this.TRVPSupplier[k][i]) {
                                    this.TRVPSupplier[k][i] = {
                                        input: '',
                                        material: '',
                                        supplierId: '',
                                        po: '',
                                        poFile: '',
                                        quantity: '',
                                        unit: ''
                                    };
                                }
                                this.TRVPSupplier[k][i].input = tr.inputList[key][i].input;
                                if (Array.isArray(tr.inputList[key][i].material)) {
                                    this.TRVPSupplier[k][i].material = tr.inputList[key][i].material;

                                    this.selectedItems[k][i] = [];
                                    for (let j = 0; j < tr.inputList[key][i].material.length; j++) {
                                        this.selectedItems[k][i].push({
                                            id: tr.inputList[key][i].material[j],
                                            itemName: this.localeService.getDisplayText(
                                                tr.inputList[key][i].material[j]
                                            )
                                        });
                                    }
                                } else {
                                    this.TRVPSupplier[k][i].material = [];
                                }
                                this.TRVPSupplier[k][i].supplierId = tr.inputList[key][i].supplierId;
                                this.TRVPSupplier[k][i].po = tr.inputList[key][i].poNumber;
                                this.TRVPSupplier[k][i].poFile = tr.inputList[key][i].poId;
                                if (tr.inputList[key][i].qty) {
                                    this.TRVPSupplier[k][i].quantity = tr.inputList[key][i].qty['quantity'];
                                    this.TRVPSupplier[k][i].unit = tr.inputList[key][i].qty['unit'];
                                }
                            }
                            k++;
                        }
                    }
                }

                this.pts.getMetadata('facility', tr.id).subscribe(facilityMetadataResponse => {
                    const facilityMetadata = facilityMetadataResponse['data'].metadata;
                    this.localeService.addToMasterData(facilityMetadataResponse['data'].masterData);
                    const processes = facilityMetadata.valueProcess;
                    const facilities = facilityMetadata.facility;

                    this.facilities = JSON.parse(JSON.stringify(facilities));
                    this.processes = JSON.parse(JSON.stringify(processes));

                    this.vpToFacility = [];

                    if (tr.vpToFacility) {
                        for (const vpToFacilityKey in tr.vpToFacility) {
                            if (!tr.vpToFacility.hasOwnProperty(vpToFacilityKey)) {
                                continue;
                            }

                            this.vpToFacility[vpToFacilityKey] = tr.vpToFacility[vpToFacilityKey];
                        }
                    }
                });

                if (this.canProceed[1]) {
                    this.pts
                        .getMetadata('questionnaire', this.surveyModalTR.id)
                        .subscribe(questionnaireMetadataResponse => {
                            this.assessmentId = questionnaireMetadataResponse['data'].metadata.assessment_id;
                            this.loadingSurveyQuestions = true;
                            this.assessmentService.getSurveyQuestions(this.assessmentId).subscribe(
                                surveyQuestionsResponse => {
                                    const questions = surveyQuestionsResponse['data'].question;
                                    const responses = surveyQuestionsResponse['data'].response;

                                    this.subGroupTabs = [];

                                    for (const questionsKey in questions) {
                                        if (!questions.hasOwnProperty(questionsKey)) {
                                            continue;
                                        }
                                        this.groupName = questionsKey;
                                        for (const questionKey in questions[questionsKey]) {
                                            if (!questions[questionsKey].hasOwnProperty(questionKey)) {
                                                continue;
                                            }
                                            this.subGroupTabs.push(questionKey);
                                        }
                                    }

                                    this.responses = [];
                                    this.answered = JSON.parse(JSON.stringify(responses));

                                    this.selectedTabName = this.subGroupTabs[0];

                                    this.surveyQuestions = JSON.parse(JSON.stringify(questions));
                                    this.loadingSurveyQuestions = false;
                                },
                                () => {
                                    this.loadingSurveyQuestions = false;
                                    this.toastr.error(
                                        environment.error_messages.could_not_fetch_data.message,
                                        environment.error_messages.could_not_fetch_data.title
                                    );
                                }
                            );
                        });
                }

                setTimeout(() => {
                    this.trStarting[tr.id] = false;
                    this.trResuming[tr.id] = false;
                    //this.subTRModal.hide();
                    this.surveyModal.show();
                }, 10);
            },
            () => {
                this.trStarting[tr.id] = false;
                this.trResuming[tr.id] = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    setCanProceed() {
        for (let i = 0; i < this.subTRs.length; i++) {
            if (this.subTRs[i].id === this.currentTRId) {
                this.canProceed[0] = !!this.subTRs[i].supplierInput;
                this.canProceed[1] = !!this.subTRs[i].vpToFacility;
                this.canProceed[2] = true;
            }
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
        this.companyProfileService.getCompanyProfile(companyId).subscribe(
            resp => {
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

                    this.valueProcesses = [];

                    if (facility && Array.isArray(facility)) {
                        for (let j = 0; j < facility.length; j++) {
                            if (this.valueProcesses.indexOf(facility[j]) === -1) {
                                this.valueProcesses.push(facility[j]);
                            }
                        }
                    }

                    this.materials = [];

                    if (material && Array.isArray(material)) {
                        for (let j = 0; j < material.length; j++) {
                            if (this.materials.indexOf(material[j]) === -1) {
                                this.materials.push(material[j]);
                            }
                        }
                    }

                    this.standards = [];

                    if (standard && Array.isArray(standard)) {
                        for (let j = 0; j < standard.length; j++) {
                            if (this.standards.indexOf(standard[j]) === -1) {
                                this.standards.push(standard[j]);
                            }
                        }
                    }
                }

                this.supplierProfileModal.show();
            },
            () => {
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    public openSupplierProfileModal(supplierId) {
        this.getCompanyProfile(supplierId);
    }

    uploadPO(files: FileList, k, i) {
        if (!Array.isArray(this.POFileName)) {
            this.POFileName = [];
            this.POFileName[k] = [];
        }
        if (!Array.isArray(this.POFileName[k])) {
            this.POFileName[k] = [];
        }
        if (files.length === 0) {
            this.POFileName[k][i] = false;
            return;
        }
        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        this.POFileName[k][i] = fileName;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (
            !fileExtension ||
            fileExtension === '' ||
            environment.config.allowedFileExtensions.indexOf(fileExtension.toLowerCase()) === -1
        ) {
            this.toastr.error('This file format is not supported');
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            this.toastr.info(
                'File size should be within ' +
                    environment.config.maximumFileUploadSize +
                    'MB. Chosen file is ' +
                    fileSizeString +
                    'MB'
            );
            return;
        }

        this.pts.uploadPO(fileToUpload).subscribe(
            response => {
                this.toastr.success('PO uploaded', 'Success');
                this.TRPOFileId[i] = response['data'].id;
            },
            () => {
                this.POFileName[k][i] = false;
            }
        );
    }

    validateSupplierInput(field, k, i) {
        if (this.TRVPSupplier[k][i].supplierId === 'NA') {
            return true;
        }

        switch (field) {
            case 'supplierId':
                if (!this.TRVPSupplier[k][i].supplierId) {
                    return false;
                }
                break;
            case 'materials':
                if (!Array.isArray(this.selectedItems[k][i]) || this.selectedItems[k][i].length === 0) {
                    return false;
                }
                break;
            case 'po':
                if (!this.TRVPSupplier[k][i].po) {
                    return false;
                }
                break;
            case 'quantity':
                if (!this.TRVPSupplier[k][i].quantity || !this.TRVPSupplier[k][i].unit) {
                    return false;
                }
                break;
            default:
                return false;
        }

        return true;
    }

    validateSupplierInputForm() {
        for (let k = 0; k < this.inputs.length; k++) {
            for (let i = 0; i < this.inputs[0].values.length; i++) {
                if (this.TRVPSupplier[k][i].supplierId === 'NA') {
                    continue;
                }

                if (!this.TRVPSupplier[k][i].supplierId) {
                    return false;
                }

                if (
                    this.TRVPSupplier[k][i].supplierId !== this.authService.user.companyId &&
                    !this.TRVPSupplier[k][i].po
                ) {
                    return false;
                }

                if (!this.TRVPSupplier[k][i].quantity || !this.TRVPSupplier[k][i].unit) {
                    return false;
                }
            }
        }
        return true;
    }

    createTR() {
        const supplierIds = [];
        const poNumbers = [];
        const inputs = [];
        const payload = {
            id: this.surveyModalTR.id
        };

        this.currentTRId = this.surveyModalTR.id;

        payload['supplierInput'] = [];

        if (!this.validateSupplierInputForm()) {
            this.submittedSupplierInput = true;
            this.toastr.error('Please fill the highlighted mandatory fields');
            return;
        }

        for (let k = 0; k < this.inputs.length; k++) {
            for (let i = 0; i < this.inputs[k].values.length; i++) {
                const element = document.getElementById('inputName-' + i);
                const inputValue = element['value'];

                // if (!Array.isArray(this.selectedItems[k])) {
                //   this.selectedItems[k] = [];
                //   this.selectedItems[k][i] = [];
                // }

                if (this.TRVPSupplier[k][i].supplierId !== 'NA') {
                    payload['supplierInput'].push({
                        supplierId: this.TRVPSupplier[k][i].supplierId,
                        poNumber: this.TRVPSupplier[k][i].po,
                        poId: this.TRPOFileId[i],
                        qty: {
                            quantity: this.TRVPSupplier[k][i].quantity,
                            unit: this.TRVPSupplier[k][i].unit
                        },
                        input: inputValue,
                        type: this.inputs[k].type,
                        material: this.selectedItems[k][i].map(item => {
                            return item.id;
                        })
                    });
                } else {
                    payload['supplierInput'].push({
                        supplierId: this.TRVPSupplier[k][i].supplierId,
                        poNumber: null,
                        poId: null,
                        qty: {
                            quantity: null,
                            unit: null
                        },
                        input: inputValue,
                        type: this.inputs[k].type,
                        material: []
                    });
                }
                supplierIds.push(this.TRVPSupplier[k][i].supplierId);
                poNumbers.push(this.TRVPSupplier[k][i].po);
                inputs.push(inputValue);
            }
        }

        this.launchTRModalLaunchingBusy = true;
        this.pts.createTR(payload).subscribe(() => {
            this.getAllSubTRs();
            this.toastr.success('Traceability Request created', 'Success');
            this.analyticsService.trackEvent('TR Initiated', { Origin: 'TR - Received' });
            this.launchTRModalLaunchingBusy = false;
            this.submittedSupplierInput = false;
        });
    }

    openSurveyModal(tr) {
        this.surveyModalTR = JSON.parse(JSON.stringify(tr));

        this.submittedSupplierInput = false;

        this.currentTRId = tr.id;
        this.setCanProceed();
        this.trResuming[tr.id] = true;
        this.trStarting[tr.id] = true;
        this.setCurrentSurveyTab(0);
        this.multiSelectMaterials = [];

        this.fibreMaterialSelection = false;

        this.pts.getMetadata('supplier_input', tr.id).subscribe(
            metadataResponse => {
                const inputs = metadataResponse['data'].metadata.INPUT;
                const materials = metadataResponse['data'].metadata.material;
                const suppliers = metadataResponse['data'].metadata.supplier;
                const units = metadataResponse['data'].metadata.unit;
                this.localeService.addToMasterData(metadataResponse['data'].masterData);
                this.inputs = JSON.parse(JSON.stringify(inputs));
                this.inputs_static = JSON.parse(JSON.stringify(inputs));
                this.garmentSuppliers = JSON.parse(JSON.stringify(suppliers));
                this.units = JSON.parse(JSON.stringify(units));

                let counter = 0;
                for (const materialsKey in materials) {
                    if (!materials.hasOwnProperty(materialsKey)) {
                        continue;
                    }
                    this.selectedItems[counter++] = [];
                    this.inputs_materials[materialsKey] = [];
                    if (Array.isArray(materials[materialsKey])) {
                        for (let j = 0; j < materials[materialsKey].length; j++) {
                            this.inputs_materials[materialsKey].push({
                                id: materials[materialsKey][j],
                                itemName: this.localeService.getDisplayText(materials[materialsKey][j])
                            });
                        }
                    } else {
                        this.inputs_materials[materialsKey].push({
                            id: 'Not Applicable',
                            itemName: 'Not Applicable'
                        });
                    }
                }

                this.TRVPSupplier = [];
                if (!this.canProceed[0]) {
                    for (let k = 0; k < this.inputs.length; k++) {
                        this.POFileName[k] = [];
                        this.TRVPSupplier[k] = [];
                        for (let i = 0; i < this.inputs[k].values.length; i++) {
                            this.TRVPSupplier[k][i] = {
                                input: '',
                                material: '',
                                supplierId: '',
                                po: '',
                                poFile: '',
                                quantity: '',
                                unit: ''
                            };
                        }
                    }
                }

                if (Object.keys(tr.inputList).length !== 0 && tr.inputList.constructor === Object) {
                    let k = 0;
                    this.inputs = [];
                    for (const key in tr.inputList) {
                        if (tr.inputList.hasOwnProperty(key)) {
                            this.inputs[k] = {
                                values: [],
                                type: key
                            };
                            this.TRVPSupplier[k] = [];
                            this.selectedItems[k] = [];
                            for (let i = 0; i < tr.inputList[key].length; i++) {
                                this.inputs[k].values.push(tr.inputList[key][i].input);
                                if (!this.TRVPSupplier[k][i]) {
                                    this.TRVPSupplier[k][i] = {
                                        input: '',
                                        material: '',
                                        supplierId: '',
                                        po: '',
                                        poFile: '',
                                        quantity: '',
                                        unit: ''
                                    };
                                }
                                this.TRVPSupplier[k][i].input = tr.inputList[key][i].input;
                                if (Array.isArray(tr.inputList[key][i].material)) {
                                    this.TRVPSupplier[k][i].material = tr.inputList[key][i].material;

                                    this.selectedItems[k][i] = [];
                                    for (let j = 0; j < tr.inputList[key][i].material.length; j++) {
                                        this.selectedItems[k][i].push({
                                            id: tr.inputList[key][i].material[j],
                                            itemName: this.localeService.getDisplayText(
                                                tr.inputList[key][i].material[j]
                                            )
                                        });
                                    }
                                } else {
                                    this.TRVPSupplier[k][i].material = [];
                                }
                                this.TRVPSupplier[k][i].supplierId = tr.inputList[key][i].supplierId;
                                this.TRVPSupplier[k][i].po = tr.inputList[key][i].poNumber;
                                this.TRVPSupplier[k][i].poFile = tr.inputList[key][i].poId;
                                if (tr.inputList[key][i].qty) {
                                    this.TRVPSupplier[k][i].quantity = tr.inputList[key][i].qty['quantity'];
                                    this.TRVPSupplier[k][i].unit = tr.inputList[key][i].qty['unit'];
                                }
                            }
                            k++;
                        }
                    }
                }

                this.pts.getMetadata('facility', tr.id).subscribe(facilityMetadataResponse => {
                    const facilityMetadata = facilityMetadataResponse['data'].metadata;
                    this.localeService.addToMasterData(facilityMetadataResponse['data'].masterData);
                    const processes = facilityMetadata.valueProcess;
                    const facilities = facilityMetadata.facility;

                    this.facilities = JSON.parse(JSON.stringify(facilities));
                    this.processes = JSON.parse(JSON.stringify(processes));

                    this.vpToFacility = [];

                    if (tr.vpToFacility) {
                        for (const vpToFacilityKey in tr.vpToFacility) {
                            if (!tr.vpToFacility.hasOwnProperty(vpToFacilityKey)) {
                                continue;
                            }

                            this.vpToFacility[vpToFacilityKey] = tr.vpToFacility[vpToFacilityKey];
                        }
                    }
                });

                if (this.canProceed[1]) {
                    this.pts
                        .getMetadata('questionnaire', this.surveyModalTR.id)
                        .subscribe(questionnaireMetadataResponse => {
                            this.assessmentId = questionnaireMetadataResponse['data'].metadata.assessment_id;

                            this.loadingSurveyQuestions = true;
                            this.assessmentService
                                .getSurveyQuestions(this.assessmentId)
                                .subscribe(surveyQuestionsResponse => {
                                    const questions = surveyQuestionsResponse['data'].question;
                                    const responses = surveyQuestionsResponse['data'].response;

                                    this.subGroupTabs = [];

                                    for (const questionsKey in questions) {
                                        if (!questions.hasOwnProperty(questionsKey)) {
                                            continue;
                                        }
                                        this.groupName = questionsKey;
                                        for (const questionKey in questions[questionsKey]) {
                                            if (!questions[questionsKey].hasOwnProperty(questionKey)) {
                                                continue;
                                            }
                                            this.subGroupTabs.push(questionKey);
                                        }
                                    }

                                    this.responses = [];
                                    this.answered = JSON.parse(JSON.stringify(responses));

                                    this.selectedTabName = this.subGroupTabs[0];

                                    this.surveyQuestions = JSON.parse(JSON.stringify(questions));
                                    this.loadingSurveyQuestions = false;
                                });

                            setTimeout(() => {
                                this.trStarting[tr.id] = false;
                                this.trResuming[tr.id] = false;
                                //this.subTRModal.hide();
                                this.surveyModal.show();
                            }, 10);
                        });
                } else {
                    setTimeout(() => {
                        this.trStarting[tr.id] = false;
                        this.trResuming[tr.id] = false;
                        //this.subTRModal.hide();
                        this.surveyModal.show();
                    }, 10);
                }
            },
            () => {
                this.trStarting[tr.id] = false;
                this.trResuming[tr.id] = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    public downloadPO(evidenceId, poNumber) {
        this.toastr.info('Requesting file. Please wait');
        this.pts.getPO(evidenceId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                this.pts.getPOFileName(evidenceId).subscribe(
                    fileNameResponse => {
                        const fileName = fileNameResponse['data'];
                        FileSaver.saveAs(blob, fileName);
                    },
                    () => {
                        this.toastr.info('Downloading as JPEG image type', 'Error fetching file name');
                        FileSaver.saveAs(blob, poNumber + '.jpg');
                    }
                );
            },
            failData => {
                console.log(failData);
                this.toastr.error(`Failed to download file. Error: ${failData.error.error}`);
            }
        );
    }

    setCurrentSurveyTab(tabName: number) {
        if (tabName === 3) {
            this.pts.getMetadata('certification', this.currentTRId).subscribe(certificationMetadataResponse => {
                this.certifications_types = certificationMetadataResponse['data'].metadata['CERTIFICATION'];
                this.localeService.addToMasterData(certificationMetadataResponse['data'].masterData);
            });
            this.currentSurveyTab = tabName;
        } else if (tabName === 4) {
            // Shipment Details tab
            this.currentSurveyTab = tabName;
        } else {
            if (tabName > 0 && !this.canProceed[tabName - 1]) {
                if (!this.canProceed[0]) {
                    this.toastr.info('Please complete supplier inputs', 'Required Action');
                } else if (!this.canProceed[1]) {
                    this.toastr.info('Please complete production facilities', 'Required Action');
                }
                return;
            }
            this.currentSurveyTab = tabName;
        }
    }

    createVPToFacility() {
        const payload = {
            id: this.surveyModalTR.id,
            vpToFacility: {}
        };

        for (let i = 0; i < this.processes.length; i++) {
            for (let j = 0; j < this.processes[i].values.length; j++) {
                if (!this.vpToFacility[this.processes[i].values[j]]) {
                    this.toastr.error('Please fill all VPs inorder to proceed');
                    return;
                }
            }
        }

        for (const vpToFacilityKey in this.vpToFacility) {
            if (this.vpToFacility.hasOwnProperty(vpToFacilityKey)) {
                payload.vpToFacility[vpToFacilityKey] = this.vpToFacility[vpToFacilityKey];
            }
        }

        this.pts.saveVPToFacility(payload).subscribe(() => {
            this.toastr.success('Production facilities have been saved', 'Success');
            this.currentTRId = this.surveyModalTR.id;
            this.getAllSubTRs();
        });
    }

    submitSurvey() {
        this.analyticsService.trackEvent('TR Submitted');
        this.surveyModal.hide();
    }

    // noinspection JSMethodCanBeStatic
    displayMaterialsTooltip(material) {
        let displayString = '';
        for (const value in material) {
            displayString = displayString + this.localeService.getDisplayText(material[value]) + ',';
        }
        return displayString.slice(0, -1);
    }

    saveFibreMaterials() {
        const payload = {
            id: this.surveyModalTR.id,
            material: this.fibreMaterials.map(item => {
                return item.itemName;
            })
        };
        this.launchTRModalLaunchingBusy = true;
        this.pts.saveFibreMaterial(payload).subscribe(
            () => {
                this.toastr.info('Fibre materials saved', 'Success');
                this.getAllSubTRs();
                this.launchTRModalLaunchingBusy = false;
            },
            () => {
                this.launchTRModalLaunchingBusy = false;
                this.toastr.error('An error occurred on saving fibre materials. Please try after some time', 'Error');
            }
        );
    }

    addNewInput(k, input) {
        this.inputs[k].values.push(input);

        this.TRVPSupplier[k][this.inputs[k].values.length - 1] = {
            input: '',
            material: '',
            supplierId: '',
            po: '',
            poFile: '',
            quantity: '',
            unit: ''
        };
    }

    removeNewInput(k, i) {
        this.inputs[k].values.splice(i, 1);

        this.TRVPSupplier[k].splice(i, 1);

        this.selectedItems[k].splice(i, 1);

        this.POFileName[k].splice(i, 1);
    }

    openFacilityModal(facility) {
        this.viewingFacility = JSON.parse(JSON.stringify(facility));
        this.facilityModal.show();
    }

    submitTR(trId) {
        this.pts.submitTR(trId).subscribe(
            response => {
                this.toastr.success('successfully submitted.');
            },
            fail_response => {
                this.toastr.error('Error submitting. Please try again after sometime');
            }
        );
    }

    public isBotPOsAvailable() {
        if (
            this.surveyModalTR.hasOwnProperty('supplierInput') &&
            this.surveyModalTR.supplierInput.length > 0 &&
            this.surveyModalTR.supplierInput[0].botPoIds
        ) {
            return true;
        } else {
            return false;
        }
    }

    getAllReceivedTR() {
        this.pageLoading = true;
        this.filterOptions = this.updateFiltersSelection();
        this.pts.getAllReceivedTRs(this.filterOptions).subscribe(response => {
            this.trs = response['data']['trList'];
            this.localeService.addToMasterData(response['data']['masterData']);
            for (let i = 0; i < this.trs.length; i++) {
                this.trs[i].createTs = new Date(this.trs[i].createTs).toLocaleString();
                if (this.trs[i].status) {
                    this.trs[i].statusText = this.trs[i].status.toLowerCase().replace('_', '');
                }
            }
            this.pageLoading = false;
        });
    }

    updateFiltersSelection() {
        return this.utilService.getSessionStorageValue(this.filter_session) || this.filterOptions;
    }

    getFilteredOptions() {
        this.filterOptions = {
            supplierName: [],
            season: [],
            year: [],
            productGroup: [],
            status: []
        };
        const options = this.utilService.getSessionStorageValue(this.filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    this.filterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return this.filterOptions;
    }
}
