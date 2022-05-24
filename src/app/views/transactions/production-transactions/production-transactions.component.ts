import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import {
    ISupplierListFormOptions,
    SupplierListTypes
} from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { ContextService } from '../../../shared/context.service';
import { APP_DATE_FORMATS, AppDateAdapter } from '../../../shared/utils/format-datepicker';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { ITierConfigPayload, PRODUCTION_LABELS, SEARCH_CONTEXT, TRANSACTION_TYPE } from '../transactions.model';
import { TransactionsService } from '../transactions.service';
import { UtilsService } from './../../../shared/utils/utils.service';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-production-transactions',
    templateUrl: './production-transactions.component.html',
    styleUrls: ['./production-transactions.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class ProductionTransactionsComponent implements OnInit, OnDestroy {
    today = new Date();
    hintColor: string;
    articleHintColor: string;
    lotHintColor: string;
    subscription: Subscription;
    searchTermFacility: any;
    searchRawData = [];
    searchData = [];
    rawLotData = [];
    facilityRawData = [];
    inputLotQtyArray = [];
    totalLotQytArray = [];
    facilities = [];

    lotData = [];

    pageLoading = false;
    config: any = {};
    inputMaterials = [];
    inputMaterial = {};
    inputLotDropdown = [];
    suppliers = [];

    productSearchText: any;
    articlesSearchText = [];

    articleSearchText = [];
    stylesAutoCompleteList = [];

    soaUniqueName: any;

    articleUniqueName = '';

    productionInput = {
        lotId: '',
        poNumber: '',
        productItemId: '',
        quantity: {
            quantity: '',
            unit: 'un_kilograms'
        },
        supplierUOM: {
            quantity: null,
            unit: null
        },
        inputTxDate: '',
        inputTxId: '',
        supplierId: null,
        supplierFacilityId: null,
        txType: 'INBOUND',
        articleId: '',
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

    transaction = {
        date: new Date(),
        companyId: '',
        mode: 'WEB_UI',
        txType: TRANSACTION_TYPE.PRODUCTION,
        facilityId: null,
        productionData: {
            outputLotId: '',
            productEntity: '',
            outputProductItemId: '',
            outputQuantity: {
                quantity: null,
                unit: 'un_kilograms'
            },
            sellerUOM: {
                quantity: null,
                unit: ''
            },
            supplierMaterialName: '',
            productionInputLots: []
        }
    };

    inputLotsSelected = [];

    sustainableProductionInputs = [];
    nonSustainableProductionInputs = [];

    // searchable dropdown
    isRequired = true;
    optional = { key: 'lot_id', value: 'lot_id', selectedKey: 'lot_id' };
    poOptional = { key: 'po_number', value: 'po_number', selectedKey: 'po_number' };
    mlmIdOptional = { key: 'product_id', value: 'product_name_number', selectedKey: 'product_id' };
    supplierOptional = { key: 'id', value: 'value', selectedKey: 'id' };
    materialsOptional = { key: 'key', value: 'value', selectedKey: 'id' };
    articlesOptional = { key: 'product_id', value: 'product_name', selectedKey: 'product_id' };

    tiers = ['tr_tier1', 'tr_tier2', 'tr_tier3', 'tr_tier4'];

    supplierListOptions: ISupplierListFormOptions = {
        controlType: 'single-select',
        listOnlyThisSuppliers: [
            SupplierListTypes.not_invited_supplier,
            SupplierListTypes.accepted_supplier,
            SupplierListTypes.unAccepted_supplier
        ],
        acceptOnlyListedValues: true,
        floatLabel: 'always',
        isRequired: true,
        placeholder: 'Supplier:',
        valueChangesFire: 'from-option',
        customClass: 'transaction-custom-style'
    };

    private suppliersList: any;

    env = environment;

    validationResponse = {};

    styleComposition = [];
    inputStyleComposition = [];

    soaSearchHintText = 'Type all characters to search';
    articleSearchHintText = 'Type at least 3 characters to search';
    lotSearchHintText = 'Type to search';
    facilitySearchHintText = 'Type all characters to search';

    tierPayload: ITierConfigPayload = {
        brandCompanyId: '000000000000000000000000',
        tier: 'tr_tier1',
        searchContext: SEARCH_CONTEXT.T1_PRODUCTION,
        txType: TRANSACTION_TYPE.PRODUCTION
    };

    showArticleError = false;
    articleError = '';
    tierConfig: any;
    productionLabels = PRODUCTION_LABELS;
    mandatoryFields: string[] = [
        this.productionLabels.INTERNAL_FIELD,
        this.productionLabels.LOT_ID,
        this.productionLabels.QUANTITY,
        this.productionLabels.PO_NUMBER,
        this.productionLabels.PO_DATE,
        this.productionLabels.TRANSACTION_DATE,
        this.productionLabels.SUPPLIER,
        this.productionLabels.FACILITY,
        this.productionLabels.INPUT_ARTICLE_NAME_NUMBER,
        this.productionLabels.INPUT_LOT_ID,
        this.productionLabels.INPUT_LOT_QUANTITY,
        this.productionLabels.INPUT_MATERIAL_COMPOSITION,
        this.productionLabels.INPUT_PO_NUMBER
    ];

    PRODUCT_IDENTIFIERS = [
        this.productionLabels.MATERIAL_NAME,
        this.productionLabels.MATERIAL_NUMBER,
        this.productionLabels.STYLE_NAME,
        this.productionLabels.STYLE_NUMBER
    ];

    SEARCHFIELDS = {};

    tier_session = 'transactions_tier';
    selectedTier = 'Tier1';
    module = 'TT_TRANSACTION';
    constructor(
        private localeService: LocalizationService,
        private router: Router,
        private toastrService: CustomToastrService,
        public commonServices: CommonServices,
        private analyticsService: AnalyticsService,
        private appContext: ContextService,
        public authService: AuthService,
        private transactionsService: TransactionsService,
        private utilsService: UtilsService,
        private dialog: MatDialog
    ) {
        this.transaction.companyId = this.authService.companyId;
    }

    ngOnInit() {
        this.analyticsService.trackPageVisit('production transaction');
        this.pageLoading = true;

        this.SEARCHFIELDS[this.productionLabels.MATERIAL_NAME] = ['internal_article_name.search'];
        this.SEARCHFIELDS[this.productionLabels.MATERIAL_NUMBER] = ['material_unique_code.search'];
        this.SEARCHFIELDS[this.productionLabels.STYLE_NAME] = ['name.search'];
        this.SEARCHFIELDS[this.productionLabels.STYLE_NUMBER] = ['code.search'];

        // Fetch brand associated from user context
        this.tierPayload.brandCompanyId =
            this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : '000000000000000000000000';
        const tierSession = this.utilsService.getSessionStorageValue(this.tier_session);
        this.tierPayload.tier = tierSession.key;
        this.selectedTier = tierSession.value;
        this.tierPayload.searchContext = `${this.tierPayload.tier}_${TRANSACTION_TYPE.PRODUCTION}`;
        forkJoin([
            this.transactionsService.getTierConfig(this.tierPayload),
            this.transactionsService.getProductionConfig()
        ]).subscribe(
            response => {
                // Process tier payload
                this.tierConfig = JSON.parse(JSON.stringify(response[0]));
                this.supplierListOptions.placeholder = this.getFieldLabel(this.productionLabels.SUPPLIER);

                // Process Outbound config
                this.processProductionConfig(response[1]);
            },
            fail_response => {
                this.toastrService.error('error fetching transaction data');
                this.pageLoading = false;
            }
        );
    }
    getProductionConfig() {
        this.pageLoading = true;
        // this.transactionsService
        //     .getProductionConfig({ tier: this.tierPayload.tier, brandContextId: this.tierPayload.brandCompanyId })
        //     .subscribe(response => {
        //         this.processProductionConfig(response);
        //     });
        this.transactionsService.getProductionConfig().subscribe(response => {
            this.processProductionConfig(response);
        });
    }

    processProductionConfig(response) {
        this.config = response['data']['data'];
        // remove this from backend
        this.config.lots = [];
        this.config.suppliers = [];
        this.config.poNumber = [];
        this.config.mlmIds = [];
        this.localeService.addToMasterData(response['data'].masterData);
        // this.constructArticlesAutoCompleteList();
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
        // this.searchRawData = this.config.SOA_search;
        this.pageLoading = false;
    }

    ngOnDestroy() {
        // prevent memory leak when component is destroyed
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private filterForUniqueSOAValue(rawSOAData) {
        const filteredSOATerms = [];
        const filteredSOAData = [];
        rawSOAData.forEach(el => {
            //el.unique_search = el.unique_search.replace('-null', '').replace('null-', '');
            if (this.tierPayload.tier === this.tiers[0]) {
                if (filteredSOATerms.indexOf(el.product_unique_code) === -1) {
                    filteredSOATerms.push(el.product_unique_code);
                }
            } else {
                if (filteredSOATerms.indexOf(el.material_unique_code) === -1) {
                    filteredSOATerms.push(el.material_unique_code);
                }
            }
            filteredSOAData.push(el);
        });
        return filteredSOAData;
    }

    addInputMaterial() {
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.sustainableProductionInputs.push(JSON.parse(JSON.stringify(this.productionInput)));
        this.inputLotsSelected.push({});
        this.articlesSearchText.push('');
    }
    deleteInputMaterial(index) {
        // if (index < this.transaction.productionData.productionInputLots.length - 1) {
        this.sustainableProductionInputs.splice(index, 1);
        this.inputLotsSelected.splice(index, 1);
        this.inputLotDropdown.splice(index, 1);
        this.articlesSearchText.splice(index, 1);
        // }
    }

    addNonSustainableMaterial() {
        this.nonSustainableProductionInput.fieldName = this.commonServices.makeId(5);
        this.nonSustainableProductionInputs.push(JSON.parse(JSON.stringify(this.nonSustainableProductionInput)));
        this.inputLotsSelected.push({});
        this.articlesSearchText.push('');
    }
    deleteNonSustainableMaterial(index) {
        // if (index < this.transaction.productionData.productionInputLots.length - 1) {
        this.nonSustainableProductionInputs.splice(index, 1);
        this.inputLotsSelected.splice(index, 1);
        this.inputLotDropdown.splice(index, 1);
        this.articlesSearchText.splice(index, 1);
        // }
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

    checkQuantityEntered(userQty, i) {
        const lotQty = this.inputLotQtyArray[i];
        const lot = this.inputLotsSelected[i];
        if (userQty > +lotQty) {
            this.toastrService.error(
                'Invalid Quantity Entered: Available Quantity in selected Lot:' + lotQty + ' ' + lot.quantity.unit_value
            );

            this.sustainableProductionInputs[i].quantity.quantity = undefined;
            this.sustainableProductionInputs[i].quantity.unit = 'un_kilograms';
        } else {
            if (
                this.sustainableProductionInputs[i].quantity.quantity &&
                this.inputLotsSelected[i].actual_conversion_ratio
            ) {
                this.sustainableProductionInputs[i].supplierUOM.quantity = (
                    parseFloat(this.sustainableProductionInputs[i].quantity.quantity) /
                    this.inputLotsSelected[i].actual_conversion_ratio
                )
                    .toFixed(this.inputLotsSelected[i].quantity_in_uom.value)
                    .toString();
            }
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

        // this.addInputMaterial();
    }

    private clearForm() {
        this.soaUniqueName = { product_unique_code: '', material_unique_code: '' };
        this.searchTermFacility = '';
        this.suppliers = [];
        this.config.lots = [];
        this.config.suppliers = [];
        this.config.poNumber = [];
        this.config.mlmIds = [];
        this.config.materials = [];
        this.showArticleError = false;
        this.articleError = '';
        this.styleComposition = [];
        this.inputStyleComposition = [];
        this.productionInput = {
            lotId: '',
            poNumber: '',
            productItemId: '',
            quantity: {
                quantity: '',
                unit: 'un_kilograms'
            },
            supplierUOM: {
                quantity: null,
                unit: null
            },
            inputTxDate: '',
            inputTxId: '',
            supplierId: null,
            supplierFacilityId: null,
            txType: 'INBOUND',
            articleId: '',
            fieldName: '',
            inputMaterialType: 0,
            materialCompositionList: []
        };

        this.nonSustainableProductionInput = {
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

        this.transaction = {
            date: new Date(),
            companyId: this.authService.companyId,
            mode: 'WEB_UI',
            txType: TRANSACTION_TYPE.PRODUCTION,
            facilityId: null,
            productionData: {
                productEntity: '',
                outputLotId: '',
                outputProductItemId: '',
                outputQuantity: {
                    quantity: '',
                    unit: 'un_kilograms'
                },
                sellerUOM: {
                    quantity: null,
                    unit: ''
                },
                productionInputLots: [],
                supplierMaterialName: ''
            }
        };
        this.articleUniqueName = '';
        this.productSearchText = {};
        this.inputLotsSelected = [];
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.sustainableProductionInputs.push(JSON.parse(JSON.stringify(this.productionInput)));
        this.nonSustainableProductionInputs.push(JSON.parse(JSON.stringify(this.nonSustainableProductionInput)));
        this.getProductionConfig();
    }

    getSOADisplayName(item) {
        if (item) {
            return this.tierPayload.tier === this.tiers[0] ? item.product_unique_code : item.material_unique_code;
        }
    }

    getFacilityName(item) {
        if (item != null && item.reference_id != null) {
            return `${item.reference_id}-${item.name}`;
        }
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

    searchFreeHandProduction(searchTerm, productIdentifier) {
        this.showArticleError = false;
        this.articleError = '';
        const searchPayload = {
            brandContextId: '',
            filter: {}
        };
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        searchPayload['module'] = this.module;
        // searchPayload['freeHand'] = searchTerm;
        // searchPayload['freeHandFields'] = this.SEARCHFIELDS[productIdentifier];
        if (!searchTerm) {
            return;
        }

        if (this.tierPayload.tier === this.tiers[0]) {
            searchPayload['filter']['Product Unique Code'] = [searchTerm];
            this.transactionsService.searchFreeHandStyle(searchPayload).subscribe(
                response => {
                    this.processSearchResult(response, searchTerm);
                },
                () => {
                    this.processSearchError(searchTerm);
                }
            );
        } else {
            searchPayload['filter']['Material Unique Code'] = [searchTerm];
            this.transactionsService.searchFreeHandMaterial(searchPayload).subscribe(
                response => {
                    this.processSearchResult(response, searchTerm);
                },
                () => {
                    this.processSearchError(searchTerm);
                }
            );
        }
    }

    searchFreeHandFacility(searchTermFacility) {
        const searchPayload = {};
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        searchPayload['module'] = this.module;
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

    private processSearchError(searchTerm) {
        if (searchTerm && searchTerm.length >= 3) {
            this.searchData = [];
            this.hintColor = 'red';
            this.soaSearchHintText = 'No results found';
        }
    }
    private processSearchResult(response, searchTerm) {
        this.searchRawData = response['data'].searchResponse;
        if (this.searchRawData.length > 0) {
            // used to check only unique values are pushed to this.config.SOA_search
            this.searchData = this.filterForUniqueSOAValue(this.searchRawData);

            this.hintColor = '';
            this.soaSearchHintText = '';
        } else {
            if (searchTerm && searchTerm.length >= 3) {
                this.searchData = [];
                this.hintColor = 'red';
                this.soaSearchHintText = 'No results found';
            }
        }
    }

    searchInputMaterial(searchTerm) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm.toLocaleUpperCase();
        searchPayload['module'] = this.module;
        searchPayload['filter'] = {
            'Transaction Type': ['INBOUND', 'AUTOMATED INBOUND'],
            Status: ['SUBMITTED']
        };
        if (this.tierPayload.tier === this.tiers[1]) {
            searchPayload['filter']['Transaction Type'].push('COTTON_INBOUND');
        }
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

    searchLotDetail(event: any) {
        if (event.key !== '') {
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

    onProductSelection(value) {
        //const soaSplit = value.id_type.split('-');
        // this.transaction.productionData.outputProductItemId = soaSplit[0];

        if (this.tierPayload.tier === this.tiers[0]) {
            this.transaction.productionData.productEntity = 'STYLE';
            this.transaction.productionData.outputProductItemId = value.product_unique_code;
        } else {
            this.transaction.productionData.productEntity = 'MATERIAL_LIBRARY';
            this.transaction.productionData.outputProductItemId = value.material_unique_code;
        }
        this.sustainableProductionInputs = [];
        this.nonSustainableProductionInputs = [];
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.sustainableProductionInputs.push(JSON.parse(JSON.stringify(this.productionInput)));
        this.nonSustainableProductionInputs.push(JSON.parse(JSON.stringify(this.nonSustainableProductionInput)));
        // this.getMaterialCompForMultiLayer(); Not applicable for fashion
        // Get Lots related to this style
        // const searchPayload = {};
        // const searchTerm = this.productSearchText.unique_search;
        // searchPayload['freeHand'] = searchTerm;
        // searchPayload['filter'] = {
        //     id: [soaSplit[0]]
        // };
        // this.transactionsService.getStyleDetails(searchPayload).subscribe(data => {
        //     this.styleComposition = data['material_composition'];
        // });
        this.styleComposition = value['material_composition'];
    }

    onFacilitySelection(value) {
        this.transaction.facilityId = value.reference_id;
        this.getMaterialCompForMultiLayer();
    }
    getStyleComposition() {
        let composition = '';
        if (this.styleComposition && this.styleComposition.length > 0) {
            composition = this.styleComposition.map(comp => `${comp.value} ${comp.composition}%`).join(', ');
        }
        return composition;
    }

    getMaterialCompForMultiLayer() {
        if (
            this.transaction.productionData.productEntity === 'MATERIAL_LIBRARY' &&
            this.transaction.facilityId !== null &&
            this.transaction.productionData.outputProductItemId !== null
        ) {
            let payload = {
                brandContextId: this.tierPayload.brandCompanyId,
                outputProductItemId: this.transaction.productionData.outputProductItemId,
                facilityId: this.transaction.facilityId,
                companyId: this.transaction.companyId
            };
            this.transactionsService.getMaterialByMaterialCodeAndFacility(payload).subscribe(response => {
                this.styleComposition = response['data']['material_composition'];
                this.transaction.productionData.supplierMaterialName = response['data']['supplier_name'];
            });
        }
    }

    getInputStyleComposition(index: number) {
        return this.inputStyleComposition[index];
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

    onPoNumberChange(event, i) {
        this.sustainableProductionInputs[i].poNumber = event.po_number;
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

    searchArticle(event, i) {
        if (event.key !== '') {
            this.searchInputMaterial(this.sustainableProductionInputs[i].articleId);
        }
    }

    searchStyleOrArticle(event, productIdentifier) {
        if (event.key !== '') {
            this.searchFreeHandProduction(this.soaUniqueName, productIdentifier);
        }
        if (event.target.value.trim('') === '') {
            this.soaUniqueName = { product_unique_code: '', material_unique_code: '' };
        }
    }

    searchFacility(event) {
        if (event.key !== '') {
            this.searchFreeHandFacility(this.searchTermFacility);
        }
    }

    getProductName(item) {
        let displayText = '';
        if (item) {
            if (this.tierPayload.tier === this.tiers[0]) {
                if (item.product_unique_code) {
                    displayText += item.product_unique_code + '-';
                }

                if (item.name) {
                    displayText += item.name;
                }
            } else {
                if (item.material_unique_code) {
                    displayText += item.material_unique_code + '-';
                }

                if (item.internal_article_name) {
                    displayText += item.internal_article_name;
                }
            }
        }
        if (displayText.endsWith('-')) {
            displayText = displayText.slice(0, -1);
        }
        return displayText;
    }

    validateSelectedProduct(productIdentifier) {
        let matchedItems;
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (this.tierPayload.tier === this.tiers[0]) {
                if (
                    !this.soaUniqueName ||
                    (this.soaUniqueName.hasOwnProperty('product_unique_code') && this.soaUniqueName.product_unique_code)
                ) {
                    return;
                }
                matchedItems = this.searchData.filter(x => x.product_unique_code === this.soaUniqueName);
            } else {
                if (
                    !this.soaUniqueName ||
                    (this.soaUniqueName.hasOwnProperty('material_unique_code') &&
                        this.soaUniqueName.material_unique_code)
                ) {
                    return;
                }
                matchedItems = this.searchData.filter(x => x.material_unique_code === this.soaUniqueName);
            }

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.showArticleError = true;
                this.soaUniqueName = '';
                this.articleError = `${this.getFieldLabel(productIdentifier)} is invalid`;
                // this.toastrService.error('Please select a valid Article / Style');
            }
        }, 100);
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

    searchStyle(event) {
        if (event.key !== '') {
            this.searchFreeHandProduction(this.productSearchText, '');
        }
    }

    saveProductionOrder() {
        this.pageLoading = true;
        const sp_inputs = JSON.parse(JSON.stringify(this.sustainableProductionInputs));
        const nsp_inputs = JSON.parse(JSON.stringify(this.nonSustainableProductionInputs));

        if (sp_inputs.length < 1) {
            this.toastrService.info('Please add the input materials', 'No input materials');
            this.pageLoading = false;
            return;
        }

        sp_inputs.forEach(inputLot => {
            if (this.tierPayload.tier === this.tiers[1]) {
                delete inputLot.articleId;
                delete inputLot.supplierUOM;
            } else if (
                this.tierPayload.tier === this.tiers[0] &&
                (!inputLot.supplierUOM.quantity || inputLot.supplierUOM.quantity === null)
            ) {
                delete inputLot.supplierUOM;
            }

            if (!inputLot.poNumber || inputLot.poNumber === null) {
                delete inputLot.poNumber;
            }

            if (typeof inputLot.lotId !== 'string') {
                inputLot.lotId = inputLot.lotId.lot_id;
            }
            delete inputLot.fieldName;
        });

        let payload = JSON.parse(JSON.stringify(this.transaction));
        if (this.transaction.productionData.sellerUOM.quantity == null) {
            delete payload.productionData.sellerUOM;
        }
        if (!this.transaction.productionData.supplierMaterialName) {
            delete payload.productionData.supplierMaterialName;
        }
        payload.productionData.productionInputLots = JSON.parse(JSON.stringify(sp_inputs));

        if (this.tierPayload.tier === this.tiers[1]) {
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
        }

        payload.date = this.commonServices.adjustDateForTimezone(this.transaction.date);
        payload['tierId'] = this.tierPayload.tier;
        payload['brandContextId'] = this.tierPayload.brandCompanyId;

        this.transactionsService.submitTransactions(payload).subscribe(
            (response: any) => {
                if (response && response.errorMsg !== null) {
                    this.analyticsService.trackSaveFail('production transaction');
                    this.pageLoading = false;
                    if (response.errorMsg === 'Duplicate Transaction') {
                        this.toastrService.error('Production Transaction already exists', 'Error');
                    } else if (response.errorMsg === 'Transaction Submitted For Edit') {
                        const submitTransactionResponse = response;
                        const msgText =
                            this.tierPayload.tier === this.tiers[0]
                                ? 'BOM validation failed. Transaction will be submitted for LO approval'
                                : 'Material validation failed. Transaction will be submitted for LO approval';
                        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                            width: '375px',
                            data: {
                                class: 'confirmation-dialog',
                                title: 'Warning!',
                                msg: msgText,
                                primaryButton: 'Submit',
                                secondaryButton: 'Cancel',
                                removeMargins: true,
                                showClose: false
                            }
                        });
                        dialogRef.afterClosed().subscribe(response => {
                            if (response === 'Submit') {
                                this.submitTransactionToLoApproval(submitTransactionResponse.transactionId);
                            } else {
                                this.transaction['id'] = submitTransactionResponse.transactionId;
                            }
                        });
                    } else {
                        this.toastrService.error(response.errorMsg, 'Error');
                    }
                } else {
                    this.analyticsService.trackSaveSuccess('production transaction');
                    this.toastrService.success('Transaction created successfully', 'Success');
                    this.clearForm();
                    setTimeout(() => {
                        this.appContext.cardViewRefresh.next(true);
                        this.pageLoading = false;
                        this.router.navigate(['/transactions']);
                    }, 2000);
                }
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.analyticsService.trackSaveFail('production transaction', 'Error: Duplicate Reference Id');
                    this.toastrService.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.analyticsService.trackSaveFail('production transaction');
                    this.toastrService.error(
                        'We could not process your request at the moment. Please try again later',
                        'Error'
                    );
                }
                this.pageLoading = false;
            }
        );
    }

    styleSelectionChanged(event) {
        this.transaction.productionData.outputProductItemId = event.option.value.id;
    }

    articleSelectionChanged(event, index) {
        this.sustainableProductionInputs[index].soaId = event.option.value.id;
        this.sustainableProductionInputs[index].soaType = event.option.value.type;
    }

    save() {
        this.analyticsService.trackSaveButtonClick('production transaction');
        this.saveProductionOrder();
    }

    validateSelectedStyle() {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            const unique_code =
                this.tierPayload.tier === this.tiers[0] ? 'product_unique_code' : 'material_unique_code';
            if (this.productSearchText.hasOwnProperty(unique_code) || !this.productSearchText) {
                return;
            }

            let matchedItems = this.searchData.filter(x => {
                const val = x[unique_code] === this.productSearchText;
                return val;
            });

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.showArticleError = true;
                this.articleError = `${this.getFieldLabel(this.productionLabels.ARTICLE_NAME_NUMBER)} is invalid`;
                this.productSearchText = '';
                // this.toastrService.error('Please select a valid Article / Style');
            }
        }, 100);
    }

    updateSupplier(event: any, index: number) {
        this.inputLotsSelected[index] = event;
        this.sustainableProductionInputs[index].supplierFacilityId = this.inputLotsSelected[index].id;
    }

    checkToShowField(item: string) {
        return this.transactionsService.checkToShowField(item, this.mandatoryFields, this.tierConfig);
    }

    getFieldLabel(item: string) {
        return this.transactionsService.getFieldLabel(item, this.mandatoryFields, this.tierConfig);
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
            this.sustainableProductionInputs[index].productItemId = '';
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

    isPoNumberMandatory(value) {
        return value.txType === TRANSACTION_TYPE.PRODUCTION_INTERMEDIATE ? false : true;
    }

    updateQuantity(i) {
        if (
            this.sustainableProductionInputs[i].supplierUOM.quantity &&
            this.inputLotsSelected[i].actual_conversion_ratio
        ) {
            this.sustainableProductionInputs[i].quantity.quantity = (
                parseFloat(this.sustainableProductionInputs[i].supplierUOM.quantity) *
                this.inputLotsSelected[i].actual_conversion_ratio
            )
                .toFixed(this.inputLotsSelected[i].quantity.value)
                .toString();
        }
    }

    validation() {
        if (typeof this.searchTermFacility !== 'object') {
            this.searchTermFacility = '';
            this.facilities = [];
            this.toastrService.error('Please select a valid Facility');
        }
    }

    countDecimalDigits(value: number): number {
        if (Math.floor(value) !== value) {
            return value.toString().split('.')[1].length || 0;
        }
        return 0;
    }

    submitTransactionToLoApproval(txId: string): void {
        this.transactionsService.submitTransactionToLoApproval(txId).subscribe(
            (response: any) => {
                console.log(response);
                if (response && response.errorMsg !== null) {
                    this.toastrService.error(response[0].errorMsg, 'Error');
                } else {
                    this.router.navigate(['/transactions'], { fragment: 'approval_status' });
                }
            },
            errorResponse => {
                this.toastrService.error('Error while submitting transaction to lo approval', 'Error');
            }
        );
    }
}
