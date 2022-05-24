import { TEmsService } from '../../t-ems.service';
import { Component, Input, OnInit } from '@angular/core';
import { LocalizationService } from './../../../../shared/utils/localization.service';
import { AuthService } from '../../../../core';

@Component({
    selector: 'app-evidence-entity',
    templateUrl: './evidence-entity.component.html',
    styleUrls: ['./evidence-entity.component.scss']
})
export class EvidenceEntityComponent implements OnInit {
    @Input() items;
    @Input() trId;
    @Input() evidence;

    addMoreInputs: any;
    productEvidencesViewList: any;
    payload: any;

    constructor(private trs: TEmsService, private localizationService: LocalizationService) {}

    ngOnInit() {
        if (this.items !== undefined && this.items.length === 0) {
            this.items.push({
                productId: this.evidence.productId,
                productType: this.evidence.productType,
                entity: this.evidence.entity,
                supplierId: this.evidence.supplierId,
                dataProvider: this.evidence.dataProvider,
                productName: this.evidence.productName,
                evidencesView: []
            });
            this.items = this.items[0];
        }
        this.getAddMoreInput();
    }

    getAddMoreInput() {
        this.trs.getAddMoreCertificatesInput(this.trId).subscribe(response => {
            const data = response['data'];
            this.addMoreInputs = data['mappings'];
            // if (!this.entity.productSupplyChainList) {
            //     this.addMoreInputs.forEach(addMoreInput => {
            //         this.addToProductSupplyChainList(addMoreInput);
            //     });
            // }
            // this.isConstructingPayload = false;
        });
    }

    addToProductEvidenceList(item: any): void {
        item.categories = item.categories.map(categoryItem => {
            const changeCategoriesName =
                categoryItem.key === 'PRODUCT' ? 'Transaction Certificate' : 'Scope Certificate';
            return {
                ...categoryItem,
                changeCategoriesName
            };
        });
        this.payload = {
            certId: item.id,
            category: '',
            categories: item.categories,
            creationType: 'USER'
        };
        if (this.items.evidencesView) {
            this.items.evidencesView.push(JSON.parse(JSON.stringify(this.payload)));
        } else {
            this.items['evidencesView'] = [];
            this.items['evidencesView'].push(JSON.parse(JSON.stringify(this.payload)));
        }
    }

    deleteEvidenceArticle(item: any) {
        const index: number = this.items.evidencesView.indexOf(item);
        if (index !== -1) {
            this.items.evidencesView.splice(index, 1);
        }
    }
}
