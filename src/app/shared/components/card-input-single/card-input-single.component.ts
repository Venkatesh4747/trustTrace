import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { STYLE_SETTING_STATUS } from '../../../views/user/settings/company/company-settings-const';
import { CompanySettingsService } from '../../../views/user/settings/company/company-settings.service';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

@Component({
    selector: 'app-card-input-single',
    templateUrl: './card-input-single.component.html',
    styleUrls: ['./card-input-single.component.scss']
})
export class CardInputSingleComponent implements OnInit {
    @ViewChild('chipCardForm', { static: true }) private chipCardForm: NgForm;
    pageLoading = false;
    isEditing = false;
    @Input() placeholderText;
    @Input() hrTitle;
    @Input() cardData;
    @Input() sectionName;
    @Input() sectionKey;
    @Input() askEditConfirm: Boolean = false;
    @Input() askDeleteConfirm: Boolean = false;
    @Input() isCardDataStatusExists: Boolean = false;
    @Input() hideEditDeleteCondition = {};

    inputData = {
        id: '',
        value: ''
    };
    constructor(
        private settingService: CompanySettingsService,
        private tosterService: CustomToastrService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {}

    onSave(inputData) {
        // validate input
        if (this.validateDuplicateEntry(inputData)) {
            if (this.inputData.id.length > 0) {
                // should we
                // update
                this.cardData.forEach((element, index) => {
                    if (element.id === this.inputData.id) {
                        this.cardData[index] = this.inputData;
                    }
                });
            } else {
                const tmpInputs = this.inputData.value.split(',');
                if (tmpInputs && tmpInputs.length > 1) {
                    for (const input of tmpInputs) {
                        const tmpInpt = {
                            id: '',
                            value: input
                        };
                        this.cardData.push(tmpInpt);
                    }
                } else {
                    this.cardData.push(this.inputData);
                }
            }
            this.saveValues();
        }
    }
    validateDuplicateEntry(inputData) {
        for (const card of this.cardData) {
            if (card.status === STYLE_SETTING_STATUS.ACTIVE && card.id !== inputData.id) {
                const inputArray = inputData.value.split(',');
                for (let index = 0; index < inputArray.length; index++) {
                    const hasDuplicate: Boolean = inputArray[index].toLowerCase() === card.value.toLowerCase();
                    if (hasDuplicate) {
                        if (this.sectionName === 'seasons') {
                            this.tosterService.error(
                                'This seasons of product group already exits, Please enter other name',
                                'failed'
                            );
                            return;
                        }
                        if (this.sectionName === 'recurring_types') {
                            this.tosterService.error(
                                'This recurring Types of product group already exits, Please enter other name',
                                'failed'
                            );
                            return;
                        }
                        if (this.sectionName === 'sustainability_labels') {
                            this.tosterService.error(
                                'This sustainability Labels of product group already exits, Please enter other name',
                                'failed'
                            );
                            return;
                        }
                    }
                }
            }
        }
        return true;
    }
    saveValues() {
        this.pageLoading = true;
        this.settingService.saveKVSettings(this.cardData, this.sectionName).subscribe(resp => {
            this.cardData = resp.data.data.styleSettings[this.sectionKey];
            this.clearForm();
            this.chipCardForm.resetForm();
            this.pageLoading = false;
            this.tosterService.success('Success');
            this.isEditing = false;
        });
    }
    onEdit(index) {
        if (this.askEditConfirm) {
            const editDialog = this.dialog.open(ConfirmDialogComponent, {
                width: '500px',
                data: {
                    title: 'Edit',
                    msg:
                        'Editing this setting will affect areas where it was previously used. Are you sure you want to edit?',
                    primaryButton: 'No',
                    secondaryButton: 'Yes'
                }
            });
            editDialog.afterClosed().subscribe(response => {
                if (response) {
                    const responseArray = response.split(',');
                    if (responseArray[0] === 'Yes') {
                        this.isEditing = true;
                        this.inputData = Object.assign({}, this.cardData[index]);
                    }
                }
            });
        } else {
            this.isEditing = true;
            this.inputData = Object.assign({}, this.cardData[index]);
        }
    }

    onDelete(index) {
        if (this.askDeleteConfirm) {
            const colorDelDialog = this.dialog.open(ConfirmDialogComponent, {
                width: '500px',
                data: {
                    title: 'Delete?',
                    msg:
                        'You will no longer be able to use this company setting. Are you sure you want to delete this setting?',
                    primaryButton: 'No',
                    secondaryButton: 'Yes'
                }
            });
            colorDelDialog.afterClosed().subscribe(response => {
                if (response) {
                    const responseArray = response.split(',');
                    if (responseArray[0] === 'Yes') {
                        this.cardData[index].status = STYLE_SETTING_STATUS.IN_ACTIVE;
                        this.saveValues();
                    }
                }
            });
        } else {
            this.cardData.splice(index, 1);
            this.saveValues();
        }
    }

    clearForm() {
        this.isEditing = false;
        this.inputData = {
            id: '',
            value: ''
        };
    }
}
