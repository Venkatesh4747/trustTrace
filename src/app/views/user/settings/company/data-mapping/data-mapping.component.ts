import { CommonServices } from './../../../../../shared/commonServices/common.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LocalizationService } from './../../../../../shared/utils/localization.service';
import { CompanySettingsService } from './../company-settings.service';
import { CustomToastrService } from '../../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-data-mapping',
    templateUrl: './data-mapping.component.html',
    styleUrls: ['./data-mapping.component.scss']
})
export class DataMappingComponent implements OnInit {
    @Input() dataMappingItems: any;
    @Input() pendingDataMappingItems: any;
    @Input() division: any;
    @Input() config = [];
    @Input() companyId: string;

    isEditable: boolean = false;
    showEditIcon: boolean = true;
    isFetchingDataMappingItems: boolean = false;
    isSaving: boolean = false;
    fetchingMasterData: boolean = false;

    dataMappingForm: FormGroup = new FormGroup({});

    constructor(
        private formBuilder: FormBuilder,
        private csService: CompanySettingsService,
        private toastr: CustomToastrService,
        public localizationService: LocalizationService,
        private commonServices: CommonServices
    ) {}

    ngOnInit() {}

    resetForm() {
        this.isEditable = false;
        this.dataMappingItems = undefined;
        this.pendingDataMappingItems = undefined;
    }

    getConfig() {
        this.config = [];
        this.fetchingMasterData = true;

        this.commonServices.getMasterData([this.division.key]).subscribe(
            data => {
                const temp = JSON.parse(JSON.stringify(data.masterData));
                const keys = Object.keys(temp);
                let masterItem = {};
                keys.forEach(item => {
                    masterItem = {};
                    masterItem['key'] = item;
                    masterItem['value'] = temp[item]['value'];
                    this.config.push(masterItem);
                });
                this.fetchingMasterData = false;
            },
            failResponse => {
                this.fetchingMasterData = false;
            }
        );
    }

    createFormGroup() {
        const formGroups = {};

        this.pendingDataMappingItems.forEach((item: any) => {
            item['ttMasterKey'] = !item['ttMasterKey'] ? '' : item['ttMasterKey'];
            formGroups[item.id] = new FormControl(item.ttMasterKey);
        });

        this.dataMappingForm = this.formBuilder.group(formGroups);
    }

    handleEditClick() {
        this.createFormGroup();
        this.isEditable = true;
        this.getConfig();
    }

    trackById(index: string, item: any) {
        return item.id;
    }

    cancelEditMode() {
        this.createFormGroup();
        this.isEditable = false;
    }

    setFormValuesToPayload() {
        const formValues = this.dataMappingForm.value;

        this.pendingDataMappingItems.forEach((item: any) => {
            item['ttMasterKey'] = formValues[item.id];
        });
    }

    handleOptionSelection(index: number) {
        this.pendingDataMappingItems[index].status = 'MAPPED';
    }

    fetchDataMappingItems() {
        this.isFetchingDataMappingItems = true;
        this.resetForm();

        this.csService.getDataMappingItems(this.division.key).subscribe(response => {
            const data = response['data'];
            this.localizationService.addToMasterData(data['masterData']);
            this.dataMappingItems = JSON.parse(JSON.stringify(data['masterDataAlias']));
            this.pendingDataMappingItems = JSON.parse(JSON.stringify(data['masterDataAliasPendingList']));
            this.createFormGroup();
            this.isFetchingDataMappingItems = false;
        });
    }

    saveDataMapping() {
        this.isSaving = true;
        this.setFormValuesToPayload();
        const payload = this.pendingDataMappingItems.filter(item => item.status === 'MAPPED');
        this.csService.updateDataMappingItems(this.division.key, payload).subscribe(
            response => {
                this.isSaving = false;
                this.isEditable = false;
                this.fetchDataMappingItems();
            },
            failResponse => {
                this.isSaving = false;
                this.toastr.error('Something went wrong. Please try after sometime.', 'Error');
            }
        );
    }
}
