import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { BomLiteService } from './../bom-lite.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CommonServices } from '../../../shared/commonServices/common.service';

@Component({
    selector: 'app-bom-detail-view',
    templateUrl: './bom-detail-view.component.html',
    styleUrls: ['./bom-detail-view.component.scss']
})
export class BomDetailViewComponent implements OnInit {
    env = environment;

    tabs = ['Basic Information'];

    id: string;
    selectedTab = this.tabs[0];
    entity = 'BOM'; // 'ML', 'SUPPLIER'
    viewPage = 'BOM_VIEW'; // 'ML_VIEW', 'SUPPLIER_VIEW'
    viewType = 'FORM'; // 'FORM', 'TABLE', 'CARD'

    pageLoading = true;
    isFetchingAdditionalInfo = true;

    additionalInfo: any;
    payload: any;
    fieldResponse: any;
    dataInfo: any;
    parameters: any;
    bomDetail: any;

    queryParams = { params: { tab: this.tabs[0] } };

    constructor(
        private commonServices: CommonServices,
        private toastr: CustomToastrService,
        private route: ActivatedRoute,
        private router: Router,
        private bomLiteService: BomLiteService,
        public localizationService: LocalizationService
    ) {
        this.route.params.subscribe(params => (this.id = params['bomId']));

        this.route.queryParams.pipe(filter(params => params.tab)).subscribe(params => {
            this.parameters = params;
        });
        if (this.router.url.includes('?')) {
            this.queryParams['returnUrl'] = this.router.url.split('?')[0];
        } else {
            this.queryParams['returnUrl'] = this.router.url;
        }
    }

    ngOnInit() {
        this.resetPayload();
        forkJoin([
            this.bomLiteService.getBOMDetail(this.id),
            this.commonServices.getCustomFieldInfo(this.payload)
        ]).subscribe(
            response => {
                this.localizationService.addToMasterData(response[0]['data']['masterData']);
                const bomData = response[0]['data']['bom_data'];
                const additionalInfoData = response[1]['customFieldUITemplateAggResponseMap'];
                this.processBOMDetail(bomData);
                this.processAdditionalInfoTabs(additionalInfoData);
                if (this.parameters && this.tabs.indexOf(this.parameters.tab) !== -1) {
                    const paramIndex = this.tabs.indexOf(this.parameters.tab);
                    this.selectedTab = this.tabs[paramIndex];
                } else {
                    this.selectedTab = this.tabs[0];
                }
                this.resetPayload();
                this.handleTabClick(this.selectedTab);
            },
            () => {
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
                this.resetPayload();
            }
        );
    }

    resetPayload() {
        const temp = {
            entity: this.entity,
            viewPage: this.viewPage,
            viewType: this.viewType,
            entityId: this.id
        };
        this.payload = Object.assign({}, temp);
    }

    processBOMDetail(data: any) {
        const bomData = JSON.parse(JSON.stringify(data));
        this.bomDetail = {};
        const bomDataKeys = Object.keys(bomData);
        bomDataKeys.forEach(keyItem => {
            if (
                typeof bomData[keyItem] === 'string' ||
                Number.isFinite(bomData[keyItem]) ||
                bomData[keyItem] === null ||
                Array.isArray(bomData[keyItem])
            ) {
                this.bomDetail[keyItem] = bomData[keyItem];
            } else if (typeof bomData[keyItem] === 'object') {
                let id = '';

                // Process Yield Value
                if (bomData[keyItem]['value']) {
                    id = 'Yield Value';
                    this.bomDetail[id] = bomData[keyItem]['value'];
                }

                // Process Yield UOM
                if (bomData[keyItem]['yieldUoM']) {
                    id = 'Yield UOM';
                    let value = [];
                    let tempVal = '';

                    if (bomData[keyItem]['yieldUoM']['width']) {
                        tempVal = `${bomData[keyItem]['yieldUoM']['width']} ${this.localizationService.getDisplayText(
                            bomData[keyItem]['yieldUoM']['widthUnit']
                        )}`;
                        value.push(tempVal);
                    }
                    if (bomData[keyItem]['yieldUoM']['length']) {
                        tempVal = `${bomData[keyItem]['yieldUoM']['length']} ${this.localizationService.getDisplayText(
                            bomData[keyItem]['yieldUoM']['lengthUnit']
                        )}`;
                        value.push(tempVal);
                    }
                    if (bomData[keyItem]['yieldUoM']['quantity']) {
                        tempVal = `${
                            bomData[keyItem]['yieldUoM']['quantity']
                        } ${this.localizationService.getDisplayText(bomData[keyItem]['yieldUoM']['quantityUnit'])}`;
                        value.push(tempVal);
                    }
                    if (bomData[keyItem]['yieldUoM']['weight']) {
                        tempVal = `${bomData[keyItem]['yieldUoM']['weight']} ${this.localizationService.getDisplayText(
                            bomData[keyItem]['yieldUoM']['weightUnit']
                        )}`;
                        value.push(tempVal);
                    }
                    if (bomData[keyItem]['yieldUoM']['thickness']) {
                        tempVal = `${
                            bomData[keyItem]['yieldUoM']['thickness']
                        } ${this.localizationService.getDisplayText(bomData[keyItem]['yieldUoM']['thicknessUnit'])}`;
                        value.push(tempVal);
                    }
                    this.bomDetail[id] = value.join(' X ');
                }
            }
        });
        this.pageLoading = false;
    }

    processAdditionalInfoTabs(data: any) {
        if (data !== null) {
            Object.keys(data).forEach(key => {
                this.tabs.push(key);
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
        this.resetPayload();
        this.isFetchingAdditionalInfo = true;
        this.payload['tabs'] = [option];

        // In case of Additional Information tab, need to send empty string
        if (option === 'Additional Information') {
            this.payload['tabs'] = [];
        }

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

    handleTabClick(option) {
        this.selectedTab = option;
        switch (option) {
            case this.tabs[0]:
                break;
            default:
                this.getAdditionalInfo(option);
                break;
        }
        if (this.router.url.split('?')[1] !== 'back=true') {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                    tab: option
                }
            });
        }
    }

    goBack() {
        this.commonServices.goBack(['/', 'bom-lite']);
    }

    getFieldType(value: any): string {
        if (!value || value === null) {
            return 'Text';
        } else if (Number.isFinite(value)) {
            return 'Number';
        } else if (Array.isArray(value)) {
            return 'Array';
        } else if (typeof value === 'object') {
            return 'Object';
        } else {
            return 'Text';
        }
    }
}
