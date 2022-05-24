import { CommonServices } from './../../../../../shared/commonServices/common.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../../../../core/user/auth.service';
import { CompanySettingsService } from '../company-settings.service';
import { CustomToastrService } from '../../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-filter-criteria-items',
    templateUrl: './filter-criteria-items.component.html',
    styleUrls: ['./filter-criteria-items.component.scss']
})
export class FilterCriteriaItemsComponent implements OnInit {
    pageLoading: boolean = true;
    isFetchingAdditionalInfo = false;

    companyId: string;
    selectedPanel: string;

    filterCriteriaItems: any;
    divisionItems: any;
    payload: any;
    fieldResponse: any;
    additionalInfo: any;
    dataInfo: any;

    // divisions: string[] = ['Apparel', 'Footwear', 'Accessories & Gears'];

    divisions: string[] = [];

    entity = 'COMPANY_SETTINGS';
    viewPage = 'COMPANY_SETTINGS_VIEW';
    viewType = 'FORM';

    constructor(
        private csService: CompanySettingsService,
        private auth: AuthService,
        private commonServices: CommonServices,
        private toastr: CustomToastrService
    ) {}

    ngOnInit() {
        this.companyId = this.auth.user.companyId;
        // this.fetchFilterCriteriaItems();

        this.resetPayload();
        this.payload['groupOnly'] = true;

        this.commonServices.getCustomFieldInfo(this.payload).subscribe(response => {
            const additionalInfoData = response['customFieldUITemplateAggResponseMap'];
            this.processAdditionalInfoTabs(additionalInfoData);
        });
    }

    resetPayload() {
        const temp = {
            entity: this.entity,
            viewPage: this.viewPage,
            viewType: this.viewType,
            entityId: this.companyId
        };
        this.payload = Object.assign({}, temp);
    }

    processAdditionalInfoTabs(data: any) {
        if (data !== null) {
            Object.keys(data).forEach(key => {
                this.divisions.push(key);
            });
        }
        this.pageLoading = false;
    }

    processAdditionalInfo(data: any) {
        this.additionalInfo = data;
        this.dataInfo = JSON.parse(JSON.stringify(data));
        this.pageLoading = false;
    }

    getAdditionalInfo(option: string) {
        this.selectedPanel = option;
        this.resetPayload();
        this.payload['tabs'] = [option];
        this.isFetchingAdditionalInfo = true;

        this.commonServices.getCustomFieldInfo(this.payload).subscribe(
            data => {
                this.processAdditionalInfo(data['customFieldUITemplateAggResponseMap'][option]);
                this.fieldResponse = data['fieldResponse'];
                this.resetPayload();
                this.isFetchingAdditionalInfo = false;
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
                this.isFetchingAdditionalInfo = false;
            }
        );
    }

    onSaveAdditionalInfo(payload: any) {
        this.isFetchingAdditionalInfo = true;
        this.commonServices.updateCustomFieldInfo(this.entity, this.companyId, payload.responseData).subscribe(
            data => {
                this.toastr.success('Information has been saved successfully.', 'Success');
                this.getAdditionalInfo(this.selectedPanel);
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
                this.isFetchingAdditionalInfo = false;
            }
        );
    }

    fetchFilterCriteriaItems() {
        this.pageLoading = true;
        this.csService.getFilterCriteriaItems(this.companyId).subscribe(response => {
            this.filterCriteriaItems = JSON.parse(JSON.stringify(response['data']));
            this.processFilterCriteriaItems();
        });
    }

    processFilterCriteriaItems() {
        this.divisionItems = {
            Apparel: [],
            Footwear: [],
            'Accessories & Gears': []
        };

        this.divisionItems['Apparel'] = this.filterCriteriaItems.filter(
            (item: any) => item.division.desc === this.divisions[0]
        );
        this.divisionItems['Footwear'] = this.filterCriteriaItems.filter(
            (item: any) => item.division.desc === this.divisions[1]
        );
        this.divisionItems['Accessories & Gears'] = this.filterCriteriaItems.filter(
            (item: any) => item.division.desc === this.divisions[2]
        );

        this.pageLoading = false;
    }
}
