import { AnalyticsService } from './../../../../core/analytics/analytics.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from './../../../../../environments/environment';
import { UtilsService } from './../../../utils/utils.service';

@Component({
    selector: 'app-customization-info',
    templateUrl: './customization-info.component.html',
    styleUrls: ['./customization-info.component.scss']
})
export class CustomizationInfoComponent implements OnInit {
    @Input() customizationInfo;
    @Input() formMode;
    @Input() indexId;
    @Input() fieldResponse;
    @Output() customizationValueChange = new EventEmitter();
    @Input() canShowEditIcon = true;

    env = environment;
    editCustomizationInfo = this.formMode;

    displayType = {
        normal: 'NORMAL',
        compound: 'COMPOUND'
    };

    showEditIcon = true;

    get imgUrl(): (iconName: string) => string {
        return this.utilService.getcdnImage.bind(this.utilService);
    }

    constructor(private utilService: UtilsService, private analyticsService: AnalyticsService) {}

    ngOnInit() {
        this.showEditIcon = this.canShowEditIcon && this.checkIsEditableAtLeastOneField();
    }

    checkIsEditableAtLeastOneField(): boolean {
        const isEditable = this.customizationInfo.some((infoData: any) => infoData.displayConfig.editable);
        return isEditable;
    }

    trackById(index: string, info: any) {
        return info.fieldId;
    }

    saveCustomizationForm(payload: any) {
        this.customizationValueChange.emit(payload);
        this.editCustomizationInfo = false;
    }

    showCustomizationInfoBlock(editForm: boolean) {
        this.editCustomizationInfo = editForm;
    }

    showSaveCustomizationInfoForm() {
        this.analyticsService.trackEvent('Edit Button Click', {
            Origin: 'Customization Field',
            Action: 'Edit button clicked'
        });
        this.editCustomizationInfo = true;
    }

    getFieldWithFieldId(fieldId: string) {
        const index = this.customizationInfo.findIndex(item => item.fieldId === fieldId);
        if (index > -1) {
            return this.customizationInfo[index];
        } else {
            return undefined;
        }
    }
}
