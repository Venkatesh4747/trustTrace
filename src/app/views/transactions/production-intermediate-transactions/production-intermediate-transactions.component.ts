import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AnalyticsService } from './../../../core/analytics/analytics.service';
import { AuthService } from './../../../core/user/auth.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { ContextService } from './../../../shared/context.service';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { UtilsService } from './../../../shared/utils/utils.service';
import {
    PRODUCTION_INTERMEDIATE_LABELS,
    ITierConfigPayload,
    SEARCH_CONTEXT,
    TRANSACTION_TYPE,
    IProductionIntermediateData,
    IProductionIntermediateInputLotData
} from './../transactions.model';
import { TransactionsService } from './../transactions.service';

@Component({
    selector: 'app-production-intermediate-transactions',
    templateUrl: './production-intermediate-transactions.component.html',
    styleUrls: ['./production-intermediate-transactions.component.scss']
})
export class ProductionIntermediateTransactionsComponent implements OnInit {
    env = environment;

    today = new Date();

    productionIntermediateLabels = PRODUCTION_INTERMEDIATE_LABELS;

    mandatoryFields: string[] = [
        this.productionIntermediateLabels.LOT_ID,
        this.productionIntermediateLabels.QUANTITY,
        this.productionIntermediateLabels.FACILITY,
        this.productionIntermediateLabels.INPUT_ARTICLE_NAME_NUMBER,
        this.productionIntermediateLabels.INPUT_FACILITY,
        this.productionIntermediateLabels.INPUT_LOT_ID,
        this.productionIntermediateLabels.INPUT_LOT_QUANTITY
    ];
    lotData = [];

    pageLoading: boolean = false;

    tierConfig: any;
    config: any;
    searchTermFacility: any;
    hintColor: string;

    tierPayload: ITierConfigPayload = {
        brandCompanyId: '000000000000000000000000',
        tier: 'tr_tier2',
        searchContext: SEARCH_CONTEXT.T2_PRODUCTION_INTERMEDIATE,
        txType: TRANSACTION_TYPE.PRODUCTION_INTERMEDIATE
    };

    optional = { key: 'lot_id', value: 'lot_id', selectedKey: 'lot_id' };
    poOptional = { key: 'po_number', value: 'po_number', selectedKey: 'po_number' };
    mlmIdOptional = { key: 'product_id', value: 'product_name_number', selectedKey: 'product_id' };
    supplierOptional = { key: 'id', value: 'value', selectedKey: 'id' };
    materialsOptional = { key: 'key', value: 'value', selectedKey: 'id' };

    tiers = ['tr_tier1', 'tr_tier2', 'tr_tier3', 'tr_tier4'];

    productionInput: IProductionIntermediateInputLotData = {
        articleId: '',
        lotId: '',
        poNumber: '',
        quantity: {
            quantity: '',
            unit: 'un_kilograms'
        },
        inputTxId: '',
        supplierId: null,
        supplierFacilityId: null,
        txType: 'INBOUND',
        fieldName: '',
        inputMaterialType: 0,
        materialCompositionList: []
    };

    nonSustainableProductionInput = {
        quantity: {
            quantity: '',
            unit: 'un_kilograms'
        },
        materialCompositionList: [
            {
                id: '',
                value: ''
            }
        ],
        txType: 'NON_SUSTAINABLE_INBOUND',
        fieldName: '',
        inputMaterialType: 1
    };

    payload: IProductionIntermediateData = {
        date: new Date(),
        companyId: '',
        mode: 'WEB_UI',
        txType: TRANSACTION_TYPE.PRODUCTION_INTERMEDIATE,
        facilityId: null,
        productionData: {
            outputLotId: null,
            outputQuantity: {
                quantity: '',
                unit: 'un_kilograms'
            },
            materialCompositionList: [
                {
                    id: '',
                    value: ''
                }
            ],
            sellerUOM: {
                quantity: '',
                unit: 'un_kilograms'
            },
            productionInputLots: []
        },
        tierId: ''
    };

