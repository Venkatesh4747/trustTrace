import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { AssessmentAuditService } from '../../assessment-audit/assessment-audit.service';
import { FacilitiesService } from '../../facilities/facilities.service';
import { FacilitiesProfile } from './facilities-profile.model';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
const moment = _rollupMoment || _moment;

export interface IValueProcess {
    name: string;
}

export interface IMaterials {
    name: string;
}

@Component({
    selector: 'app-facilities-details',
    templateUrl: './facilities-details.component.html',
    styleUrls: ['./facilities-details.component.scss']
})
export class FacilitiesDetailsComponent implements OnInit {
    pageLoading = true;
    todoTask;
    contact;
    contactInfo = { name: '', email: '', phoneNumber: '' };
    facilityProfile: FacilitiesProfile;
    supplier;
    analyticsPageOrigin = 'Facilities Page';
    audits = [];
    auditCount = 0;
    /*CHIPS INPUT */
    visible = true;
    imageVisible = false;
    address;
    standards = [];
    masterData = [];
    vpObjs = [];
    matObjs = [];
    moment = moment;

    editVisible = false;
    vpSelectable = false;
    vpRemovable = false;
    matSelectable = false;
    matRemovable = false;
    editContactInfo = false;
    env = environment;

    addOnBlur = true;
    facilityId = '';
    countries = [];
    vpCtrl = new FormControl();
    filteredVps: Observable<object[]>;
    matCtrl = new FormControl();
    filteredMaterials: Observable<Object[]>;
    @ViewChild('vpInput', { static: false }) vpInput: ElementRef;
    @ViewChild('matInput', { static: false }) matInput: ElementRef;

    staticFacilityProfileTypes = ['Basic Information', 'Facility Scoring'];
    facilityProfileTypes: string[];
    facilityProfileType: string;
    additionalInfo;
    entity = 'FACILITY'; // 'ML', 'SUPPLIER', 'FACILITY'
    viewPage = 'FACILITY_VIEW'; // 'ML_VIEW', 'SUPPLIER_VIEW', 'FACILITY_VIEW'
    viewType = 'FORM'; // 'FORM', 'TABLE', 'CARD'
    isFetchingAdditionalInfo = false;
    additionalInformation = 'Additional Information';
    additionalInformationPage = 'Addition Information Page';
    editAddress = false;

    facilityRating: any;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    master_standards: any[];

