import { LocalizationService } from './../../../../shared/utils/localization.service';
import { AuthService } from './../../../../core/user/auth.service';
import { CommonServices } from './../../../../shared/commonServices/common.service';
import { Component, OnInit, Input } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { some, pullAt } from 'lodash';

import { TraceabilityRequestService } from './../../traceability-request.service';
import { environment as env } from '../../../../../environments/environment';

@Component({
    selector: 'app-create-entity',
    templateUrl: './create-entity.component.html',
    styleUrls: ['./create-entity.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class CreateEntityComponent implements OnInit {
    @Input() entity;
    @Input() trId;
    @Input() toShowFacilityColumn;

    addMoreInputs: any;

    public env = env;

    isEditable = true;
    isConstructingPayload = false;

    payload = {
        dataProvider: '',
        supplyChainArticle: {
            articleTypeId: '',
            internalArticleName: '',
            supplierId: '',
            supplierName: '',
            traceable: ''
        }
    };

    optionalParams = {
        key: 'id',
        value: 'name',
        selectedKey: 'id'
    };

    optional = { key: 'supplier_facility_id', value: 'name', selectedKey: 'supplier_facility_id' };

    constructor(
        private trs: TraceabilityRequestService,
        private commonservices: CommonServices,
        private auth: AuthService,
        public localizationService: LocalizationService
    ) {}

    ngOnInit() {
        if (this.entity.metaData && this.entity.metaData.isAgentNode) {
            this.entity = this.entity.productSupplyChainList[0];
        }
        this.isConstructingPayload = true;
        if (!this.entity.productSupplyChainList) {
            this.isEditable = true;
        } else if (this.entity.supplyChainArticle.traceable === undefined) {
            this.isEditable = false;
        }
        this.trs.getAddMoreInput(this.entity.supplyChainArticle.articleTypeId, this.trId).subscribe(response => {
            const data = response['data'];
            this.addMoreInputs = data['mappings']['RAW_MATERIALS'];
            if (!this.entity.productSupplyChainList) {
                this.addMoreInputs.forEach(addMoreInput => {
                    this.addToProductSupplyChainList(addMoreInput);
                });
            }
            this.isConstructingPayload = false;
        });
    }

    addToProductSupplyChainList(item: any) {
        this.payload = {
            dataProvider: this.auth.user.companyId,
            supplyChainArticle: {
                articleTypeId: item.value,
                internalArticleName: '',
                supplierId: '',
                supplierName: '',
                traceable: item.hasNextLevel ? 'yes' : 'no'
            }
        };
        if (this.entity.productSupplyChainList) {
            this.entity.productSupplyChainList.push(JSON.parse(JSON.stringify(this.payload)));
        } else {
            this.entity['productSupplyChainList'] = [];
            this.entity['productSupplyChainList'].push(JSON.parse(JSON.stringify(this.payload)));
        }
    }

    deleteInProductSupplyChainList(article: any) {
        const index: number = this.entity.productSupplyChainList.indexOf(article);
        if (index !== -1) {
            this.entity.productSupplyChainList.splice(index, 1);
        }
        if (this.entity['productSupplyChainList'].length === 0) {
            delete this.entity.productSupplyChainList;
        }
    }

    checkEntityRequired(productSupplyChain: any) {
        let isTraceable =
            productSupplyChain.supplyChainArticle.traceable &&
            productSupplyChain.supplyChainArticle.traceable === 'yes';
        let isSameSupplier =
            productSupplyChain.dataProvider === productSupplyChain.supplyChainArticle.supplierId &&
            productSupplyChain.supplyChainArticle.supplierId !== this.auth.companyId;
        const addMoreInput = {
            value: productSupplyChain.supplyChainArticle.articleTypeId,
            hasNextLevel: true
        };
        if (this.addMoreInputs) {
            return isTraceable && some(this.addMoreInputs, addMoreInput) && !isSameSupplier;
        }
        return isTraceable && !isSameSupplier;
    }

    scrollToElementWithId(id: string) {
        this.commonservices.scrollToElement(id);
    }
    getProductName(): string {
        let label = this.entity.supplyChainArticle.internalArticleName;
        if (
            this.entity.supplyChainArticle.productOtherInfo &&
            (this.entity.dataProvider === this.auth.companyId || this.entity.launchedBy === this.auth.companyId) &&
            this.entity.supplyChainArticle.productOtherInfo.tradeName
        ) {
            label = `${label} / ${this.entity.supplyChainArticle.productOtherInfo.tradeName}`;
        }
        return label;
    }
}
