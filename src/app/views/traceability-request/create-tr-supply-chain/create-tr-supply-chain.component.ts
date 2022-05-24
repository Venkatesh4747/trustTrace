import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { TraceabilityRequestService } from './../traceability-request.service';
import { AuthService } from './../../../core/user/auth.service';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { IAdditionalInfo } from '../../../shared/components/tt-radio-group/tt-radio-group.component';
import { forkJoin } from 'rxjs';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-create-tr-supply-chain',
    templateUrl: './create-tr-supply-chain.component.html',
    styleUrls: ['./create-tr-supply-chain.component.scss']
})
export class CreateTrSupplyChainComponent implements OnInit {
    supplyChainData: any;
    manufacturerPayload: any;
    trId: string;
    isAgentNode: any;

    pageLoading = false;
    isConstructingPayload = false;
    toCollectFromSupplier = false;
    shouldDisableManufacturerToggle1 = false;
    showFacilityColumn = false;

    entities = [
        {
            key: 'enter',
            value: 'Add it by yourself'
        },
        {
            key: 'launch',
            value: 'Collect from  manufacturer'
        }
    ];

    additionalInfoInput: IAdditionalInfo = {
        key: 'launch',
        filed: {
            type: 'text',
            label: 'Check if you want to add a new name for $product :',
            value: null
        }
    };

    optionalParams = {
        key: 'id',
        value: 'name',
        selectedKey: 'id'
    };

    initialProductSupplyChainList = {
        dataProvider: '',
        supplyChainArticle: {
            articleTypeId: '',
            internalArticleName: '',
            supplierId: '',
            supplierName: ''
        }
    };

    modelData = {
        supplier: {
            id: '',
            name: '',
            verificationStatus: {
                id: 0,
                value: ''
            },
            supplierAssociationStatus: {
                id: 0,
                value: ''
            },
            supplierOtherInfo: {}
        },
        facility: {
            id: '',
            name: ''
        },
        entity: {}
    };

    additionalInfo = null;

    ANALYTICS_EVENT_T_TRACE_EDIT_PAGE = 'T-Trace Edit-Page';

