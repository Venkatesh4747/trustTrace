import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { AuthService } from '../../../../../app/core';
import { CommonServices } from '../../../../shared/commonServices/common.service';
import { ConfirmDialogComponent } from '../../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { InfoModalComponent } from '../../../../shared/modals/info-modal/info-modal.component';
import { ProductsService } from '../../products.service';
import { IValue } from '../../template.model';
import {
    ICreateLabelAndProgramReqPayload,
    ILabelsAndProgramConfig,
    IParameterConfig,
    LabelLevel,
    screenState
} from '../labels-and-program.model';

@Component({
    selector: 'app-label-detail',
    templateUrl: './labels-and-programs-detail.component.html',
    styleUrls: ['./labels-and-programs-detail.component.scss']
})
export class LabelsAndProgramsDetailComponent implements OnInit {
    pageLoading = true;
    submitOnProgress = false;
    labelData: any;
    canSave = true;
    labelsAndProgramConfig: ILabelsAndProgramConfig;
    private _labelId: string;

    private _screenState: screenState;

    get isNavigateCheck(): boolean {
        return this.labelsAndProgramFormGroup.touched;
    }

    get isActiveLabel(): boolean {
        return this.labelData?.status === 'Active';
    }

    get isUpdatePage(): boolean {
        return this.screenState === 'update';
    }

    get screenState(): screenState {
        return this._screenState;
    }

    set screenState(value: screenState) {
        this._screenState = value;
        switch (value) {
            case 'create':
                this._labelId = null;
                this.getLabelsAndProgramConfig();
                break;
            case 'update':
                this._labelId = this.activatedRoute.snapshot.params.labelId;
                forkJoin([
                    this.productService.getLabelData(this.labelId),
                    this.productService.getLabelsAndProgramConfig()
                ])
                    .pipe(
                        switchMap(data => {
                            this.labelData = data[0];
                            this.labelsAndProgramConfig = data[1];
                            if (data[0]?.clone) {
                                return this.productService.getMasterLabelList(data[0]?.labelLevel);
                            }
                            return of(null);
                        })
                    )
                    .subscribe(
                        resp => {
                            this.masterLabelList = resp?.labels ? resp.labels : null;
                            this.constructForm();
                            this.setLabelData();
                        },
                        () => {
                            this.toastrService.info('Failed to load form. Please refresh.');
                            this.pageLoading = false;
                        }
                    );
                break;
            default:
                break;
        }
    }

    get labelId(): string {
        return this._labelId;
    }

    get hasLabelDeactivateAccess(): boolean {
        return this.authService.haveAccess('LABELS_AND_PROGRAMS_ARCHIVE');
    }

    labelsAndProgramFormGroup: FormGroup;

    masterLabelList: IValue[];
    labelConfig: any;
    initialLabelConfig: any;
    fetchingLabels: boolean;
    fetchingLabelConfig: boolean;
    validators = { operator: [Validators.required], score: [Validators.pattern(/^[1-5]$/), Validators.required] };

    fetchState = {
        labels: false,
        labelConfig: false
    };

