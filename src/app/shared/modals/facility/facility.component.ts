import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { ProfileService } from '../../../views/company/profile/profile.service';
import { CommonServices } from '../../commonServices/common.service';
import { CertificateManagerService } from '../../components/certificate-manager/certificate-manager.service';
import { LocalizationService } from '../../utils/localization.service';
import { UtilsService } from '../../utils/utils.service';
import { FacilityProfile, FacilityProfileMode } from './facility-profile.model';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

const moment = _rollupMoment || _moment;
@Component({
    selector: 'app-facility',
    templateUrl: './facility.component.html',
    styleUrls: ['./facility.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FacilityComponent implements OnInit {
    pageLoading = true;
    public masterData = {};
    public facility: FacilityProfile;
    public master_valueProcess;
    public master_materials;
    public master_standards;

    public facilityMode = FacilityProfileMode;

    // Address form data
    countries = [];
    states: any = [];
    cities: any = [];
    loadingCities: boolean;
    loadingStates: boolean;
    loadingCountries: boolean;

    moment = moment;
    env = environment;

    materials = new FormControl();
    materialsList: string[] = ['Down Feathers', 'Leather', 'Wool', 'Polyester', 'Cotton', 'Merino Wool'];

    vp = new FormControl();
    vpList: string[] = ['Down Procuring', 'Store Operations', 'Head Office operations'];
    cert = new FormControl();
    certList: string[] = ['ISO  140001', 'OHSAS 18000', 'Merino'];

    constructor(
        public utilService: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public localeService: LocalizationService,
        private dialogRef: MatDialogRef<FacilityComponent>,
        private profileService: ProfileService,
        private toastr: CustomToastrService,
        private authService: AuthService,
        private commonServices: CommonServices,
        private analyticsService: AnalyticsService,
        public certificateManagerService: CertificateManagerService
    ) {}

    ngOnInit() {
        // move this to localizationService to load default values
        this.localeService.getMasterData().subscribe(
            resp => {
                this.masterData = resp.data;
                (this.master_valueProcess = this.localeService.getVPs(this.masterData)),
                    (this.master_materials = this.localeService.getMaterials(this.masterData)),
                    (this.master_standards = this.localeService.getcertifications(this.masterData));

                if (this.data.mode === FacilityProfileMode.EDIT || this.data.mode === FacilityProfileMode.READ) {
                    this.facility = this.data.facility;
                    if (this.data.facility && !this.data.facility.hasOwnProperty('address')) {
                        this.facility['address'] = {
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

                    if (this.data.facility && !this.data.facility.hasOwnProperty('employeeCount')) {
                        this.facility['employeeCount'] = {
                            men: '',
                            women: '',
                            others: ''
                        };
                    }
                } else {
                    (this.master_valueProcess = this.localeService.getVPs(this.masterData)),
                        (this.master_materials = this.localeService.getMaterials(this.masterData)),
                        (this.master_standards = this.localeService.getcertifications(this.masterData));

                    this.facility = {
                        name: '',
                        employeeCount: { men: '', women: '', others: '' },
                        noOfAssessments: 0,
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
                        certificateList: [],
                        productionCapacity: ''
                    };
                }
                // fetch address info
                this.getCountries();
                this.pageLoading = false;
            },
            err => {
                // Todo: do some better data handlings
                alert('cannot load master data, check system admin');
            }
        );
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    saveFacility() {
        this.facility.companyId = this.authService.companyId;
        this.populateAddressMeta(this.facility.address);
        // latLongdata
        // this.facility.address.countryCode = this.getCountryCode(this.facility.address);
        // this.facility.address.countryCode = this.getCountryCode(this.facility.address);

        if (this.facility && this.validateFacilityProfileData()) {
            this.pageLoading = true;
            this.profileService.addFacility(this.facility).subscribe(
                response => {
                    this.toastr.success('Facility has been added', 'Success');
                    this.analyticsService.trackEvent('Facility Page', {
                        Origin: this.data.analyticsPageOrigin,
                        CompanyId: this.authService.companyId,
                        'Action Performed': 'Facility created'
                    });
                    this.pageLoading = false;
                    this.dialogRef.close();
                },
                failResponse => {
                    if (failResponse.error && failResponse.error.message !== '') {
                        this.toastr.error(failResponse.error.message, 'Failed');
                    } else {
                        this.toastr.error('Facility could not be created. Please try after some time', 'Failed');
                    }
                    this.pageLoading = false;
                }
            );
        } /*  else {
      this.profileService.updateFacility(this.newFacility).subscribe(response => {
        this.toastr.success('Facility has been updated', 'Success');
        this.getCompanyProfile(this.authService.companyId);
        this.savingFacility = false;
        this.facilityModal.hide();
      }, failResponse => {
        this.savingFacility = false;
        this.toastr.error('Facility could not be updated. Please try after some time', 'Failed');
      });
    } */
    }

    updateFacility() {
        this.facility.companyId = this.authService.companyId;
        this.populateAddressMeta(this.facility.address);

        if (this.facility && this.validateFacilityProfileData()) {
            this.pageLoading = true;
            this.profileService.updateFacility(this.facility).subscribe(
                response => {
                    this.toastr.success('Facility has been updated', 'Success');
                    this.analyticsService.trackEvent('Facility Page', {
                        Origin: this.data.analyticsPageOrigin,
                        CompanyId: this.authService.companyId,
                        'Action Performed': 'Facility updated'
                    });

                    this.pageLoading = false;
                    this.dialogRef.close();
                },
                failResponse => {
                    if (failResponse.error && failResponse.error.message !== '') {
                        this.toastr.error(failResponse.error.message, 'Failed');
                    } else {
                        this.toastr.error('Facility could not be updated. Please try after some time', 'Failed');
                    }
                    this.pageLoading = false;
                }
            );
        }
    }

    validateFacilityProfileData() {
        if (!this.facility.name || this.facility.name === '') {
            this.toastr.error('Please enter facility name', 'Required Field - Facility Name');
            return;
        }

        if (!this.facility.materials || this.facility.materials.length <= 0) {
            this.toastr.error('Please choose one or more relevant materials', 'Required Field - Materials');
            return;
        }

        if (!this.facility.valueProcess || this.facility.valueProcess.length <= 0) {
            this.toastr.error('Please choose one or more relevant value processes', 'Required Field - Value Processes');
            return;
        }

        if (!this.facility.standards || this.facility.standards.length <= 0) {
            this.toastr.error('Please choose one or more standards', 'Required Field - Standards');
            return;
        }

        if (!this.facility.address.addressLine1 || this.facility.address.addressLine1 === '') {
            this.toastr.error('Please enter addressLine1', 'Required Field - addressLine1');
            return;
        }

        if (!this.facility.address.country || this.facility.address.country === '') {
            this.toastr.error('Please enter country', 'Required Field - Country');
            return;
        }

        if (!this.facility.address.state || this.facility.address.state === '') {
            this.toastr.error('Please enter state', 'Required Field - State');
            return;
        }

        if (!this.facility.address.city || this.facility.address.city === '') {
            this.toastr.error('Please enter city', 'Required Field - City');
            return;
        }

        if (!this.facility.address.zip || this.facility.address.zip === '') {
            this.toastr.error('Please enter zip', 'Required Field - Zip Code');
            return;
        }

        return true;
    }

    // Address data population

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
    getCountries() {
        this.loadingCountries = true;
        this.commonServices.getCountries().subscribe(response => {
            const data = response['data'];
            this.countries = data.country;
            this.loadingCountries = false;

            if (this.facility && this.facility.address && this.facility.address.country) {
                this.getStates(this.facility.address.country);
            }
        });
    }

    getStates(countryName) {
        this.loadingStates = true;
        const stateId = this.getCountryId(countryName);
        this.commonServices.getStates(stateId).subscribe(response => {
            const data = response['data'];
            this.states = data.state;
            this.loadingStates = false;
            if (this.facility && this.facility.address && this.facility.address.state) {
                this.getCities(this.facility.address.state);
            }
        });
    }
    getCities(stateName) {
        this.loadingCities = true;
        const cityId = this.getStateId(stateName);
        this.commonServices.getCities(cityId).subscribe(response => {
            const data = response['data'];
            this.cities = data.city;
            this.loadingCities = false;
        });
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

    unsetStateOnCountrySelection() {
        this.facility.address.state = '';
    }
    unsetCityOnStateSelection() {
        this.facility.address.city = '';
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

    getCertificateNameById(Certificate_Type: any) {
        const cert = this.master_standards.filter(certificate => certificate.id === Certificate_Type);
        if (cert && cert.length > 0) {
            return cert[0].value;
        }

        return 'Certificate Not Found';
    }
}
