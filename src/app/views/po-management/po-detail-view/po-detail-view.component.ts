import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../../environments/environment';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { PoManagementService } from '../po-management.service';
import { LocalizationService } from './../../../shared/utils/localization.service';

@Component({
    selector: 'app-po-detail-view',
    templateUrl: './po-detail-view.component.html',
    styleUrls: ['./po-detail-view.component.scss']
})
export class PoDetailViewComponent implements OnInit {
    env = environment;

    tabs = ['Basic Information'];

    id: string;
    styleId: string;
    selectedTab = this.tabs[0];
    entity = 'PO'; // 'ML', 'SUPPLIER'
    viewPage = 'PO_VIEW'; // 'ML_VIEW', 'SUPPLIER_VIEW'
    viewType = 'FORM'; // 'FORM', 'TABLE', 'CARD'

    pageLoading = true;
    isFetchingAdditionalInfo = false;

    additionalInfo: any;
    payload: any;
    fieldResponse: any;
    dataInfo: any;
    parameters: any;
    poDetail: any;

    queryParams = { params: { tab: this.tabs[0] } };

    constructor(
        private commonServices: CommonServices,
        private toastr: CustomToastrService,
        private route: ActivatedRoute,
        private router: Router,
        private poService: PoManagementService,
        public localizationService: LocalizationService
    ) {
        this.route.params.subscribe(params => {
            this.id = params['poId'];
            this.styleId = params['styleId'];
        });

        this.route.queryParams.subscribe(queryParams => {
            this.parameters = queryParams;
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
            this.poService.getPODetail(this.id, this.styleId),
            this.commonServices.getCustomFieldInfo(this.payload)
        ]).subscribe(
            response => {
                const poData = response[0]['data'];
                const additionalInfoData = response[1]['customFieldUITemplateAggResponseMap'];
                this.processPODetail(poData);
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

    resetPayload(): void {
        const temp = {
            entity: this.entity,
            viewPage: this.viewPage,
            viewType: this.viewType,
            entityId: this.id
        };
        this.payload = Object.assign({}, temp);
    }

    processPODetail(data: any): void {
        this.poDetail = JSON.parse(JSON.stringify(data));
        this.pageLoading = false;
    }

    processAdditionalInfoTabs(data: any): void {
        if (data !== null) {
            Object.keys(data).forEach(key => {
                this.tabs.push(key);
            });
        }
        this.pageLoading = false;
    }

    processAdditionalInfo(data: any): void {
        this.additionalInfo = data;
        this.dataInfo = JSON.parse(JSON.stringify(data));
        this.pageLoading = false;
    }

    getAdditionalInfo(option: string): void {
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

    handleTabClick(option): void {
        this.selectedTab = option;

        if (option !== this.tabs[0]) {
            this.getAdditionalInfo(option);
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

    goBack(): void {
        this.commonServices.goBack(['/', 'po-management']);
    }
}