    control = {
        fieldType: 'SINGLE_SELECT'
    };

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private productService: ProductsService,
        private toastrService: CustomToastrService,
        private dialog: MatDialog,
        private authService: AuthService,
        private commonService: CommonServices
    ) {}

    ngOnInit(): void {
        const url = this.activatedRoute.snapshot.url;
        this.screenState = url[0].path as 'create' | 'update';
    }

    getLabelsAndProgramConfig(): void {
        this.pageLoading = true;
        this.productService.getLabelsAndProgramConfig().subscribe(
            data => {
                this.labelsAndProgramConfig = data;
                this.constructForm();
                this.pageLoading = false;
            },
            () => {
                this.pageLoading = false;
            }
        );
    }

    constructForm(): void {
        this.labelsAndProgramFormGroup = this.formBuilder.group({
            labelType: [{ value: null, disabled: this.isUpdatePage }, Validators.required],
            suppliers: [{ value: null, disabled: true }, Validators.required],
            labelName: [{ value: null, disabled: this.isUpdatePage }, Validators.required],
            labelLevel: [{ value: null, disabled: this.isUpdatePage }, Validators.required],
            clone: [{ value: true, disabled: this.isUpdatePage }, Validators.required],
            clonedLabel: [{ value: null, disabled: true }, Validators.required],
            calculationBuilderValues: this.formBuilder.array([], Validators.required),
            comments: ['']
        });

        const formArray = this.labelsAndProgramFormGroup.controls.calculationBuilderValues as FormArray;
        this.constructFormArray(formArray, this.labelsAndProgramConfig?.calculationBuilderConfig?.parametersConfig);
        this.labelsAndProgramFormGroup.get('calculationBuilderValues').disable();
    }

    constructFormArray(parentFormArray: FormArray, configArray: IParameterConfig[]): void {
        try {
            configArray.forEach(config => {
                const formGroup = this.formBuilder.group({});

                if (config?.subParametersConfig?.length > 0) {
                    formGroup.addControl('parameterName', this.formBuilder.control(config.parameterName));
                    formGroup.addControl('subParametersValue', this.formBuilder.array([]));
                    formGroup.get('parameterName').disable();
                    this.constructFormArray(
                        formGroup.controls.subParametersValue as FormArray,
                        config.subParametersConfig
                    );
                } else {
                    formGroup.addControl('parameterName', this.formBuilder.control(config.parameterName));
                    formGroup.addControl('displayName', this.formBuilder.control(config.displayName));
                    formGroup.addControl('operator', this.formBuilder.control(config.operator));
                    formGroup.addControl(
                        'score',
                        this.formBuilder.control(config.score, [Validators.pattern(/^[1-5]$/)])
                    );
                    formGroup.get('parameterName').disable();
                    formGroup.get('displayName').disable();
                }

                parentFormArray.push(formGroup);
            });
            this.initialLabelConfig = this.labelsAndProgramFormGroup.get('calculationBuilderValues').value;
        } catch (e) {
            this.toastrService.info('Failed to load form. Please refresh.');
        }
    }

    getArrayConfig(form: FormGroup, formArrayName: string): FormArray {
        return form.get(formArrayName) as FormArray;
    }

    onSubmit(): void {
        let isCalculationBuilderValueExists = false;
        if (this.labelsAndProgramFormGroup.get('labelName').hasError('exists')) {
            this.labelsAndProgramFormGroup.get('labelName').setErrors(null);
        }
        if (!this.labelsAndProgramFormGroup.valid) {
            this.labelsAndProgramFormGroup.markAllAsTouched();
            this.dialog.open(InfoModalComponent, {
                width: '372px',
                data: {
                    title: 'Invalid entry!',
                    description: this.getDescription(),
                    buttonLabel: 'Close'
                }
            });
            return;
        }
        if (!this.labelsAndProgramFormGroup.get('clone').value) {
            isCalculationBuilderValueExists = this.validateCalculationBuilderValues(
                this.labelsAndProgramFormGroup.value?.calculationBuilderValues
            );
        }
        if (isCalculationBuilderValueExists || this.labelsAndProgramFormGroup.get('clone').value) {
            const payload: ICreateLabelAndProgramReqPayload = this.labelsAndProgramFormGroup.value;
            this.submitOnProgress = true;
            if (!this.isUpdatePage) {
                this.createLabel(payload);
            } else {
                this.onSubmitValidation();
            }
        } else {
            this.dialog.open(InfoModalComponent, {
                width: '372px',
                data: {
                    title: 'Invalid entry!',
                    description:
                        'No calculation logic found. Please ensure to update the calculation logic before trying to create the label.',
                    buttonLabel: 'Close'
                }
            });
        }
    }

    createLabel(payload: ICreateLabelAndProgramReqPayload): void {
        this.productService.createLabel(payload).subscribe(
            data => {
                this.submitOnProgress = false;
                if (data?.data?.length > 0) {
                    this.dialog.open(InfoModalComponent, {
                        width: '372px',
                        data: {
                            title: 'Invalid entry!',
                            description: data.data[0].errorMessage,
                            buttonLabel: 'Close'
                        }
                    });
                    this.labelsAndProgramFormGroup.get(data.data[0].fieldName).setErrors({ exists: true });
                } else {
                    this.toastrService.success('Label created successfully', 'Success');
                    setTimeout(() => {
                        this.labelsAndProgramFormGroup.markAsUntouched();
                        this.router.navigateByUrl('products/labels');
                    }, 1000);
                }
            },
            () => {
                this.submitOnProgress = false;
                this.toastrService.error('Label creation failed. Please try again', 'Server Error');
            }
        );
    }

    updateLabel(payload: ICreateLabelAndProgramReqPayload): void {
        this.productService.updateLabel(this.labelId, payload).subscribe(
            data => {
                if (data?.data) {
                    this.submitOnProgress = false;
                    this.toastrService.success('Label updated successfully', 'Success');
                    setTimeout(() => {
                        this.labelsAndProgramFormGroup.markAsUntouched();
                        this.router.navigateByUrl('products/labels');
                    }, 1000);
                } else {
                    this.submitOnProgress = false;
                    this.toastrService.info(
                        'No changes were made. Kindly make some changes before changing. If you have no changes, please click on Cancel'
                    );
                }
            },
            () => {
                this.submitOnProgress = false;
                this.toastrService.error('Label update failed. Please try again', 'Server Error');
            }
        );
    }

    getDescription(): string {
        if (
            !this.labelsAndProgramFormGroup.get('clone').value &&
            !this.labelsAndProgramFormGroup.get('calculationBuilderValues').valid
        ) {
            return 'Some incomplete expressions were found, please select both an operator and a number to complete the expression.';
        }
        if (!this.labelsAndProgramFormGroup.valid) {
            return 'Please update all mandatory fields before creating the label';
        }
    }

    cancel(): void {
        this.router.navigateByUrl('products/labels');
    }

    readOnlyController(controlName: string, expectedValue: any, targetControl: any, callback?: () => void): void {
        if (callback) {
            callback.call(null, this.labelsAndProgramFormGroup.get(controlName).value === expectedValue, targetControl);
        } else if (this.labelsAndProgramFormGroup.get(controlName).value === expectedValue) {
            this.labelsAndProgramFormGroup.get(targetControl).enable();
        } else {
            this.labelsAndProgramFormGroup.get(targetControl).disable();
            this.labelsAndProgramFormGroup.get(targetControl).reset();
        }
    }

    disableClonedLabelField(): void {
        if (
            this.labelsAndProgramFormGroup.get('clone').value &&
            this.labelsAndProgramFormGroup.get('labelLevel').value !== null
        ) {
            this.labelsAndProgramFormGroup.controls.clonedLabel.enable();
            this.labelsAndProgramFormGroup.get('clonedLabel').setErrors({ required: true });
        } else {
            this.labelsAndProgramFormGroup.controls.clonedLabel.disable();
            this.labelsAndProgramFormGroup.get('clonedLabel').reset();
        }
        if (this.isUpdatePage) {
            this.labelsAndProgramFormGroup.controls.clonedLabel.disable();
            this.labelsAndProgramFormGroup.get('clonedLabel').setErrors(null);
        }
    }

    resetCalculationBuilder(flag: boolean, targetControl: string): void {
        this.labelsAndProgramFormGroup.get('calculationBuilderValues').patchValue(this.initialLabelConfig);
        if (flag) {
            this.labelsAndProgramFormGroup.get(targetControl).enable();
        } else {
            this.labelsAndProgramFormGroup.get(targetControl).disable();
        }
    }

    getAvailableLabels(): void {
        this.labelsAndProgramFormGroup.get('clonedLabel').disable();
        this.labelsAndProgramFormGroup.controls['clonedLabel'].setValue(null);
        const labelLevel: LabelLevel = this.labelsAndProgramFormGroup.get('labelLevel').value;
        this.fetchState.labels = true;
        if (this.labelsAndProgramFormGroup.get('clone').value) {
            this.labelsAndProgramFormGroup.get('calculationBuilderValues').patchValue(this.initialLabelConfig);
        }
        if (labelLevel) {
            this.productService.getMasterLabelList(labelLevel).subscribe(
                data => {
                    this.masterLabelList = data.labels;
                    this.fetchState.labels = false;
                    this.disableClonedLabelField();
                },
                () => {
                    this.fetchState.labels = false;
                    this.toastrService.error(
                        `Unable to fetch existing ${labelLevel} labels. Please refresh and try again`,
                        'Server Error'
                    );
                }
            );
        } else {
            this.fetchState.labels = false;
            this.masterLabelList = [];
        }
    }
    getLabelConfigs(value: string): void {
        if (this.isUpdatePage) {
            return;
        }
        this.fetchState.labelConfig = true;
        if (value) {
            this.productService.getLabelConfig(value).subscribe(
                data => {
                    this.fetchState.labelConfig = false;
                    this.labelConfig = data.calculationBuilderValues;

                    this.labelsAndProgramFormGroup.get('calculationBuilderValues').patchValue(this.labelConfig);
                },
                () => {
                    this.fetchState.labelConfig = false;
                }
            );
        } else {
            this.fetchState.labelConfig = false;
            this.labelConfig = [];
            this.labelsAndProgramFormGroup.get('calculationBuilderValues').patchValue(this.initialLabelConfig);
            this.labelsAndProgramFormGroup.get('calculationBuilderValues').markAsUntouched();
            this.labelsAndProgramFormGroup.get('calculationBuilderValues').clearValidators();
            this.labelsAndProgramFormGroup.get('calculationBuilderValues').updateValueAndValidity();
        }
    }
    onLabelNameChange(formControlName: string): void {
        if (this.labelsAndProgramFormGroup.get(formControlName).value?.trim()) {
            this.labelsAndProgramFormGroup.get(formControlName).setErrors(null);
        } else {
            this.labelsAndProgramFormGroup.get(formControlName).setErrors({ required: true });
        }
    }

    reset(parameterFormGroup: FormGroup, parameterFormControlValues: string[]): void {
        if (this.labelsAndProgramFormGroup.get('calculationBuilderValues').disabled) {
            return;
        }
        parameterFormControlValues.forEach(control => {
            parameterFormGroup.get(control).reset();
            parameterFormGroup.get(control).clearValidators();
            parameterFormGroup.get(control).updateValueAndValidity();
            parameterFormGroup.get(control).markAsTouched();
        });
    }

    updateValiditionForOperatorAndScore(formGroup: FormGroup, controlName: string, dependentControlName: string): void {
        if (formGroup.get(dependentControlName).value === null && formGroup.get(controlName).value) {
            formGroup.get(dependentControlName).setValidators(this.validators[dependentControlName]);
            formGroup.get(controlName).setValidators(this.validators[controlName]);
            formGroup.get(controlName).updateValueAndValidity();
            formGroup.get(dependentControlName).updateValueAndValidity();
        } else {
            formGroup.get(dependentControlName).clearValidators();
            formGroup.get(controlName).clearValidators();
            formGroup.get('score').setValidators(this.validators.score);
            formGroup.get('score').updateValueAndValidity();
        }
    }

    validateCalculationBuilderValues(calculationBuilderValues: any[]): boolean {
        return calculationBuilderValues.some(parameterValue => {
            if (parameterValue?.operator && parameterValue?.score) {
                return true;
            }
            if (parameterValue?.subParametersValue) {
                return this.validateCalculationBuilderValues(parameterValue.subParametersValue);
            }
        });
    }

    getValidTooltipForClonedLabel(): string {
        if (this.labelsAndProgramFormGroup.get('clonedLabel').disabled && !this.isUpdatePage) {
            if (
                this.labelsAndProgramFormGroup.get('clone').value &&
                !this.labelsAndProgramFormGroup.get('labelLevel').value
            ) {
                return this.commonService.getTranslation('Please select label Level first');
            } else if (!this.labelsAndProgramFormGroup.get('clone').value) {
                return this.commonService.getTranslation(
                    'Cannot be selected, since create from scratch option is selected'
                );
            }
        }
    }

    setLabelData(): void {
        this.pageLoading = false;
        this.labelsAndProgramFormGroup.patchValue(this.labelData);
        this.disableAndEnableFormGroup();
    }

    deactivateLabel(): void {
        this.pageLoading = true;
        let confirmationMessage: string;
        this.productService.getProductCountForLabel(this.labelId).subscribe(
            data => {
                if (data.clonedLabel) {
                    confirmationMessage = `${this.commonService.getTranslation(
                        'Are you sure you want to deactivate this label?'
                    )} ${this.labelsAndProgramFormGroup.get('labelName').value} 
                    ${this.commonService.getTranslation('and its cloned labels have been added to')}
                    ${data.submittedProductCount} ${this.commonService.getTranslation('submitted product(s) and')} ${
                        data.draftProductCount
                    } ${this.commonService.getTranslation('draft product(s)')}`;
                } else {
                    confirmationMessage = `${this.commonService.getTranslation(
                        'Are you sure you want to deactivate this label? It has been added to'
                    )} ${data.submittedProductCount} ${this.commonService.getTranslation('submitted product(s) and')} ${
                        data.draftProductCount
                    } ${this.commonService.getTranslation('draft product(s)')}`;
                }
                this.pageLoading = false;
                const dialogPrompt = this.dialog.open(ConfirmDialogComponent, {
                    width: '490px',
                    data: {
                        title: 'Deactivate Label?',
                        msg: confirmationMessage,
                        primaryButton: 'Cancel',
                        secondaryButton: 'Deactivate',
                        class: 'bg-red-btn-delete-modal-dialog-block',
                        showClose: false
                    }
                });
                dialogPrompt.afterClosed().subscribe(result => {
                    if (result === 'Deactivate') {
                        this.productService.deactivateLabel(this.labelId).subscribe(
                            () => {
                                this.toastrService.success('Label deactivated successfully', 'Success');
                                this.labelData.status = 'Inactive';
                                this.disableAndEnableFormGroup();
                            },
                            () => {
                                this.toastrService.error('Unable to deactivate label', 'Server Error');
                            }
                        );
                    }
                });
            },
            () => {
                this.pageLoading = false;
                this.toastrService.error('Unable to fetch product count for this label', 'Server Error');
            }
        );
    }

    disableAndEnableFormGroup(): void {
        if (!this.isActiveLabel) {
            this.canSave = false;
            this.labelsAndProgramFormGroup.disable();
            return;
        }
        if (this.labelsAndProgramFormGroup.get('labelType').value === 'Supplier specific') {
            this.labelsAndProgramFormGroup.get('suppliers').enable();
        }
        if (!this.labelsAndProgramFormGroup.get('clone').value && this.isActiveLabel) {
            this.labelsAndProgramFormGroup.get('calculationBuilderValues').enable();
        }
    }

    onSubmitValidation(): void {
        this.submitOnProgress = true;
        const payload: ICreateLabelAndProgramReqPayload = this.labelsAndProgramFormGroup.value;
        if (this.labelData.labelType === 'Supplier specific') {
            const supplierBeforeSubmit = this.labelData.suppliers;
            const supplierAfterSubmit = this.labelsAndProgramFormGroup.get('suppliers').value;
            const removedSuppliers = [];
            supplierBeforeSubmit.forEach(supplierName => {
                if (!supplierAfterSubmit.includes(supplierName)) {
                    removedSuppliers.push(supplierName);
                }
            });

            if (removedSuppliers.length > 0) {
                this.productService.getSupplierProductCount(removedSuppliers, this.labelId).subscribe(
                    data => {
                        this.submitOnProgress = false;
                        const confirmationMessage = `${this.commonService.getTranslation(
                            'Are you sure do you want to remove this supplier(s) for selected label? This label has been added for'
                        )} ${data.submittedProductCount} ${this.commonService.getTranslation(
                            'submitted product(s) and'
                        )} 
                        ${data.draftProductCount} ${this.commonService.getTranslation(
                            'draft product(s) for selected supplier(s)'
                        )}`;
                        const dialogPrompt = this.dialog.open(ConfirmDialogComponent, {
                            width: '490px',
                            data: {
                                title: 'Edit Label?',
                                msg: confirmationMessage,
                                primaryButton: 'Cancel',
                                secondaryButton: 'Save',
                                class: 'bg-red-btn-delete-modal-dialog-block',
                                showClose: false
                            }
                        });
                        dialogPrompt.afterClosed().subscribe(result => {
                            if (result === 'Save') {
                                this.updateLabel(payload);
                            }
                        });
                    },
                    () => {
                        this.pageLoading = false;
                        this.toastrService.error(
                            'Unable to fetch product count for removed supplier(s)',
                            'Server Error'
                        );
                    }
                );
            } else {
                this.submitOnProgress = false;
                this.updateLabel(payload);
            }
        } else {
            this.updateLabel(payload);
        }
    }
}
