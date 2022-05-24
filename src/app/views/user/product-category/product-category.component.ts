import { environment } from './../../../../environments/environment';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { ElementRef, Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { ValueHolderDialogComponent } from '../../../shared/value-holder-dialog/value-holder-dialog.component';
import { STYLE_SETTING_STATUS } from '../settings/company/company-settings-const';
import { CompanySettingsService } from '../settings/company/company-settings.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-product-category',
    templateUrl: './product-category.component.html',
    styleUrls: ['./product-category.component.scss']
})
export class ProductCategoryComponent implements OnInit {
    productCategoryForm: FormGroup;
    @Input() productCategories;
    pageLoading = false;
    isEditing = false;
    selectedProductGroupName = '';
    id = 'product-category-container';
    acceptedStringLength = environment.TRUNCATE_STRING_LENGTH;

    productGroupsList = {
        categoryName: '',
        size: [],
        fit: [],
        length: []
    };

    initialProductGroup = {};

    constructor(
        public dialog: MatDialog,
        private settingService: CompanySettingsService,
        private tosterService: CustomToastrService,
        private commonServices: CommonServices,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.resetForm();
    }

    setProductGroup() {
        return this.fb.group({
            id: '',
            groupName: '',
            size: this.fb.array([{ id: '', value: '' }]),
            fit: this.fb.array([{ id: '', value: '' }]),
            length: this.fb.array([{ id: '', value: '' }])
        });
    }

    get productGroups(): FormArray {
        return this.productCategoryForm.get('productGroups') as FormArray;
    }

    openSettingsModal(event: MouseEvent, index: number, category: string) {
        const target = new ElementRef(event.currentTarget);
        const inputVal = this.productCategoryForm.value.productGroups[index][category];
        const dialogRef = this.dialog.open(ValueHolderDialogComponent, {
            width: '250px',
            data: { inputs: inputVal, trigger: target, data_cy: category }
        });

        dialogRef.afterClosed().subscribe(result => {
            let values = {
                id: '',
                value: ''
            };
            if (inputVal.length > 0) {
                values = inputVal.map(obj => obj).filter(val => val.value !== '');
                this.productCategoryForm.value.productGroups[index][category] = values;
            }
        });
    }

    removeProductGroup(index) {
        const control = <FormArray>this.productCategoryForm.controls.productGroups;
        control.removeAt(index);
        if (this.productCategoryForm.value.productGroups.length === 0) {
            this.resetForm();
        }
    }

    addProductGroup() {
        this.productGroups.push(this.setProductGroup());
    }

