import { Location } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { zip } from 'rxjs';
import { AuthService } from '../../../core';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { CertificateManagerComponent } from '../../../shared/components/certificate-manager/certificate-manager.component';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { ProfileService } from '../profile/profile.service';

enum FieldType {
    radio = 'radio',
    multiSelect = 'multiSelect',
    text = 'text',
    date = 'date',
    number = 'number',
    singleSelect = 'singleSelect'
}

export class FieldOption {
    label: string;
    value: string;
    default?: boolean;
}

export class Field {
    formControlName?: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: Array<FieldOption>;
    required?: boolean;
    min?: number;
    max?: number;
    minDate?: Date;
    maxDate?: Date;
    minLength?: number;
    maxLength?: number;
    disabled?: boolean;
    hidden?: boolean;
    dummy: boolean;
}
@Component({
    selector: 'app-create-facility',
    templateUrl: './create-facility.component.html',
    styleUrls: ['./create-facility.component.scss']
})
export class CreateFacilityComponent implements OnInit, AfterViewInit {
    @Input() isEditFacility: boolean;
    @Input('facility') editFacilityData: any;

    dropdownValues = {
        Country: '',
        State: '',
        City: ''
    };
    parameters = {
        Country: {
            key: 'id',
            value: 'value',
            name: 'name',
            id: 'id',
            selectedKey: 'id',
            code: 'code'
        },
        State: {
            key: 'id',
            value: 'value',
            name: 'name',
            id: 'id',
            countryCode: 'countryId',
            selectedKey: 'id'
        },
        City: {
            key: 'id',
            value: 'value',
            name: 'name',
            id: 'id',
            stateId: 'stateId',
            selectedKey: 'id'
        }
    };
    isRequired: true;

    fieldsList: any;
    showCertificateCategories = false;
    certificateIds: Array<string>;
    facilityForm: FormGroup;
    masterData: any;
    master_valueProcess: any;
    master_materials: any;
    master_standards: any;
    isPageReady: boolean;
    loadingCountries: boolean;
    loadingStates: boolean;
    loadingCities: boolean;
    countries: any;
    states: any;
    cities: any;
    isFacilityFormInit: boolean;
    certificateHttpObservers = [];
    @ViewChild('facilityFormFGD', { static: false }) facilityFormFGD: FormGroupDirective;
    @ViewChild('certificateManager', { static: false }) certificateManager: CertificateManagerComponent;

    constructor(
        private _formBuilder: FormBuilder,
        private commonServices: CommonServices,
        private toastrService: CustomToastrService,
        private authService: AuthService,
        private profileService: ProfileService,
        private router: Router,
        private location: Location,
        private localeService: LocalizationService,
        private multiIndustryService: MultiIndustryService
    ) {
        this.certificateIds = [];
        this.isPageReady = false;
    }

    ngOnInit() {
        this.localeService.getMasterData().subscribe(resp => {
            this.masterData = resp.data;
            this.master_valueProcess = this.localeService.getVPs(this.masterData);
            this.master_materials = this.localeService.getMaterials(this.masterData);
            this.master_standards = this.localeService.getcertifications(this.masterData);

            this.sortAlphabetically(this.master_standards, 'value');
            this.sortAlphabetically(this.master_materials, 'value');
            this.sortAlphabetically(this.master_valueProcess, 'value');

            this.initFacilityForm();

            this.getCountries();

            this.isPageReady = true;
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (this.isEditFacility) {
                this.certificateManager.updateCertificateEntries(this.editFacilityData.certificateList);
            }
        }, 1000);
    }

    goBack() {
        this.location.back();
    }

