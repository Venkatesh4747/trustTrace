import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Country, Response, formValidators } from '../../geoapi.models';
import { CustomToastrService } from '../../../../../shared/commonServices/custom-toastr.service';
import { GeoService } from '../../geoService.service';
import { CountryService } from '../country.service';
@Component({
    selector: 'app-country-details',
    templateUrl: './country-details.component.html',
    styleUrls: ['./country-details.component.scss']
})
export class CountryDetailsComponent implements OnInit, OnDestroy {
    countryForm: FormGroup;
    editMode = false;
    editable = true;
    title = '';
    regions: [] | null;
    subRegions: [] | null;
    filteredOptions = {
        regions: null,
        subRegions: null
    };
    validators = formValidators;
    disabledBtn = false;
    constructor(
        private countryService: CountryService,
        private modalCountryDetailsRef: MatDialogRef<CountryDetailsComponent>,
        private toastr: CustomToastrService,
        private geoService: GeoService,
        @Inject(MAT_DIALOG_DATA) private dataFromCountry: { viewMode: boolean; countryDetails?: Country }
    ) {}

    ngOnInit(): void {
        this.editable = this.dataFromCountry.viewMode;
        this.title = this.dataFromCountry.viewMode ? 'Country Details' : 'Add Country';
        this.getRegions();
        this.getSubregions();
        this.initForm();
        if (
            (this.dataFromCountry.viewMode || this.editMode) &&
            Object.keys(this.dataFromCountry.countryDetails).length > 0
        ) {
            this.updateTheForm();
        }
    }

    onAddCountry(): void | boolean {
        if (this.countryForm.valid) {
            const postData = this.processedData(this.countryForm.value);

            this.geoService.pageLoading.next(true);
            if (this.editMode) {
                const { id: countryID } = this.dataFromCountry.countryDetails;
                this.countryService.updateCountry(postData, countryID).subscribe(
                    res => {
                        this.onSuccess(res.message, res.status);
                    },
                    err => {
                        this.onFailure();
                    }
                );
            } else {
                this.countryService.addACountry(postData).subscribe(
                    res => {
                        this.onSuccess(res.message, res.status);
                    },
                    err => {
                        this.onFailure();
                    }
                );
            }
        } else {
            this.toastr.error('Please fill the mandatory fields!!');
            return false;
        }
    }

    onSuccess(msg: string, status: string): void {
        let statusType = status === Response.Success ? 'success' : 'error';
        if (statusType === Response.Success) {
            this.disabledBtn = false;
            this.modalCountryDetailsRef.close();
            this.geoService.refeshDatas.next();
        }
        this.geoService.pageLoading.next(false);
        this.toastr[statusType](msg);
    }

    onFailure(): void {
        this.disabledBtn = false;
        this.geoService.pageLoading.next(false);
        this.toastr.error('Error', 'something went wrong');
    }
    initForm(): void {
        this.countryForm = new FormGroup({
            name: new FormControl(null, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(/^([^0-9])+$/)
            ]),
            iso2: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-z]{2}$/)]),
            iso3: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-z]{3}$/)]),
            phone_code: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{1,4}$/)]),
            capital: new FormControl('', [
                Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(/^([^0-9])+$/)
            ]),
            currency: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-z]{2,5}$/)]),
            native: new FormControl(null, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(/^([^0-9])+$/)
            ]),
            region: new FormControl(''),
            subregion: new FormControl(''),
            latitude: new FormControl(null, [
                Validators.required,
                Validators.pattern(/^(\-?([0-8]?[0-9](\.\d+)?|90(.[0]+)?))$/)
            ]),
            longitude: new FormControl(null, [
                Validators.required,
                Validators.pattern(/^-?([1]?[1-7][1-9]|[1]?[1-8][0]|[1-9]?[0-9])\.{1}\d{1,}$/)
            ])
        });

        this.countryForm.get('region').valueChanges.subscribe(selected => {
            if (selected) {
                this.filteredValues('regions', selected);
                this.setFormErrors('region', this.regions);
            }
        });

        this.countryForm.get('subregion').valueChanges.subscribe(selected => {
            if (selected) {
                this.filteredValues('subRegions', selected);
                this.setFormErrors('subregion', this.subRegions);
            }
        });
    }

    onCancel(): void {
        this.modalCountryDetailsRef.close();
    }

    onEdit(): void {
        this.editable = false;
        this.editMode = true;
        this.title = 'Edit Country';
    }

    processedData(post: Country): Country {
        const dataToSend = { ...post };
        if (this.editMode) {
            const { id, countryId } = this.dataFromCountry.countryDetails;
            dataToSend['id'] = id;
            dataToSend['countryId'] = countryId;
            return dataToSend;
        }
        return dataToSend;
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
    getRegions(): void {
        this.countryService.getRegions().subscribe(
            res => {
                this.regions = res;
                this.filteredOptions.regions = res;
            },
            err => {
                this.toastr.error('Error', 'something went wrong while fetching Regions');
            }
        );
    }

    updateTheForm(): void {
        const {
            name,
            iso2,
            iso3,
            phone_code,
            capital,
            currency,
            native,
            region,
            subregion,
            latitude,
            longitude
        } = this.dataFromCountry.countryDetails;
        this.countryForm.setValue({
            name,
            iso2,
            iso3,
            phone_code,
            capital,
            currency,
            native,
            region,
            subregion,
            latitude,
            longitude
        });
    }
    getSubregions(): void {
        this.countryService.getSubRegions().subscribe(
            res => {
                this.subRegions = res;
                this.filteredOptions.subRegions = res;
            },
            err => {
                this.toastr.error('Error', 'something went wrong while fetching Subregions');
            }
        );
    }

    handlingFormErrors(ctrlName: string, validatorName: string): boolean {
        return (
            this.countryForm.controls[ctrlName].hasError(validatorName) && this.countryForm.controls[ctrlName].touched
        );
    }

    setFormErrors(ctrlName: string, sourceArr: any[]): void {
        let controlValue: string = this.countryForm.get(ctrlName).value;

        if (sourceArr && sourceArr.length > 0) {
            let found: boolean = sourceArr.some(item => item.name == controlValue);

            if (found) {
                this.countryForm.get(ctrlName).setErrors(null);
            } else {
                this.countryForm.get(ctrlName).setErrors({ isExists: true });
            }
        } else {
            this.countryForm.get(ctrlName).setErrors({ notExists: true });
        }
    }
    ngOnDestroy(): void {
        this.editMode = false;
        this.countryForm.reset();
        this.disabledBtn = false;
    }
}
