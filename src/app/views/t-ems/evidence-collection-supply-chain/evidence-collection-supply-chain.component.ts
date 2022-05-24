import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { TEmsService } from '../t-ems.service';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { first } from 'rxjs/operators';
import { ContextService } from '../../../shared/context.service';

@Component({
    selector: 'app-evidence-collection-supply-chain',
    templateUrl: './evidence-collection-supply-chain.component.html',
    styleUrls: ['./evidence-collection-supply-chain.component.scss']
})
export class EvidenceCollectionSupplyChainComponent implements OnInit {
    pageLoading = false;

    trId = '';
    selectedEntity = '';
    supplyChainData: any;

    ANALYTICS_EVENT_T_EMS__NEW_REQ_SUPPLY_CHAIN = 'T-EMS New-Request Supply-Chain';

    constructor(
        public commonServices: CommonServices,
        private route: ActivatedRoute,
        private toastr: CustomToastrService,
        private router: Router,
        private trService: TEmsService,
        private analyticsService: AnalyticsService,
        private appContext: ContextService
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.trId = params['trId'];
            this.trService.getSupplyChainForproductEvidence(this.trId).subscribe(response => {
                this.supplyChainData = JSON.parse(JSON.stringify(response));
                if (this.supplyChainData.data['supply-chain'].length > 0) {
                    this.selectedEntity = this.supplyChainData.data['supply-chain'][0];
                }
            });
        });
    }

    onSubmit() {
        let request: Observable<any>;

        if (
            this.selectedEntity['entity'].toLowerCase() === 'style' ||
            this.selectedEntity['entity'].toLowerCase() === 'material library'
        ) {
            request = this.trService.updateSupplyChainForStyleMaterialProductEvidence(this.trId);
        } else {
            request = this.trService.updateSupplyChainForTRProductEvidence(this.trId, this.selectedEntity['entityId']);
        }
        request.pipe(first()).subscribe(
            response => {
                this.toastr.success('T-EMS request has been launched to selected suppliers', 'Success');
                setTimeout(() => {
                    this.pageLoading = false;
                    this.appContext.cardViewRefresh.next(true);
                    this.router.navigate(['/', 't-ems']);
                }, 1000);
            },
            errorResponse => {
                this.toastr.error(
                    'Something went wrong! Please try again or contact support if the issue persists',
                    'Oops! Error'
                );
                this.pageLoading = false;
            }
        );
    }

    analyticsSubmitClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_EMS__NEW_REQ_SUPPLY_CHAIN + ' Submit#Clicked',
            analyticsOptions
        );
    }
}
