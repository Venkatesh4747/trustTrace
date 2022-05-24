import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { TraceabilityRequestService } from '../traceability-request.service';
import { ReusableEntityComponent } from './reusable-entity/reusable-entity.component';

@Component({
    selector: 'app-reusable-supply-chain',
    templateUrl: './reusable-supply-chain.component.html',
    styleUrls: ['./reusable-supply-chain.component.scss']
})
export class ReusableSupplyChainComponent implements OnInit {
    supplyChainData: any;
    trId: string;
    dataProvider: string;
    pageLoading = false;

    selectAllCheckBox = false;

    ANALYTICS_EVENT_T_TRACE_SUPPLY_CHAIN_REUSE = 'T-Trace Supply-Chain-Reuse';

    @ViewChild(ReusableEntityComponent, { static: false }) reusableEntity: ReusableEntityComponent;
    constructor(
        private trs: TraceabilityRequestService,
        private route: ActivatedRoute,
        public localizationService: LocalizationService,
        public commonServices: CommonServices,
        private router: Router,
        private toastr: CustomToastrService,
        private authService: AuthService,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {
        this.pageLoading = true;
        // Combine them both into a single observable
        const urlParams = combineLatest([this.route.params, this.route.queryParams]).pipe(
            map(([params, queryParams]) => ({ ...params, ...queryParams }))
        );

        // Subscribe to the single observable, giving us both
        urlParams.subscribe(routeParams => {
            this.trId = routeParams['trId'];
            this.dataProvider = routeParams['dataProvider'];
            this.trs.getReusableSupplyChain(this.trId).subscribe(response => {
                const data = response['data'];
                this.supplyChainData = JSON.parse(JSON.stringify(data));
                if (!this.supplyChainData || Object.keys(this.supplyChainData).length === 0) {
                    this.navigateToNextPage();
                }
                this.pageLoading = false;
            });
        });
    }

    skip() {
        this.navigateToNextPage();
    }

    proceed() {
        this.pageLoading = true;
        this.trs
            .processReusableSupplyChain(this.reusableEntity.getReusedMaterialsWithSupplyChains(), this.trId)
            .subscribe(
                response => {
                    this.pageLoading = false;
                    this.navigateToNextPage();
                },
                fail_response => {
                    this.toastr.error('Trying to reuse selected Supply Chains.', 'Error');
                    this.pageLoading = false;
                }
            );
    }

    navigateToNextPage() {
        if (this.dataProvider === this.authService.companyId) {
            this.router.navigate(['/', 't-trace', 'product', 'supplychain', this.trId, 'edit']);
        } else {
            this.router.navigate(['/', 't-trace']);
        }
    }

    updateSelectAll(event) {
        if (event) {
            this.selectAllCheckBox = event.value;
        }
    }

    analyticsSkipClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_TRACE_SUPPLY_CHAIN_REUSE + ' Skip#Clicked',
            analyticsOptions
        );
    }

    analyticsProceedClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_TRACE_SUPPLY_CHAIN_REUSE + ' Proceed#Clicked',
            analyticsOptions
        );
    }
}
