import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { STYLE_SETTING_STATUS } from '../settings/company/company-settings-const';
import { CompanySettingsService } from '../settings/company/company-settings.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-color-specifications',
    templateUrl: './color-settings.component.html',
    styleUrls: ['./color-settings.component.scss']
})
export class ColorSettingsComponent implements OnInit {
    @ViewChild('productColorForm', { static: true }) private productColorForm: NgForm;
    @Input() colors;
    pageLoading = false;
    isEditing = false;
    inputData = {
        id: '',
        name: '',
        code: [
            {
                id: 'hex',
                value: ''
            }
        ]
    };
    activeColors = [];
    id = 'color-specifications';

    constructor(
        private settingService: CompanySettingsService,
        private tosterService: CustomToastrService,
        private confirmDialog: MatDialog,
        private commonServices: CommonServices
    ) {}

    ngOnInit() {}

    onSave(inputData) {
        if (this.validateDuplicateEntry(inputData)) {
            // validate input
            this.inputData.code[0].id = 'hex';
            if (this.inputData.id.length > 0) {
                // update
                this.colors.forEach((element, index) => {
                    if (element.id === this.inputData.id) {
                        this.colors[index] = this.inputData;
                    }
                });
            } else {
                this.colors.push(this.inputData);
            }
            this.saveColors();
        }
    }
    saveColors() {
        this.pageLoading = true;
        this.settingService.saveStyleColorSettings(this.colors).subscribe(resp => {
            this.colors = resp.data.data.styleSettings.colors;
            this.clearForm();
            this.productColorForm.resetForm();
            this.tosterService.success('Success');
        });
        this.pageLoading = false;
        this.isEditing = false;
    }

    clearForm() {
        this.inputData = {
            id: '',
            name: '',
            code: [
                {
                    id: '',
                    value: ''
                }
            ]
        };
    }
    validateDuplicateEntry(inputData) {
        for (const color of this.colors) {
            if (color.status === STYLE_SETTING_STATUS.ACTIVE && color.id !== inputData.id) {
                const hasDuplicate: Boolean = inputData.name.toLowerCase() === color.name.toLowerCase();
                if (hasDuplicate) {
                    this.tosterService.error('This color name already exits, Please enter other name', 'failed');
                    return;
                }
            }
        }
        return true;
    }
    onEdit(index) {
        const colorEditDialog = this.confirmDialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Edit',
                msg:
                    'Editing this setting will affect areas where it was previously used. Are you sure you want to edit?',
                primaryButton: 'No',
                secondaryButton: 'Yes'
            }
        });
        colorEditDialog.afterClosed().subscribe(response => {
            if (response) {
                const responseArray = response.split(',');
                if (responseArray[0] === 'Yes') {
                    this.isEditing = true;
                    this.inputData = Object.assign({}, this.colors[index]);
                    this.commonServices.scrollToElement(this.id);
                }
            }
        });
    }

    onDelete(index): void {
        const colorDelDialog = this.confirmDialog.open(ConfirmDialogComponent, {
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
                    this.colors[index].status = STYLE_SETTING_STATUS.IN_ACTIVE;
                    this.saveColors();
                }
            }
        });
    }
}
