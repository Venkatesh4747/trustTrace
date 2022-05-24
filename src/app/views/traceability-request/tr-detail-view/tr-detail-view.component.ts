import { forkJoin } from 'rxjs';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { ContextService } from './../../../shared/context.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { TraceabilityRequestService } from './../traceability-request.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-tr-detail-view',
    templateUrl: './tr-detail-view.component.html',
    styleUrls: ['./tr-detail-view.component.scss']
})
export class TrDetailViewComponent implements OnInit, AfterViewInit {
    public env = environment;

    trId: string;
    supplyChainData: any;
    suppliers: any;

    pageLoading = true;
    isConstructingPayload = false;

    searchText = '';
    selectedArticleName;

    height = 59;

    constructor(
        private trs: TraceabilityRequestService,
        private route: ActivatedRoute,
        public commonService: CommonServices,
        public localeService: LocalizationService,
        private supplierService: SuppliersService,
        private appContext: ContextService,
        private router: Router
    ) {}

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.height =
            document.getElementById('supply-chain-view-header').offsetHeight +
            document.getElementById('supply-chain-view-table-title').offsetHeight +
            document.getElementById('supply-chain-view-table-header').offsetHeight;
    }

    ngOnInit() {}

    ngAfterViewInit() {
        this.isConstructingPayload = true;

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
            this.trs.getSupplyChainData(this.trId),
            this.supplierService.getAllSuppliers(JSON.parse(JSON.stringify(payload)))
        ]).subscribe(response => {
            const data = response[0]['data'];
            this.localeService.addToMasterData(data['masterData']);
            this.supplyChainData = Object.assign({}, JSON.parse(JSON.stringify(data['supplyChain'])));

            this.suppliers = response[1]['data']['searchResponse'];

            for (const supplier in this.suppliers) {
                if (!this.suppliers.hasOwnProperty(supplier)) {
                    continue;
                }

                if (this.suppliers[supplier].supplier_id === this.supplyChainData.supplyChainArticle.supplierId) {
                    this.supplyChainData.supplyChainArticle.supplierLink =
                        '/suppliers/' + this.supplyChainData.supplyChainArticle.supplierId;
                }

                this.assignSupplierLinks(this.supplyChainData.productSupplyChainList);
            }

            this.pageLoading = false;
            this.isConstructingPayload = false;
            this.onResize();
        });
    }

    assignSupplierLinks(productSupplyChainList) {
        for (const supplier in this.suppliers) {
            if (!this.suppliers.hasOwnProperty(supplier)) {
                continue;
            }
            for (const pscl_index in productSupplyChainList) {
                if (!productSupplyChainList.hasOwnProperty(pscl_index)) {
                    continue;
                }

                if (
                    this.suppliers[supplier].supplier_id ===
                    productSupplyChainList[pscl_index].supplyChainArticle.supplierId
                ) {
                    productSupplyChainList[pscl_index].supplyChainArticle.supplierLink =
                        '/suppliers/' + productSupplyChainList[pscl_index].supplyChainArticle.supplierId;
                }

                if (
                    typeof productSupplyChainList[pscl_index].productSupplyChainList === 'object' &&
                    productSupplyChainList[pscl_index].productSupplyChainList !== null
                ) {
                    this.assignSupplierLinks(productSupplyChainList[pscl_index].productSupplyChainList);
                }
            }
        }
    }

    searchArticle(article: any) {}

    navigateToEdit() {
        if (this.selectedArticleName && this.selectedArticleName.entityName) {
            this.router.navigate(['/', 't-trace', 'product', 'supplychain', this.trId, 'edit'], {
                queryParams: { articleName: this.selectedArticleName.entityName }
            });
        } else {
            this.router.navigate(['/', 't-trace', 'product', 'supplychain', this.trId, 'edit']);
        }
    }
}
