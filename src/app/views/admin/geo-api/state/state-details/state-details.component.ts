import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { State, Response, formValidators } from '../../geoapi.models';
import { CountryService } from '../../country/country.service';
import { Subscription } from 'rxjs';
import { GeoService } from '../../geoService.service';
import { StateService } from '../state.service';
import { CustomToastrService } from '../../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-state-details',
    templateUrl: './state-details.component.html',
    styleUrls: ['./state-details.component.scss']
})
export class StateDetailsComponent implements OnInit, OnDestroy {
    countries: { id: number; name: string }[] | null;
    stateForm: FormGroup;
    filteredValues: { id: number; name: string }[] | null;
    selectedStateValues: State;
    editMode = false;
    editable = true;
    stateSubscription: Subscription;
    title = '';
    disableBtn = false;
    validators = formValidators;
    constructor(
        private countryService: CountryService,
        private modalStateDetailsRef: MatDialogRef<StateDetailsComponent>,
        private geoService: GeoService,
        private toastr: CustomToastrService,
        private stateService: StateService,
        @Inject(MAT_DIALOG_DATA) private dataFromState: { viewMode: boolean; stateDetails?: State }
    ) {}

    ngOnInit(): void {
        this.getCountries();
        this.editable = this.dataFromState.viewMode;
        this.title = this.dataFromState.viewMode ? 'State Details' : 'Add State';
        this.initForm();
    }

    getCountries(): void {
        this.countryService.getCountries().subscribe(
            result => {
                this.countries = result;
                this.filteredValues = result;
            },
            err => {
                this.toastr.error(err, 'Something went wrong!!');
            }
        );
    }
    initForm(): void {
        let countryCtrl = null;
        let stateCtrl = null;
        let latitudeCtrl = null;
        let longitudeCtrl = null;
        let stateCodeCtrl = null;

        if ((this.dataFromState.viewMode || this.editMode) && Object.keys(this.dataFromState.stateDetails).length > 0) {
            this.selectedStateValues = this.dataFromState.stateDetails;
            countryCtrl = this.selectedStateValues.country.name;
            stateCtrl = this.selectedStateValues.name;
            latitudeCtrl = this.selectedStateValues.latitude;
            longitudeCtrl = this.selectedStateValues.longitude;
            stateCodeCtrl = this.selectedStateValues.stateCode;
        }
        this.stateForm = new FormGroup({
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
            state_code: new FormControl(stateCodeCtrl, [
                Validators.required,
                Validators.pattern(/^([A-Za-z0-9]){2,3}$/)
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

        this.stateForm.get('country').valueChanges.subscribe(selected => {
            if (selected) {
                this.filteredOptions(selected);
                this.setFormErrors('country', this.countries);
            }
        });
    }

    filteredOptions(country: string) {
        if (country && country.length > 0) {
            this.filteredValues = this.countries.filter(option => {
                return option.name.toLocaleLowerCase().indexOf(country.toLocaleLowerCase()) !== -1;
            });
        } else {
            this.filteredValues = null;
        }
    }

    onCancel(): void {
        this.modalStateDetailsRef.close();
    }
    onEdit(): void {
        this.editable = false;
        this.editMode = true;
        this.title = 'Edit State';
        this.filteredOptions(this.selectedStateValues.country.name);
    }
    onAddCity(): void | boolean {
        if (this.stateForm.valid) {
            this.disableBtn = true;
            const postData = this.processedData(this.stateForm.value);
            this.geoService.pageLoading.next(true);

            if (this.editMode) {
                this.stateService.updateState(postData, this.selectedStateValues.id).subscribe(
                    res => {
                        this.onSuccess(res.message, res.status);
                    },
                    err => {
                        this.onFailure();
                    }
                );
            } else {
                this.stateService.addNewState(postData).subscribe(
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
    ngOnDestroy(): void {
        this.editMode = false;
        this.stateForm.reset();
        this.disableBtn = false;
    }

    onSuccess(msg: string, status: string): void {
        let statusType = status === Response.Success ? 'success' : 'error';
        if (statusType === Response.Success) {
            this.modalStateDetailsRef.close();
            this.geoService.refeshDatas.next();
        }
        this.disableBtn = false;
        this.geoService.pageLoading.next(false);
        this.toastr[statusType](msg);
    }

    onFailure(): void {
        this.disableBtn = false;
        this.geoService.pageLoading.next(false);
        this.toastr.error('Error', 'something went wrong!!');
    }

    getDetails(searchStr: string, propName: string): string | number | boolean {
        if (Array.isArray(this.countries) && this.countries.length > 0) {
            for (let country of this.countries) {
                if (country['name'] === searchStr) {
                    return country[propName];
                }
            }
        }
        return false;
    }

    processedData(post): any {
        const dataToSend = {
            name: post.state,
            countryCode: this.getDetails(post.country, 'iso2'),
            latitude: post.latitude,
            longitude: post.longitude,
            countryId: this.getDetails(post.country, 'countryId'),
            countryObjId: this.getDetails(post.country, 'id'),
            stateCode: post.state_code
        };

        if (this.editMode) {
            dataToSend['id'] = this.selectedStateValues.id;
            dataToSend['stateId'] = this.selectedStateValues.stateId;
            return dataToSend;
        }
        return dataToSend;
    }

    handlingFormErrors(ctrlName: string, validatorName: string): boolean {
        return this.stateForm.controls[ctrlName].hasError(validatorName) && this.stateForm.controls[ctrlName].touched;
    }

    setFormErrors(ctrlName: string, sourceArr: any[]): void {
        let controlValue: string = this.stateForm.get(ctrlName).value;
        let found: boolean = sourceArr.some(item => item.name == controlValue);

        if (found) {
            this.stateForm.get(ctrlName).setErrors(null);
        } else {
            this.stateForm.get(ctrlName).setErrors({ isExists: true });
        }
    }
}
