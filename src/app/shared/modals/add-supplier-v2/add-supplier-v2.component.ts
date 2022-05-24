import { AuthService } from './../../../core/user/auth.service';
import { Component, Inject, OnInit } from '@angular/core';
import { environment as env } from '../../../../environments/environment';
import { SuppliersService } from '../../../views/suppliers/suppliers.service';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonServices } from '../../commonServices/common.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { take } from 'rxjs/operators';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { amplitude, messages, popup, validation } from '../../const-values';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import {
    IAddSupplierModelData,
    IAddSupplierPayload,
    IAddSupplierResponse,
    IUpdateSupplierInvitePayload
} from './add-supplier-v2.model';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

@Component({
    selector: 'app-add-supplier-v2',
    templateUrl: './add-supplier-v2.component.html',
    styleUrls: ['./add-supplier-v2.component.scss']
})
export class AddSupplierV2ModalComponent implements OnInit {
    public env = env;
    addSupplierProcessing: boolean;
    citySearchText = '';
    cities: [];

    /** */
    addSupplierForm: FormGroup;

    showMessage = {
        flag: false,
        message: null
    };
    private _doNotInvite = false;

    get doNotInvite(): boolean {
        return this._doNotInvite;
    }

    get isSupplier(): boolean {
        return this.authService.user.subscriptionType === 'SUPPLIER';
    }

    modelResponse: IAddSupplierResponse = {
        status: null,
        data: null
    };