    constructor(
        private trs: TraceabilityRequestService,
        private route: ActivatedRoute,
        public commonServices: CommonServices,
        private toastr: CustomToastrService,
        private router: Router,
        public localizationService: LocalizationService,
        private auth: AuthService,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {
        this.modelData = {
            supplier: {
                id: '',
                name: '',
                verificationStatus: {
                    id: 0,
                    value: ''
                },
                supplierAssociationStatus: {
                    id: 0,
                    value: ''
                },
                supplierOtherInfo: {}
            },
            facility: {
                id: '',
                name: ''
            },
            entity: this.entities[0]
        };
        this.pageLoading = true;
        this.route.params.subscribe(params => {
            this.trId = params['trId'];

            forkJoin([this.trs.getTrUIMetadata(this.trId), this.trs.getSupplyChainData(this.trId)]).subscribe(
                response => {
                    this.showFacilityColumn = response[0]['showFacilityColumn'];
                    this.processGetSupplyChainData(response[1]['data']);
                }
            );
            // this.getSupplyChainData();
        });
    }

    processGetSupplyChainData(data: any) {
        this.localizationService.addToMasterData(data['masterData']);
        this.supplyChainData = JSON.parse(JSON.stringify(data['supplyChain']));
        this.manufacturerPayload = JSON.parse(JSON.stringify(data['supplyChain']));
        this.isAgentNode = this.supplyChainData.metaData && this.supplyChainData.metaData.isAgentNode;
        if (this.isAgentNode) {
            this.modelData.supplier = {
                id: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.supplierId,
                name: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.supplierName,
                verificationStatus: this.supplyChainData.productSupplyChainList[0].supplyChainArticle
                    .supplierVerificationStatus,
                supplierAssociationStatus: this.supplyChainData.productSupplyChainList[0].supplyChainArticle
                    .supplierAssociationStatus,
                supplierOtherInfo: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.supplierOtherInfo
            };
            this.modelData.facility = {
                id: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.facilityId || '',
                name: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.facilityName || ''
            };
            if (this.supplyChainData.productSupplyChainList[0].dataProvider !== this.auth.companyId) {
                this.modelData.entity = this.entities[1];
                this.toCollectFromSupplier = true;
            }
        } else {
            this.modelData.supplier = {
                id: this.supplyChainData.supplyChainArticle.supplierId,
                name: this.supplyChainData.supplyChainArticle.supplierName,
                verificationStatus: this.supplyChainData.supplyChainArticle.supplierVerificationStatus,
                supplierAssociationStatus: this.supplyChainData.supplyChainArticle.supplierAssociationStatus,
                supplierOtherInfo: this.supplyChainData.supplyChainArticle.supplierOtherInfo
            };
            this.modelData.facility = {
                id: this.supplyChainData.supplyChainArticle.facilityId || '',
                name: this.supplyChainData.supplyChainArticle.facilityName || ''
            };
            const productName = this.getProductName();
            this.additionalInfoInput.filed.label = this.additionalInfoInput.filed.label.replace(
                '$product',
                productName.label
            );
            this.additionalInfoInput.filed.value = productName.tradeName;
            if (this.supplyChainData.dataProvider !== this.auth.companyId) {
                this.modelData.entity = this.entities[1];
                this.toCollectFromSupplier = true;
            }
        }
        this.isConstructingPayload = false;
        this.pageLoading = false;
    }

    validate(data: any) {
        if (!data.supplyChainArticle.supplierId || !data.supplyChainArticle.supplierName) {
            this.toastr.error('Supplier is missing', 'Required Field');
            return false;
        }

        if (!data.supplyChainArticle.internalArticleName) {
            this.toastr.error('Article Name is missing', 'RequiredField');
            return false;
        }

        if (data.productSupplyChainList && data.productSupplyChainList.length > 0) {
            const childValidationStatus = data.productSupplyChainList.every(childData => this.validate(childData));
            if (!childValidationStatus) {
                return false;
            }
        }

        return true;
    }

    saveTr() {
        let savePayload: any;
        if (this.toCollectFromSupplier) {
            savePayload = this.manufacturerPayload;
        } else {
            savePayload = this.supplyChainData;
        }

        // Check for Agent Node payload
        if (this.isAgentNode) {
            savePayload.productSupplyChainList[0].supplyChainArticle.supplierId = this.modelData.supplier.id;
            savePayload.productSupplyChainList[0].supplyChainArticle.supplierName = this.modelData.supplier.name;
            savePayload.productSupplyChainList[0].supplyChainArticle.supplierOtherInfo = this.modelData.supplier.supplierOtherInfo;

            savePayload.productSupplyChainList[0].supplyChainArticle.facilityId = this.modelData.facility.id;
            savePayload.productSupplyChainList[0].supplyChainArticle.facilityName = this.modelData.facility.name;
        } else {
            savePayload.supplyChainArticle.supplierId = this.modelData.supplier.id;
            savePayload.supplyChainArticle.supplierName = this.modelData.supplier.name;
            savePayload.supplyChainArticle.supplierOtherInfo = this.modelData.supplier.supplierOtherInfo;

            savePayload.supplyChainArticle.facilityId = this.modelData.facility.id;
            savePayload.supplyChainArticle.facilityName = this.modelData.facility.name;
        }

        if (!this.validate(savePayload)) {
            return;
        }
        this.pageLoading = true;
        this.trs.saveSupplyChain(savePayload, this.trId).subscribe(
            response => {
                this.toastr.success('Supply chain updated', 'Success');
                setTimeout(() => {
                    this.pageLoading = false;
                    this.router.navigate(['/', 't-trace']);
                }, 1000);
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error(failResponse.error.message, 'Failed');
            }
        );
    }

    launchAndProceed() {
        let launchPayload: any;
        if (this.toCollectFromSupplier) {
            launchPayload = this.manufacturerPayload;
        } else {
            launchPayload = this.supplyChainData;
        }

        const productOtherInfo = {
            tradeName: this.additionalInfo
        };

        // Check for Agent Node payload
        if (this.isAgentNode) {
            launchPayload.productSupplyChainList[0].supplyChainArticle.supplierId = this.modelData.supplier.id;
            launchPayload.productSupplyChainList[0].supplyChainArticle.supplierName = this.modelData.supplier.name;
            launchPayload.productSupplyChainList[0].supplyChainArticle.supplierOtherInfo = this.modelData.supplier.supplierOtherInfo;
            if (this.additionalInfo || this.toCollectFromSupplier) {
                launchPayload.productSupplyChainList[0].supplyChainArticle.productOtherInfo = productOtherInfo;
            }
        } else {
            launchPayload.supplyChainArticle.supplierId = this.modelData.supplier.id;
            launchPayload.supplyChainArticle.supplierName = this.modelData.supplier.name;
            launchPayload.supplyChainArticle.supplierOtherInfo = this.modelData.supplier.supplierOtherInfo;
            if (this.additionalInfo || this.toCollectFromSupplier) {
                launchPayload.supplyChainArticle.productOtherInfo = productOtherInfo;
            }
        }

        if (!this.validate(launchPayload)) {
            return;
        }
        this.pageLoading = true;
        this.trs.launchAndProceedSupplyChain(launchPayload, this.trId).subscribe(
            response => {
                this.toastr.success('TR Launched', 'Success');
                setTimeout(() => {
                    this.pageLoading = false;
                    this.router.navigate(['/', 't-trace']);
                }, 1000);
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error(failResponse.error.message, 'Failed');
            }
        );
    }

    handleOptionChange({ item, additionalInfo }) {
        this.handleEntityChange(item);
        this.additionalInfo = additionalInfo;
    }

    handleEntityChange(item: any) {
        this.modelData.entity = item;
        this.toCollectFromSupplier = item.key === 'launch' ? true : false;
        let dataProvider;
        if (this.toCollectFromSupplier) {
            dataProvider = this.modelData.supplier.id;
        } else {
            dataProvider = this.auth.user.companyId;
        }
        // Check for Agent Node payload
        if (this.isAgentNode) {
            this.manufacturerPayload.productSupplyChainList[0].dataProvider = dataProvider;
        } else {
            this.manufacturerPayload.dataProvider = dataProvider;
        }
    }

    handleManufacturerChange(item: any) {
        this.modelData.supplier = {
            id: item.supplier_id,
            name: item.supplier_name,
            verificationStatus: item.supplier_verification_status,
            supplierAssociationStatus: item.supplier_association_status,
            supplierOtherInfo: item.supplier_other_info
        };
    }

    launchToSupplier() {
        // Check for Agent Node payload
        if (this.isAgentNode) {
            delete this.manufacturerPayload.productSupplyChainList[0]['productSupplyChainList'];
        } else {
            delete this.manufacturerPayload['productSupplyChainList'];
        }
        // delete this.manufacturerPayload['productSupplyChainList'];
        this.launchAndProceed();
    }

    getExisitingDataForSupplierSearch(item) {
        if (item) {
            let supplierData = {};
            if (this.isAgentNode) {
                supplierData = {
                    supplier_name: item.productSupplyChainList[0].supplyChainArticle.supplierName,
                    supplier_id: item.productSupplyChainList[0].supplyChainArticle.supplierId
                };
                if (item.supplierVerificationStatus) {
                    supplierData['supplier_verification_status'] = {
                        id: item.productSupplyChainList[0].supplyChainArticle.supplierVerificationStatus.id,
                        value: item.productSupplyChainList[0].supplyChainArticle.supplierVerificationStatus.value
                    };
                }

                if (item.supplierAssociationStatus) {
                    supplierData['supplier_association_status'] = {
                        id: item.productSupplyChainList[0].supplyChainArticle.supplierAssociationStatus.id,
                        value: item.productSupplyChainList[0].supplyChainArticle.supplierAssociationStatus.value
                    };
                }
            } else {
                supplierData = {
                    supplier_name: item.supplyChainArticle.supplierName,
                    supplier_id: item.supplyChainArticle.supplierId
                };
                if (item.supplierVerificationStatus) {
                    supplierData['supplier_verification_status'] = {
                        id: item.supplyChainArticle.supplierVerificationStatus.id,
                        value: item.supplyChainArticle.supplierVerificationStatus.value
                    };
                }
                if (item.supplierAssociationStatus) {
                    supplierData['supplier_association_status'] = {
                        id: item.item.supplyChainArticle.supplierAssociationStatus.id,
                        value: item.item.supplyChainArticle.supplierAssociationStatus.value
                    };
                }
            }

            return supplierData;
        }
    }

    shouldDisableManufacturerToggle() {
        if (
            this.modelData.supplier['id'] === this.auth.companyId ||
            // !this.modelData.supplier['supplierAssociationStatus'] ||
            !this.modelData.supplier['supplierAssociationStatus'] ||
            [0, 10].includes(this.modelData.supplier['supplierAssociationStatus'].id) ||
            !this.modelData.supplier.verificationStatus ||
            this.modelData.supplier.verificationStatus.id === 10
        ) {
            if (this.modelData.entity === this.entities[1]) {
                this.handleEntityChange(this.entities[0]);
            }
            return true;
        }
        return false;
    }

    analyticsSaveClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_TRACE_EDIT_PAGE + ' Save#Clicked', analyticsOptions);
    }

    analyticsLaunchAndProceedClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_TRACE_EDIT_PAGE + ' Launch&Proceed#Clicked',
            analyticsOptions
        );
    }
    getProductName(): { label: string; tradeName: string } {
        let label = this.supplyChainData.supplyChainArticle.internalArticleName;
        let tradeName = null;
        let labelName = null;

        labelName = this.supplyChainData.supplyChainArticle.productOtherInfo
            ? this.supplyChainData.supplyChainArticle.productOtherInfo.tradeName
            : '';

        tradeName = labelName;
        if (this.isAgentNode) {
            tradeName = this.supplyChainData.productSupplyChainList[0].supplyChainArticle.productOtherInfo
                ? this.supplyChainData.productSupplyChainList[0].supplyChainArticle.productOtherInfo.tradeName
                : '';
        }

        if (
            labelName &&
            (this.supplyChainData.dataProvider === this.auth.companyId ||
                this.supplyChainData.launchedBy === this.auth.companyId)
        ) {
            label = `${label} / ${labelName}`;
        }
        const resp = { label, tradeName: tradeName ? tradeName : null };
        return resp;
    }
}