    editProductCategory(categoryIndex) {
        const confirmEditDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Edit',
                msg:
                    'Editing this setting will affect areas where it was previously used. Are you sure you want to edit?',
                primaryButton: 'No',
                secondaryButton: 'Yes'
            }
        });
        confirmEditDialog.afterClosed().subscribe(response => {
            if (response) {
                const responseArray = response.split(',');
                if (responseArray[0] === 'Yes') {
                    this.isEditing = true;

                    // Initialising the productCategoryForm
                    this.productCategoryForm = this.fb.group({
                        categoryName: new FormControl('', Validators.required),
                        id: '',
                        status: '',
                        productGroups: this.fb.array([])
                    });

                    this.productCategoryForm
                        .get('categoryName')
                        .setValue(this.productCategories[categoryIndex].categoryName);
                    this.productCategoryForm.get('id').setValue(this.productCategories[categoryIndex].id);
                    this.productCategoryForm.get('status').setValue(this.productCategories[categoryIndex].status);

                    if (this.productCategories[categoryIndex].productGroups.length <= 0) {
                        (this.productCategoryForm.get('productGroups') as FormArray).push(this.setProductGroup());
                    } else {
                        this.productCategories[categoryIndex].productGroups.forEach(pg => {
                            (this.productCategoryForm.get('productGroups') as FormArray).push(
                                this.fb.group({
                                    id: pg.id,
                                    groupName: pg.groupName,
                                    size: this.fb.array(pg.size),
                                    fit: this.fb.array(pg.fit),
                                    length: this.fb.array(pg.length)
                                })
                            );
                        });
                    }
                    this.commonServices.scrollToElement(this.id);
                }
            }
        });
    }

    removeProductCategory(category) {
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
                    const index = this.productCategories.findIndex(el => el.id === category.id);
                    this.productCategories[index].status = STYLE_SETTING_STATUS.IN_ACTIVE;
                    this.saveCurrentProductCategories();
                }
            }
        });
    }

    validateDuplicateEntry(editableProductCategory) {
        const productGroupObjects = editableProductCategory.productGroups;
        for (const categoryObject of this.productCategories) {
            if (
                categoryObject.status === STYLE_SETTING_STATUS.ACTIVE &&
                editableProductCategory.id !== categoryObject.id
            ) {
                const hasDuplicate: Boolean =
                    editableProductCategory.categoryName.toLowerCase() === categoryObject.categoryName.toLowerCase();
                if (hasDuplicate) {
                    this.tosterService.error('This Category Name already exits, Please enter other name', 'failed');
                    return;
                }
            }
        }
        let hasDuplicate = false;
        editableProductCategory.productGroups
            .map(groupObj => groupObj.groupName)
            .sort()
            .sort((a, b) => {
                if (a === b) {
                    hasDuplicate = true;
                }
            });

        if (hasDuplicate) {
            this.tosterService.error('This Product Group name already exists, Please enter other name', 'failed');
            return;
        }
        hasDuplicate = false;
        for (const groupObj of productGroupObjects) {
            groupObj.size
                .map(sizeObj => sizeObj.value)
                .sort()
                .sort((a, b) => {
                    if (a === b) {
                        hasDuplicate = true;
                    }
                });
            if (hasDuplicate) {
                this.tosterService.error('This size already exits, Please enter other size', 'failed');
                return;
            }
            groupObj.fit
                .map(fitObj => fitObj.value)
                .sort()
                .sort((a, b) => {
                    if (a === b) {
                        hasDuplicate = true;
                    }
                });
            if (hasDuplicate) {
                this.tosterService.error('This fit already exits, Please enter other fit', 'failed');
                return;
            }
            groupObj.length
                .map(lengthObj => lengthObj.value)
                .sort()
                .sort((a, b) => {
                    if (a === b) {
                        hasDuplicate = true;
                    }
                });
            if (hasDuplicate) {
                this.tosterService.error('This length already exits, Please enter other length', 'failed');
                return;
            }
        }
        return true;
    }

    saveProductGroup(editableProductCategory) {
        if (this.validateDuplicateEntry(editableProductCategory)) {
            if (editableProductCategory.id.length > 0) {
                // update
                this.productCategories.forEach((element, index) => {
                    if (element.id === editableProductCategory.id) {
                        this.productCategories[index] = editableProductCategory;
                    }
                });
            } else {
                this.productCategories.push(editableProductCategory);
            }
            this.saveCurrentProductCategories();
        }
    }

    saveCurrentProductCategories() {
        this.pageLoading = true;
        this.settingService.saveProductCategory(this.productCategories).subscribe(resp => {
            this.productCategories = resp.data.data.styleSettings.productCategories;
            this.resetForm();
            this.tosterService.success('Product category has been saved');
            this.pageLoading = false;
            this.isEditing = false;
        });
    }

    getAllDisplayText(payloadObj, truncate = true) {
        if (payloadObj) {
            let result = payloadObj.map(obj => obj.value).filter(value => value !== '');
            result = result.join(',');
            return result;
        }
    }

    resetForm() {
        this.productCategoryForm = this.fb.group({
            categoryName: new FormControl('', Validators.required),
            id: '',
            status: '',
            productGroups: this.fb.array([this.setProductGroup()])
        });
    }
}
