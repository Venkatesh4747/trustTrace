import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MultiIndustryService } from '../../multi-industry-support/multi-industry.service';
import { CommonServices } from './../../commonServices/common.service';
import { LocalizationService } from './../../utils/localization.service';

@Component({
    selector: 'app-additional-information',
    templateUrl: './additional-information.component.html',
    styleUrls: ['./additional-information.component.scss']
})
export class AdditionalInformationComponent implements OnInit {
    @Input() entityId;
    @Input() entity;
    @Input() entityData;
    @Input() fieldResponse;
    @Input() showTitle: boolean = true;
    @Output() saveAdditionalInfo = new EventEmitter();
    @Input() canShowEditIcon = true;

    editCustomizationInfo = false;
    fetchingMasterData = true;
    commonMasterDataKeys = ['COUNTRY', 'REGION'];
    foodMasterDataKeys = ['PRODUCT_INGREDIENT', 'PRODUCTION_METHOD'];

    get isFoodIndustry(): boolean {
        return this.multiIndustryService.industry === 'food';
    }

    get masterDataKeys(): string[] {
        if (this.isFoodIndustry) {
            return this.commonMasterDataKeys.concat(this.foodMasterDataKeys);
        } else {
            return this.commonMasterDataKeys;
        }
    }

    constructor(
        private commonServices: CommonServices,
        private localizationService: LocalizationService,
        private multiIndustryService: MultiIndustryService
    ) {}

    ngOnInit(): void {
        this.commonServices.getMasterData(this.masterDataKeys, this.isFoodIndustry).subscribe(
            data => {
                this.localizationService.addToMasterData(data.masterData);
                this.fetchingMasterData = false;
            },
            () => {
                this.fetchingMasterData = false;
            }
        );
    }

    onValueChange(data: any): void {
        const payload = {
            entity: '',
            entityId: '',
            responseData: []
        };
        payload.entity = this.entity;
        payload.entityId = this.entityId;
        payload.responseData = data;
        if (this.saveAdditionalInfo) {
            this.saveAdditionalInfo.emit(payload);
        }
    }
}
