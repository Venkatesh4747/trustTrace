import { Router } from '@angular/router';
import { ContextService } from './../../../context.service';
import { Component, OnInit, Input } from '@angular/core';
import { LocalizationService } from './../../../utils/localization.service';
import { environment } from './../../../../../environments/environment';
import { CommonServices } from '../../../commonServices/common.service';

@Component({
    selector: 'app-child-tree',
    templateUrl: './child-tree.component.html',
    styleUrls: ['./child-tree.component.scss']
})
export class ChildTreeComponent implements OnInit {
    public env = environment;
    @Input() items: any;
    @Input() entityArticleName = '';
    @Input() navigateWithParams = false;
    @Input() showDetails = false;
    @Input() queryParams = {};

    src: string;
    default: string;

    selectedArticleName;

    constructor(
        public localeService: LocalizationService,
        private appContext: ContextService,
        private router: Router,
        private commonService: CommonServices
    ) {}

    ngOnInit() {
        this.appContext.selectedArticleName.subscribe(articleName => {
            this.selectedArticleName = articleName;
        });

        // Default Image Url
        this.default = `${this.env.IMG_URL}images/icons/products/pdt_default.png`;
    }

    handleSelect(articleName: string) {
        this.appContext.selectedArticleName.next({ articleName: articleName, entityName: this.entityArticleName });
    }

    getSrc(item: any) {
        return `${this.env.IMG_URL}images/icons/products/${item.supplyChainArticle.articleTypeId}.png`;
    }

    navigateToSupplierProfile(link) {
        const url = link.split('/');
        if (this.navigateWithParams) {
            this.commonService.navigateToUrlWithQueryParams(url, this.queryParams);
        } else {
            this.router.navigate(url);
        }
    }

    canShowSupplierName(item: any) {
        if (item.supplyChainArticle.supplierName !== "I don't wish to provide") {
            return true;
        }
        if (item.supplyChainArticle.supplierName === "I don't wish to provide") {
            if (
                !item.supplyChainArticle.supplierOtherInfo ||
                !item.supplyChainArticle.supplierOtherInfo.address ||
                (item.supplyChainArticle.supplierOtherInfo.address &&
                    !item.supplyChainArticle.supplierOtherInfo.address.city) ||
                !item.supplyChainArticle.supplierOtherInfo.address.country
            ) {
                return true;
            }
        } else {
            return false;
        }
    }
}
