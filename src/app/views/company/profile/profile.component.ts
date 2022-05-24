import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { Subscription } from 'rxjs';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { environment as env } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { FacilityComponent } from '../../../shared/modals/facility/facility.component';
import { SideNavigationService } from '../../../shared/side-navigation/side-navigation.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { AssessmentTemplateService } from '../../assessment-template/assessment-template.service';
import { ProfileService } from './profile.service';

const moment = _rollupMoment || _moment;

export interface Valueprocess {
    name: string;
}

export interface Materials {
    name: string;
}

export enum Mode {
    READ,
    EDIT,
    ADD
}

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    sideNavigation;
    editMode = Mode;
    pageLoading = true;
    public env = env;
    contact;
    address;
    editVisible = true;
    analyticsPageOrigin = 'Company Profile';
    employeeCount = { men: 0, women: 0, others: 0 };
    company = {
        companyName: '',
        description: ''
    };
    moment = moment;

    profileData = {
        id: '',
        companyName: '',
        contactPersonName: '',
        contactEmail: '',
        contactMobile: '',
        description: '',
        logo_url: '',
        noOfSuppliers: '',
        noOfStyles: '',
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
                employeeCount: { men: 0, women: 0, others: 0 },
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
                standards: [],
                productionCapacity: ''
            }
        ]
    };

    newFacility = {
        name: '',
        employeeCount: { men: 0, women: 0, others: 0 },
        companyId: '',
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
        valueProcess: [],
        materials: [],
        standards: [],
        productionCapacity: ''
    };

    valueProcesses = [];
    materials = [];
    standards = [];
    regions = [];
    options = [];

    profileView = true;

    @ViewChild('companyLogoInput', { static: true }) companyLogoInput;
    @ViewChild('facilityModal', { static: false }) facilityModal;
    @ViewChild('facilityInfoModal', { static: false }) facilityInfoModal;

    editAddress = false;
    editContactInfo = false;
    editCompanyDetail = false;
    addFacilityModal: boolean;
    selectedVPs = [];
    markedVPs = [];
    selectedStandards = [];
    countries = [];
    states = [];
    savingCompanyProfile = false;
    savingFacility = false;
    selectedMaterials = [];
    markedMaterials = [];
    vpSub: Subscription;
    deleteFacilitySub: Subscription;
    deletingFacility = [];
    completionPercentage = 0;
    markedStandards = [];
    uploadingLogo: boolean;
    uploadLogoSub: any;
    cities: any = [];
    loadingCities: boolean;
    loadingStates: boolean;
    loadingCountries: boolean;
    facilityCountries: any = [];
    facilityStates: any = [];
    facilityCities: any = [];

    standardsImage = env.config.standardsImage;
    loadingFacilityCities: boolean;
    loadingFacilityStates: boolean;
    loadingFacilityCountries: boolean;
    viewingFacility: any;

    /*CHIPS INPUT */
    visible = true;
    selectable = false;
    removable = false;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    valueProcess: Valueprocess[] = [];
    mat: Materials[] = [];
    pcScore;
    incompleteFields = [];
    master_standards: any[];

    noAuthorizationMessage = env.error_messages.no_authorization;

    add(event: MatChipInputEvent, type: string): void {
        const input = event.input;
        const value = event.value;

        // Add value process
        if ((value || '').trim()) {
            if (type === 'valueProcess') {
                this.valueProcess.push({ name: value.trim() });
                this.selectable = false;
                this.removable = false;
            } else {
                this.mat.push({ name: value.trim() });
                this.selectable = false;
                this.removable = false;
            }
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    // Remove value process chips
    removeVp(valueProcess: Valueprocess): void {
        const index = this.valueProcess.indexOf(valueProcess);
        if (index >= 0) {
            this.valueProcess.splice(index, 1);
        }
    }

    // Remove value process chips
    removeMt(materials: Materials): void {
        const index = this.materials.indexOf(materials);
        if (index >= 0) {
            this.materials.splice(index, 1);
        }
    }
    /*CHIPS INPUT */

    constructor(
        private sideNav: SideNavigationService,
        private toastr: CustomToastrService,
        private qs: AssessmentTemplateService,
        private authService: AuthService,
        public profileService: ProfileService,
        public commonServices: CommonServices,
        public localeService: LocalizationService,
        public utilService: UtilsService,
        private dialog: MatDialog,
        private analyticsService: AnalyticsService,
        private confirmDialog: MatDialog,
        public certificateManagerService: CertificateManagerService,
        private router: Router
    ) {
        this.sideNavigation = sideNav;
    }

    pageLoaded() {
        setTimeout(() => {
            this.pageLoading = false;
        }, 100);
    }

    ngOnInit() {
        this.pageLoading = true;
        this.authService.getUser().subscribe(response => {
            this.getCompanyProfile(response.companyId);
        });

        this.getCountries();

        this.qs.getAll().subscribe(response => {
            const data = response.data;
            this.options = data.classifications_metadata;
            this.localeService.addToMasterData(data.masterData);
            this.profileService.getStandards().subscribe(resp => {
                const standards_data = resp['data'];
                this.options['STANDARDS'] = [];
                for (let i = 0; i < standards_data.length; i++) {
                    this.options['STANDARDS'].push(standards_data[i]);
                }
                this.pageLoaded();
            });
        });
    }

    getStandardImageName(standardName) {
        const standard = standardName.toLowerCase();

        return this.standardsImage[standard];
    }

    getCompanyProfile(companyId) {
        this.pageLoading = true;
        this.profileService.getCompanyProfile(companyId).subscribe(resp => {
            const data = resp['data'];
            this.localeService.addToMasterData(resp['data'].masterData);
            this.master_standards = this.localeService.getcertifications(resp['data'].masterData);
            const companyDetails = data.companyDetails;
            this.profileData.id = companyId;

            this.profileData.companyName = companyDetails.name;
            this.profileData.description = companyDetails.description;
            this.profileData.noOfStyles = companyDetails.noOfStyles;
            this.profileData.noOfSuppliers = companyDetails.noOfSuppliers;

            this.company.companyName = companyDetails.name;
            this.company.description = companyDetails.description;
            this.pcScore = companyDetails.pcScore;
            this.incompleteFields = companyDetails.incompleteFields;

            if (companyDetails.hasOwnProperty('contactInfo')) {
                this.profileData.contactPersonName = companyDetails.contactInfo.name;
                this.profileData.contactEmail = companyDetails.contactInfo.email;
                this.profileData.contactMobile = companyDetails.contactInfo.phoneNumber;
                this.contact = companyDetails.contactInfo;
            }

            this.profileData.logo_url = companyDetails.logoUrl || env.IMG_URL + 'images/no-company-logo-found.png';

            if (companyDetails.hasOwnProperty('address')) {
                this.profileData.address = JSON.parse(JSON.stringify(companyDetails.address));
                this.address = companyDetails.address;
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

            this.profileData.Facilities = data.companyDetails.facility;
            this.employeeCount = { men: 0, women: 0, others: 0 };
            this.valueProcesses = [];
            this.standards = [];
            this.materials = [];

            // Get unique VPs, Materials and Standards from Facilities
            for (let i = 0; i < this.profileData.Facilities.length; i++) {
                if (this.profileData.Facilities[i].employeeCount) {
                    if (this.profileData.Facilities[i].employeeCount.men) {
                        this.employeeCount.men += this.profileData.Facilities[i].employeeCount.men;
                    }
                    if (this.profileData.Facilities[i].employeeCount.women) {
                        this.employeeCount.women += this.profileData.Facilities[i].employeeCount.women;
                    }
                    if (this.profileData.Facilities[i].employeeCount.others) {
                        this.employeeCount.others += this.profileData.Facilities[i].employeeCount.others;
                    }
                }
                if (this.profileData.Facilities[i].hasOwnProperty('address')) {
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
                }
                this.addFacilityDataToProfileData(this.profileData.Facilities[i]);
            }

            this.getCountries();

            this.computeCompletionPercentage();
            this.pageLoaded();
            this.analyticsService.trackEvent('Company Profile Page', {
                Origin: 'Company Profile',
                CompanyId: companyId,
                'Action Performed': 'Company profile page visited'
            });
        });
    }

    addFacilityDataToProfileData(facility) {
        const facilityVPs = facility.valueProcess;
        const facilityMaterials = facility.materials;
        const facilityCertificates = facility.certificateList || [];

        if (facilityVPs && Array.isArray(facilityVPs)) {
            for (let j = 0; j < facilityVPs.length; j++) {
                if (this.valueProcesses.indexOf(facilityVPs[j]) === -1) {
                    this.valueProcesses.push(facilityVPs[j]);
                }
            }
        }
        if (facilityMaterials && Array.isArray(facilityMaterials)) {
            for (let j = 0; j < facilityMaterials.length; j++) {
                if (this.materials.indexOf(facilityMaterials[j]) === -1) {
                    this.materials.push(facilityMaterials[j]);
                }
            }
        }

        if (facilityCertificates && Array.isArray(facilityCertificates)) {
            facilityCertificates.forEach(certificate => {
                this.standards.push(certificate);
            });
        }

        // if (facilityStandards && Array.isArray(facilityStandards)) {
        //     for (let j = 0; j < facilityStandards.length; j++) {
        //         if (this.standards.indexOf(facilityStandards[j]) === -1) {
        //             this.standards.push(facilityStandards[j]);
        //         }
        //     }
        // }
    }

    computeCompletionPercentage() {
        this.completionPercentage = 0;

        if (this.profileData.companyName) {
            this.completionPercentage += 10;
        }

        if (this.profileData.description) {
            this.completionPercentage += 10;
        }

        if (this.profileData.contactPersonName) {
            this.completionPercentage += 10;
        }

        if (this.profileData.contactEmail) {
            this.completionPercentage += 10;
        }

        if (this.profileData.contactMobile) {
            this.completionPercentage += 10;
        }

        if (this.profileData.logo_url) {
            this.completionPercentage += 10;
        }

        if (this.profileData.address.country) {
            this.completionPercentage += 5;
        }

        if (this.profileData.address.state) {
            this.completionPercentage += 5;
        }

        if (this.profileData.address.addressLine1) {
            this.completionPercentage += 5;
        }

        if (this.profileData.address.addressLine2) {
            this.completionPercentage += 5;
        }

        if (this.profileData.address.city) {
            this.completionPercentage += 5;
        }

        if (this.profileData.address.zip) {
            this.completionPercentage += 5;
        }

        if (this.profileData.Facilities.length > 0) {
            this.completionPercentage += 10;
        }
    }

    profileViewChange() {
        this.profileView = !this.profileView;
    }

    invokeFileUpload() {
        this.companyLogoInput.nativeElement.click();
    }

    /*   addFacility() {
      this.getFacilityCountries();
      this.newFacility = {
        name: '',
        companyId: '',
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
        valueProcess: [],
        materials: [],
        standards: []
      };
      this.markedVPs = [];
      this.markedMaterials = [];
      this.markedStandards = [];
      this.selectedMaterials = [];
      this.selectedVPs = [];
      this.selectedStandards = [];
      this.addFacilityModal = true;
      this.facilityModal.show();
    } */

    /*   editFacility(index) {
      this.getFacilityCountries();
      this.newFacility = JSON.parse(JSON.stringify(this.profileData.Facilities[index]));
      this.selectedMaterials = [];
      this.markedMaterials = [];
      this.selectedVPs = [];
      this.markedVPs = [];
      this.selectedStandards = [];
      this.markedStandards = [];

      if (Array.isArray(this.profileData.Facilities[index]['materials'])) {
        for (let i = 0; i < this.profileData.Facilities[index]['materials'].length; i++) {
          this.selectMaterials(this.profileData.Facilities[index]['materials'][i]);
        }
      }

      if (Array.isArray(this.profileData.Facilities[index]['valueProcess'])) {
        for (let i = 0; i < this.profileData.Facilities[index]['valueProcess'].length; i++) {
          this.selectVPs(this.profileData.Facilities[index]['valueProcess'][i]);
        }
      }

      if (Array.isArray(this.profileData.Facilities[index]['standards'])) {
        for (let i = 0; i < this.profileData.Facilities[index]['standards'].length; i++) {
          this.selectStandards(this.profileData.Facilities[index]['standards'][i]);
        }
      }

      this.fetchVPs(null);

      this.addFacilityModal = false;
      this.facilityModal.show();
    }
   */

    deleteFacility(index) {
        this.deletingFacility[index] = true;
        // this.profileData.Facilities.splice(index, 1);
        if (this.deleteFacilitySub) {
            this.deleteFacilitySub.unsubscribe();
        }

        this.deleteFacilitySub = this.profileService.deleteFacility(this.profileData.Facilities[index].id).subscribe(
            response => {
                this.deletingFacility[index] = false;
                this.getCompanyProfile(this.authService.companyId);
                this.toastr.success('Facility Deleted', 'Success');
                this.analyticsService.trackEvent('Facility Page', {
                    Origin: 'Company Profile',
                    FacilityId: this.profileData.Facilities[index].id,
                    'Action Performed': 'Facility Deleted'
                });
            },
            failResponse => {
                this.deletingFacility[index] = false;
                this.toastr.error('The facility could not be deleted', 'Error');
            }
        );
    }

    selectMaterials(material) {
        if (this.selectedMaterials.indexOf(material) === -1) {
            this.selectedMaterials.push(material);
            this.markedMaterials[material] = true;
        } else {
            this.selectedMaterials.splice(this.selectedMaterials.indexOf(material), 1);
            this.markedMaterials[material] = false;
        }
    }

    fetchVPs(material) {
        if (material) {
            this.selectMaterials(material);
        }

        if (this.vpSub) {
            this.vpSub.unsubscribe();
        }

        this.vpSub = this.qs.getValueProcess(this.selectedMaterials).subscribe(response => {
            const data = response.data;
            let flag = false;
            this.options['VALUE_PROCESS'] = data.valueProcess;
            for (let i = 0; i < this.selectedVPs.length; i++) {
                flag = false;
                for (let j = 0; j < this.options['VALUE_PROCESS'].length; j++) {
                    if (this.selectedVPs[i] === this.options['VALUE_PROCESS'][j]) {
                        flag = true;
                    }
                }
                if (!flag) {
                    this.markedVPs[this.selectedVPs[i]] = false;
                    this.selectedVPs.splice(i, 1);
                    // since we are removing an element in the above line,
                    // let us decrease the counter by 1 to make up for the deleted element.
                    i--;
                }
            }
        });
    }

    selectStandards(standard) {
        if (this.selectedStandards.indexOf(standard) === -1) {
            this.selectedStandards.push(standard);
            this.markedStandards[standard] = true;
        } else {
            this.selectedStandards.splice(this.selectedStandards.indexOf(standard), 1);
            this.markedStandards[standard] = false;
        }
    }

    selectVPs(vp) {
        if (this.selectedVPs.indexOf(vp) === -1) {
            this.selectedVPs.push(vp);
            this.markedVPs[vp] = true;
        } else {
            this.selectedVPs.splice(this.selectedVPs.indexOf(vp), 1);
            this.markedVPs[vp] = false;
        }
    }

    uploadLogo(files) {
        this.uploadingLogo = true;
        // this.profileData.logo_url;
        if (this.uploadLogoSub) {
            this.uploadLogoSub.unsubscribe();
        }
        if (files.length === 0) {
            return;
        }
        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (
            !fileExtension ||
            fileExtension === '' ||
            env.config.allowedLogoFileExtensions.indexOf(fileExtension.toLowerCase()) === -1
        ) {
            this.toastr.error('Please use a supported file format: jpg, jpeg and png', 'Unsupported File Extension');
            return;
        }
        if (fileSize > env.config.maximumFileUploadSize) {
            this.toastr.error(
                'File size should be within ' +
                    env.config.maximumFileUploadSize +
                    'MB. Chosen file is ' +
                    fileSizeString +
                    'MB',
                'File Size too large!'
            );
            return;
        }

        this.uploadLogoSub = this.profileService.uploadCompanyLogo(fileToUpload, this.authService.companyId).subscribe(
            response => {
                this.toastr.success('Company logo has been updated', 'Success');
                this.analyticsService.trackEvent('Company Profile Page', {
                    Origin: 'Company Profile',
                    CompanyId: this.authService.companyId,
                    'Action Performed': 'Company logo uploaded'
                });

                const data = response.data;
                this.authService.userCompanyDetails.logoUrl = data.url + '?date=' + new Date().getTime();
                this.profileData.logo_url = data.url + '?date=' + new Date().getTime();
                this.getCompanyProfile(this.authService.companyId);
                this.uploadingLogo = false;
            },
            failResponse => {
                this.toastr.error('Company logo could not be uploaded. Please try after some time.', 'Failed');
                this.uploadingLogo = false;
            }
        );
    }

    validateProfileData() {
        if (!this.profileData.companyName) {
            this.toastr.error('Please enter company name', 'Required Field - Company Name');
            return;
        }

        if (!this.profileData.contactPersonName) {
            this.toastr.error('Please enter contact person name', 'Required Field - Contact Name');
            return;
        }

        if (!this.profileData.contactEmail) {
            this.toastr.error('Please enter contact email ID', 'Required Field - Email ID');
            return;
        }

        if (!this.profileData.contactMobile) {
            this.toastr.error('Please enter contact phone number', 'Required Field - Phone');
            return;
        }

        if (!this.profileData.address.country) {
            this.toastr.error('Please enter country', 'Required Field - Country');
            return;
        }

        if (!this.profileData.address.state) {
            this.toastr.error('Please enter state', 'Required Field - State');
            return;
        }

        if (!this.profileData.address.city) {
            this.toastr.error('Please enter city', 'Required Field - City');
            return;
        }

        return true;
    }

    updateCompanyProfile() {
        if (!this.validateProfileData()) {
            return false;
        }

        this.savingCompanyProfile = true;
        this.profileData.id = this.authService.companyId;

        const payload = {
            id: this.profileData.id,
            name: this.profileData.companyName,
            address: JSON.parse(JSON.stringify(this.profileData.address)),
            logoUrl: this.profileData.logo_url,
            description: this.profileData.description,
            contactInfo: {
                name: this.profileData.contactPersonName,
                phoneNumber: this.profileData.contactMobile,
                email: this.profileData.contactEmail
            }
        };

        // convert lat long to number type
        payload.address.latitude = parseFloat(payload.address.latitude);
        payload.address.longitude = parseFloat(payload.address.longitude);

        this.profileService.updateCompanyProfile(payload).subscribe(
            response => {
                this.toastr.success('Profile has been updated', 'Success');
                this.savingCompanyProfile = false;
                this.addFacilityModal = false;
                this.getCompanyProfile(this.authService.companyId);
                this.profileViewChange();
            },
            failResponse => {
                this.savingCompanyProfile = false;
                this.toastr.error('Unable to save profile information. Please try again or contact support', 'Oops');
            }
        );
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

    getCountryId(countryName) {
        if (Array.isArray(this.countries) && this.countries.length > 0) {
            for (let i = 0; i < this.countries.length; i++) {
                if (this.countries[i].name === countryName) {
                    return this.countries[i].id;
                }
            }
        }

        this.toastr.error(`There seems to be an issue with the selected country ${countryName}`, 'Invalid country');
        return false;
    }

    getStateId(stateName) {
        if (Array.isArray(this.states) && this.states.length > 0) {
            for (let i = 0; i < this.states.length; i++) {
                if (this.states[i].name === stateName) {
                    return this.states[i].id;
                }
            }
        }

        return false;
    }

    getLatLngFromCityName(cityName) {
        if (Array.isArray(this.cities) && this.cities.length > 0) {
            for (let i = 0; i < this.cities.length; i++) {
                if (this.cities[i].name === cityName) {
                    return { latitude: this.cities[i].lat, longitude: this.cities[i].lon };
                }
            }
        }

        return false;
    }

    setLatLng(cityName) {
        const latlng = this.getLatLngFromCityName(cityName);

        if (typeof latlng !== 'boolean') {
            this.profileData.address.latitude = latlng.latitude;
        }
        if (typeof latlng !== 'boolean') {
            this.profileData.address.longitude = latlng.longitude;
        }
    }

    populateAddressMeta(address) {
        const latlng = this.getLatLngFromCityName(address.city);
        if (typeof latlng !== 'boolean') {
            address.latitude = latlng.latitude;
        }
        if (typeof latlng !== 'boolean') {
            address.longitude = latlng.longitude;
        }
        address.countryCode = this.getCountryCode(address.country);
    }

    getCities(stateName) {
        this.loadingCities = true;
        const stateId = this.getStateId(stateName);

        this.commonServices.getCities(stateId).subscribe(response => {
            const data = response['data'];
            this.cities = data.city;
            this.loadingCities = false;
        });
    }

    getStates(countryName) {
        this.loadingStates = true;
        const countryId = this.getCountryId(countryName);
        this.commonServices.getStates(countryId).subscribe(response => {
            const data = response['data'];
            this.states = data.state;
            this.loadingStates = false;

            if (this.profileData.address.state) {
                this.getCities(this.profileData.address.state);
            }
        });
    }

    getCountries() {
        this.loadingCountries = true;
        this.commonServices.getCountries().subscribe(response => {
            const data = response['data'];
            this.countries = data.country;
            this.loadingCountries = false;

            if (this.profileData.address.country) {
                this.getStates(this.profileData.address.country);
            }
        });
    }

    getLatLngFromFacilityCityName(cityName) {
        if (Array.isArray(this.facilityCities) && this.facilityCities.length > 0) {
            for (let i = 0; i < this.facilityCities.length; i++) {
                if (this.facilityCities[i].name === cityName) {
                    return { latitude: this.facilityCities[i].lat, longitude: this.facilityCities[i].lon };
                }
            }
        }

        return false;
    }

    getFacilityCountryId(countryName) {
        if (Array.isArray(this.facilityCountries) && this.facilityCountries.length > 0) {
            for (let i = 0; i < this.facilityCountries.length; i++) {
                if (this.facilityCountries[i].name === countryName) {
                    return this.facilityCountries[i].id;
                }
            }
        }

        this.toastr.error(`There seems to be an issue with the selected country ${countryName}`, 'Invalid country');
        return false;
    }

    getFacilityStateId(stateName) {
        if (Array.isArray(this.facilityStates) && this.facilityStates.length > 0) {
            for (let i = 0; i < this.facilityStates.length; i++) {
                if (this.facilityStates[i].name === stateName) {
                    return this.facilityStates[i].id;
                }
            }
        }

        return false;
    }

    setFacilityLatLng(cityName) {
        const latlng = this.getLatLngFromFacilityCityName(cityName);

        if (typeof latlng !== 'boolean') {
            this.newFacility.address.latitude = latlng.latitude;
        }
        if (typeof latlng !== 'boolean') {
            this.newFacility.address.longitude = latlng.longitude;
        }
    }

    getFacilityCities(stateName) {
        this.loadingFacilityCities = true;
        const stateId = this.getFacilityStateId(stateName);

        this.commonServices.getCities(stateId).subscribe(response => {
            const data = response['data'];
            this.facilityCities = data.city;
            this.loadingFacilityCities = false;
        });
    }

    getFacilityStates(countryName) {
        this.loadingFacilityStates = true;
        const countryId = this.getFacilityCountryId(countryName);
        this.commonServices.getStates(countryId).subscribe(response => {
            const data = response['data'];
            this.facilityStates = data.state;
            this.loadingFacilityStates = false;

            if (this.newFacility.address.state) {
                this.getFacilityCities(this.newFacility.address.state);
            }
        });
    }

    getFacilityCountries() {
        this.loadingFacilityCountries = true;
        this.commonServices.getCountries().subscribe(response => {
            const data = response['data'];
            this.facilityCountries = data.country;
            this.loadingFacilityCountries = false;

            if (this.newFacility.address.country) {
                this.getFacilityStates(this.newFacility.address.country);
            }
        });
    }

    validateFacilityProfileData() {
        if (!this.newFacility.name) {
            this.toastr.error('Please enter facility name', 'Required Field - Facility Name');
            return;
        }

        if (this.newFacility.materials.length <= 0) {
            this.toastr.error('Please choose one or more relevant materials', 'Required Field - Materials');
            return;
        }

        if (this.newFacility.valueProcess.length <= 0) {
            this.toastr.error('Please choose one or more relevant value processes', 'Required Field - Value Processes');
            return;
        }

        if (this.newFacility.standards.length <= 0) {
            this.toastr.error('Please choose one or more standards', 'Required Field - Standards');
            return;
        }

        if (!this.newFacility.address.addressLine1) {
            this.toastr.error('Please enter country', 'Required Field - addressLine1');
            return;
        }

        if (!this.newFacility.address.country) {
            this.toastr.error('Please enter country', 'Required Field - Country');
            return;
        }

        if (!this.newFacility.address.state) {
            this.toastr.error('Please enter state', 'Required Field - State');
            return;
        }

        if (!this.newFacility.address.city) {
            this.toastr.error('Please enter city', 'Required Field - City');
            return;
        }

        if (!this.newFacility.address.zip) {
            this.toastr.error('Please enter zip', 'Required Field - Zip Code');
            return;
        }

        return true;
    }

    saveFacility() {
        // this.savingFacility = true;
        this.newFacility.materials = this.selectedMaterials;
        this.newFacility.valueProcess = this.selectedVPs;
        this.newFacility.standards = this.selectedStandards;
        this.newFacility.companyId = this.authService.companyId;
        this.populateAddressMeta(this.newFacility.address);
        // this.onValueChange()

        if (!this.validateFacilityProfileData()) {
            return false;
        }

        if (this.addFacilityModal) {
            this.profileService.addFacility(this.newFacility).subscribe(
                response => {
                    this.toastr.success('Facility has been added', 'Success');

                    this.savingFacility = false;
                    this.getCompanyProfile(this.authService.companyId);
                    this.facilityModal.hide();
                },
                failResponse => {
                    if (failResponse.error && failResponse.error.message !== '') {
                        this.toastr.error(failResponse.error.message, 'Failed');
                    } else {
                        this.toastr.error('Facility could not be created. Please try after some time', 'Failed');
                    }
                    this.addFacilityDataToProfileData(this.newFacility);
                    this.savingFacility = false;
                }
            );
        } else {
            this.profileService.updateFacility(this.newFacility).subscribe(
                response => {
                    this.toastr.success('Facility has been updated', 'Success');

                    this.getCompanyProfile(this.authService.companyId);
                    this.savingFacility = false;
                    this.facilityModal.hide();
                    this.addFacilityDataToProfileData(this.newFacility);
                },
                failResponse => {
                    this.savingFacility = false;
                    this.toastr.error('Facility could not be updated. Please try after some time', 'Failed');
                }
            );
        }
    }

    openFacilityInfoModal(facility) {
        this.viewingFacility = facility;
        this.facilityInfoModal.show();
    }

    wantToEditVp() {
        this.selectable = true;
        this.removable = true;
    }

    openDialog(): void {
        const facilityDialog = this.dialog.open(FacilityComponent, {
            width: '650px',
            height: '900px'
        });
    }

    addFacility(): void {
        if (this.authService.haveAccess('FACILITY_CREATE')) {
            this.router.navigate(['/', 'company', 'create-facility']);
        } else {
            this.toastr.info(this.noAuthorizationMessage, 'Insufficient permission');
        }
        // const addDialogBox = this.dialog.open(FacilityComponent, {
        //     width: '700px',
        //     data: {
        //         mode: this.editMode.ADD,
        //         analyticsPageOrigin: this.analyticsPageOrigin
        //     }
        // });

        // addDialogBox.afterClosed().subscribe(resp => {
        //     this.authService.getUser().subscribe(response => {
        //         this.getCompanyProfile(response.companyId);
        //     });
        // });
    }

    editFacility(index) {
        if (this.authService.haveAccess('FACILITY_UPDATE')) {
            this.router.navigate(['/company/edit-facility', this.profileData.Facilities[index].id]);
        } else {
            this.toastr.info(this.noAuthorizationMessage, 'Insufficient permission');
        }
    }

    // editFacility(index): void {
    //     const editDialogBox = this.dialog.open(FacilityComponent, {
    //         width: '700px',
    //         data: {
    //             mode: this.editMode.EDIT,
    //             analyticsPageOrigin: this.analyticsPageOrigin,
    //             facility: this.profileData.Facilities[index]
    //         }
    //     });
    //
    //     editDialogBox.afterClosed().subscribe(resp => {
    //         this.authService.getUser().subscribe(response => {
    //             this.getCompanyProfile(response.companyId);
    //         });
    //     });
    // }

    viewFacility(index) {
        this.analyticsService.trackEvent('Facility Page', {
            Origin: this.analyticsPageOrigin,
            CompanyId: this.authService.companyId,
            FacilityId: this.profileData.Facilities[index].id,
            'Action Performed': 'Facility View'
        });

        if (this.authService.haveAccess('FACILITY_READ')) {
            this.dialog.open(FacilityComponent, {
                width: '700px',
                data: {
                    mode: this.editMode.READ,
                    analyticsPageOrigin: this.analyticsPageOrigin,
                    facility: this.profileData.Facilities[index]
                }
            });
        } else {
            this.toastr.info(this.noAuthorizationMessage, 'Insufficient permission');
        }
    }

    openDelDialog(id): void {
        if (this.authService.haveAccess('FACILITY_ARCHIVE')) {
            const facilityDelDialog = this.confirmDialog.open(ConfirmDialogComponent, {
                width: '460px',
                data: {
                    title: 'Delete Facility',
                    msg: 'Are you sure, you want to delete this facility?',
                    primaryButton: 'Cancel',
                    secondaryButton: 'Delete'
                }
            });
            facilityDelDialog.afterClosed().subscribe(response => {
                if (response) {
                    const responseArr = response.split(',');
                    if (responseArr[0] === 'Delete') {
                        this.deleteFacility(id);
                    }
                }
            });
        } else {
            this.toastr.info(this.noAuthorizationMessage, 'Insufficient permission');
        }
    }

    onValueChange(event, type: string) {
        this.profileData.id = this.authService.companyId;
        let payload = {};
        if (type === 'ADDRESS') {
            payload = {
                id: this.profileData.id,
                name: this.profileData.companyName,
                address: event
            };
        } else if (type === 'CONTACT') {
            payload = {
                id: this.profileData.id,
                name: this.profileData.companyName,
                contactInfo: {
                    name: event.contactPersonName,
                    phoneNumber: event.contactMobile,
                    email: event.contactEmail
                }
            };
        } else {
            payload = {
                id: this.profileData.id,
                name: this.profileData.companyName,
                address: this.profileData.address,
                logoUrl: this.profileData.logo_url,
                description: this.profileData.description,
                contactInfo: {
                    name: this.profileData.contactPersonName,
                    phoneNumber: this.profileData.contactMobile,
                    email: this.profileData.contactEmail
                }
            };
        }

        this.profileService.updateCompanyProfile(payload).subscribe(response => {
            this.toastr.success('Saved', 'Success');
            this.getCompanyProfile(this.profileData.id);
            this.analyticsService.trackEvent('Company Profile Page', {
                Origin: 'Company Profile',
                CompanyId: this.authService.companyId,
                'Action Performed': 'Company profile updated'
            });
        });
    }
    saveCompanyDetailForm() {
        if (this.profileData.companyName) {
            this.profileData.id = this.authService.companyId;
            const payload = {
                id: this.profileData.id,
                name: this.profileData.companyName,
                description: this.profileData.description
            };
            this.profileService.updateCompanyProfile(payload).subscribe(response => {
                this.toastr.success('Saved', 'Success');
                this.getCompanyProfile(this.profileData.id);
                this.analyticsService.trackEvent('Company Profile Page', {
                    Origin: 'Company Profile',
                    CompanyId: this.authService.companyId,
                    'Action Performed': 'Company profile updated'
                });
            });
            this.showCompanyDetailBlock();
        } else {
            this.toastr.error('Please enter Company name', 'Required Field - name');
        }
    }
    showCompanyDetailForm() {
        this.editCompanyDetail = true;
        this.profileData.companyName = this.company.companyName;
        this.profileData.description = this.company.description;
    }
    showCompanyDetailBlock() {
        this.editCompanyDetail = false;
    }

    changeProgressColor() {
        if (this.pcScore <= 10) {
            return 'red';
        } else if (this.pcScore <= 50) {
            return 'yellow';
        } else if (this.pcScore <= 75) {
            return 'blue';
        } else {
            return 'green';
        }
    }

    getCertificateNameById(Certificate_Type: any) {
        const cert = this.master_standards.filter(certificate => certificate.id === Certificate_Type);
        if (cert && cert.length > 0) {
            return cert[0].value;
        }

        return 'Certificate Not Found';
    }
}
