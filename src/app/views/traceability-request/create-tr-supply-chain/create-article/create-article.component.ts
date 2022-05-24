import { CommonServices } from './../../../../shared/commonServices/common.service';
import { LocalizationService } from './../../../../shared/utils/localization.service';
import { AuthService } from './../../../../core/user/auth.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { some } from 'lodash';
import { TraceabilityRequestService } from '../../traceability-request.service';
import { ConfirmDialogComponent } from './../../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../../environments/environment';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';

export interface FacilityData {
    supplier_facility_id: string;
    name: string;
}

@Component({
    selector: 'app-create-article',
    templateUrl: './create-article.component.html',
    styleUrls: ['./create-article.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class CreateArticleComponent implements OnInit {
    @Input() article;
    @Input() listIndex;
    @Input() addMoreInputs;
    @Input() isReadonly: Boolean = false;
    @Input() disableDelete: Boolean = false;
    @Output() handleDelete = new EventEmitter();
    @Output() scrollToElementWithId = new EventEmitter();
    @Input() showFacilityColumn: boolean;

    toggleValue = true;
    disabled = false;
    isFetchingFacility = false;

    env = environment;

    unique_id = '';

    @Input() entity;
    toggleData = ['Collect from supplier', 'Add it by yourself'];

    optionalParams = {
        key: 'id',
        value: 'name',
        selectedKey: 'id'
    };

    optional = { key: 'supplier_facility_id', value: 'name', selectedKey: 'supplier_facility_id' };

    facilities: any;
    selectedFacility: string;

    get getArcticleName(): string {
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
        if (!this.article.poNumber) {
            this.article['poNumber'] = '';
        }
        if (!this.article.supplyChainArticle.productOtherInfo) {
            const tradeName = {
                tradeName: ''
            };
            this.article['supplyChainArticle']['productOtherInfo'] = tradeName;
        }
        if (this.article.dataProvider === this.auth.user.companyId) {
            this.toggleValue = true;
        } else {
            this.toggleValue = false;
        }
        this.unique_id = this.commonServices.makeId(5);

        if (this.showFacilityColumn && this.article['supplyChainArticle'].supplierId) {
            if (
                this.article['supplyChainArticle'].facilityId &&
                this.article['supplyChainArticle'].facilityId !== '' &&
                this.article['supplyChainArticle'].facilityName &&
                this.article['supplyChainArticle'].facilityName !== ''
            ) {
                this.selectedFacility = this.article['supplyChainArticle'].facilityId;
            }

            this.getFacilities();
        }
    }

    onSelectingSupplier(item: any) {
        this.toggleValue = true;
        if (item) {
            this.article.supplyChainArticle.supplierId = item.supplier_id;
            this.article.supplyChainArticle.supplierName = item.supplier_name;
            this.article.supplyChainArticle.supplierVerificationStatus = item.supplier_verification_status;
            this.article.supplyChainArticle.supplierAssociationStatus = item.supplier_association_status;
            this.article.supplyChainArticle.supplierOtherInfo = item.supplier_other_info;

            this.article.supplyChainArticle.facilityId = '';
            this.article.supplyChainArticle.facilityName = '';
            this.getFacilities(true);
        }
    }

    onSelectingFacility(item: any) {
        this.article.supplyChainArticle.facilityId = item.supplier_facility_id;
        this.article.supplyChainArticle.facilityName = item.name;
    }

    handleFacilityClearInput() {
        this.article.supplyChainArticle.facilityId = '';
        this.article.supplyChainArticle.facilityName = '';
    }

    handleToggleChange(changeValue: MatSlideToggleChange) {
        const collectFromSupplier = changeValue.checked;
        if (collectFromSupplier) {
            // Collect it from supplier
            this.article.dataProvider = this.article.supplyChainArticle.supplierId;
            delete this.article.productSupplyChainList;
        } else {
            // Enter data by myself
            this.article.dataProvider = this.auth.user.companyId;
        }
    }

    deleteSupplyChain(article: any) {
        const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Delete?',
                msg:
                    'Are you sure you want to delete this material? Deleting will remove all of its associated materials in the supply chain',
                primaryButton: 'Cancel',
                secondaryButton: 'Delete Material',
                class: 't-trace-modal-dialog-block',
                showClose: false
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response === 'Delete Material') {
                this.handleDelete.emit(article);
            }
        });
    }

    scrollToElement(id: string) {
        if (id) {
            this.scrollToElementWithId.emit(id);
        }
    }

    isScrollingApplicable() {
        const isScrollable =
            this.article.supplyChainArticle.internalArticleName && this.article.supplyChainArticle.traceable === 'yes';
        return isScrollable && this.article.dataProvider !== this.article.supplyChainArticle.supplierId;
    }

    makeCreateToggleDisable() {
        const addMoreInput = {
            value: this.article.supplyChainArticle.articleTypeId,
            hasNextLevel: false
        };
        if (
            this.article.supplyChainArticle.internalArticleName === '' ||
            this.article.supplyChainArticle.supplierId === ''
        ) {
            return true;
        } else if (this.article.supplyChainArticle.creationType === 'USER' && some(this.addMoreInputs, addMoreInput)) {
            return true;
        } else if (
            this.article.supplyChainArticle.creationType === 'USER' &&
            !some(this.addMoreInputs, addMoreInput) &&
            this.article.supplyChainArticle.traceable === 'no'
        ) {
            return true;
        } else if (
            this.article.supplyChainArticle.creationType === 'SYSTEM' &&
            some(this.addMoreInputs, addMoreInput)
        ) {
            return true;
        } else if (!this.article.supplyChainArticle.creationType && some(this.addMoreInputs, addMoreInput)) {
            return true;
        } else if (this.article.supplyChainArticle.supplierId === this.auth.companyId) {
            return true;
        } else if (
            !this.article.supplyChainArticle.supplierAssociationStatus ||
            [0, 10].includes(+this.article.supplyChainArticle.supplierAssociationStatus.id)
        ) {
            return true;
        } else if (
            !this.article.supplyChainArticle.supplierVerificationStatus ||
            this.article.supplyChainArticle.supplierVerificationStatus.id === 10
        ) {
            return true;
        } else {
            return false;
        }
    }

    getExisitingDataForSupplierSearch(item) {
        if (item) {
            const supplierData = {
                supplier_name: item.supplierName,
                supplier_id: item.supplierId
            };

            if (item.supplierVerificationStatus) {
                supplierData['supplier_verification_status'] = {
                    id: item.supplierVerificationStatus.id,
                    value: item.supplierVerificationStatus.value
                };
            }
            if (item.supplierAssociationStatus) {
                supplierData['supplier_association_status'] = {
                    id: item.supplierAssociationStatus.id,
                    value: item.supplierAssociationStatus.value
                };
            }
            return supplierData;
        }
    }

    getFacilities(onSupplierSelect = false) {
        let supplierId;
        this.facilities = [];
        this.isFetchingFacility = true;

        if (onSupplierSelect) {
            this.selectedFacility = undefined;
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
}
