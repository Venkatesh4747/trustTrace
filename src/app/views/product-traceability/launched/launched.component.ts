import { Component, OnInit, ViewChild } from '@angular/core';
import * as FileSaver from 'file-saver';
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
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-launched',
    templateUrl: './launched.component.html',
    styleUrls: ['./launched.component.scss']
})
export class LaunchedComponent implements OnInit {
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

    trs = [];

    deleteTRLoading: any = [];

    @ViewChild('launchTRModal', { static: true }) launchTRModal;
    @ViewChild('subTRModal', { static: true }) subTRModal;
    @ViewChild('supplierProfileModal', { static: true }) supplierProfileModal;

    TRQuantity: any;
    TRPurchaseOrderNo: any;
    launchTRModalLaunchingBusy: boolean;

    quarters = ['Winter', 'Spring', 'Summer', 'Fall'];
    TROneSupplier: boolean;
    garmentSuppliers = [];
    units = [];

    TRStyleName: any = '';
    currentStyle: any;
    TRVPSupplier = [];
    products: any = [];

    TRUnit: null;
    materials: any = [];
    TRYear: any;
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
    orderPlacedByBrand: boolean;
    TRSeason: any;
    selectedCertification: any;

    create_POFileName: any = false;
    create_TRPOFileId: any;
    POFileName: any = [];
    subTRs: any;
    certificationFiles: any = {};
    subTRLoading: boolean;
    modalFlowData: any;

    @ViewChild('supplierModal', { static: false }) supplierModal;
    @ViewChild('productFlowModal', { static: true }) productFlowModal;
    @ViewChild('surveyModal', { static: false }) surveyModal;

