import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { some } from 'lodash';
import { environment } from '../../../../../environments/environment';
import { TraceabilityRequestService } from '../../traceability-request.service';
import { AuthService } from '../../../../core';
import { CommonServices } from '../../../../shared/commonServices/common.service';
import { ConfirmDialogComponent } from '../../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { LocalizationService } from '../../../../shared/utils/localization.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TRACEABILITY_CONSTANTS } from '../../traceability-constants.model';
import { IArticleDelete, IPayLoadSupplyChain } from '../../traceability.model';

const SUPPLIER_ASSOCIATION_STATUS = {
    '10': 'UN_INVITED',
    '15': 'PENDING',
    '20': 'ASSOCIATED',
    '50': 'NOT_ASSOCIATED'
};

@Component({
    selector: 'app-edit-article',
    templateUrl: './edit-article.component.html',
    styleUrls: ['./edit-article.component.scss']
})
export class EditArticleComponent implements OnInit {
    @Input() article: IPayLoadSupplyChain;
    @Input() listIndex: number;
    @Input() addMoreInputs: any;
    @Input() isReadonly: boolean = false;
    @Input() disableDelete: boolean = false;
    @Input() scrollTo = '';
    @Output() handleDelete = new EventEmitter();
    @Output() scrollToElementWithId = new EventEmitter();
    @Output() handleRecreate = new EventEmitter();
    @Input() showFacilityColumn: boolean;
    @Output() handleCheckboxArticleType: EventEmitter<IArticleDelete> = new EventEmitter();

    toggleValue = false;
    disabled = false;
    isFetchingFacility = false;

    env = environment;

    unique_id = '';

    optionalParams = {
        key: 'id',
        value: 'name',
        selectedKey: 'id'
    };

    optional = { key: 'supplier_facility_id', value: 'name', selectedKey: 'supplier_facility_id' };

    facilities = [];
    selectedFacility: string;

    get getArticleName(): string {
        return this.localizationService.getDisplayText(this.article.supplyChainArticle.articleTypeId);
    }
    constructor(
        private auth: AuthService,
        public localizationService: LocalizationService,
        private commonServices: CommonServices,
        private trs: TraceabilityRequestService,
        private toastr: CustomToastrService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        if (this.article?.supplyChainArticle?.supplierAssociationStatus?.id) {
            this.article.supplyChainArticle.supplierAssociationStatus.value =
                SUPPLIER_ASSOCIATION_STATUS[this.article?.supplyChainArticle?.supplierAssociationStatus?.id];
        }
        if (!this.article.poNumber) {
            this.article[TRACEABILITY_CONSTANTS.PO_NUMBER] = '';
        }
        if (!this.article.supplyChainArticle.productOtherInfo) {
            const tradeName = {
                tradeName: ''
            };
            this.article[TRACEABILITY_CONSTANTS.SUPPLY_CHAIN_ARTICLE]['productOtherInfo'] = tradeName;
        }
        this.toggleValue = this.getProvideByMyselfStatus;

        this.unique_id = this.commonServices.makeId(5);

        if (this.scrollTo !== '') {
            this.scrollToElement(this.scrollTo);
        }

        if (this.showFacilityColumn && this.article[TRACEABILITY_CONSTANTS.SUPPLY_CHAIN_ARTICLE].supplierId) {
            if (
                this.article[TRACEABILITY_CONSTANTS.SUPPLY_CHAIN_ARTICLE].facilityId &&
                this.article[TRACEABILITY_CONSTANTS.SUPPLY_CHAIN_ARTICLE].facilityName
            ) {
                this.selectedFacility = this.article[TRACEABILITY_CONSTANTS.SUPPLY_CHAIN_ARTICLE].facilityId;
            }

            this.getFacilities();
        }
    }

    onInputEvent(): void {
        this.article.poNumber = this.article.poNumber.toUpperCase();
        this.commonServices.emitInputChildEvent(true);
    }

    onSelectingSupplier(item: any): void {
        this.toggleValue = false;
        if (item) {
            this.setSupplyChainArticleData(item);
            this.getFacilities(true);
            this.onInputEvent();
            this.toggleValue = this.getTheToggleValueStatus;
            if (this.article.supplyChainArticle.traceable === 'yes') {
                this.handleProvideMyselfRecreateEmit(this.toggleValue);
            }
        }
        delete this.article.productSupplyChainList;
    }
    private setSupplyChainArticleData(data: any): void {
        this.article.supplyChainArticle.supplierId = data?.supplier_id ?? null;
        this.article.supplyChainArticle.supplierName = data?.supplier_name ?? null;
        this.article.supplyChainArticle.supplierVerificationStatus = data?.supplier_verification_status ?? null;
        this.article.supplyChainArticle.supplierAssociationStatus = data?.supplier_association_status ?? null;
        this.article.supplyChainArticle.supplierOtherInfo = data?.supplier_other_info ?? null;
        this.article.supplyChainArticle.facilityId = '';
        this.article.supplyChainArticle.facilityName = '';
        if (this.checkSupplierIsSNA) {
            this.article.dataProvider = this.getCompanyId;
        }
        if (!data) {
            this.getFacilities();
        }
    }

    onSelectingFacility(item: any): void {
        this.article.supplyChainArticle.facilityId = item.supplier_facility_id;
        this.article.supplyChainArticle.facilityName = item.name;
        this.onInputEvent();
    }

