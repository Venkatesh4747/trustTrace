import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { ContextService } from '../../../shared/context.service';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/utils/format-datepicker';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { FacilitiesService } from '../../facilities/facilities.service';
import { TransactionsService } from '../transactions.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { UtilsService } from './../../../shared/utils/utils.service';
/* Commented the code as the ticket PL-259 is not imlemented on the backend */
/* import {
    ISupplierListFormOptions,
    SupplierListTypes
} from './../../../shared/components/supplier-list-form-element/supplier-list-form-element.model'; */
import {
    IOutboundData,
    ITierConfigPayload,
    OUTBOUND_LABELS,
    SEARCH_CONTEXT,
    TRANSACTION_TYPE
} from './../transactions.model';

@Component({
    selector: 'app-outbound-transactions',
    templateUrl: './outbound-transactions.component.html',
    styleUrls: ['./outbound-transactions.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class OutboundTransactionsComponent implements OnInit, OnDestroy {
    hintColor: string;
    pageLoading = true;
    displaySaveBtn = true;
    selectedFacilitiesName = [];
    subscription: Subscription;
    searchRawData = [];
    lotRawData = [];
    customerRawData = [];
    facilityRawData = [];
    suppliers = [];
    customers = [];
    facilities = [];
    inputLotValue = 0.0;
    otherReasonForDelay: '';
    payload: IOutboundData = {
        date: new Date(),
        companyId: '',
        mode: 'WEB_UI',
        txType: TRANSACTION_TYPE.OUTBOUND,
        facilityId: null,
        outboundData: {
            poNumber: '',
            poMappingStatus: '',
            poDate: null,
            customerFacilityId: '' /* Commented the code as the ticket PL-259 is not imlemented on the backend */,
            /* supplierId: null, */ productionLotId: '',
            lotManufacturedDate: null,
            productItemId: '',
            quantity: {
                quantity: '',
                unit: 'un_kilograms'
            },
            sellerUOM: {
                quantity: null,
                unit: ''
            },
            delayReason: '',
            remarks: '',
            invoiceNumber: '',
            productionTxId: ''
        }
    };

    config: any = {};

    selectedTransaction: any;

    searchTerm: any;
    searchTermCustomer: any;
    searchTermFacility: any;
    isRequired = true;
    optional = { key: 'lot_id', value: 'lot_id', selectedKey: 'lot_id' };
    supplierOptional = { key: 'supplier_id', value: 'supplier_name', selectedKey: 'supplier_id' };
    poOptional = { key: 'transaction_id', value: 'transaction_id', selectedKey: 'transaction_id' };
    facilityOptional = { key: 'supplier_facility_id', value: 'reference_id', selectedKey: 'reference_id' };
    env = environment;
    validationResponse = {};

    soaSearchHintText = 'Type at least 3 characters to search';
    facilitySearchHintText = 'Type all characters to search';
    customerSearchHintText = 'Type all characters to search';

    /* Commented the code as the ticket PL-259 is not imlemented on the backend */
    /* supplierListOptions: ISupplierListFormOptions = {
        controlType: 'single-select',
        listOnlyThisSuppliers: [
            SupplierListTypes.not_invited_supplier,
            SupplierListTypes.accepted_supplier,
            SupplierListTypes.unAccepted_supplier
        ],
        acceptOnlyListedValues: true,
        floatLabel: 'always',
        isRequired: false,
        placeholder: 'Seller of the Product:',
        valueChangesFire: 'from-option',
        customClass: 'transaction-custom-style'
    }; */

    tierPayload: ITierConfigPayload = {
        brandCompanyId: '000000000000000000000000',
        tier: 'tr_tier1',
        searchContext: SEARCH_CONTEXT.T1_OUTBOUND,
        txType: TRANSACTION_TYPE.OUTBOUND
    };

    tierConfig: any;
    outboundLabels = OUTBOUND_LABELS;
    mandatoryFields: string[] = [
        this.outboundLabels.INTERNAL_FIELD,
        this.outboundLabels.ARTICLE_NAME_NUMBER,
        this.outboundLabels.LOT_ID,
        this.outboundLabels.PO_NUMBER,
        this.outboundLabels.TRANSACTION_DATE,
        this.outboundLabels
            .CUSTOMER_NAME /* Commented the code as the ticket PL-259 is not imlemented on the backend */,
        /* this.outboundLabels.SUPPLIER, */ this.outboundLabels.FACILITY,
        this.outboundLabels.LOT_MANUFACTURED_DATE
    ];
    tier_session = 'transactions_tier';
    tiers = ['tr_tier1', 'tr_tier2', 'tr_tier3', 'tr_tier4'];

    poLinkingPayload = {
        'Facility ref': [],
        'Product ref': []
    };

    poList;

    today: Date = new Date();

    module = 'TT_TRANSACTION';
    constructor(
        private router: Router,
        private localeService: LocalizationService,
        private toastrService: CustomToastrService,
        private facilitiesService: FacilitiesService,
        private transactionsService: TransactionsService,
        private analyticsService: AnalyticsService,
        public authService: AuthService,
        private appContext: ContextService,
        private multiIndustryService: MultiIndustryService,
        private commonServices: CommonServices,
        private confirmDialog: MatDialog,
        private utilsService: UtilsService
    ) {
        this.payload.companyId = this.authService.companyId;
    }

    ngOnInit() {
        this.analyticsService.trackPageVisit('Outbound transaction');
        this.pageLoading = true;
        // Fetch brand associated from user context
        this.tierPayload.brandCompanyId =
            this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : '000000000000000000000000';
        const tierSession = this.utilsService.getSessionStorageValue(this.tier_session);
        this.tierPayload.tier = tierSession.key;
        this.tierPayload.searchContext = `${this.tierPayload.tier}_${TRANSACTION_TYPE.OUTBOUND}`;

        // Set Mandatory fields
        if (this.tierPayload.tier === this.tiers[1]) {
            this.mandatoryFields.push(this.outboundLabels.QUANTITY);
        }
        forkJoin([
            this.transactionsService.getTierConfig(this.tierPayload),
            this.transactionsService.getOutboundConfig(this.tierPayload.brandCompanyId)
        ]).subscribe(
            response => {
                // Process tier payload
                this.tierConfig = JSON.parse(JSON.stringify(response[0]));
                /* Commented the code as the ticket PL-259 is not imlemented on the backend */
                /* this.supplierListOptions.placeholder = this.getFieldLabel(this.outboundLabels.SUPPLIER); */

                // Process Outbound config
                this.processOutboundConfig(response[1]);
            },
            fail_response => {
                this.toastrService.error('error fetching transaction data');
                this.pageLoading = false;
            }
        );
    }

    getOutboundConfig() {
        this.pageLoading = true;
        this.transactionsService.getOutboundConfig(this.tierPayload.brandCompanyId).subscribe(
            resp => {
                this.processOutboundConfig(resp);
            },
            fail_response => {
                this.toastrService.error('error fetching order data');
                this.pageLoading = false;
            }
        );
    }

    processOutboundConfig(response) {
        this.localeService.addToMasterData(response['data'].masterData);
        this.config = response['data'].data;
        if (this.config.customers?.length == 1) {
            this.payload.outboundData.customerFacilityId = this.config.customers[0].reference_id;
        }
        this.lotRawData = this.config.lots;
        this.config.lots = [];
        this.config.SOA_search = [];
        this.pageLoading = false;
    }

    ngOnDestroy() {
        // prevent memory leak when component is destroyed
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    getPOList() {
        let payload = {
            brandContextId: this.tierPayload.brandCompanyId,
            filter: {}
        };
        if (this.poLinkingPayload['Product ref'].length === 0) {
            payload.filter['Product ref'] = [' '];
        } else {
            payload.filter['Product ref'] = this.poLinkingPayload['Product ref'];
        }

        // if (this.poLinkingPayload['Facility ref'].length === 0) {
        //     payload.filter['Facility ref'] = [' '];
        // } else {
        //     payload.filter['Facility ref'] = this.poLinkingPayload['Facility ref'];
        // }

        this.transactionsService.getPOList(payload).subscribe(data => {
            this.poList = [];
            this.poList = JSON.parse(JSON.stringify(data['searchResponse']));
        });
    }

    saveOrder() {
        this.pageLoading = true;
        this.payload.date = this.commonServices.adjustDateForTimezone(this.payload.date);
        const payload = JSON.parse(JSON.stringify(this.payload));
        if (this.otherReasonForDelay) {
            this.payload.outboundData.delayReason = this.otherReasonForDelay;
        }
        if (this.payload.outboundData.sellerUOM.quantity === null) {
            delete this.payload.outboundData.sellerUOM;
        }
        if (this.payload.outboundData.remarks === '') {
            delete this.payload.outboundData.remarks;
        }
        if (this.payload.outboundData.invoiceNumber === '') {
            delete this.payload.outboundData.invoiceNumber;
        }
        if (this.payload.outboundData.poMappingStatus === '') {
            delete this.payload.outboundData.poMappingStatus;
        }
        if (this.payload.outboundData.delayReason === '') {
            delete this.payload.outboundData.delayReason;
        }
        if (this.tierPayload.tier === this.tiers[0]) {
            delete this.payload.outboundData.customerFacilityId;
        }
        if (this.payload.outboundData.poNumber === '') {
            delete this.payload.outboundData.poNumber;
        }
        this.payload['tierId'] = this.tierPayload.tier;
        this.payload['brandContextId'] = this.tierPayload.brandCompanyId;
        this.transactionsService.submitTransactions(this.payload).subscribe(
            (response: any) => {
                if (response && response.errorMsg !== null) {
                    this.analyticsService.trackSaveFail('outbound transaction');
                    if (response.errorMsg === 'Duplicate Transaction') {
                        this.toastrService.error('Outbound Transaction already exists', 'Error');
                        this.pageLoading = false;
                    } else {
                        this.toastrService.error(response.errorMsg, 'Error');
                        this.pageLoading = false;
                    }
                } else {
                    this.analyticsService.trackSaveSuccess('outbound transaction');
                    this.toastrService.success('Transaction created successfully', 'Success');
                    this.resetForm();
                    // TODO: Card view refresh on same url navigation
                    setTimeout(() => {
                        this.appContext.cardViewRefresh.next(true);
                        this.pageLoading = false;
                        this.router.navigate(['/transactions']);
                    }, 2000);
                }
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.analyticsService.trackSaveFail('outbound transaction', 'Error: Duplicate Reference Id');
                    this.toastrService.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.analyticsService.trackSaveFail('outbound transaction');
                    this.toastrService.error('error fetching order data');
                    this.pageLoading = false;
                }
            }
        );
    }

    getStyleName(item) {
        if (item != null && item.product_name != null) {
            return `${item.product_name}-${item.product_number}`;
        }
    }

    getFacilityName(item) {
        if (item != null && item.reference_id != null) {
            return `${item.reference_id}-${item.name}`;
        }
    }

    onLotSelection(event) {
        if (event.quantity) {
            this.payload.outboundData.quantity.quantity = event.quantity.value;
            this.payload.outboundData.quantity.unit = 'un_kilograms';
        }
        if (event.actual_conversion_ratio) {
            this.payload.outboundData.sellerUOM.quantity = (
                parseFloat(this.payload.outboundData.quantity.quantity) / event.actual_conversion_ratio
            )
                .toFixed(this.countDecimalDigits(event.quantity_in_uom.value))
                .toString();
        } else {
            this.payload.outboundData.sellerUOM.quantity = null;
        }
        // this.inputLotValue = event.quantity;
        this.payload.outboundData.productItemId = event.product_number;
        this.payload.outboundData.lotManufacturedDate = event.tx_date;

        this.selectedTransaction = event;

        /* Commented the code as the ticket PL-259 is not imlemented on the backend */
        // Get suppliers
        /* if (event.supplier) {
            this.suppliers = [];
            this.suppliers.push({ supplier_id: event.supplier.id, supplier_name: event.supplier.value });
        }

        if (this.suppliers.length == 1) {
            if (Array.isArray(this.suppliers) && this.suppliers.length == 1) {
                if (
                    !this.payload.outboundData.supplierId ||
                    this.payload.outboundData.supplierId !== this.suppliers[0].supplier_id
                ) {
                    this.supplierListOptions.selectedItem = this.suppliers;
                }
            }
        } else {
            this.payload.outboundData.supplierId = null;
        }
        if (!this.suppliers || this.suppliers.length === 0) {
            this.suppliers = [];
            this.onCreateSupplierNotAvailableModel();
        } */
        this.payload.outboundData.productionTxId = event.id;
    }

    onCreateSupplierNotAvailableModel() {
        const infoPopUp = this.confirmDialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Information',
                msg:
                    'This Article/Style does not have an associated Supplier. Please add a Supplier to record this transaction',
                primaryButton: 'Close',
                showClose: true
            }
        });
    }

    resetForm() {
        this.searchTerm = '';
        this.searchTermFacility = '';
        this.facilitiesService.clearFacilities();
        this.config.lots = [];
        this.payload = {
            date: new Date(),
            companyId: this.authService.companyId,
            mode: 'WEB_UI',
            txType: TRANSACTION_TYPE.OUTBOUND,
            facilityId: null,
            outboundData: {
                poNumber: '',
                poMappingStatus: '',
                poDate: null,
                customerFacilityId: '' /* Commented the code as the ticket PL-259 is not imlemented on the backend */,
                /* supplierId: null, */ productionLotId: '',
                lotManufacturedDate: null,
                productItemId: '',
                quantity: {
                    quantity: '',
                    unit: 'un_kilograms'
                },
                sellerUOM: {
                    quantity: null,
                    unit: ''
                },
                delayReason: '',
                remarks: '',
                invoiceNumber: '',
                productionTxId: ''
            }
        };
        this.poLinkingPayload = {
            'Facility ref': [],
            'Product ref': []
        };
        this.getOutboundConfig();
    }

    searchFreeHandOutbound(searchTerm) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        searchPayload['module'] = this.module;
        searchPayload['filter'] = {
            'Transaction Type': ['PRODUCTION'],
            Status: ['SUBMITTED']
        };

        /* Commented the code as the ticket PL-259 is not imlemented on the backend */
        /* searchPayload['filter'] = {
            'Transaction Type': ['PRODUCTION', 'INBOUND'],
            Status: ['SUBMITTED']
        }; */

        this.transactionsService.searchTransaction(searchPayload).subscribe(response => {
            this.searchRawData = response['data'].searchResponse;
            if (searchTerm.length >= 3) {
                if (this.searchRawData.length > 0) {
                    this.config.SOA_search = this.filterForUniqueLots(this.searchRawData);

                    this.hintColor = '';
                    this.soaSearchHintText = '';
                } else {
                    this.config.SOA_search = [];
                    this.hintColor = 'red';
                    this.soaSearchHintText = 'No results found';
                }
            }
        });
    }

    searchFreeHandCustomer(searchTermCustomer) {
        const searchPayload = {};
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        searchPayload['module'] = this.module;
        searchPayload['mustNot'] = {
            'Supplier Id': [this.authService.companyId]
        };
        searchPayload['filter'] = {
            'Reference Id': [searchTermCustomer]
        };

        if (!searchTermCustomer) {
            return;
        }

        this.transactionsService.getFacilities(searchPayload).subscribe(response => {
            this.customerRawData = response['data'].searchResponse;
            if (this.customerRawData.length > 0) {
                this.customers = JSON.parse(JSON.stringify(this.customerRawData));
                this.hintColor = '';
                this.customerSearchHintText = '';
            } else {
                if (this.customers.length === 0) {
                    this.hintColor = 'red';
                    this.customerSearchHintText = 'No results found';
                } else {
                    this.hintColor = '';
                    this.customerSearchHintText = '';
                }
            }
        });
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

    searchStyle(event) {
        if (event.key !== '') {
            this.searchFreeHandOutbound(this.searchTerm);
        }
    }

    searchCustomer(event) {
        if (event.key !== '') {
            if (this.tierPayload.tier === this.tiers[1]) {
                const customerIndex = this.config.customers.findIndex(
                    customer => customer.reference_id === this.searchTermCustomer
                );
                if (customerIndex !== -1) {
                    this.customers = [];
                    this.customers.push(this.config.customers[customerIndex]);
                } else {
                    this.searchFreeHandCustomer(this.searchTermCustomer);
                }
            } else {
                this.searchFreeHandCustomer(this.searchTermCustomer);
            }
        }
    }

    searchFacility(event) {
        if (event.key !== '') {
            this.searchFreeHandFacility(this.searchTermFacility);
        }
    }

    getSOAId(value): string {
        const soaSplit = value.split('-');
        return soaSplit[0];
    }

    getLotId(value) {
        return value.id;
    }

    onSOASelection(value) {
        this.poLinkingPayload['Product ref'] = [];
        this.poLinkingPayload['Product ref'].push(value.product_number);
        this.config.lots = this.searchRawData.filter(lot => {
            return lot.product_name === value.product_name && lot.product_number === value.product_number;
        });

        (this.payload.outboundData.productionLotId = ''), (this.payload.outboundData.poNumber = '');

        const lot = this.config.lots.filter(_lot => _lot.product_name === value.product_name)[0];

        if (!lot || lot.length === 0) {
            this.toastrService.error(
                this.multiIndustryService.getLabel('Not Lots found for the chosen style / material')
            );
            return;
        }

        // If there is only one customer, then select it for the user
        if (this.config.customers.length == 1) {
            this.payload.outboundData.customerFacilityId = this.config.customers[0].reference_id;
        }

        // Fetch PO listing
        if (this.tierPayload.tier === this.tiers[0]) {
            this.getPOList();
        }
    }

    onCustomerSelection(value) {
        this.payload.outboundData.customerFacilityId = value.reference_id;
    }

    onFacilitySelection(value) {
        this.poLinkingPayload['Facility ref'] = [];
        this.poLinkingPayload['Facility ref'].push(value.reference_id);
        this.payload.facilityId = value.reference_id;

        // Fetch PO listing
        // this.getPOList();
    }

    save() {
        this.analyticsService.trackSaveButtonClick('outbound transaction');
        this.saveOrder();
    }

    validateSelectedStyle() {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (
                (this.searchTerm.hasOwnProperty('product_name') && this.searchTerm.hasOwnProperty('product_number')) ||
                !this.searchTerm
            ) {
                return;
            }

            let matchedItems = this.config.SOA_search.filter(x => {
                return `${x.product_name}-${x.product_number}` === this.searchTerm;
            });

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.searchTerm = '';
                this.toastrService.error('Please select a valid Article / Style');
            }
        }, 200);
    }

    validateSelectedCustomer() {
        setTimeout(() => {
            if (this.searchTermCustomer.hasOwnProperty('reference_id') || !this.searchTermCustomer) {
                return;
            }

            let matchedItems = this.customers.filter(
                x => x.reference_id.toLocaleUpperCase() === this.searchTermCustomer.toLocaleUpperCase()
            );

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.searchTermCustomer = '';
                this.customers = [];
                this.toastrService.error('Please select a valid Facility');
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

    /* Commented the code as the ticket PL-259 is not imlemented on the backend */
    /* updateSupplier(event: any) {
        if (Array.isArray(event)) {
            this.payload.outboundData.supplierId = event[0].supplier_id;
        } else {
            this.payload.outboundData.supplierId = event.supplier_id;
        }
    } */

    checkToShowField(item: string) {
        return this.transactionsService.checkToShowField(item, this.mandatoryFields, this.tierConfig);
    }

    getFieldLabel(item: string) {
        return this.transactionsService.getFieldLabel(item, this.mandatoryFields, this.tierConfig);
    }

    getFieldValues(item: string): string[] {
        return this.transactionsService.getFieldValues(item, this.tierConfig);
    }

    updateSellerUom() {
        if (this.payload.outboundData.quantity.quantity && this.selectedTransaction.actual_conversion_ratio) {
            this.payload.outboundData.sellerUOM.quantity = (
                parseFloat(this.payload.outboundData.quantity.quantity) /
                this.selectedTransaction.actual_conversion_ratio
            )
                .toFixed(this.countDecimalDigits(this.selectedTransaction.quantity_in_uom.value))
                .toString();
        }
    }

    updateQuantity() {
        if (this.payload.outboundData.sellerUOM.quantity && this.selectedTransaction.actual_conversion_ratio) {
            this.payload.outboundData.quantity.quantity = (
                parseFloat(this.payload.outboundData.sellerUOM.quantity) *
                this.selectedTransaction.actual_conversion_ratio
            )
                .toFixed(this.countDecimalDigits(this.selectedTransaction.quantity.value))
                .toString();
        }
    }

    validation(fieldName: string): void {
        switch (fieldName) {
            case 'customer':
                if (typeof this.searchTermCustomer !== 'object') {
                    this.searchTermCustomer = '';
                    this.customers = [];
                    this.toastrService.error('Please select a valid Facility');
                }
                break;
            case 'facility':
                if (typeof this.searchTermFacility !== 'object') {
                    this.searchTermFacility = '';
                    this.facilities = [];
                    this.toastrService.error('Please select a valid Facility');
                }
                break;
            default:
                break;
        }
    }

    countDecimalDigits(value: number): number {
        if (Math.floor(value) !== value) {
            return value.toString().split('.')[1].length || 0;
        }
        return 0;
    }

    toShowOtherReason(): boolean {
        return this.payload.outboundData.delayReason === 'Others';
    }
}