    set doNotInvite(flag: boolean) {
        if (flag && !this.modelData.formControlConfig.doNotInvite.notCheckable) {
            const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
                width: '446px',
                data: {
                    title: popup.supplier.doNotInvite.title,
                    msg: popup.supplier.doNotInvite.message,
                    primaryButton: 'Cancel',
                    secondaryButton: 'Proceed',
                    removeMargins: true
                }
            });
            confirmDialog
                .afterClosed()
                .pipe(take(1))
                .subscribe(response => {
                    if (response) {
                        if (response.split(',')[0] === 'Proceed') {
                            this._doNotInvite = flag;
                            this.emailValidationReset(false);
                            // Analytics
                            this.analyticsService.trackEvent(amplitude.supplier.doNotInvite, {
                                Origin: this.modelData.origin
                            });
                        } else {
                            this.analyticsService.trackEvent(amplitude.supplier.doNotInviteCanceled, {
                                Origin: this.modelData.origin
                            });
                        }
                    }
                });
        } else {
            this._doNotInvite = false;
            this.emailValidationReset();
        }
    }
    constructor(
        public dialogRef: MatDialogRef<AddSupplierV2ModalComponent>,
        @Inject(MAT_DIALOG_DATA) public modelData: IAddSupplierModelData,
        private toastr: CustomToastrService,
        private supplierService: SuppliersService,
        private commonServices: CommonServices,
        private analyticsService: AnalyticsService,
        private dialog: MatDialog,
        private _fb: FormBuilder,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.modelData.formControlConfig.supplierUid.isRequired = !this.isSupplier;
        const CONTROL = this.modelData.formControlConfig;

        this.addSupplierForm = this._fb.group({
            supplierUid: [
                {
                    value: CONTROL?.values?.supplier_uid || '',
                    disabled: !!CONTROL.supplierUid.isNotEditable
                },
                CONTROL.supplierUid.isRequired ? [Validators.required] : []
            ],
            companyName: [
                {
                    value: CONTROL.values ? (CONTROL.values.name ? CONTROL.values.name : '') : '',
                    disabled: !!CONTROL.companyName.isNotEditable
                },
                CONTROL.companyName.isRequired ? [Validators.required] : []
            ],
            emailId: [
                {
                    value: CONTROL.values ? (CONTROL.values.contact_email ? CONTROL.values.contact_email : '') : '',
                    disabled: !!CONTROL.email.isNotEditable
                },
                CONTROL.email.isRequired
                    ? [Validators.required, Validators.pattern(validation.emailPattern)]
                    : [Validators.pattern(validation.emailPattern)]
            ],
            location: [
                {
                    value: '',
                    disabled: !!CONTROL.location.isNotEditable
                },
                CONTROL.location.isRequired
                    ? [Validators.required, this.cityValidator.bind(this)]
                    : [this.cityValidator.bind(this)]
            ]
        });

        if (this.modelData.actionType === 'UPDATE') {
            const LOCATION = {
                city: { name: CONTROL.values.supplier_city },
                state: { name: CONTROL.values.supplier_state },
                country: { name: CONTROL.values.supplier_country }
            };
            this.addSupplierForm.get('location').setValue(LOCATION);
            this.addSupplierForm.get('emailId').setValue('');
        }

        this.dialogRef.disableClose = true;
    }

    /**
     * @method cityValidator
     * @param control { AbstractControl }
     * Form validator (not accept string data type)
     */
    private cityValidator(control: AbstractControl) {
        if (typeof control.value === 'string') {
            return { validCity: true };
        }
        return null;
    }

    /**
     * @method onSubmit
     * @returns { void }
     * Add New/Update/Invite existing supplier
     */
    onSubmit(): void {
        if (!this.addSupplierForm.valid) {
            this.toastr.error('Please fix the errors on the form');
            this.analyticsService.trackEvent(amplitude.supplier.addSupplierFormValidationError, {
                Origin: this.modelData.origin
            });
            return;
        }

        switch (this.modelData.actionType) {
            case 'ADD':
                this.addSupplier();
                break;
            case 'UPDATE':
                this.updateSupplierInvite();
                break;
            default:
                break;
        }
    }

    private addSupplier(): void {
        const payload = this.constructAddSupplierPayload();

        this.addSupplierProcessing = true;
        this.supplierService.addSupplier(payload).subscribe(
            data => {
                const resp: IAddSupplierResponse = {
                    data: null,
                    status: 'SUCCESS'
                };
                this.modelResponse = resp;
                if (data.body && data.body['data'] && data.body['data']['supplierData']) {
                    this.modelResponse.data = data.body['data']['supplierData'];
                }
                if (this.doNotInvite) {
                    this.modelData.templateConfig.title = popup.supplier.movedToUnInvite.title;
                    this.showMessage.message = popup.supplier.movedToUnInvite.message;
                    this.showMessage.flag = true;
                } else {
                    let event = null; //Analytics
                    switch (data.status) {
                        case 201:
                            event = amplitude.supplier.addSupplierSuccessWithNoConflicts;
                            this.toastr.success(messages.supplier.invitedNoConflicts);
                            break;
                        case 202:
                            event = amplitude.supplier.addSupplierSuccessExactEmailMatch;
                            this.toastr.success(messages.supplier.invitedEmailAlreadyExists);
                            break;
                        case 203:
                            this.toastr.success(messages.supplier.addSupplierSuccess);
                            this.toastr.warning(
                                messages.supplier.supplierWithConflicts,
                                amplitude.supplier.addSupplierConflicts
                            );
                            this.analyticsService.trackEvent(amplitude.supplier.addSupplierSuccessWithDomainConflicts, {
                                Origin: this.modelData.origin
                            });
                            break;
                        default:
                            break;
                    }
                    if (event) {
                        this.analyticsService.trackEvent(event, {
                            Origin: this.modelData.origin
                        });
                    }
                    this.hide('close');
                    this.addSupplierProcessing = false;
                }
            },
            error =>
                this.errorHandler(
                    messages.supplier.commonError.addSupplier,
                    error,
                    amplitude.supplier.addSupplierFailed
                )
        );
    }

    private updateSupplierInvite(): void {
        const payload: IUpdateSupplierInvitePayload = {
            supplierUid: this.modelData.formControlConfig.values.supplier_uid,
            companyId: this.modelData.formControlConfig.values.company_id,
            newEmailId: this.addSupplierForm.value.emailId,
            supplierId: this.modelData.formControlConfig.values.supplier_id
        };
        this.addSupplierProcessing = true;
        this.supplierService.updateSupplierInvite(payload).subscribe(
            res => {
                if (res.hasOwnProperty('status') && res.hasOwnProperty('message')) {
                    const resp: IAddSupplierResponse = {
                        data: payload,
                        status: res.status.toLocaleUpperCase() as any
                    };
                    this.modelResponse = resp;
                    const event =
                        res.status === 'Success'
                            ? amplitude.supplier.editSupplierInviteSuccess
                            : amplitude.supplier.editSupplierInviteConflict;

                    this.analyticsService.trackEvent(event, { Origin: this.modelData.origin });

                    this.modelData.templateConfig.title = res.status;
                    this.showMessage.flag = true;
                    this.showMessage.message = res.message;
                } else {
                    this.toastr.error('Something went wrong please try again', 'Error');
                }
            },
            error =>
                this.errorHandler(
                    messages.supplier.commonError.updateSupplierInvite,
                    error,
                    amplitude.supplier.editSupplierInviteFailed
                )
        );
    }

    private errorHandler(commonErrorMessage: string, error: any, analytics: string): void {
        this.modelResponse = {
            data: null,
            status: 'ERROR'
        };
        this.addSupplierProcessing = false;
        if (error.error && error.error.message) {
            this.toastr.info(error.error.message);
        } else {
            this.toastr.error(commonErrorMessage);
        }
        if (analytics) {
            this.analyticsService.trackEvent(analytics, { Origin: this.modelData.origin });
        }
    }

    private constructAddSupplierPayload(): IAddSupplierPayload {
        const formData = this.addSupplierForm.value;
        const supplierUidValue = formData.supplierUid.trim() === '' ? null : formData.supplierUid.trim();
        return {
            supplierUid: supplierUidValue,
            companyName: formData.companyName,
            email: formData.emailId.trim() === '' ? null : formData.emailId.trim(),
            doNotInvite: this.doNotInvite,
            address: {
                city: formData.location.city.name,
                latitude: formData.location.city.coords.lat,
                longitude: formData.location.city.coords.lon,
                country: formData.location.country.name,
                state: formData.location.state.name
            }
        };
    }

    hide(type: string = null): void {
        this.addSupplierForm.reset();
        let event = null;
        switch (this.modelData.actionType) {
            case 'ADD':
                event = amplitude.supplier.addSupplierCanceled;
                break;
            case 'UPDATE':
                event = amplitude.supplier.editSupplierInviteCanceled;
                break;
            default:
                break;
        }
        if (type === null && event !== null) {
            this.analyticsService.trackEvent(event, {
                Origin: this.modelData.origin
            });
        }
        this.dialogRef.close(this.modelResponse);
    }

    searchCity(event: any) {
        const searchPayload = {
            freeHand: event.target.value,
            pagination: {
                size: 25
            }
        };
        this.commonServices.searchCities(searchPayload).subscribe(response => {
            this.cities = response['data']['searchResponse'];
        });
    }

    getLocationDisplayName(item: any) {
        let result = '';
        if (item) {
            if (item.city) {
                result += item.city.name + ', ';
            }
            if (item.state) {
                result += item.state.name + ', ';
            }
            if (item.country) {
                result += item.country.name;
            }
        }
        return result;
    }

    private emailValidationReset(isRequired: boolean = true): void {
        const validations = [Validators.pattern(validation.emailPattern)];
        if (isRequired) {
            validations.push(Validators.required);
        }
        this.addSupplierForm.get('emailId').setValidators(validations);

        this.addSupplierForm.patchValue({
            emailId: this.addSupplierForm.value.emailId
        });
    }
}
