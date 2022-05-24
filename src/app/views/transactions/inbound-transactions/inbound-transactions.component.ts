import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import {
    ISupplierListFormOptions,
    SupplierListTypes
} from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { ContextService } from '../../../shared/context.service';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/utils/format-datepicker';
import { LocalizationService } from '../../../shared/utils/localization.service';
import {
    IInboundData,
    INBOUND_LABELS,
    ITierConfigPayload,
    SEARCH_CONTEXT,
    TRANSACTION_TYPE
} from '../transactions.model';
import { TransactionsService } from '../transactions.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { UtilsService } from './../../../shared/utils/utils.service';

@Component({
    selector: 'app-inbound-transactions',
    templateUrl: './inbound-transactions.component.html',
    styleUrls: ['./inbound-transactions.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class InboundTransactionsComponent implements OnInit, OnDestroy {
    env = environment;
    today = new Date();
    hintColor: string;
    soaSearchHintText = 'Type all characters to search';
    facilitySearchHintText = 'Type all characters to search';
    supplierSearchHintText = 'Type all characters to search';
    pageLoading = false;
    subscription: Subscription;
    associatedFacility = [];
    suppliers = [];
    facilities = [];
    soaUniqueName: any;
    searchTermFacility: any;
    searchTermSupplier: any;
    searchData = [];
    searchRawData = [];
    facilityRawData = [];
    supplierRawData = [];
    payload: IInboundData = {
        date: null,
        companyId: '',
        mode: 'WEB_UI',
        txType: TRANSACTION_TYPE.INBOUND,
        facilityId: null,
        inboundData: {
            productEntity: '',
            productItemId: '',
            sellerLotId: '',
            quantity: {
                quantity: '',
                unit: 'un_kilograms'
            },
            sellerUOM: {
                quantity: null,
                unit: ''
            },
            poNumber: '',
            poDate: null,
            supplierId: '',
            supplierFacilityId: ''
        }
    };
    productComposition = [];
    config: any = {};
    isRequired = true;
    optional = { key: 'supplier_id', value: 'supplier_name', selectedKey: 'supplier_id' };

    tiers = ['tr_tier1', 'tr_tier2'];

    supplierListOptions: ISupplierListFormOptions = {
        controlType: 'single-select',
        listOnlyThisSuppliers: [
            SupplierListTypes.not_invited_supplier,
            SupplierListTypes.accepted_supplier,
            SupplierListTypes.unAccepted_supplier
        ],
        brandContextId: '',
        acceptOnlyListedValues: true,
        floatLabel: 'always',
        isRequired: true,
        placeholder: 'Seller of the Product:',
        valueChangesFire: 'from-option',
        customClass: 'transaction-custom-style',
        errorMessage: ''
    };

    showArticleError = false;
    articleError = '';
    tierPayload: ITierConfigPayload = {
        brandCompanyId: '000000000000000000000000',
        tier: 'tr_tier1',
        searchContext: SEARCH_CONTEXT.T1_INBOUND,
        txType: TRANSACTION_TYPE.INBOUND
    };
    tierConfig: any;
    inboundLabels = INBOUND_LABELS;
    tier_session = 'transactions_tier';
    mandatoryFields: string[] = [
        this.inboundLabels.INTERNAL_FIELD,
        this.inboundLabels.LOT_ID,
        this.inboundLabels.QUANTITY,
        this.inboundLabels.PO_NUMBER,
        this.inboundLabels.TRANSACTION_DATE,
        this.inboundLabels.SUPPLIER,
        this.inboundLabels.FACILITY
    ];

    PRODUCT_IDENTIFIERS = [
        this.inboundLabels.MATERIAL_NAME,
        this.inboundLabels.MATERIAL_NUMBER,
        this.inboundLabels.STYLE_NAME,
        this.inboundLabels.STYLE_NUMBER
    ];

    SEARCHFIELDS = {};
    module = 'TT_TRANSACTION';
    constructor(
        private confirmDialog: MatDialog,
        private localeService: LocalizationService,
        private router: Router,
        private toastrService: CustomToastrService,
        private appContext: ContextService,
        private analyticsService: AnalyticsService,
        public authService: AuthService,
        private transactionsService: TransactionsService,
        private commonServices: CommonServices,
        private utilsService: UtilsService
    ) {
        this.payload.companyId = this.authService.companyId;
    }

    ngOnInit() {
        this.analyticsService.trackPageVisit('inbound transaction');
        this.pageLoading = true;

        this.SEARCHFIELDS[this.inboundLabels.MATERIAL_NAME] = ['internal_article_name.search'];
        this.SEARCHFIELDS[this.inboundLabels.MATERIAL_NUMBER] = ['material_unique_code.search'];
        this.SEARCHFIELDS[this.inboundLabels.STYLE_NAME] = ['name.search'];
        this.SEARCHFIELDS[this.inboundLabels.STYLE_NUMBER] = ['code.search'];

        // Fetch brand associated from user context
        this.tierPayload.brandCompanyId =
            this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : '000000000000000000000000';
        this.tierPayload.tier = this.utilsService.getSessionStorageValue(this.tier_session).key;
        this.tierPayload.searchContext = `${this.tierPayload.tier}_${TRANSACTION_TYPE.INBOUND}`;
        forkJoin([
            this.transactionsService.getTierConfig(this.tierPayload),
            this.transactionsService.getInboundConfig()
        ]).subscribe(
            response => {
                // Process tier payload
                this.tierConfig = JSON.parse(JSON.stringify(response[0]));
                this.supplierListOptions.placeholder = `${this.getFieldLabel(this.inboundLabels.SUPPLIER)}:`;
                this.supplierListOptions.errorMessage = `${this.getFieldLabel(this.inboundLabels.SUPPLIER)} is invalid`;

                // Process Inbound config
                this.localeService.addToMasterData(response[1]['data'].masterData);
                this.associatedFacility = response[1]['data'].data.facilities;
                this.config = response[1]['data'].data;
                this.pageLoading = false;
            },
            fail_response => {
                this.toastrService.error('error fetching transaction data');
                this.pageLoading = false;
            }
        );
    }

    initSuppliers() {
        this.suppliers = [];

        const searchPayload = {};
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        searchPayload['module'] = this.module;

        this.transactionsService.searchSupplier(searchPayload).subscribe(response => {
            let supplierResult = response['data']['searchResponse'];
            if (supplierResult) {
                supplierResult.forEach(element => {
                    this.suppliers.push({ supplier_id: element.supplier_id, supplier_name: element.supplier_name });
                });
            }
            if (!this.suppliers || this.suppliers.length === 0) {
                this.onCreateSupplierNotAvailableModel();
            }
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    getSOAName(item) {
        if (item != null && item.material_unique_code != null) {
            return item.material_unique_code;
        }
    }

    getProductName(item) {
        let displayText = '';
        if (item) {
            // if (this.tierPayload.tier === this.tiers[0]) {
            //     if (item.name) {
            //         displayText += item.name + '-';
            //     }

            //     if (item.code) {
            //         displayText += item.code;
            //     }
            // } else {

            //     if (item.internal_article_name) {
            //         displayText += item.internal_article_name+ '-';
            //     }

            //     if (item.internal_article_number) {
            //         displayText += item.internal_article_number;
            //     }
            // }

            if (item.material_unique_code) {
                displayText += item.material_unique_code + '-';
            }

            if (item.internal_article_name) {
                displayText += item.internal_article_name;
            }
        }
        if (displayText.endsWith('-')) {
            displayText = displayText.slice(0, -1);
        }
        return displayText;
    }

    getMaterialName(item) {
        let displayText = '';
        if (item != null) {
            if (item.internal_article_name) {
                displayText += item.internal_article_name + '-';
            }

            if (item.material_unique_code) {
                displayText += item.material_unique_code;
            }
        }

        if (displayText.endsWith('-')) {
            displayText = displayText.slice(0, -1);
        }
        return displayText;
    }

    getStyleName(item) {
        let displayText = '';
        if (item != null) {
            if (item.name) {
                displayText += item.name + '-';
            }

            if (item.code) {
                displayText += item.code;
            }
        }

        if (displayText.endsWith('-')) {
            displayText = displayText.slice(0, -1);
        }
        return displayText;
    }

    getFacilityName(item) {
        if (item != null && item.reference_id != null) {
            return `${item.reference_id}-${item.name}`;
        }
    }

    getSupplierName(item) {
        if (item != null && item.reference_id != null) {
            return `${item.reference_id}-${item.name}`;
        }
    }

    resetForm() {
        this.soaUniqueName = { material_unique_code: '', supplier: [] };
        this.searchTermFacility = '';
        this.searchTermSupplier = '';
        this.config = [];
        this.productComposition = [];
        this.showArticleError = false;
        this.articleError = '';
        this.payload = {
            date: null,
            companyId: this.authService.companyId,
            mode: 'WEB_UI',
            txType: TRANSACTION_TYPE.INBOUND,
            facilityId: null,
            inboundData: {
                productEntity: '',
                productItemId: '',
                sellerLotId: '',
                quantity: {
                    quantity: '',
                    unit: 'un_kilograms'
                },
                sellerUOM: {
                    quantity: null,
                    unit: ''
                },
                poNumber: '',
                poDate: null,
                supplierId: '',
                supplierFacilityId: ''
            }
        };
        this.transactionsService.getInboundConfig();
    }

    saveInbound() {
        this.pageLoading = true;
        if (
            !this.payload.inboundData.supplierFacilityId ||
            typeof this.payload.inboundData.supplierFacilityId !== 'string'
        ) {
            this.toastrService.error('Please fix the errors on the form');
            this.pageLoading = false;
            return;
        }

        this.searchRawData.filter(e => {
            if (this.soaUniqueName.material_unique_code === e.material_unique_code) {
                // const soaSplit = e.id_type.split('-');
                // if (soaSplit[1] === 'style') {
                //     this.payload.inboundData.productEntity = 'STYLE';
                // } else if (soaSplit[1] === 'material_lib') {
                //     this.payload.inboundData.productEntity = 'MATERIAL_LIBRARY';
                // }
                this.payload.inboundData.productEntity = 'MATERIAL_LIBRARY';
                this.payload.inboundData.productItemId = e.material_unique_code;
            }
        });

        this.payload.date = this.commonServices.adjustDateForTimezone(this.payload.date);
        // this.payload.date = this.commonServices.adjustDateForTimezone(new Date());
        const payload = JSON.parse(JSON.stringify(this.payload));
        payload.inboundData.supplierId = null;
        payload.inboundData.supplierFacilityId = this.payload.inboundData.supplierFacilityId;
        delete payload.inboundData.supplier;
        if (payload.inboundData.sellerUOM.quantity == null) {
            // delete this.payload.inboundData.sellerUOM;
            delete payload.inboundData.sellerUOM;
        }
        payload['tierId'] = this.tierPayload.tier;
        payload['brandContextId'] = this.tierPayload.brandCompanyId;
        this.transactionsService.submitTransactions(payload).subscribe(
            (response: any) => {
                if (response && response.errorMsg !== null) {
                    this.analyticsService.trackSaveFail('inbound transaction');
                    if (response.errorMsg === 'Duplicate Transaction') {
                        this.toastrService.error('Inbound Transaction already exists', 'Error');
                        this.pageLoading = false;
                    } else {
                        this.toastrService.error(response.errorMsg, 'Error');
                        this.pageLoading = false;
                    }
                } else {
                    this.analyticsService.trackSaveSuccess('inbound transaction');
                    this.toastrService.success('Transaction created successfully', 'Success');
                    this.resetForm();
                    setTimeout(() => {
                        this.appContext.cardViewRefresh.next(true);
                        this.pageLoading = false;
                        this.router.navigate(['/transactions']);
                    }, 2000);
                }
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.analyticsService.trackSaveFail('inbound transaction', 'Error: Duplicate Reference Id');
                    this.toastrService.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.analyticsService.trackSaveFail('inbound transaction');
                    this.toastrService.error(
                        'We could not process your request at the moment. Please try again later',
                        'Error'
                    );
                }
                this.pageLoading = false;
            }
        );
    }

    searchFreeHandInbound(searchTerm, productIdentifier) {
        this.showArticleError = false;
        this.articleError = '';
        const searchPayload = {
            brandContextId: '',
            module: this.module,
            filter: {}
        };

        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        // searchPayload['freeHand'] = searchTerm;
        // searchPayload['freeHandFields'] = this.SEARCHFIELDS[productIdentifier];
        // if (!searchPayload['freeHand']) {
        //     return;
        // }

        if (!searchTerm) {
            return;
        }
        // if ([this.inboundLabels.STYLE_NAME, this.inboundLabels.STYLE_NUMBER].includes(productIdentifier)) {
        //     searchPayload['filter']['Code'] = [];
        //     searchPayload['filter']['Code'].push(searchTerm.toLocaleUpperCase());
        //     this.transactionsService.searchFreeHandStyle(searchPayload).subscribe(
        //         response => {
        //             this.processSearchResult(response, searchTerm);
        //         },
        //         () => {
        //             this.processSearchError(searchTerm);
        //         }
        //     );
        // } else if ([this.inboundLabels.MATERIAL_NUMBER, this.inboundLabels.MATERIAL_NAME].includes(productIdentifier)) {
        //     searchPayload['filter']['Material Unique Code'] = [searchTerm];
        //     this.transactionsService.searchFreeHandMaterial(searchPayload).subscribe(
        //         response => {
        //             this.processSearchResult(response, searchTerm);
        //         },
        //         () => {
        //             this.processSearchError(searchTerm);
        //         }
        //     );
        // }
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

    searchFreeHandSupplier(searchTermSupplier) {
        const searchPayload = {};
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        searchPayload['module'] = this.module;
        searchPayload['mustNot'] = {
            'Supplier Id': [this.authService.companyId]
        };
        searchPayload['filter'] = {
            'Reference Id': [searchTermSupplier]
        };

        if (!searchTermSupplier) {
            return;
        }

        this.suppliers = [];
        this.transactionsService.getFacilities(searchPayload).subscribe(response => {
            this.supplierRawData = response['data'].searchResponse;
            if (this.supplierRawData.length > 0) {
                this.suppliers = JSON.parse(JSON.stringify(this.supplierRawData));
                this.hintColor = '';
                this.supplierSearchHintText = '';
            } else {
                if (this.suppliers.length === 0) {
                    this.hintColor = 'red';
                    this.supplierSearchHintText = 'No results found';
                } else {
                    this.hintColor = '';
                    this.supplierSearchHintText = '';
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
            // used to check only unique values are pushed to this.searchData
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

    private filterForUniqueSOAValue(rawSOAData) {
        const filteredSOATerms = [];
        const filteredSOAData = [];
        rawSOAData.forEach(el => {
            // el.unique_search = el.unique_search.replace('-null', '').replace('null-', '');
            if (filteredSOATerms.indexOf(el.material_unique_code) === -1) {
                filteredSOATerms.push(el.material_unique_code);
                filteredSOAData.push(el);
            }
        });
        return filteredSOAData;
    }

    onSOASelection(value) {
        this.productComposition = value.material_composition;
        //this.suppliers = [];
        // this.searchRawData.forEach(el => {
        //     if (value.unique_search === el.unique_search) {
        //         if (el.supplier) {
        //             el.supplier.forEach(supplier => {
        //                 this.suppliers.push({ supplier_id: supplier.id, supplier_name: supplier.name });
        //             });
        //         }

        //         if (Array.isArray(this.suppliers) && this.suppliers.length === 1) {
        //             if (
        //                 !this.payload.inboundData.supplierId ||
        //                 this.payload.inboundData.supplierId !== this.suppliers[0].supplier_id
        //             ) {
        //                 this.supplierListOptions.selectedItem = this.suppliers;
        //             }
        //         } else {
        //             this.payload.inboundData.supplierId = null;
        //         }

        //         if (!this.suppliers || this.suppliers.length === 0) {
        //             this.suppliers = [];
        //             this.onCreateSupplierNotAvailableModel();
        //         }
        //     }
        // });

        // const searchPayload = {};
        // const searchTerm = this.soaUniqueName.unique_search;
        // searchPayload['freeHand'] = searchTerm;
        // searchPayload['filter'] = {
        //     id: [this.soaUniqueName.id_type.split('-')[0]]
        // };
        // this.transactionsService.getStyleDetails(searchPayload).subscribe(data => {
        //     this.styleComposition = data['material_composition'];
        // });
    }

    onFacilitySelection(value) {
        this.payload.facilityId = value.reference_id;
    }

    onSupplierFacilitySelection(value) {
        this.payload.inboundData.supplierFacilityId = value.supplier_facility_id;
    }

    searchStyleOrArticle(event, productIdentifier) {
        if (event.key !== '') {
            this.searchFreeHandInbound(this.soaUniqueName, productIdentifier);
        }
        if (event.target.value.trim('') === '') {
            this.payload.inboundData.supplierId = null;
            this.soaUniqueName = { material_unique_code: '', supplier: [] };
        }
    }

    searchFacility(event) {
        if (event.key !== '') {
            this.searchFreeHandFacility(this.searchTermFacility);
        }
    }

    searchSupplier(event) {
        if (event.key !== '') {
            this.searchFreeHandSupplier(this.searchTermSupplier);
        }
    }

    save() {
        this.analyticsService.trackSaveButtonClick('inbound transaction');
        this.saveInbound();
    }

    onCreateSupplierNotAvailableModel() {
        const infoPopUp = this.confirmDialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Information',
                msg: 'Supplier list is empty. Please create suppliers to create transactions',
                primaryButton: 'Close',
                showClose: true
            }
        });
    }

    validateSelectedProduct(productIdentifier) {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (this.soaUniqueName.hasOwnProperty('material_unique_code') || !this.soaUniqueName) {
                return;
            }

            let matchedItems = this.searchData.filter(
                x => x.material_unique_code.toLocaleUpperCase() === this.soaUniqueName.toLocaleUpperCase()
            );

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

    validateSelectedSupplier() {
        setTimeout(() => {
            if (this.searchTermSupplier.hasOwnProperty('reference_id') || !this.searchTermSupplier) {
                return;
            }

            let matchedItems = this.suppliers.filter(
                x => x.reference_id.toLocaleUpperCase() === this.searchTermSupplier.toLocaleUpperCase()
            );

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.searchTermSupplier = '';
                this.suppliers = [];
                this.toastrService.error('Please select a valid Supplier');
            }
        }, 100);
    }

    updateSupplier(event: any) {
        if (Array.isArray(event)) {
            this.payload.inboundData.supplierId = event[0].supplier_id;
        } else {
            this.payload.inboundData.supplierId = event.supplier_id;
        }
    }

    checkToShowField(item: string) {
        return this.transactionsService.checkToShowField(item, this.mandatoryFields, this.tierConfig);
    }

    getFieldLabel(item: string) {
        return this.transactionsService.getFieldLabel(item, this.mandatoryFields, this.tierConfig);
    }

    getProductComposition() {
        let composition = '';
        if (this.productComposition) {
            composition = this.productComposition.map(comp => `${comp.value} ${comp.composition}%`).join(', ');
        }
        return composition;
    }
}