    handleFacilityClearInput(): void {
        this.article.supplyChainArticle.facilityId = '';
        this.article.supplyChainArticle.facilityName = '';
        this.onInputEvent();
    }

    handleToggleChange(changeValue: MatSlideToggleChange): void {
        const provideThisSupplierDataByYourselfStatus = changeValue.checked;
        this.onInputEvent();
        if (provideThisSupplierDataByYourselfStatus) {
            // Enter data by myself
            this.handleProvideMyselfRecreateEmit(provideThisSupplierDataByYourselfStatus);
        } else {
            // Collect it from supplier
            this.article.dataProvider = this.article.supplyChainArticle.supplierId;
            this.article.provideMyself = false;
            delete this.article.productSupplyChainList;
        }
    }

    private handleProvideMyselfRecreateEmit(provideMyselfStatus: boolean = false): void {
        this.article.dataProvider = this.getCompanyId;
        this.article.provideMyself = provideMyselfStatus;
        let article = provideMyselfStatus ? this.article : null;
        this.handleRecreate.emit(article);
    }

    scrollToElement(id: string): void {
        if (id) {
            this.scrollToElementWithId.emit(id);
        }
    }

    isScrollingApplicable(): boolean {
        return (
            this.article.supplyChainArticle.internalArticleName && this.article.supplyChainArticle.traceable === 'yes'
        );
    }

    makeToggleDisable(): boolean {
        return this.checkSupplierIdMatchCompanyId || this.checkSupplierIsSNA || this.checkUnInvitedSupplier;
    }

    clearSupplierData(): void {
        this.toggleValue = false;
        this.article.provideMyself = false;
        this.setSupplyChainArticleData(false);
    }

    getExistingDataForSupplierSearch(item: any) {
        if (item) {
            const supplierData = {
                supplier_name: item.supplierName,
                supplier_id: item.supplierId
            };

            if (item.supplierVerificationStatus) {
                supplierData[TRACEABILITY_CONSTANTS.SUPPLIER_VERIFICATION_STATUS] = {
                    id: item.supplierVerificationStatus.id,
                    value: item.supplierVerificationStatus.value
                };
            }
            if (item.supplierAssociationStatus) {
                supplierData[TRACEABILITY_CONSTANTS.SUPPLIER_ASSOCIATION_STATUS] = {
                    id: item.supplierAssociationStatus.id,
                    value: item.supplierAssociationStatus.value
                };
            }
            return supplierData;
        }
    }

    getFacilities(onSupplierSelect = false): void {
        let supplierId: string;
        this.facilities = [];
        this.isFetchingFacility = true;

        if (onSupplierSelect) {
            this.selectedFacility = null;
        }

        if (this.article.supplyChainArticle.supplierName !== "I don't wish to provide") {
            supplierId = this.article.supplyChainArticle.supplierId;
        }

        if (supplierId) {
            this.trs.getAllFacility(supplierId).subscribe(
                data => {
                    let temp = {};
                    if (data) {
                        data.forEach(item => {
                            temp = {
                                supplier_facility_id: item.id,
                                name: item.name
                            };
                            this.facilities.push(temp);
                        });
                    }
                    if (this.article.supplyChainArticle.facilityId && !onSupplierSelect) {
                        const index = this.facilities.findIndex(
                            facility => facility.supplier_facility_id === this.article.supplyChainArticle.facilityId
                        );

                        if (index === -1) {
                            temp = {
                                supplier_facility_id: this.article.supplyChainArticle.facilityId,
                                name: this.article.supplyChainArticle.facilityName
                            };
                            this.facilities.push(temp);
                        }
                    }

                    this.isFetchingFacility = false;
                },
                failResponse => {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                    this.isFetchingFacility = false;
                }
            );
        } else {
            this.isFetchingFacility = false;
        }
    }

    handleSelectArticleType($event: MatCheckboxChange): void {
        this.handleCheckboxArticleType.emit({
            checkedStatus: $event.checked,
            articleDetail: this.article.supplyChainArticle
        });
    }

    get isSupplyChainArticleMandatory(): boolean {
        return !!this.article.supplyChainArticle.mandatory;
    }

    get getCompanyId(): string {
        return this.auth.user.companyId;
    }

    private get getProvideByMyselfStatus(): boolean {
        return (
            (this.article.provideMyself && this.article.dataProvider === this.getCompanyId) ||
            (this.article.provideMyself && (this.checkSupplierIdMatchCompanyId || this.checkSupplierIsSNA))
        );
    }

    private get getTheToggleValueStatus(): boolean {
        return this.checkSupplierIdMatchCompanyId || this.checkSupplierIsSNA || this.checkUnInvitedSupplier;
    }

    private get checkSupplierIdMatchCompanyId(): boolean {
        return this.article.supplyChainArticle.supplierId === this.getCompanyId;
    }

    private get checkSupplierIsSNA(): boolean {
        return this.article.supplyChainArticle.supplierId === TRACEABILITY_CONSTANTS.SNA_CANNOT_DISCLOSE;
    }

    private get checkUnInvitedSupplier(): boolean {
        return this.article?.supplyChainArticle?.supplierAssociationStatus?.value === TRACEABILITY_CONSTANTS.UN_INVITED;
    }
}