    payload: any;
    fieldResponse: any;
    get checkAccess(): (name: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    constructor(
        private route: ActivatedRoute,
        public commonServices: CommonServices,
        private analyticsService: AnalyticsService,
        public localeService: LocalizationService,
        private fs: FacilitiesService,
        public utilService: UtilsService,
        private toastr: CustomToastrService,
        public certificateManagerService: CertificateManagerService,
        private assessmentAuditService: AssessmentAuditService,
        public auth: AuthService
    ) {
        this.facilityProfileTypes = [...this.staticFacilityProfileTypes];
        this.facilityProfileType = this.facilityProfileTypes[0];
        this.facilityProfile = {
            facilityId: null,
            name: '',
            description: '',
            associatedSince: undefined,
            contactInfo: { name: '', phoneNumber: '', email: '' },
            employeeCount: { men: '0', women: '0', others: '0', total: '0' },
            valueProcess: [],
            materials: [],
            certifications: [],
            address: {
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                country: '',
                zip: ''
            },
            noOfAssessments: 0,
            productionCapacity: ''
        };
        this.onInputChange();
    }
    onInputChange() {
        this.filteredVps = this.vpCtrl.valueChanges.pipe(
            startWith(null),
            map((vp: string | null) => (vp ? this._filterVps(vp) : this.vpObjs.slice()))
        );

        this.filteredMaterials = this.matCtrl.valueChanges.pipe(
            startWith(null),
            map((material: string | null) => (material ? this._filterMaterials(material) : this.matObjs.slice()))
        );
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.pageLoading = true;
            this.facilityId = params['id'];
            this.resetPayload();
            this.payload['groupOnly'] = true;

            this.commonServices.getCustomFieldInfo(this.payload).subscribe(response => {
                const additionalInfoData = response['customFieldUITemplateAggResponseMap'];
                this.processAdditionalInfoTabs(additionalInfoData);
                this.resetPayload();
            });
            this.fs.getFacility(this.facilityId).subscribe(
                response => {
                    Object.keys(response.data.facility).forEach(key => {
                        if (response.data.facility[key] !== null || response.data.facility[key] !== undefined) {
                            this.facilityProfile[key] = response.data.facility[key];
                        }
                    });
                    this.masterData = response.data.masterData;
                    this.localeService.addToMasterData(response.data.masterData);
                    this.master_standards = this.localeService.getcertifications(this.masterData);
                    const facility = response.data.facility;
                    if (facility.hasOwnProperty('contactInfo')) {
                        this.contact = facility.contactInfo;
                        this.contactInfo.name = facility.contactInfo.name;
                        this.contactInfo.email = facility.contactInfo.email;
                        this.contactInfo.phoneNumber = facility.contactInfo.phoneNumber;
                    }
                    if (facility.hasOwnProperty('address')) {
                        this.address = response.data.facility.address;
                        this.fs.getFacilityRating(this.address.country).subscribe(facilityRatingResponse => {
                            this.facilityRating = JSON.parse(JSON.stringify(facilityRatingResponse));
                            for (const [key, data] of Object.entries(this.facilityRating)) {
                                if (data['status'].toLowerCase().match(/(high)/)) {
                                    this.facilityRating[key].type = 'danger';
                                } else if (data['status'].toLowerCase().match(/(medium|moderate)/)) {
                                    this.facilityRating[key].type = 'warning';
                                } else {
                                    this.facilityRating[key].type = 'info';
                                }
                            }
                        });
                    }
                    this.todoTask = response.data.facility.todoTasks;
                    this.standards = response.data.facility.certificateList;
                    this.initializeChipAutoList(this.facilityProfile);
                    this.analyticsService.trackEvent('Facilities Details Page', {
                        Origin: 'Facility Page',
                        SupplierId: this.facilityId,
                        Action: 'facilities details page visited'
                    });
                    this.pageLoading = false;
                },
                () => {
                    this.toastr.error(
                        environment.error_messages.could_not_fetch_data.message,
                        environment.error_messages.could_not_fetch_data.title
                    );
                    this.pageLoading = false;
                }
            );
            this.assessmentAuditService.getFacilityProfileAudits(this.facilityId).subscribe(
                response => {
                    const data = response['data'];
                    this.audits = data['audits'];
                    this.auditCount = data['totalCount'];
                },
                () => {
                    this.toastr.error(
                        environment.error_messages.could_not_fetch_data.message,
                        environment.error_messages.could_not_fetch_data.title
                    );
                }
            );
        });
        this.commonServices.getCountries().subscribe(response => {
            this.countries = response['data']['country'];
        });
    }

    wantToEditVp(toBeDisabled = true) {
        this.vpRemovable = toBeDisabled;
        this.vpSelectable = toBeDisabled;
    }

    wantToEditMat(toBeDisabled = true) {
        this.matRemovable = toBeDisabled;
        this.matSelectable = toBeDisabled;
    }

    add(event: MatChipInputEvent, type: string): void {
        const input = event.input;
        const value = event.value;

        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.onValueChange(value, '');
    }

    // Remove value process chips
    removeVp(valueProcess: string): void {
        if (this.auth.haveAccess('FACILITY_UPDATE')) {
            const index = this.facilityProfile.valueProcess.indexOf(valueProcess);
            if (index >= 0) {
                this.facilityProfile.valueProcess.splice(index, 1);
                const duplicate = this.vpObjs.filter(obj => obj.id.includes(valueProcess));
                if (duplicate.length === 0) {
                    this.vpObjs.push(this.masterData[valueProcess]);
                }
            }
            this.onValueChange(valueProcess, '');
            this.onInputChange();
            this.analyticsService.trackEvent('Facilities Details Page', {
                Origin: 'Facilities Page',
                'Action Performed': 'Value Process Removed'
            });
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
        }
    }

    // Remove value process chips
    removeMat(materials: string): void {
        if (this.auth.haveAccess('FACILITY_UPDATE')) {
            const index = this.facilityProfile.materials.indexOf(materials);
            if (index >= 0) {
                this.facilityProfile.materials.splice(index, 1);
                const duplicate = this.matObjs.filter(obj => obj.id.includes(materials));
                if (duplicate.length === 0) {
                    this.matObjs.push(this.masterData[materials]);
                }
            }
            this.onValueChange(materials, '');
            this.onInputChange();
            this.analyticsService.trackEvent('Facilities Details Page', {
                Origin: 'Facilities Page',
                'Action Performed': 'Material Removed'
            });
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
        }
    }
    /*CHIPS INPUT */

    updateQualityParam(value) {
        if (this.auth.haveAccess('FACILITY_UPDATE')) {
            this.facilityProfile.qualityRating = value;
            this.onValueChange(value, '');
            this.analyticsService.trackEvent('Facilities Details Page', {
                Origin: 'Facilities Page',
                'Action Performed': 'Rating updated'
            });
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
        }
    }

    onValueChange(param = null, type?: string) {
        if (param !== null) {
            switch (type) {
                case 'CONTACT':
                    this.facilityProfile.contactInfo.phoneNumber = param.contactMobile;
                    this.facilityProfile.contactInfo.email = param.contactEmail;
                    this.facilityProfile.contactInfo.name = param.contactPersonName;
                    break;
                case 'DATE':
                    this.facilityProfile.associatedSince = param;
                    break;
            }
        }
        this.facilityProfile.facilityId = this.facilityId;
        this.fs.saveFacilityProfile(this.facilityProfile).subscribe(
            resp => {
                // if it is a first time update. ensuring the next update is not creating a duplicate entry here
                const facility = resp.data.facility;
                this.facilityProfile = this.initializeObject(facility, this.facilityProfile);
                this.initializeChipAutoList(this.facilityProfile);
                if (facility.contactInfo) {
                    this.contact = facility.contactInfo;
                }
                this.analyticsService.trackEvent('Facilities Details Page', {
                    Origin: 'Facilities Page',
                    facilityId: this.facilityId,
                    'Action Performed': 'Facility profile updated'
                });
            },
            () => {
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }
    initializeChipAutoList(facilityProfile) {
        this.vpObjs = [];
        this.matObjs = [];
        for (const key in this.masterData) {
            if (key.startsWith('vp')) {
                const index = facilityProfile.valueProcess.indexOf(this.masterData[key].id);
                if (index === -1) {
                    this.vpObjs.push(this.masterData[key]);
                }
            } else if (key.startsWith('mtr')) {
                const index = facilityProfile.materials.indexOf(this.masterData[key].id);
                if (index === -1) {
                    this.matObjs.push(this.masterData[key]);
                }
            } else if (key.startsWith('cert')) {
                // this.matObjs.push(this.masterData[key])
                // implement later if needed
            }
        }
    }
    initializeObject(sourceObj, sampleObj) {
        if (!sampleObj) {
            return sourceObj;
        }
        for (const key in sourceObj) {
            if (sourceObj.hasOwnProperty(key)) {
                const tempSampleObj = sampleObj[key];
                const tempSourceObj = sourceObj[key];
                if (Array.isArray(tempSampleObj)) {
                    if (Array.isArray(tempSourceObj)) {
                        if (typeof tempSourceObj[0] === 'object') {
                            sampleObj[key] = [];
                            for (let i = 0; i < tempSourceObj.length; i++) {
                                sampleObj[key].push(this.initializeObject(tempSourceObj[i], tempSampleObj[i]));
                            }
                        } else {
                            sampleObj[key] = tempSourceObj;
                        }
                    }
                } else if (typeof tempSampleObj === 'object') {
                    this.initializeObject(sourceObj[key], sampleObj[key]);
                } else {
                    sampleObj[key] = sourceObj[key];
                }
            }
        }
        return sampleObj;
    }

    onBlurVp() {
        this.vpRemovable = false;
    }

    onBlurMaterial() {
        this.matRemovable = false;
    }

    focusOnInput(field) {
        if (this.auth.haveAccess('FACILITY_UPDATE')) {
            if (field === 'Material') {
                this.matInput.nativeElement.focus();
            } else {
                this.vpInput.nativeElement.focus();
            }
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
        }
    }

    blurChipInput(field) {
        if (field === 'Material') {
            this.matInput.nativeElement.blur();
            this.onBlurMaterial();
        } else {
            this.vpInput.nativeElement.blur();
            this.onBlurVp();
        }
    }

    selectedValueProcess(event: MatAutocompleteSelectedEvent): void {
        this.facilityProfile.valueProcess.push(event.option.value);
        const index = _.findIndex(this.vpObjs, { id: event.option.value });
        this.vpObjs.splice(index, 1);
        this.vpInput.nativeElement.value = '';
        this.vpCtrl.setValue(null);
        this.onValueChange();
        this.blurChipInput('Value Process');
    }

    selectedMaterials(event: MatAutocompleteSelectedEvent): void {
        this.facilityProfile.materials.push(event.option.value);
        const index = _.findIndex(this.matObjs, { id: event.option.value });
        this.matObjs.splice(index, 1);
        this.matInput.nativeElement.value = '';
        this.matCtrl.setValue(null);
        this.onValueChange();
        this.blurChipInput('Material');
    }

    private _filterVps(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.vpObjs.filter(vp => vp.id.includes(filterValue));
    }
    private _filterMaterials(value: string) {
        const filterValue = value.toLowerCase();
        return this.matObjs.filter(material => material.id.includes(filterValue));
    }

    getCountryCode(countryName) {
        for (const country of this.countries) {
            if (country.name === countryName) {
                return country.code.toLowerCase();
            }
        }
        return false;
    }

    getCertificateNameById(Certificate_Type: any) {
        const cert = this.master_standards.filter(certificate => certificate.id === Certificate_Type);
        if (cert && cert.length > 0) {
            return cert[0].value;
        }

        return 'Certificate Not Found';
    }

    onSaveAdditionalInfo(payload: any) {
        this.isFetchingAdditionalInfo = true;
        this.commonServices.updateCustomFieldInfo(this.entity, this.facilityId, payload.responseData).subscribe(
            data => {
                this.toastr.success('Information has been saved successfully.', 'Success');
                this.getAdditionalInfo(this.facilityProfileType);
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
                this.isFetchingAdditionalInfo = false;
            }
        );
    }

    getAdditionalInfo(option: string) {
        this.isFetchingAdditionalInfo = true;
        this.payload['tabs'] = [option];

        // In case of Additional Information tab, need to send empty string
        if (option === this.additionalInformation) {
            this.payload['tabs'] = [];
        }

        this.commonServices.getCustomFieldInfo(this.payload).subscribe(
            data => {
                this.processAdditionalInfo(data['customFieldUITemplateAggResponseMap'][option]);
                this.fieldResponse = data['fieldResponse'];
                this.resetPayload();
                this.isFetchingAdditionalInfo = false;
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
                this.isFetchingAdditionalInfo = false;
            }
        );
    }

    resetPayload() {
        this.payload = {
            entity: this.entity,
            viewPage: this.viewPage,
            viewType: this.viewType,
            entityId: this.facilityId
        };
    }

    processAdditionalInfoTabs(data: any) {
        if (data !== null) {
            Object.keys(data).forEach(key => {
                this.facilityProfileTypes.push(key);
            });
            this.pageLoading = false;
        }
    }

    processAdditionalInfo(data: any) {
        this.additionalInfo = data;
        this.pageLoading = false;
    }

    changeFacilityProfileType(option) {
        this.facilityProfileType = option;

        switch (option) {
            case this.facilityProfileTypes[0]:
                break;
            case this.facilityProfileTypes[1]:
                break;
            default:
                this.analyticsService.trackEvent(this.additionalInformationPage, {
                    Origin: 'Facility Detail Page',
                    Action: 'Additional Information tab visited'
                });
                this.pageLoading = true;
                this.getAdditionalInfo(option);
                break;
        }
    }

    checkForAccess(access = 'FACILITY_UPDATE') {
        return this.auth.haveAccess(access);
    }

    isAStaticProfileType(facilityProfileType): boolean {
        return this.staticFacilityProfileTypes.includes(facilityProfileType);
    }
}
