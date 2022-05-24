import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { MaterialsLiteService } from './../materials-lite.service';

@Component({
    selector: 'app-material-detail-view',
    templateUrl: './material-detail-view.component.html',
    styleUrls: ['./material-detail-view.component.scss']
})
export class MaterialDetailViewComponent implements OnInit {
    env = environment;

    tabs = ['Basic Information'];

    id: string;
    selectedTab = this.tabs[0];
    entity = 'ML'; // 'ML', 'SUPPLIER'
    viewPage = 'ML_VIEW'; // 'ML_VIEW', 'SUPPLIER_VIEW'
    viewType = 'FORM'; // 'FORM', 'TABLE', 'CARD'

    pageLoading = true;
    isFetchingAdditionalInfo = false;

    additionalInfo: any;
    payload: any;
    fieldResponse: any;
    dataInfo: any;
    parameters: any;
    materialDetail: any;

    queryParams = { params: { tab: this.tabs[0] } };

    constructor(
        private commonServices: CommonServices,
        private toastr: CustomToastrService,
        private route: ActivatedRoute,
        private router: Router,
        private materialLiteService: MaterialsLiteService,
        public localizationService: LocalizationService
    ) {
        this.route.params.subscribe(params => (this.id = params['materialId']));

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
            this.materialLiteService.getMaterialDetail(this.id),
            this.commonServices.getCustomFieldInfo(this.payload)
        ]).subscribe(
            response => {
                this.localizationService.addToMasterData(response[0]['data']['masterData']);
                const materialData = response[0]['data']['material_library'];
                const additionalInfoData = response[1]['customFieldUITemplateAggResponseMap'];
                this.processMaterialDetail(materialData);
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

    processMaterialDetail(data: any) {
        const materialData = JSON.parse(JSON.stringify(data));
        this.materialDetail = {};
        const materialDataKeys = Object.keys(materialData);
        materialDataKeys.forEach(keyItem => {
            if (
                typeof materialData[keyItem] === 'string' ||
                Number.isFinite(materialData[keyItem]) ||
                materialData[keyItem] === null ||
                Array.isArray(materialData[keyItem])
            ) {
                this.materialDetail[keyItem] = materialData[keyItem];
            } else if (typeof materialData[keyItem] === 'object') {
                let id = '';

                // Process Material Composition
                if (materialData[keyItem]['materialsComposition']) {
                    id = `${keyItem} - Material Composition`;
                    this.materialDetail[id] = materialData[keyItem]['materialsComposition'];
                }

                // Process Material Weight
                if (materialData[keyItem]['density']) {
                    id = `${keyItem} - Weight`;
                    let value = `${materialData[keyItem]['density']['value']} ${this.localizationService.getDisplayText(
                        materialData[keyItem]['density']['unit']
                    )}`;
                    this.materialDetail[id] = value;
                }

                // Process Material construction
                if (materialData[keyItem]['construction']) {
                    id = `${keyItem} - Construction`;
                    this.materialDetail[id] = materialData[keyItem]['construction'];
                }
            }
        });
        // this.materialDetail = JSON.parse(JSON.stringify(data));
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
        this.commonServices.goBack(['/', 'materials-lite']);
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
