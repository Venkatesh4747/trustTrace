import { AnalyticsService } from './../../../../core/analytics/analytics.service';
import { CommonServices } from './../../../commonServices/common.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { environment } from './../../../../../environments/environment';
import { UtilsService } from './../../../utils/utils.service';
import { forkJoin } from 'rxjs';

export class EditCustomizationInfoMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid);
    }
}
@Component({
    selector: 'app-edit-customization-info',
    templateUrl: './edit-customization-info.component.html',
    styleUrls: ['./edit-customization-info.component.scss']
})
export class EditCustomizationInfoComponent implements OnInit {
    @Input() infoData;
    @Input() formEditMode;
    @Input() responseFields;
    @Output() onCustomizationValueChange = new EventEmitter();
    @Output() onShowCustomizationValueChange = new EventEmitter();

    env = environment;

    customizationInfoForm: FormGroup = new FormGroup({});

    editCustomizationInfo;

    filesToBeRemoved = [];

    displayType = {
        normal: 'NORMAL',
        compound: 'COMPOUND'
    };

    matcher = new EditCustomizationInfoMatcher();

    constructor(
        private formBuilder: FormBuilder,
        public utilService: UtilsService,
        private commonServices: CommonServices,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {
        this.setFormGroup();
    }

    setFormGroup() {
        const formGroups = {};
        let validators = [];
        this.infoData.forEach((info: any) => {
            validators = [];

            if (info.displayConfig.constraintConfig) {
                Object.keys(info.displayConfig.constraintConfig).forEach(config => {
                    switch (config) {
                        case 'min':
                            validators.push(Validators.min(info.displayConfig.constraintConfig[config]));
                            break;
                        case 'max':
                            validators.push(Validators.max(info.displayConfig.constraintConfig[config]));
                            break;
                        case 'mandatory':
                            if (info.displayConfig.constraintConfig[config]) {
                                validators.push(Validators.required);
                            }
                            break;
                    }
                });
            }

            if (
                this.responseFields !== null &&
                this.responseFields[info.fieldId] &&
                this.responseFields[info.fieldId][0] !== null
            ) {
                formGroups[info.fieldId] = new FormControl(this.responseFields[info.fieldId][0], validators);
            } else {
                formGroups[info.fieldId] = new FormControl('', validators);
            }

            if (
                (info.displayConfig.type === 'MULTI_SELECT' || info.displayConfig.type === 'FILE') &&
                this.responseFields !== null &&
                this.responseFields[info.fieldId] &&
                this.responseFields[info.fieldId][0] !== null
            ) {
                formGroups[info.fieldId] = new FormControl(this.responseFields[info.fieldId], validators);
            }
        });
        this.customizationInfoForm = this.formBuilder.group(formGroups);
        this.editCustomizationInfo = this.formEditMode;
    }

    getInfoName(str: string) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }

    saveCustomizationForm() {
        this.analyticsService.trackEvent('Save Button Click', {
            Origin: 'Customization Field Form',
            Action: 'Save button clicked'
        });
        const formDataValues = this.customizationInfoForm.value;
        const payload = [];
        let temp = { fieldId: '', value: [] };
        this.infoData.forEach(info => {
            // Reset Temp field
            temp = { fieldId: '', value: [] };
            temp.fieldId = info.fieldId;

            if (info.displayConfig.type === 'MULTI_SELECT' || info.displayConfig.type === 'FILE') {
                if (formDataValues[info.fieldId] === '') {
                    temp.value.push(formDataValues[info.fieldId] as string);
                } else {
                    temp.value = formDataValues[info.fieldId];
                }
            } else {
                temp.value.push(formDataValues[info.fieldId] as string);
            }

            payload.push(temp);
        });

        // Hard delete removed files during edit on save
        this.deleteFiles();
        this.onCustomizationValueChange.emit(payload);
        this.showCustomizationInfoBlock();
    }

    public showSaveCustomizationInfoForm() {
        this.analyticsService.trackEvent('Edit Button Click', {
            Origin: 'Customization Field',
            Action: 'Edit button clicked'
        });
        this.editCustomizationInfo = true;
    }

    showCustomizationInfoBlock() {
        this.analyticsService.trackEvent('Cancel Button Click', {
            Origin: 'Customization Field Form',
            Action: 'Cancel button clicked'
        });
        this.filesToBeRemoved = [];
        this.setFormGroup();
        this.editCustomizationInfo = false;
        this.onShowCustomizationValueChange.emit(this.editCustomizationInfo);
    }

    getFieldWithFieldId(fieldId: string) {
        const index = this.infoData.findIndex(item => item.fieldId === fieldId);
        if (index > -1) {
            return this.infoData[index];
        } else {
            return undefined;
        }
    }

    deleteFile(file) {
        this.commonServices.removeFile(file.id, file.fileName[0]).subscribe(
            response => {
                if (response['status'] === 'SUCCESS') {
                    this.filesToBeRemoved = [];
                }
            },
            error => {
                this.filesToBeRemoved = [];
            }
        );
    }

    deleteFiles() {
        const promises = [];
        if (this.filesToBeRemoved.length > 0) {
            this.filesToBeRemoved.forEach(item => {
                promises.push(this.deleteFile(item));
            });
            return forkJoin(promises);
        }
    }
}
