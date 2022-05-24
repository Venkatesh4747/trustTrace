import { CustomToastrService } from './../../../../shared/commonServices/custom-toastr.service';
import { LocalizationService } from './../../../../shared/utils/localization.service';
import { AuthService } from './../../../../core/user/auth.service';
import { CommonServices } from './../../../../shared/commonServices/common.service';
import { Component, OnInit, Input } from '@angular/core';
import { some } from 'lodash';
import { environment as env } from '../../../../../environments/environment';
import { TraceabilityRequestService } from './../../traceability-request.service';
import { IArticleDelete, IPayLoadSupplyChain, ISupplyChainArticle } from '../../traceability.model';
import { TRACEABILITY_CONSTANTS } from '../../traceability-constants.model';
import { v4 as uuid } from 'uuid';

@Component({
    selector: 'app-edit-entity',
    templateUrl: './edit-entity.component.html',
    styleUrls: ['./edit-entity.component.scss']
})
export class EditEntityComponent implements OnInit {
    @Input() entity;
    @Input() scrollTo = '';
    @Input() trId;
    @Input() toShowFacilityColumn: boolean;

    addMoreInputs: any;
    nonTraceableStartingIndex: number;

    private env = env;

    isEditable = true;
    isConstructingPayload = false;

    payload: IPayLoadSupplyChain = {
        dataProvider: '',
        provideMyself: false,
        supplyChainArticle: {
            articleTypeId: '',
            mandatory: false,
            internalArticleName: '',
            supplierId: '',
            supplierName: '',
            traceable: '',
            facilityId: '',
            facilityName: '',
            articleUniqueId: ''
        }
    };

    optionalParams = {
        key: 'id',
        value: 'name',
        selectedKey: 'id'
    };

    private articleTypeList: ISupplyChainArticle[] = [];

    constructor(
        private trs: TraceabilityRequestService,
        private commonservices: CommonServices,
        private auth: AuthService,
        public localizationService: LocalizationService,
        private toastr: CustomToastrService
    ) {}

    ngOnInit(): void {
        while (this.entity.metaData && this.entity.metaData.isAgentNode) {
            this.entity = this.entity.productSupplyChainList[0];
        }
        this.isConstructingPayload = true;
        if (!this.entity.productSupplyChainList) {
            this.isEditable = true;
        } else if (this.entity.supplyChainArticle.traceable === undefined) {
            this.isEditable = false;
        }
        this.getAddMoreInput(this.entity.supplyChainArticle.articleTypeId);
    }

    get getImageURL(): string {
        return env.IMG_URL;
    }

    get hasArticleIndexList(): boolean {
        return this.articleTypeList.length > 0;
    }

    getAddMoreInput(id: string): void {
        this.trs.getAddMoreInput(id, this.trId).subscribe(response => {
            const data = response[TRACEABILITY_CONSTANTS.DATA];
            this.addMoreInputs =
                data[TRACEABILITY_CONSTANTS.MAPPINGS][TRACEABILITY_CONSTANTS.RAW_MATERIALS_WITHOUT_SPACE];
            if (!this.entity.productSupplyChainList) {
                this.addMoreInputs.forEach(addMoreInput => {
                    this.addToProductSupplyChainList(addMoreInput);
                });
            }
            this.isConstructingPayload = false;
            this.sortTheEntityProductSupplyChainList();
        });
    }

    private getPayLoad(item: any): IPayLoadSupplyChain {
        return {
            dataProvider: this.auth.user.companyId,
            provideMyself: false,
            supplyChainArticle: {
                articleTypeId: item.value,
                mandatory: item.mandatory,
                internalArticleName: '',
                supplierId: '',
                supplierName: '',
                traceable: item.hasNextLevel ? 'yes' : 'no',
                facilityId: '',
                facilityName: '',
                articleUniqueId: uuid(),
                supplierAssociationStatus: null
            }
        };
    }

    addToProductSupplyChainList(item: any): void {
        this.commonservices.emitInputChildEvent(false);
        this.payload = this.getPayLoad(item);
        if (this.entity.productSupplyChainList) {
            this.entity.productSupplyChainList.push(JSON.parse(JSON.stringify(this.payload)));
        } else {
            this.entity[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST] = [];
            this.entity[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST].push(
                JSON.parse(JSON.stringify(this.payload))
            );
        }
        this.sortTheEntityProductSupplyChainList();
    }

    recreateToProductSupplyChainList(item: any, index: number): void {
        this.payload = this.getPayLoad(item);
        if (this.entity.productSupplyChainList[index].productSupplyChainList) {
            this.entity.productSupplyChainList[index].productSupplyChainList.push(
                JSON.parse(JSON.stringify(this.payload))
            );
        } else {
            this.entity.productSupplyChainList[index][TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST] = [];
            this.entity.productSupplyChainList[index][TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST].push(
                JSON.parse(JSON.stringify(this.payload))
            );
        }
    }

