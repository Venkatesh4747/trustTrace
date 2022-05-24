import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomToastrService } from '../../../../../shared/commonServices/custom-toastr.service';
import { CompanySettingsService } from './../company-settings.service';

@Component({
    selector: 'app-filter-criteria',
    templateUrl: './filter-criteria.component.html',
    styleUrls: ['./filter-criteria.component.scss']
})
export class FilterCriteriaComponent implements OnInit {
    @Input() filterCriteriaItems: any;
    @Input() companyId: string;
    @Input() division: string;

    isEditable: boolean = false;
    showEditIcon: boolean = true;
    isFetchingFilterCriteriaItems: boolean = false;
    isSaving: boolean = false;

    filterCriteriaForm: FormGroup = new FormGroup({});

    constructor(
        private formBuilder: FormBuilder,
        private csService: CompanySettingsService,
        private toastr: CustomToastrService
    ) {}

    ngOnInit() {}

    resetForm() {
        this.isEditable = false;
        this.filterCriteriaItems = undefined;
    }

    createFormGroup() {
        const formGroups = {};
        let validators = [];
        this.filterCriteriaItems.forEach((item: any) => {
            validators = [];

            if (item.display_config.value_type === 'NUMBER' && item.display_config.max) {
                validators.push(Validators.max(item.display_config.max));
            }

            if (item.filter_criteria.value && item.filter_criteria.value[0] !== null) {
                formGroups[item._id] =
                    item.display_config.value_type === 'MULTI_SELECT'
                        ? new FormControl(item.filter_criteria.value, validators)
                        : new FormControl(item.filter_criteria.value[0], validators);
            } else if (!item.filter_criteria.value || item.filter_criteria.value[0] === null) {
                formGroups[item._id] =
                    item.display_config.value_type === 'MULTI_SELECT'
                        ? new FormControl([], validators)
                        : new FormControl('', validators);
            }
        });
        this.filterCriteriaForm = this.formBuilder.group(formGroups);
    }

    handleEditClick() {
        this.createFormGroup();
        this.isEditable = true;
    }

    trackById(index: string, item: any) {
        return item._id;
    }

    cancelEditMode() {
        this.isEditable = false;
    }

    setFormValuesToPayload() {
        const formValues = this.filterCriteriaForm.value;
        this.filterCriteriaItems.forEach((item: any) => {
            if (Array.isArray(formValues[item._id])) {
                item.filter_criteria.value = formValues[item._id];
            } else {
                item.filter_criteria.value = [];
                item.filter_criteria.value.push(formValues[item._id]);
            }
        });
    }

    fetchFilterCriteriaItems() {
        this.isFetchingFilterCriteriaItems = true;
        this.resetForm();
        this.csService.getFilterCriteriaItems(this.companyId).subscribe(response => {
            const data = JSON.parse(JSON.stringify(response['data']));
            this.filterCriteriaItems = data.filter((item: any) => item.division.desc === this.division);
            this.createFormGroup();
            this.isFetchingFilterCriteriaItems = false;
        });
    }

    saveFilterCriteria() {
        this.isSaving = true;
        this.setFormValuesToPayload();
        this.csService.submitFilterCriteriaItems(this.companyId, this.filterCriteriaItems).subscribe(
            response => {
                this.isSaving = false;
                this.isEditable = false;
                this.fetchFilterCriteriaItems();
            },
            failResponse => {
                this.isSaving = false;
                this.toastr.error('Something went wrong. Please try after sometime.', 'Error');
            }
        );
    }
}