    sustainableProductionInputs = [];
    nonSustainableProductionInputs = [];
    rawLotData = [];
    inputStyleComposition = [];
    inputLotsSelected = [];
    inputLotQtyArray = [];
    facilities = [];
    facilityRawData = [];

    tier_session = 'transactions_tier';
    articleSearchHintText = 'Type at least 3 characters to search';
    lotSearchHintText = 'Type to search';
    facilitySearchHintText = 'Type all characters to search';
    articleHintColor: string;
    lotHintColor: string;

    constructor(
        private transactionsService: TransactionsService,
        private authService: AuthService,
        private utilsService: UtilsService,
        private analyticsService: AnalyticsService,
        private router: Router,
        private toastrService: CustomToastrService,
        private appContext: ContextService,
        private localeService: LocalizationService,
        public commonServices: CommonServices
    ) {}

    ngOnInit() {
        this.pageLoading = true;
        this.tierPayload.brandCompanyId =
            this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : '000000000000000000000000';
        this.tierPayload.tier = this.utilsService.getSessionStorageValue(this.tier_session).key;
        this.tierPayload.searchContext = `${this.tierPayload.tier}_${TRANSACTION_TYPE.PRODUCTION_INTERMEDIATE}`;

        forkJoin([
            this.transactionsService.getTierConfig(this.tierPayload),
            this.transactionsService.getProductionIntermediateConfig()
        ]).subscribe(
            response => {
                // Process tier payload
                this.tierConfig = JSON.parse(JSON.stringify(response[0]));
                this.processProductionConfig(response[1]);
                this.pageLoading = false;
            },
            fail_response => {
                this.toastrService.error('error fetching transaction data');
                this.pageLoading = false;
            }
        );
    }

    processProductionConfig(response) {
        this.localeService.addToMasterData(response['data']['masterData']);
        this.config = response['data']['data'];

        if (this.sustainableProductionInputs && this.sustainableProductionInputs.length === 0) {
            this.addInputMaterial();
        }

        if (
            this.tierPayload.tier === this.tiers[1] &&
            this.nonSustainableProductionInputs &&
            this.nonSustainableProductionInputs.length === 0
        ) {
            this.addNonSustainableMaterial();
        }
    }

    checkToShowField(item: string) {
        return this.transactionsService.checkToShowField(item, this.mandatoryFields, this.tierConfig);
    }

    getFieldLabel(item: string) {
        return this.transactionsService.getFieldLabel(item, this.mandatoryFields, this.tierConfig);
    }