    sortAlphabetically(objectToSort, labelToUse) {
        return objectToSort.sort(function(a, b) {
            const textA = a[labelToUse].toUpperCase();
            const textB = b[labelToUse].toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
    }

    private initFacilityForm(): void {
        this.fieldsList = [
            {
                label: 'Value Process',
                type: FieldType.multiSelect,
                placeholder: `${this.commonServices.getTranslation('Eg')}., ${this.commonServices.getTranslation(
                    'Accessory Production'
                )}`,
                required: true,
                options: this.master_valueProcess,
                multiple: true
            },
            {
                label: this.multiIndustryService.getLabel('Materials Used'),
                type: FieldType.multiSelect,
                placeholder: `${this.commonServices.getTranslation('Eg')}., ${this.commonServices.getTranslation(
                    'Acrylic'
                )}`,
                required: true,
                options: this.master_materials,
                multiple: true
            },
            {
                label: 'No. of Male Employees',
                type: FieldType.number,
                placeholder: `${this.commonServices.getTranslation('Eg')}., 25`
            },
            {
                label: 'No. of Female Employees',
                type: FieldType.number,
                placeholder: `${this.commonServices.getTranslation('Eg')}., 25`
            },
            {
                label: 'No. of Other Employees',
                type: FieldType.number,
                placeholder: `${this.commonServices.getTranslation('Eg')}., 25`
            },
            {
                label: 'Production Capacity',
                type: FieldType.text,
                placeholder: `${this.commonServices.getTranslation('Eg')}., 240 ${this.commonServices.getTranslation(
                    'Tonnes / Week'
                )}`
            },
            {
                label: 'Address Line 1',
                type: FieldType.text,
                placeholder: `${this.commonServices.getTranslation('Eg')}., 10 ${this.commonServices.getTranslation(
                    'Downing Street'
                )}`,
                required: true
            },
            {
                label: 'Address Line 2',
                type: FieldType.text,
                placeholder: `${this.commonServices.getTranslation('Eg')}., ${this.commonServices.getTranslation(
                    'Cross Avenue'
                )}`
            },
            {
                label: 'Country',
                type: FieldType.singleSelect,
                options: this.countries,
                placeholder: `${this.commonServices.getTranslation('Eg')}., ${this.commonServices.getTranslation(
                    'India'
                )}`,
                required: true
            },
            {
                label: 'State',
                type: FieldType.singleSelect,
                options: this.states,
                placeholder: `${this.commonServices.getTranslation('Eg')}., ${this.commonServices.getTranslation(
                    'Tamilnadu'
                )}`,
                required: true
            },
            {
                label: 'City',
                type: FieldType.singleSelect,
                placeholder: `${this.commonServices.getTranslation('Eg')}., ${this.commonServices.getTranslation(
                    'Coimbatore'
                )}`,
                options: this.cities,
                required: true
            },
            {
                label: 'Zipcode',
                type: FieldType.text,
                placeholder: `${this.commonServices.getTranslation('Eg')}., 641004`,
                required: true
            }
        ];

        this.fieldsList.forEach((field: Field) => {
            if (field.hasOwnProperty('dummy') && field.dummy) {
                return;
            }
            field.formControlName = field.label.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
        });

        const _simpleFormGroup: FormGroup | any = {};

        _simpleFormGroup['name'] = this._formBuilder.control('', [Validators.required]);

        this.fieldsList.forEach((field: Field) => {
            const validators = [];

            if (field.hasOwnProperty('dummy') && field.dummy) {
                return;
            }

            if (field.hasOwnProperty('required') && field.required) {
                validators.push(Validators.required);
            }
            if (field.hasOwnProperty('min')) {
                validators.push(Validators.min(field.min));
            }
            if (field.hasOwnProperty('max')) {
                validators.push(Validators.max(field.max));
            }
            if (field.hasOwnProperty('minLength')) {
                validators.push(Validators.minLength(field.minLength));
            }
            if (field.hasOwnProperty('maxLength')) {
                validators.push(Validators.maxLength(field.maxLength));
            }

            _simpleFormGroup[field.formControlName] = this._formBuilder.control('', { validators: validators });
        });

        // _simpleFormGroup['certificateFiles'] = this._formBuilder.control('', { validators: [Validators.required] });

        let facilityForm: any;

        if (this.isFacilityFormInit) {
            facilityForm = this.facilityForm.value;
        }

        this.facilityForm = this._formBuilder.group(_simpleFormGroup);

        if (this.isFacilityFormInit) {
            this.facilityForm.patchValue(facilityForm);
        }

        if (!this.isFacilityFormInit && this.isEditFacility) {
            let men: any;
            let women: any;
            let others: any;
            if (this.editFacilityData && this.editFacilityData.employeeCount) {
                women = this.editFacilityData.employeeCount.women;
                men = this.editFacilityData.employeeCount.men;
                others = this.editFacilityData.employeeCount.others;
            }

            if (!this.editFacilityData.hasOwnProperty('address')) {
                this.editFacilityData.address = {
                    addressLine1: '',
                    addressLine2: ''
                };
            }

            this.facilityForm.patchValue({
                Address_Line_1: this.editFacilityData.address.addressLine1,
                Address_Line_2: this.editFacilityData.address.addressLine2,
                Materials_Used: this.editFacilityData.materials,
                No_of_Female_Employees: women,
                No_of_Male_Employees: men,
                No_of_Other_Employees: others,
                Production_Capacity: this.editFacilityData.productionCapacity,
                Value_Process: this.editFacilityData.valueProcess,
                Zipcode: this.editFacilityData.address.zip,
                name: this.editFacilityData.name
            });
        }

        this.isFacilityFormInit = true;
    }

    removeSpace(label: any) {
        return 'create-facility-' + label.replace(/ /g, '-');
    }

    getCountryId(countryName) {
        if (Array.isArray(this.countries) && this.countries.length > 0) {
            for (let i = 0; i < this.countries.length; i++) {
                if (this.countries[i].name === countryName) {
                    return this.countries[i].id;
                }
            }
        }

        if (!!countryName) {
            this.toastrService.error(
                `There seems to be an issue with the selected country ${countryName}`,
                'Invalid country'
            );
        }
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

    getCityId(cityName) {
        if (Array.isArray(this.cities) && this.cities.length > 0) {
            for (let i = 0; i < this.cities.length; i++) {
                if (this.cities[i].name === cityName) {
                    return this.cities[i].id;
                }
            }
        }

        return false;
    }

    getStateNameById(stateId) {
        if (Array.isArray(this.states) && this.states.length > 0) {
            for (let i = 0; i < this.states.length; i++) {
                if (this.states[i].id === stateId) {
                    return this.states[i].name;
                }
            }
        }
        return false;
    }

    getCountryNameById(countryId) {
        if (Array.isArray(this.countries) && this.countries.length > 0) {
            for (let i = 0; i < this.countries.length; i++) {
                if (this.countries[i].id === countryId) {
                    return this.countries[i].name;
                }
            }
        }

        return false;
    }

    getCityNameById(cityId) {
        if (Array.isArray(this.cities) && this.cities.length > 0) {
            for (let i = 0; i < this.cities.length; i++) {
                if (this.cities[i].id === cityId) {
                    return this.cities[i].name;
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
            for (let i = 0; i < this.countries.length; i++) {
                this.countries[i]['value'] = this.countries[i].name;
            }
            if (this.isEditFacility) {
                this.facilityForm.patchValue({
                    Country: this.getCountryId(this.editFacilityData.address.country)
                });
                this.dropdownValues.Country = this.getCountryId(this.editFacilityData.address.country);
                this.getStates(this.getCountryId(this.editFacilityData.address.country));
            }
            this.initFacilityForm();
            this.loadingCountries = false;
        });
    }

    getStates(countryId) {
        this.loadingStates = true;
        this.commonServices.getStates(countryId).subscribe(response => {
            const data = response['data'];
            this.states = data.state;
            for (let i = 0; i < this.states.length; i++) {
                this.states[i]['value'] = this.states[i].name;
            }
            if (this.isEditFacility && this.getStateId(this.editFacilityData.address.state)) {
                this.facilityForm.patchValue({
                    State: this.getStateId(this.editFacilityData.address.state)
                });
                this.dropdownValues.State = this.getStateId(this.editFacilityData.address.state);
                this.getCities(this.getStateId(this.editFacilityData.address.state));
            }
            this.initFacilityForm();
            this.loadingStates = false;
        });
    }
    getCities(stateId) {
        this.loadingCities = true;
        this.commonServices.getCities(stateId).subscribe(response => {
            const data = response['data'];
            this.cities = data.city;
            for (let i = 0; i < this.cities.length; i++) {
                this.cities[i]['value'] = this.cities[i].name;
            }
            if (this.isEditFacility && this.getCityId(this.editFacilityData.address.city)) {
                this.facilityForm.patchValue({
                    City: this.getCityId(this.editFacilityData.address.city)
                });
                this.dropdownValues.City = this.getCityId(this.editFacilityData.address.city);
            }
            this.initFacilityForm();
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
    getCountryCodeById(countryId) {
        if (Array.isArray(this.countries) && this.countries.length > 0) {
            for (let i = 0; i < this.countries.length; i++) {
                if (this.countries[i].id === countryId) {
                    return this.countries[i].code.toLowerCase();
                }
            }
        }
        return false;
    }

    unsetStateOnCountrySelection() {
        this.facilityForm.patchValue({
            State: ''
        });
        this.dropdownValues.State = '';
    }
    unsetCityOnStateSelection() {
        this.facilityForm.patchValue({
            City: ''
        });
        this.dropdownValues.City = '';
    }
    getLatLngFromCityId(cityId) {
        if (Array.isArray(this.cities) && this.cities.length > 0) {
            for (let i = 0; i < this.cities.length; i++) {
                if (this.cities[i].id === cityId) {
                    return { latitude: this.cities[i].lat, longitude: this.cities[i].lon };
                }
            }
        }

        return false;
    }

    populateAddressMeta(address) {
        const latlng = this.getLatLngFromCityId(address.city);
        if (typeof latlng !== 'boolean') {
            address.latitude = latlng.latitude;
        }
        if (typeof latlng !== 'boolean') {
            address.longitude = latlng.longitude;
        }
        address.countryCode = this.getCountryCode(address.country);
    }
    initCertificateObservers(certificateHttpObservers) {
        this.certificateHttpObservers = [];
        this.certificateHttpObservers = certificateHttpObservers;
    }
    createFacility() {
        this.facilityForm.markAsTouched();
        this.facilityForm.controls['Country'].markAsTouched();
        this.facilityForm.controls['State'].markAsTouched();
        this.facilityForm.controls['City'].markAsTouched();

        this.facilityForm.patchValue({
            Country: this.dropdownValues.Country,
            City: this.dropdownValues.City,
            State: this.dropdownValues.State
        });

        if (!this.facilityForm.valid) {
            this.toastrService.error('Fill all mandatory fields', 'Validation error');
            return;
        }

        const latlng = this.getLatLngFromCityId(this.facilityForm.value.City);

        const payload = {
            facility: {
                name: this.facilityForm.value.name,
                employeeCount: {
                    men: this.facilityForm.value.No_of_Male_Employees,
                    women: this.facilityForm.value.No_of_Female_Employees,
                    others: this.facilityForm.value.No_of_Other_Employees
                },
                companyId: this.authService.companyId,
                address: {
                    addressLine1: this.facilityForm.value.Address_Line_1,
                    addressLine2: this.facilityForm.value.Address_Line_2,
                    country: this.getCountryNameById(this.facilityForm.value.Country),
                    countryCode: this.getCountryCodeById(this.facilityForm.value.Country),
                    state: this.getStateNameById(this.facilityForm.value.State),
                    city: this.getCityNameById(this.facilityForm.value.City),
                    zip: this.facilityForm.value.Zipcode,
                    latitude: latlng['latitude'],
                    longitude: latlng['longitude']
                },
                valueProcess: JSON.parse(JSON.stringify(this.facilityForm.value.Value_Process)),
                materials: JSON.parse(JSON.stringify(this.facilityForm.value.Materials_Used)),
                productionCapacity: this.facilityForm.value.Production_Capacity
            },
            certList: JSON.parse(JSON.stringify(this.certificateIds))
        };
        this.certificateManager.onFacilitySaveProcessCertificateHttpRequest();

        if (!this.isEditFacility) {
            this.certificateHttpObservers.push(this.profileService.addFacility(payload));
            zip(...this.certificateHttpObservers).subscribe(
                createFacilityResponse => {
                    this.toastrService.success('Facility has been created', 'Success');
                    this.resetFacilityForm();
                    this.router.navigate(['/company', 'profile']);
                },
                createFacilityErrorResponse => {
                    if (createFacilityErrorResponse.status === 409) {
                        this.toastrService.error('A record with identical details already exist.', 'Duplicate entry');
                    } else if (createFacilityErrorResponse.status === 404) {
                        this.toastrService.error('Records not found', 'Error');
                    } else {
                        this.toastrService.error(
                            'There was an error while trying to create the facility. Please try after some time, or contact support if the problem persists.',
                            'Error'
                        );
                    }
                }
            );
        } else {
            payload.facility['id'] = this.editFacilityData.id;
            this.certificateHttpObservers.push(this.profileService.updateFacility(payload));
            zip(...this.certificateHttpObservers).subscribe(
                updateFacilityResponse => {
                    this.toastrService.success('Facility has been updated', 'Success');
                    this.resetFacilityForm();
                    this.router.navigate(['/company', 'profile']);
                },
                updateFacilityErrorResponse => {
                    if (updateFacilityErrorResponse.status === 409) {
                        this.toastrService.error('A record with identical details already exist.', 'Duplicate entry');
                    } else if (updateFacilityErrorResponse.status === 404) {
                        this.toastrService.error('Records not found to update', 'Error');
                    } else {
                        this.toastrService.error(
                            'There was an error while trying to update the facility. Please try after some time, or contact support if the problem persists.',
                            'Error'
                        );
                    }
                }
            );
        }
    }

    resetFacilityForm() {
        this.facilityForm.reset();
        this.facilityFormFGD.resetForm();
        // this.certificateManager.clearCertificatesForm();
        this.router.navigate(['/company', 'profile']);
    }

    discardFacilityForm() {
        this.resetFacilityForm();
        /* if (!this.isEditFacility) {
            this.certificateManager.discardCertificates();
        } */
        this.router.navigate(['/company', 'profile']);
    }

    associtateWithFacility(certificateIds) {
        this.certificateIds = JSON.parse(JSON.stringify(certificateIds));
    }

    facilityFormHasError(controlName: string, errorName: string) {
        return (
            this.facilityForm.touched &&
            this.facilityForm.invalid &&
            this.facilityForm.controls[controlName].hasError(errorName)
        );
    }

    selectionChange(formControlName, $event) {
        if (formControlName === 'Country') {
            this.getStates($event.id);
            this.dropdownValues.State = '';
            this.dropdownValues.City = '';
            this.unsetStateOnCountrySelection();
            this.unsetCityOnStateSelection();
        } else if (formControlName === 'State') {
            this.getCities($event.id);
            this.unsetCityOnStateSelection();
        }
    }
    singleSelectHasError(formControl: string): boolean {
        if (this.facilityForm.controls[formControl].touched) {
            if (!this.dropdownValues[formControl]) {
                return true;
            } else {
                return !(
                    typeof this.dropdownValues[formControl] === 'string' &&
                    this.dropdownValues[formControl].trim() !== ''
                );
            }
        } else {
            return false;
        }
    }
    markTouched(formControl: string) {
        this.facilityForm.controls[formControl].markAsTouched();
    }
}
