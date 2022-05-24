import { Router } from '@angular/router';
import { CommonServices } from './../../commonServices/common.service';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LocalizationService } from '../../utils/localization.service';

@Component({
    selector: 'app-tree-view',
    templateUrl: './tree-view.component.html',
    styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent implements OnInit {
    public env = environment;
    @Input() items;
    @Input() navigateWithParams = false;
    @Input() queryParams = {};
    @Input() showDetails = false;
    width: number;
    src: string;
    default: string;

    @ViewChild('treeUlMainRoot', { static: false }) treeUlMainRoot: ElementRef;

    private screenWidth: number;

    constructor(
        public localeService: LocalizationService,
        private cdr: ChangeDetectorRef,
        private commonService: CommonServices,
        private router: Router
    ) {}

    ngOnInit() {
        this.src = `${this.env.IMG_URL}images/icons/products/${this.items.supplyChainArticle.articleTypeId}.png`;
        this.default = `${this.env.IMG_URL}images/icons/products/pdt_default.png`;
    }

    navigateToSupplierProfile(link) {
        const url = link.split('/');
        if (this.navigateWithParams) {
            this.commonService.navigateToUrlWithQueryParams(url, this.queryParams);
        } else {
            this.router.navigate(url);
        }
    }

    canShowSupplierName() {
        if (this.items.supplyChainArticle.supplierName !== "I don't wish to provide") {
            return true;
        }
        if (this.items.supplyChainArticle.supplierName === "I don't wish to provide") {
            if (
                !this.items.supplyChainArticle.supplierOtherInfo ||
                !this.items.supplyChainArticle.supplierOtherInfo.address ||
                (this.items.supplyChainArticle.supplierOtherInfo.address &&
                    !this.items.supplyChainArticle.supplierOtherInfo.address.city) ||
                !this.items.supplyChainArticle.supplierOtherInfo.address.country
            ) {
                return true;
            }
        } else {
            return false;
        }
    }
}
