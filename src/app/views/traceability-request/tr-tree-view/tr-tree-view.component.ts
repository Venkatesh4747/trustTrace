import { Component, OnInit, ElementRef, ViewChild, Renderer2, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { AuthService } from '../../../core';
import { ContextService } from '../../../shared/context.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { TraceabilityRequestService } from '../traceability-request.service';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-tr-tree-view',
    templateUrl: './tr-tree-view.component.html',
    styleUrls: ['./tr-tree-view.component.scss']
})
export class TrTreeViewComponent implements OnInit {
    @ViewChild('treeView') treeView: ElementRef;

    trId: string;
    supplyChainData: any;
    suppliers: any = [];
    isDownloading: boolean = false;

    screenshotEventEmitter: EventEmitter<any> = new EventEmitter();

    pageLoading = false;

    selectedArticleName;

    supplier_ids = [];

    get userData(): any {
        return this.authService.user;
    }

    constructor(
        private trs: TraceabilityRequestService,
        private route: ActivatedRoute,
        public commonService: CommonServices,
        private authService: AuthService,
        public localizationService: LocalizationService,
        private supplierService: SuppliersService,
        private appContext: ContextService,
        private router: Router,
        private analyticsService: AnalyticsService,
        private toastrService: CustomToastrService,
        private renderer: Renderer2
    ) {}

    ngOnInit() {
        this.onPageLoad();
    }

    onPageLoad(): void {
        this.pageLoading = true;

        const payload = {
            // filter: { SupplierVerificationStatus: [20] },
            sort: { sortBy: 'create_ts', sortOrder: 'desc' },
            pagination: { from: 0, size: 1000 }
        };

        this.route.params.subscribe(params => {
            this.trId = params['trId'];
            this.init(payload);
        });

        this.appContext.selectedArticleName.subscribe(articleName => {
            this.selectedArticleName = articleName;
        });
    }

    init(payload: any) {
        forkJoin([
            this.trs.getSupplyChainTreeData(this.trId),
            this.supplierService.getAllSuppliers(JSON.parse(JSON.stringify(payload)))
        ]).subscribe(
            response => {
                const data = response[0]['data'];

                this.localizationService.addToMasterData(data['masterData']);
                this.supplyChainData = Object.assign({}, JSON.parse(JSON.stringify(data['supplyChain'])));

                if (this.supplyChainData.metaData && this.supplyChainData.metaData.isAgentNode) {
                    this.supplyChainData = this.supplyChainData.productSupplyChainList[0];
                }

                this.suppliers = response[1]['data']['searchResponse'];

                this.supplyChainData.supplyChainArticle.supplierLink =
                    '/suppliers/' + this.supplyChainData.supplyChainArticle.supplierId;

                for (const supplier in this.suppliers) {
                    if (!this.suppliers.hasOwnProperty(supplier)) {
                        continue;
                    }

                    this.supplier_ids.push(this.suppliers[supplier].supplier_id);

                    if (
                        this.supplyChainData.hasOwnProperty('productSupplyChainList') &&
                        this.supplyChainData.productSupplyChainList.length > 0
                    ) {
                        this.assignSupplierLinks(this.supplyChainData.productSupplyChainList);
                    }
                }

                this.pageLoading = false;
            },
            errorResponse => {
                this.pageLoading = false;
                this.toastrService.error(
                    'We could not fetch data. Please try again after sometime or contact support if the issue persists.',
                    'Oops!'
                );
            }
        );
    }

    assignSupplierLinks(productSupplyChainList) {
        for (let pscl_index = 0; pscl_index < productSupplyChainList.length; pscl_index++) {
            if (this.supplier_ids.indexOf(productSupplyChainList[pscl_index].supplyChainArticle.supplierId) !== -1) {
                productSupplyChainList[pscl_index].supplyChainArticle.supplierLink =
                    '/suppliers/' + productSupplyChainList[pscl_index].supplyChainArticle.supplierId;
            }

            if (!productSupplyChainList[pscl_index].hasOwnProperty('productSupplyChainList')) {
                continue;
            }

            if (
                productSupplyChainList[pscl_index].hasOwnProperty('productSupplyChainList') &&
                productSupplyChainList[pscl_index].productSupplyChainList.length &&
                productSupplyChainList[pscl_index].productSupplyChainList.length > 0
            ) {
                this.assignSupplierLinks(productSupplyChainList[pscl_index].productSupplyChainList);
            }
        }
    }

    navigateToEdit() {
        if (this.selectedArticleName && this.selectedArticleName.entityName) {
            this.router.navigate(['/', 't-trace', 'product', 'supplychain', this.trId, 'edit'], {
                queryParams: { articleName: this.selectedArticleName.entityName }
            });
        } else {
            this.router.navigate(['/', 't-trace', 'product', 'supplychain', this.trId, 'edit']);
        }
    }

    analyticsBackButtonClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent('T-Trace Tree-View Back-Button#Clicked', analyticsOptions);
    }

    lockOrUnlockEditRequest(id: string, isLock: boolean): void {
        let apiRequest = isLock ? this.trs.lockTr(id) : this.trs.unlockTr(id);
        this.pageLoading = true;

        apiRequest.subscribe(
            () => {
                this.onPageLoad();
                setTimeout(() => {
                    this.appContext.cardViewRefresh.next(true);
                    this.pageLoading = false;
                    let message = isLock
                        ? 'The T-Trace has been locked successfully'
                        : 'The T-Trace has been unlocked successfully';
                    this.toastrService.success(message, 'Success');
                }, 1000);
            },
            error => {
                this.pageLoading = false;
                this.toastrService.error('Error in processing the request. Please try again after sometime.', 'Error');
            }
        );
    }

    analyticsEditButtonClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent('T-Trace Tree-View Edit-Button#Clicked', analyticsOptions);
    }

    analyticsDetailedViewButtonClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent('T-Trace Tree-View Detailed-View-Button#Clicked', analyticsOptions);
    }

    triggerScreenShot(): void {
        this.screenshotEventEmitter.emit();
    }
}
