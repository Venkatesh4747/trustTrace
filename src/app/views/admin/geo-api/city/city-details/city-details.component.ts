import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomToastrService } from '../../../../../shared/commonServices/custom-toastr.service';
import { CountryService } from '../../country/country.service';
import { City, Country, State, Response, formValidators } from '../../geoapi.models';
import { GeoService } from '../../geoService.service';
import { CityService } from '../city.service';
@Component({
    selector: 'app-city-details',
    templateUrl: './city-details.component.html',
    styleUrls: ['./city-details.component.scss']
})
export class CityDetailsComponent implements OnInit, OnDestroy {
    editable = true;
    cityForm: FormGroup;
    editMode = false;
    selectedCityValues: City;
    states: State[] | null;
    countries: Country[] | null;
    filteredOptions = {
        countries: null,
        states: null
    };
    validators = formValidators;
    disabledBtn = false;
    title = '';
    constructor(
        private cityService: CityService,
        private countryService: CountryService,
        private geoService: GeoService,
        private toast: CustomToastrService,
        private modalCityDetailsRef: MatDialogRef<CityDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) private dataFromCity: { viewMode: boolean; cityDetails?: City }
    ) {}

    ngOnInit(): void {
        this.getCountries();
        this.editable = this.dataFromCity.viewMode;
        if (this.dataFromCity.viewMode) {
            let { country } = this.dataFromCity.cityDetails;
            this.getStates(country['id']);
        }
        this.initForm();
        this.title = this.dataFromCity.viewMode ? 'City Details' : 'Add City';
    }
    getCountries(): void {
        this.countryService.getCountries().subscribe(
            result => {
                this.countries = result;
                this.filteredOptions.countries = result;
            },
            err => {
                this.toast.error('Error', 'Something went wrong!!');
            }
        );
    }

    initForm(): void {
        let countryCtrl = null;
        let stateCtrl = null;
        let latitudeCtrl = null;
        let longitudeCtrl = null;
        let cityCtrl = null;
        if ((this.dataFromCity.viewMode || this.editMode) && Object.keys(this.dataFromCity.cityDetails).length > 0) {
            this.selectedCityValues = this.dataFromCity.cityDetails;
            countryCtrl = this.selectedCityValues.country.name;
            stateCtrl = this.selectedCityValues.state.name;
            cityCtrl = this.selectedCityValues.name;
            latitudeCtrl = this.selectedCityValues.latitude;
            longitudeCtrl = this.selectedCityValues.longitude;
        }

        this.cityForm = new FormGroup({
            country: new FormControl(countryCtrl, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(/^([^0-9])+$/)
            ]),
            state: new FormControl(stateCtrl, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(/^([^0-9])+$/)
            ]),
            city: new FormControl(cityCtrl, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(/^([^0-9])+$/)
            ]),
            latitude: new FormControl(latitudeCtrl, [
                Validators.required,
                Validators.pattern(/^(\-?([0-8]?[0-9](\.\d+)?|90(.[0]+)?))$/)
            ]),
            longitude: new FormControl(longitudeCtrl, [
                Validators.required,
                Validators.pattern(/^-?([1]?[1-7][1-9]|[1]?[1-8][0]|[1-9]?[0-9])\.{1}\d{1,}$/)
            ])
        });

        this.cityForm.get('country').valueChanges.subscribe(selected => {
            if (selected) {
                this.filteredValues('countries', selected);
                this.setFormErrors('country', this.countries);
            }
        });

        this.cityForm.get('state').valueChanges.subscribe(selected => {
            if (selected) {
                this.filteredValues('states', selected);
                this.setFormErrors('state', this.states);
            }
        });
    }

    onAddCity(): void | boolean {
        if (this.cityForm.valid) {
            this.disabledBtn = true;
            this.geoService.pageLoading.next(true);
            const postData = this.processedData(this.cityForm.value);

            if (this.editMode) {
                this.cityService.updateCity(postData, this.selectedCityValues.id).subscribe(
                    res => {
                        this.onSuccess(res.message, res.status);
                    },
                    err => {
                        this.onFailure();
                    }
                );
            } else {
                this.cityService.addNewCity(postData).subscribe(
                    res => {
                        this.onSuccess(res.message, res.status);
                    },
                    err => {
                        this.onFailure();
                    }
                );
            }
        } else {
            this.toast.error('Please fill the mandatory fields!!');
            return false;
        }
    }

    onEdit(): void {
        this.editable = false;
        this.editMode = true;
        this.title = 'Edit City';
        this.filteredValues('countries', this.selectedCityValues.country.name);
        this.filteredValues('states', this.selectedCityValues.state.name);
    }

    onSuccess(msg: string, status: string): void {
        let statusType = status === Response.Success ? 'success' : 'error';
        if (statusType === Response.Success) {
            this.disabledBtn = false;
            this.modalCityDetailsRef.close();
            this.geoService.refeshDatas.next();
        }
        this.geoService.pageLoading.next(false);
        this.toast[statusType](msg);
    }

    onFailure(): void {
        this.disabledBtn = false;
        this.geoService.pageLoading.next(false);
        this.toast.error('Error', 'Something went wrong!!');
    }

    onCancel(): void {
        this.modalCityDetailsRef.close();
    }

    filteredValues(type: string, selectedString: string): void {
        if (selectedString && selectedString.length > 0 && this[type]) {
            this.filteredOptions[type] = this[type].filter(option => {
                return option.name.toLocaleLowerCase().indexOf(selectedString.toLocaleLowerCase()) !== -1;
            });
        } else {
            this.filteredOptions[type] = null;
        }
    }

    onCountryChange(id: string): void {
        this.getStates(id);
    }

    getStates(stateId: string): void {
        this.countryService.getStatesBasedOnCountryId(stateId).subscribe(
            (states: State[]) => {
                this.states = states;
                this.filteredOptions.states = states;
            },
            err => {
                this.toast.error('Error', 'Something went wrong!!');
            }
        );
    }

    getDetails(source: string, searchStr: string, propName: string): string | number | boolean {
        if (Array.isArray(this[source]) && this[source].length > 0) {
            for (let item of this[source]) {
                if (item.name === searchStr) {
                    return item[propName];
                }
            }
        }
        return false;
    }

    processedData(post): any {
        const dataToSend = {
            name: post.city,
            countryCode: this.getDetails('countries', post.country, 'iso2'),
            stateCode: this.getDetails('states', post.state, 'stateCode'),
            latitude: post.latitude,
            longitude: post.longitude,
            stateId: this.getDetails('states', post.state, 'stateId'),
            countryId: this.getDetails('countries', post.country, 'countryId'),
            stateObjId: this.getDetails('states', post.state, 'id'),
            countryObjId: this.getDetails('countries', post.country, 'id')
        };

        if (this.editMode) {
            dataToSend['id'] = this.selectedCityValues.id;
            dataToSend['cityId'] = this.selectedCityValues.cityId;
            return dataToSend;
        }
        return dataToSend;
    }

    handlingFormErrors(ctrlName: string, validatorName: string): boolean {
        return this.cityForm.controls[ctrlName].hasError(validatorName) && this.cityForm.controls[ctrlName].touched;
    }

    setFormErrors(ctrlName: string, sourceArr: any[]): void {
        let controlValue: string = this.cityForm.get(ctrlName).value;

        if (sourceArr && sourceArr.length > 0) {
            let found: boolean = sourceArr.some(item => item.name == controlValue);

            if (found) {
                this.cityForm.get(ctrlName).setErrors(null);
            } else {
                this.cityForm.get(ctrlName).setErrors({ isExists: true });
            }
        } else {
            this.cityForm.get(ctrlName).setErrors({ notExists: true });
        }
    }

    ngOnDestroy(): void {
        this.cityForm.reset();
        this.editMode = false;
        this.countries = this.states = null;
        this.disabledBtn = false;
        this.filteredOptions.countries = this.filteredOptions.states = null;
    }
}