    recreateProductSupplyChainList(article: any): void {
        const index: number = this.entity.productSupplyChainList.indexOf(article);
        if (index !== -1) {
            delete this.entity.productSupplyChainList[index].productSupplyChainList;
            this.trs.getAddMoreInput(article.supplyChainArticle.articleTypeId, this.trId).subscribe(response => {
                const data = response[TRACEABILITY_CONSTANTS.DATA];
                const addMoreInputs =
                    data[TRACEABILITY_CONSTANTS.MAPPINGS][TRACEABILITY_CONSTANTS.RAW_MATERIALS_WITHOUT_SPACE];
                addMoreInputs.forEach(addMoreInput => {
                    this.recreateToProductSupplyChainList(addMoreInput, index);
                });
            });
        }
        this.sortTheEntityProductSupplyChainList(index);
    }

    sortTheEntityProductSupplyChainList(index = null): void {
        if (!this.entity.productSupplyChainList) {
            return;
        }
        let productSupplyChainList = index
            ? this.entity.productSupplyChainList[index][TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST]
            : this.entity.productSupplyChainList;
        productSupplyChainList.sort((a: any, b: any) =>
            a.supplyChainArticle.traceable > b.supplyChainArticle.traceable ? -1 : 1
        );
        this.nonTraceableStartingIndex = this.entity.productSupplyChainList.findIndex(
            (supplyChain: any) => supplyChain.supplyChainArticle.traceable === 'no'
        );
    }

    checkEntityRequired(productSupplyChain: any): boolean {
        const isTraceable =
            productSupplyChain.supplyChainArticle.hasOwnProperty('traceable') &&
            productSupplyChain.supplyChainArticle.traceable === 'yes';
        let isSameSupplierNoChain = false;
        if (
            (productSupplyChain.dataProvider === productSupplyChain.supplyChainArticle.supplierId &&
                productSupplyChain.productSupplyChainList) ||
            (productSupplyChain.productSupplyChainList &&
                productSupplyChain.launchedBy === productSupplyChain.dataProvider) ||
            productSupplyChain.provideMyself
        ) {
            isSameSupplierNoChain = true;
        }
        const addMoreInput = {
            value: productSupplyChain.supplyChainArticle.articleTypeId,
            hasNextLevel: true
        };
        if (this.addMoreInputs) {
            return isTraceable && some(this.addMoreInputs, addMoreInput) && isSameSupplierNoChain;
        }
        return isTraceable && isSameSupplierNoChain;
    }

    scrollToElementWithId(id: string): void {
        this.commonservices.scrollToElement(id);
    }

    getProductName(): string {
        let label = this.entity.supplyChainArticle.internalArticleName;
        if (
            this.entity.supplyChainArticle?.supplierArticleName ||
            this.entity.supplyChainArticle?.supplierArticleNumber
        ) {
            label = `${label} / ${this.entity.supplyChainArticle.supplierArticleName}-${this.entity.supplyChainArticle.supplierArticleNumber}`;
        }
        if (
            this.entity.supplyChainArticle.productOtherInfo &&
            (this.entity.dataProvider === this.auth.companyId || this.entity.launchedBy === this.auth.companyId) &&
            this.entity.supplyChainArticle.productOtherInfo.tradeName
        ) {
            label = `${label} / ${this.entity.supplyChainArticle.productOtherInfo.tradeName}`;
        }
        return label;
    }

    deleteArticleByIndex($event: IArticleDelete): void {
        if ($event.checkedStatus) {
            this.articleTypeList.push($event.articleDetail);
        } else {
            this.articleTypeList = this.articleTypeList.filter(
                (eachArticle: ISupplyChainArticle) =>
                    eachArticle.articleUniqueId !== $event.articleDetail.articleUniqueId
            );
        }
    }

    deleteSelectedArticleType(): void {
        this.articleTypeList.forEach((eachArticle: ISupplyChainArticle) => {
            this.entity.productSupplyChainList.forEach(
                (eachProductSupplyChainList: IPayLoadSupplyChain, index: number) => {
                    if (eachProductSupplyChainList.supplyChainArticle.articleUniqueId === eachArticle.articleUniqueId) {
                        this.entity.productSupplyChainList.splice(index, 1);
                    }
                }
            );
        });
        this.sortTheEntityProductSupplyChainList();
        this.toastr.success('Article(s) deleted', TRACEABILITY_CONSTANTS.SUCCESS);
        this.articleTypeList.splice(0, this.articleTypeList.length);
    }
}