    saveProduction() {
        this.pageLoading = true;

        const sp_inputs = JSON.parse(JSON.stringify(this.sustainableProductionInputs));
        const nsp_inputs = JSON.parse(JSON.stringify(this.nonSustainableProductionInputs));

        if (sp_inputs.length < 1) {
            this.toastrService.info('Please add the input materials', 'No input materials');
            this.pageLoading = false;
            return;
        }

        sp_inputs.forEach(inputLot => {
            if (!inputLot.supplierFacilityId) {
                inputLot.supplierFacilityId = null;
            }
            inputLot.lotId = JSON.parse(JSON.stringify(inputLot)).lotId.lot_id;
            delete inputLot.articleId;
            delete inputLot.fieldName;
        });

        let payload = JSON.parse(JSON.stringify(this.payload));
        payload.productionData.productionInputLots = JSON.parse(JSON.stringify(sp_inputs));

        nsp_inputs.forEach(inputLot => {
            delete inputLot.fieldName;
        });
        for (let i = 0; i < nsp_inputs.length; i++) {
            if (!nsp_inputs[i].quantity.quantity) {
                nsp_inputs.splice(i, 1);
            }
        }
        nsp_inputs.forEach(input => {
            payload.productionData.productionInputLots.push(input);
        });

        payload.date = this.commonServices.adjustDateForTimezone(this.payload.date);
        payload.tierId = this.tierPayload.tier;
        payload['brandContextId'] = this.tierPayload.brandCompanyId;
        payload.companyId = this.authService.user.companyId;

        this.transactionsService.submitTransactions(payload).subscribe(
            (response: any) => {
                if (response && response.errorMsg !== null) {
                    this.analyticsService.trackSaveFail('production intermediate transaction');
                    if (response.errorMsg === 'Duplicate Transaction') {
                        this.toastrService.error('Production-intermediate Transaction already exists', 'Error');
                        this.pageLoading = false;
                    } else {
                        this.toastrService.error(response.errorMsg, 'Error');
                        this.pageLoading = false;
                    }
                } else {
                    this.analyticsService.trackSaveSuccess('production intermediate transaction');
                    this.toastrService.success('Transaction created successfully', 'Success');
                    setTimeout(() => {
                        this.appContext.cardViewRefresh.next(true);
                        this.pageLoading = false;
                        this.router.navigate(['/transactions']);
                    }, 2000);
                }
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.analyticsService.trackSaveFail(
                        'production intermediate transaction',
                        'Error: Duplicate Reference Id'
                    );
                    this.toastrService.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.analyticsService.trackSaveFail('production intermediate transaction');
                    this.toastrService.error(
                        'We could not process your request at the moment. Please try again later',
                        'Error'
                    );
                }
                this.pageLoading = false;
            }
        );
    }

    save() {
        this.analyticsService.trackSaveButtonClick('production intermediate transaction');
        this.saveProduction();
    }

    addMaterial() {
        this.payload.productionData.materialCompositionList.push({
            id: '',
            value: ''
        });
    }
    deleteMaterial(index) {
        this.payload.productionData.materialCompositionList.splice(index, 1);
        if (this.payload.productionData.materialCompositionList.length === 0) {
            this.addMaterial();
        }
    }

    addInputMaterial() {
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.sustainableProductionInputs.push(JSON.parse(JSON.stringify(this.productionInput)));
        this.inputLotsSelected.push({});
    }
    deleteInputMaterial(index) {
        this.sustainableProductionInputs.splice(index, 1);
        this.inputLotsSelected.splice(index, 1);
    }

    addNonSustainableMaterial() {
        this.nonSustainableProductionInput.fieldName = this.commonServices.makeId(5);
        this.nonSustainableProductionInputs.push(JSON.parse(JSON.stringify(this.nonSustainableProductionInput)));
        this.inputLotsSelected.push({});
    }
    deleteNonSustainableMaterial(index) {
        this.nonSustainableProductionInputs.splice(index, 1);
        this.inputLotsSelected.splice(index, 1);
    }

    addMaterialComposition(index: number) {
        const materialComp = { id: '', value: '' };
        this.nonSustainableProductionInputs[index].materialCompositionList.push(
            JSON.parse(JSON.stringify(materialComp))
        );
    }

    deleteMaterialComposition(index: number, compIndex: number) {
        if (
            this.nonSustainableProductionInputs.length > 1 &&
            this.nonSustainableProductionInputs[index].materialCompositionList.length === 1
        ) {
            this.deleteNonSustainableMaterial(index);
        } else {
            this.nonSustainableProductionInputs[index].materialCompositionList.splice(compIndex, 1);
        }
    }

    private filterForUniqueLots(rawLotData) {
        const filteredArticleNames = [];
        const filteredLotData = [];
        rawLotData.forEach(lot => {
            lot.product_name = lot.product_name.replace(/-$/, '');
            if (filteredArticleNames.indexOf(lot.product_name) === -1) {
                filteredArticleNames.push(lot.product_name);
                filteredLotData.push(lot);
            }
        });
        return filteredLotData;
    }

    private filterForUniqueArticles(rawLotData) {
        const filteredArticleNames = [];
        const filteredLotData = [];
        rawLotData.forEach(lot => {
            if (filteredArticleNames.indexOf(lot.lot_id) === -1) {
                filteredArticleNames.push(lot.lot_id);
                filteredLotData.push(lot);
            }
        });
        return filteredLotData;
    }

    searchInputMaterial(searchTerm) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        searchPayload['filter'] = {
            'Transaction Type': ['INBOUND', 'AUTOMATED INBOUND', 'COTTON INBOUND'],
            Status: ['SUBMITTED']
        };
        this.transactionsService.searchTransaction(searchPayload).subscribe(response => {
            // this.config.article_search = response['data'].searchResponse;
            this.rawLotData = response['data'].searchResponse;
            if (this.rawLotData.length > 0) {
                this.config.article_search = this.filterForUniqueLots(this.rawLotData);
            }
            if (searchTerm.length >= 3) {
                if (this.rawLotData.length > 0) {
                    this.articleHintColor = '';
                    this.articleSearchHintText = '';
                } else {
                    this.config.article_search = [];
                    this.articleHintColor = 'red';
                    this.articleSearchHintText = 'No results found';
                }
            }
        });
    }

    searchFreeHandFacility(searchTermFacility) {
        const searchPayload = {};
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        searchPayload['filter'] = {
            'Reference Id': [searchTermFacility],
            'Supplier Id': [this.authService.companyId]
        };

        if (!searchTermFacility) {
            return;
        }

        this.transactionsService.getFacilities(searchPayload).subscribe(response => {
            this.facilityRawData = response['data'].searchResponse;
            if (this.facilityRawData.length > 0) {
                this.facilities = JSON.parse(JSON.stringify(this.facilityRawData));
                this.hintColor = '';
                this.facilitySearchHintText = '';
            } else {
                if (this.facilities.length === 0) {
                    this.hintColor = 'red';
                    this.facilitySearchHintText = 'No results found';
                } else {
                    this.hintColor = '';
                    this.facilitySearchHintText = '';
                }
            }
        });
    }

    searchArticle(event, i) {
        if (event.key !== '') {
            this.searchInputMaterial(this.sustainableProductionInputs[i].articleId);
        }
    }

    searchFacility(event) {
        if (event.key !== '') {
            this.searchFreeHandFacility(this.searchTermFacility);
        }
    }

    onArticleSelection(value, index: number) {
        this.sustainableProductionInputs[index].poNumber = '';
        this.sustainableProductionInputs[index].lotId = '';
        this.sustainableProductionInputs[index].quantity.quantity = null;
        this.sustainableProductionInputs[index].inputTxDate = '';
        this.sustainableProductionInputs[index].materialCompositionList = value.material_composition;

        this.config.poNumber = this.rawLotData.filter(po => {
            return po.product_name === value.product_name && po.product_number === value.product_number;
        });

        const searchPayload = {};
        const searchTerm = value.product_name + '-' + value.product_number;
        searchPayload['freeHand'] = searchTerm;
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        if (value.tx_type === 'AUTOMATED INBOUND') {
            searchPayload['companyId'] = value.supplier ? value.supplier.id : null;
        }
        searchPayload['filter'] = {
            id: [value.product_id]
        };

        this.inputStyleComposition[index] = value['material_composition_view']
            ? value['material_composition_view']
            : '';
    }

    getLotDisplayName(item) {
        if (item) {
            return `${item.product_name}-${item.product_number}`;
        }
    }

    getLotName(item) {
        if (item) {
            return `${item.lot_id}`;
        }
    }

    getFacilityName(item) {
        if (item != null && item.reference_id != null) {
            return `${item.reference_id}-${item.name}`;
        }
    }

    onPoNumberChange(event, i) {
        this.sustainableProductionInputs[i].lotId = '';
        this.config.lots = [];
        this.config.lots = this.config.poNumber.filter(lot => {
            return (
                lot.po_number === event.po_number &&
                lot.product_name === event.product_name &&
                lot.product_number === event.product_number
            );
        });
    }

    inputLotChanged(event, index) {
        this.inputLotsSelected[index] = event;
        this.sustainableProductionInputs[index].quantity.quantity = this.inputLotsSelected[index].quantity;
        this.inputLotQtyArray[index] = this.inputLotsSelected[index].quantity;
        this.sustainableProductionInputs[index].quantity.unit = 'un_kilograms';
        this.sustainableProductionInputs[index].inputTxId = event.id;
        this.sustainableProductionInputs[index].inputTxDate = new Date(event.tx_date);
        this.sustainableProductionInputs[index].lotId = this.inputLotsSelected[index].lot_id;
        if (Array.isArray(event.supplier)) {
            this.config.suppliers = event.supplier;
        } else {
            let supplierObj = {
                id: event.supplier_id,
                value: event.supplier_name
            };
            this.config.suppliers = [];
            this.config.suppliers.push(supplierObj);
        }
    }

    checkQuantityEntered(userQty, i) {
        const lotQty = this.inputLotQtyArray[i];
        const lot = this.inputLotsSelected[i];
        if (userQty > +lotQty) {
            this.toastrService.error(
                'Invalid Quantity Entered: Available Quantity in selected Lot:' + lotQty + ' ' + lot.quantity.unit_value
            );
            this.sustainableProductionInputs[i].quantity.quantity = undefined;
            this.sustainableProductionInputs[i].quantity.unit = 'un_kilograms';
        }
    }

    checkNonZeroQuantity(i) {
        if (this.sustainableProductionInputs[i].quantity.quantity === 0) {
            this.toastrService.error('Invalid Quantity Entered');
            this.sustainableProductionInputs[i].quantity.quantity = undefined;
            this.sustainableProductionInputs[i].quantity.unit = 'un_kilograms';
        }
    }

    checkNonSustainableMaterialQuantityEntered(i, compInd) {
        const quantityUsed = this.nonSustainableProductionInputs[i].quantity.quantity;
        const qty = this.nonSustainableProductionInputs[i].materialCompositionList.reduce((sum, currentValue) => {
            return sum + +currentValue.value;
        }, 0);
        if (qty > +quantityUsed) {
            this.toastrService.error('Invalid Quantity Entered: Available Quantity in selected Lot:' + quantityUsed);
            this.nonSustainableProductionInputs[i].materialCompositionList[compInd].value = undefined;
        }
    }

    updateSupplier(event: any, index: number) {
        this.inputLotsSelected[index] = event;
        this.sustainableProductionInputs[index].supplierFacilityId = this.inputLotsSelected[index].id;
    }

    searchLot(event, i) {
        if (this.sustainableProductionInputs[i].lotId.trim() === '') {
            this.config.lot_search = [];
            this.lotHintColor = 'red';
        } else if (event.key !== '') {
            const searchTerm = this.sustainableProductionInputs[i].lotId;
            const searchPayload = {};
            searchPayload['freeHand'] = searchTerm;
            searchPayload['filter'] = {
                'Transaction Type': ['INBOUND', 'AUTOMATED INBOUND', 'COTTON INBOUND', 'INTERMEDIATE PRODUCTION'],
                Status: ['SUBMITTED']
            };
            this.transactionsService.searchTransaction(searchPayload).subscribe(response => {
                this.lotData = response['data'].searchResponse;
                if (this.lotData.length > 0) {
                    this.config.lot_search = this.filterForUniqueArticles(this.lotData);
                }
                if (searchTerm.length >= 3) {
                    if (this.lotData.length > 0) {
                        this.lotHintColor = '';
                        this.lotSearchHintText = '';
                    } else {
                        this.config.lot_search = [];
                        this.lotHintColor = 'red';
                        this.lotSearchHintText = 'No results found';
                    }
                }
            });
        }
    }

    onLotSelection(value, index: number) {
        // this.sustainableProductionInputs[index].lotId = value.lot_id;
        this.inputLotsSelected[index] = value;
        this.sustainableProductionInputs[index].poNumber = '';

        if (value.tx_type === 'INTERMEDIATE PRODUCTION') {
            this.sustainableProductionInputs[index].articleId = `${value.product_name_number}`;
            this.sustainableProductionInputs[index].materialCompositionList = value.material_composition;
            this.sustainableProductionInputs[index].inputTxId = value.id;
            this.sustainableProductionInputs[index].inputTxDate = new Date(value.tx_date);
            this.inputStyleComposition[index] = value['material_composition_view']
                ? value['material_composition_view']
                : '';
        } else {
            this.sustainableProductionInputs[index].articleId = '';
            this.sustainableProductionInputs[index].materialCompositionList = '';
            this.sustainableProductionInputs[index].inputTxId = '';
            this.sustainableProductionInputs[index].inputTxDate = new Date();
            this.inputStyleComposition[index] = '';
        }

        this.config.poNumber = [];

        this.lotData.forEach(lot => {
            if (lot.invoice_number && lot.lot_id === value.lot_id) {
                lot.po_number = lot.invoice_number;
                this.config.poNumber.push(lot);
            } else if (lot.tc_reference_number && lot.lot_id === value.lot_id) {
                lot.po_number = lot.tc_reference_number;
                this.config.poNumber.push(lot);
            } else if (lot.po_number && lot.lot_id === value.lot_id) {
                this.config.poNumber.push(lot);
            }
        });

        this.sustainableProductionInputs[index].quantity.quantity = null;
        this.sustainableProductionInputs[index].quantity.unit = 'un_kilograms';
        this.sustainableProductionInputs[index].txType = value.tx_type.replace(/ /g, '_');

        // if (Array.isArray(value.supplier_facility)) {
        //     this.config.suppliers = value.supplier_facility;
        // } else {
        //     let supplierFacilityObj = {
        //         id: value.supplier_facility.id,
        //         value: value.supplier_facility.value
        //     };
        //     this.config.suppliers = [];
        //     this.config.suppliers.push(supplierFacilityObj);
        // }

        const searchPayload = {};
        const searchTerm = value.lot_id;
        searchPayload['freeHand'] = searchTerm;
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        if (value.tx_type === 'AUTOMATED INBOUND') {
            searchPayload['companyId'] = value.supplier ? value.supplier.id : null;
        }
        searchPayload['filter'] = {
            id: [value.product_id]
        };
    }

    onPoSelection(event, i) {
        this.sustainableProductionInputs[i].articleId = `${event.product_name_number}`;
        this.sustainableProductionInputs[i].poNumber = event.po_number;
        this.sustainableProductionInputs[i].materialCompositionList = event.material_composition;
        this.sustainableProductionInputs[i].inputTxId = event.id;
        this.sustainableProductionInputs[i].inputTxDate = new Date(event.tx_date);

        this.inputStyleComposition[i] = event['material_composition_view'] ? event['material_composition_view'] : '';
        this.inputLotQtyArray[i] = this.inputLotsSelected[i].quantity.value;

        this.config.mlmIds = [];
        this.config.poNumber.forEach(po => {
            if (
                (po.invoice_number && po.invoice_number === event.po_number) ||
                (po.po_number && po.po_number === event.po_number)
            ) {
                this.config.mlmIds.push(po);
            }
        });

        if (Array.isArray(event.supplier_facility)) {
            this.config.suppliers = event.supplier_facility;
        } else {
            let supplierFacilityObj = {
                id: event.supplier_facility.id,
                value: event.supplier_facility.value
            };
            this.config.suppliers = [];
            this.config.suppliers.push(supplierFacilityObj);
        }
    }

    onMLMSelection(event, i) {
        this.sustainableProductionInputs[i].productItemId = `${event.product_id}`;
    }

    onLotArticleSelection(value, index: number) {
        this.inputStyleComposition[index] = value['material_composition_view']
            ? value['material_composition_view']
            : '';
    }

    onFacilitySelection(value) {
        this.payload.facilityId = value.reference_id;
    }

    isPoNumberMandatory(value) {
        return value.txType === TRANSACTION_TYPE.PRODUCTION_INTERMEDIATE ? false : true;
    }

    validateSelectedFacility() {
        setTimeout(() => {
            if (this.searchTermFacility.hasOwnProperty('reference_id') || !this.searchTermFacility) {
                return;
            }

            let matchedItems = this.facilities.filter(
                x => x.reference_id.toLocaleUpperCase() === this.searchTermFacility.toLocaleUpperCase()
            );

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.searchTermFacility = '';
                this.facilities = [];
                this.toastrService.error('Please select a valid Facility');
            }
        }, 100);
    }
    validation() {
        if (typeof this.searchTermFacility !== 'object') {
            this.searchTermFacility = '';
            this.facilities = [];
            this.toastrService.error('Please select a valid Facility');
        }
    }
}
