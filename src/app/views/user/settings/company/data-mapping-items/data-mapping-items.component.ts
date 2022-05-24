import { LocalizationService } from './../../../../../shared/utils/localization.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../../../../core/user/auth.service';
import { CompanySettingsService } from '../company-settings.service';

@Component({
    selector: 'app-data-mapping-items',
    templateUrl: './data-mapping-items.component.html',
    styleUrls: ['./data-mapping-items.component.scss']
})
export class DataMappingItemsComponent implements OnInit {
    isFetchingDataMapping: boolean = true;

    companyId: string;

    dataMappingItems: any;
    pendingDataMappingItems: any;

    divisions: any = [
        {
            key: 'MATERIAL',
            value: 'Material'
        },
        {
            key: 'DENSITY_UNIT',
            value: 'Unit'
        },
        {
            key: 'PRODUCT',
            value: 'Product'
        }
    ];

    constructor(
        private csService: CompanySettingsService,
        private auth: AuthService,
        private localizationService: LocalizationService
    ) {}

    ngOnInit() {
        this.companyId = this.auth.user.companyId;
        this.fetchDataMappingItems(this.divisions[0]);
    }

    fetchDataMappingItems(division: any) {
        this.isFetchingDataMapping = true;
        this.csService.getDataMappingItems(division.key).subscribe(response => {
            const data = response['data'];
            this.localizationService.addToMasterData(data['masterData']);
            this.dataMappingItems = JSON.parse(JSON.stringify(data['masterDataAlias']));
            this.pendingDataMappingItems = JSON.parse(JSON.stringify(data['masterDataAliasPendingList']));
            this.isFetchingDataMapping = false;
        });
    }
}