    level: any = [];
    productFlowDataReady: boolean;
    previewTRLoading: any = [];
    flowchartTRLoading: any = [];
    surveyModalTR: any;
    trStarting: any = [];
    trResuming: any = [];
    loadingSurveyQuestions: boolean;
    surveyQuestions: any;
    submittedSupplierInput: boolean;
    currentTRId: any;
    currentSurveyTab: number;
    canProceed: any = [];
    multiSelectMaterials: any[] = [];
    inputs: any;
    inputs_static: any;
    selectedItems: any = [];
    inputs_materials: any = [];
    create_TRVPSupplier: { id: string; vp: string; po: string; poFile: string; quantity: string; unit: string } = {
        id: '',
        vp: '',
        po: '',
        poFile: '',
        quantity: '',
        unit: ''
    };
    facilities: any;
    processes: any;
    vpToFacility: any = [];
    assessmentId: any;
    certifications_types: any;
    subGroupTabs: any[] = [];
    groupName: string;
    responses: any[] = [];
    answered: any;
    selectedTabName: any;
    dropdownSettings: any = {};
    dropdownSettingsDisabled: any = {};
    viewingFacility: any;
    filteredStyles = [];
    productTemplateSearchText = '';
    selectedProductIdToCreateTR = '';
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
        status: []
    };
    filter_session = 'trLaunch_filters';
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
        private utilsService: UtilsService,
        private multiIndustryService: MultiIndustryService
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
        this.pts.getLaunchedTRFilter().subscribe(response => {
            const data = response['data'];
            const trFilter = data.trFilter;
            this.trFilters = {
                supplierName: trFilter.supplierName,
                season: trFilter.season,
                year: trFilter.year,
                status: trFilter.status
            };
        });
        this.getAllLaunchedTR();
        this.pageLoading = true;

        this.pts.getCreateTRMetadata().subscribe(
            metadataResponse => {
                const product = metadataResponse['data'].metadata.product;
                const supplier = metadataResponse['data'].metadata.supplier;
                const units = metadataResponse['data'].metadata.unit;
                this.localeService.addToMasterData(metadataResponse['data'].masterData);
                this.products = JSON.parse(JSON.stringify(product));
                this.garmentSuppliers = JSON.parse(JSON.stringify(supplier));
                this.units = JSON.parse(JSON.stringify(units));
            },
            () => {
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );

        this.qs.getAll().subscribe(
            response => {
                const data = response.data;
                if (data.hasOwnProperty('distinct_classifications_of_company')) {
                    this.materials = data.distinct_classifications_of_company.material;
                }

                this.commonServices.getCountries().subscribe(response1 => {
                    const data1 = response1['data'];
                    this.countries = data1.country;

                    this.pageLoading = false;
                });
            },
            () => {
                this.pageLoading = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    getProductFlow(tr_id) {
        this.productFlowDataReady = false;
        this.flowchartTRLoading[tr_id] = true;
        this.productFlowModal.show();
        this.pts.getProductFlow(tr_id).subscribe(
            productFlowResponse => {
                this.modalFlowData = [];
                this.modalFlowData.push(JSON.parse(JSON.stringify(productFlowResponse['data']['productFlow'])));
                this.localeService.addToMasterData(productFlowResponse['data'].masterData);
                this.modalFlowData[0]['root'] = true;
                this.flowchartTRLoading[tr_id] = false;
                this.productFlowDataReady = true;
            },
            () => {
                this.productFlowDataReady = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    refreshTRTable() {
        this.pageLoading = true;
        this.pts.getAllTRs(this.filterOptions).subscribe(
            response => {
                this.trs = response['data']['trList'];
                for (let i = 0; i < this.trs.length; i++) {
                    this.trs[i].createTs = new Date(this.trs[i].createTs).toLocaleString();
                    if (this.trs[i].status) {
                        this.trs[i].statusText = this.trs[i].status.toLowerCase().replace('_', '');
                    }
                }
                this.pageLoading = false;
            },
            () => {
                this.pageLoading = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    resetLaunchParams() {
        this.productTemplateSearchText = '';
        this.selectedProductIdToCreateTR = '';
        this.TRStyleName = null;
        this.TRPurchaseOrderNo = null;
        this.TRQuantity = null;
        this.TROneSupplier = null;
        this.TRUnit = null;
        this.launchTRModalLaunchingBusy = false;
        this.create_POFileName = false;
    }

    openLaunchTRModal() {
        this.resetLaunchParams();
        this.launchTRModal.show();
    }

    // noinspection JSMethodCanBeStatic
    InvokeTRVPFileUpload(vp: string) {
        const element = document.getElementById('file_upload_' + vp);
        element.click();
    }

    openSubTRModal(TRId) {
        this.subTRLoading = true;
        this.pts.getAllSubTRs(TRId, 'by').subscribe(
            subTRsResponse => {
                this.subTRs = subTRsResponse['data'];
                for (let i = 0; i < this.subTRs.length; i++) {
                    this.subTRs[i].createTs = new Date(this.subTRs[i].createTs).toLocaleString();
                    if (this.subTRs[i].status) {
                        this.subTRs[i]['statusText'] = this.subTRs[i].status.toLowerCase().replace('_', '');
                    }
                }
                this.subTRLoading = false;
                this.subTRModal.show();
            },
            () => {
                this.subTRLoading = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
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
                this.profileData = {
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

                this.profileData.Facilities = JSON.parse(JSON.stringify(data.facilities));

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

                    this.regions = [];

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

    uploadPO(files: FileList) {
        if (files.length === 0) {
            this.create_POFileName = false;
            return;
        }
        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        this.create_POFileName = fileName;
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
                this.create_TRPOFileId = response['data'].id;
            },
            () => {
                this.create_POFileName = false;
                this.toastr.error('The file could not be uploaded.', 'Error Uploading File!');
            }
        );
    }

    resetCreateTRForm() {
        this.selectedProductIdToCreateTR = '';
        this.TRStyleName = '';
        this.TRYear = '';
        this.TRSeason = '';
        this.create_TRVPSupplier = {
            id: '',
            vp: '',
            po: '',
            poFile: '',
            quantity: '',
            unit: ''
        };
    }

    validateCreateTRForm() {
        if (!this.selectedProductIdToCreateTR) {
            this.toastr.error(this.multiIndustryService.getLabel('Please select a style'));
            return;
        }

        /* if (!this.TRStyleName) {
      this.toastr.error('Please enter the Style Name');
      return;
    }

    if (!this.TRYear) {
      this.toastr.error('Please enter the year');
      return;
    }

    if (!this.TRSeason) {
      this.toastr.error('Please select the season');
      return;
    } */

        if (!this.create_TRVPSupplier.vp) {
            this.toastr.error('Please select a Type');
            return;
        }

        if (!this.create_TRVPSupplier.id) {
            this.toastr.error('Please select a supplier');
            return;
        }

        if (!this.create_TRVPSupplier.po) {
            this.toastr.error('Please enter the Purchase Order ID');
            return;
        }

        if (!this.create_TRVPSupplier.quantity) {
            this.toastr.error('Please enter the quantity');
            return;
        }

        if (!this.create_TRVPSupplier.unit) {
            this.toastr.error('Please select the appropriate unit');
            return;
        }

        return true;
    }

    createTR() {
        if (!this.validateCreateTRForm()) {
            return false;
        }

        const payload = {
            productTemplateId: this.selectedProductIdToCreateTR
        };

        const supplierIds = [];
        const poNumbers = [];
        const inputs = [];
        payload['supplierInput'] = [];
        payload['supplierInput'].push({
            supplierId: this.create_TRVPSupplier.id,
            poNumber: this.create_TRVPSupplier.po,
            poId: this.create_TRPOFileId,
            qty: {
                quantity: this.create_TRVPSupplier.quantity,
                unit: this.create_TRVPSupplier.unit
            },
            input: this.create_TRVPSupplier.vp
        });

        supplierIds.push(this.create_TRVPSupplier.id);
        poNumbers.push(this.create_TRVPSupplier.po);
        inputs.push(this.create_TRVPSupplier.vp);

        this.launchTRModalLaunchingBusy = true;
        this.pts.createTR(payload).subscribe(
            () => {
                this.toastr.success('Traceability Request created', 'Success');
                this.analyticsService.trackEvent('TR Initiated', { Origin: 'TR - Launched' });
                this.launchTRModalLaunchingBusy = false;
                this.resetCreateTRForm();
                this.refreshTRTable();
                this.launchTRModal.hide();
            },
            () => {
                this.launchTRModalLaunchingBusy = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    displayMaterialsTooltip(material) {
        let displayString = '';
        for (const value in material) {
            displayString = displayString + this.localeService.getDisplayText(material[value]) + ',';
        }
        return displayString.slice(0, -1);
    }

    setCanProceed() {
        for (let i = 0; i < this.subTRs.length; i++) {
            if (this.subTRs[i].id === this.currentTRId) {
                this.canProceed[0] = !!this.subTRs[i].supplierInput;
                this.canProceed[1] = !!this.subTRs[i].vpToFacility;
            }
        }
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

    openPreviewModal(tr) {
        this.surveyModalTR = JSON.parse(JSON.stringify(tr));

        this.surveyModalTR.preview = true;

        this.submittedSupplierInput = false;
        this.previewTRLoading[tr.id] = true;

        this.currentTRId = tr.id;
        this.setCanProceed();
        this.trResuming[tr.id] = true;
        this.trStarting[tr.id] = true;
        this.setCurrentSurveyTab(0);
        this.multiSelectMaterials = [];

        this.pts.getMetadata('supplier_input', tr.id).subscribe(metadataResponse => {
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
                                        itemName: this.localeService.getDisplayText(tr.inputList[key][i].material[j])
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
                        this.localeService.addToMasterData(questionnaireMetadataResponse['data'].masterData);

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
                            this.previewTRLoading[tr.id] = false;
                        }, 10);
                    });
            } else {
                setTimeout(() => {
                    this.trStarting[tr.id] = false;
                    this.trResuming[tr.id] = false;
                    //this.subTRModal.hide();
                    this.surveyModal.show();
                    this.previewTRLoading[tr.id] = false;
                }, 10);
            }
        });
    }

    openFacilityModal(facility) {
        this.viewingFacility = JSON.parse(JSON.stringify(facility));
        this.facilityModal.show();
    }

    approveTR(trId) {
        this.pts.approveTR(trId).subscribe(
            response => {
                this.toastr.success('approved');
            },
            fail_response => {
                this.toastr.error('Error approving. Please try again after sometime');
            }
        );
    }

    getToolTipForApproveTR(status) {
        let msg = '';
        if (status === 'IN_PROGRESS' || status === 'UNOPENED') {
            msg = 'Yet to complete';
        } else if (status === 'SUBMITTED') {
            msg = 'Approve';
        } else if (status === 'APPROVED') {
            msg = 'Approved';
        }
        return msg;
    }

    isCompleted(status) {
        return status && status === 'SUBMITTED';
    }

    searchProductTemplate(searchText) {}

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

    public getProductDisplayName(item) {
        if (!item) {
            return '';
        }
        return item.unique_search;
    }

    public productSelectionChangedInCreateTR(event) {
        const id_type = event.option.value.id_type;
        const id = id_type.split('-')[0];
        this.selectedProductIdToCreateTR = id;
    }

    getAllLaunchedTR() {
        this.pageLoading = true;
        this.filterOptions = this.updateFiltersSelection();
        this.pts.getAllTRs(this.getFilteredOptions()).subscribe(
            response => {
                this.trs = response['data']['trList'];
                for (let i = 0; i < this.trs.length; i++) {
                    this.trs[i].createTs = new Date(this.trs[i].createTs).toLocaleString();
                    if (this.trs[i].status) {
                        this.trs[i].statusText = this.trs[i].status.toLowerCase().replace('_', '');
                    }
                }
                this.pageLoading = false;
            },
            () => {
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }
    updateFiltersSelection() {
        return this.utilsService.getSessionStorageValue(this.filter_session) || this.filterOptions;
    }

    getFilteredOptions() {
        this.filterOptions = {
            supplierName: [],
            season: [],
            year: [],
            productGroup: [],
            status: []
        };
        const options = this.utilsService.getSessionStorageValue(this.filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    this.filterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return this.filterOptions;
    }
    searchStyles(event) {
        const searchPayload = {};
        searchPayload['freeHand'] = this.productTemplateSearchText;
        this.pts.searchStyle(searchPayload).subscribe(response => {
            this.filteredStyles = response['data'].searchResponse;
        });
    }
}
