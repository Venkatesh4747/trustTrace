import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import {
    ISupplierListFormOptions,
    SupplierListTypes
} from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { environment } from '../../../../environments/environment';
import { OrdersService } from '../../orders/orders.service';
import { TransactionsService } from '../transactions.service';

@Component({
    selector: 'app-record-transactions',
    templateUrl: './record-transactions.component.html',
    styleUrls: ['./record-transactions.component.scss']
})
export class RecordTransactionsComponent implements OnInit, OnDestroy {
    [x: string]: any;
    @ViewChild('soaSearchHint') soaSearchHint;

    env = environment;

    pageLoading = false;

    hintColor: string;

    soaUniqueName: any;
    searchData = [];
    searchRawData = [];
    suppliers = [];
    uploadFiles: any = {};
    config: any = {};

    payload: any = {
        lot: {
            soaId: '',
            soaType: '',
            date: new Date(),
            productType: '',
            facilities: [],
            externalId: '',
            mode: '',
            quantity: {
                quantity: '',
                unit: sessionStorage.getItem('tx_inbound_unit') || ''
            },
            inboundData: {
                poNumber: '',
                supplier: null
            },
            outboundData: {
                inputLotId: '',
                poNumber: '',
                customerId: ''
            },
            qualityReport: [],
            otherDocuments: []
        },
        certList: []
    };

    isRequired = true;
    optional = { key: 'supplier_id', value: 'supplier_name', selectedKey: 'supplier_id' };

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

    data: any = {
        certificates_to_collect: []
    };

    soaSearchHintText = 'Type at least 3 characters to search';

    constructor(
        private toastrService: CustomToastrService,
        private ordersService: OrdersService,
        private transactionService: TransactionsService
    ) {}

    ngOnDestroy() {
        /*  this.subscription.unsubscribe(); */
    }
    getSOAName(item) {
        if (item !== null && item.unique_search !== null) {
            return item.unique_search;
        }
    }

    ngOnInit() {}

    validateSelectedStyle() {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (this.soaUniqueName.hasOwnProperty('unique_search') || !this.soaUniqueName) {
                return;
            }

            let matchedItems = this.searchData.filter(x => x === this.soaUniqueName);

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.soaUniqueName = '';
                this.toastrService.error('Please select a valid Article / Style');
            }
        }, 100);
    }

    searchFreeHandInbound(searchTerm, isScanned = false) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        if (!searchPayload['freeHand']) {
            return;
        }
        this.ordersService.searchFreeHandArticleOrStyle(searchPayload).subscribe(
            response => {
                this.searchRawData = response['data'].searchResponse;
                if (this.searchRawData.length > 0) {
                    // used to check only unique values are pushed to this.searchData
                    this.searchData = this.transactionService.filterForUniqueSOAValue(this.searchRawData);

                    if (isScanned) {
                        let searchTermMatch = false;

                        this.searchData.forEach(data => {
                            if (data.id_type.indexOf(this.soaUniqueName.id_type) >= 0) {
                                this.soaUniqueName = JSON.parse(JSON.stringify(data));
                                this.onSOASelection(this.soaUniqueName);
                                if (Array.isArray(this.suppliers) && this.suppliers.length === 1) {
                                    if (
                                        !this.payload.lot.inboundData.supplier ||
                                        this.payload.lot.inboundData.supplier.supplier_id !==
                                            this.suppliers[0].supplier_id
                                    ) {
                                        this.supplierListOptions.selectedItem = this.suppliers;
                                    }
                                }
                                searchTermMatch = true;
                            }
                        });

                        if (!searchTermMatch) {
                            this.toastrService.error('The scanned item is not a valid Material', 'No matching data');
                        }
                    }
                    this.hintColor = '';
                    this.soaSearchHintText = '';
                } else {
                    if (isScanned) {
                        this.toastrService.error(
                            'The scanned item is not a valid Material or Style',
                            'No matching data'
                        );
                    }
                    if (searchTerm && searchTerm.length >= 3) {
                        this.searchData = [];
                        this.hintColor = 'red';
                        this.soaSearchHintText = 'No results found';
                    }
                }
            },
            () => {
                if (searchTerm && searchTerm.length >= 3) {
                    this.searchData = [];
                    this.hintColor = 'red';
                    this.soaSearchHintText = 'No results found';
                }
            }
        );
    }

    onSOASelection(value) {
        this.suppliers = [];
        this.searchRawData.forEach(el => {
            if (value.unique_search === el.unique_search) {
                this.data.certificates_to_collect = this.data.certificates_to_collect.filter(
                    certificate_to_collect =>
                        certificate_to_collect.id === 'QUALITY_REPORT' || certificate_to_collect.id === 'OTHERS'
                );

                if (el.hasOwnProperty('certifications')) {
                    el.certifications.forEach(c => {
                        this.data.certificates_to_collect.unshift(c);
                    });
                    this.data.certificates_to_collect.forEach(certToCollect => {
                        if (certToCollect.id !== 'OTHERS' && certToCollect.id !== 'QUALITY_REPORT') {
                            certToCollect.value = certToCollect.value + ' certificate';
                        }
                    });
                    this.data.certificates_to_collect.forEach(certificate => {
                        if (!this.uploadFiles[certificate.id]) {
                            this.uploadFiles[certificate.id] = {
                                certificateId: null,
                                files: []
                            };
                        }
                    });
                }
                if (el.supplier) {
                    el.supplier.forEach(supplier => {
                        this.suppliers.push({ supplier_id: supplier.id, supplier_name: supplier.name });
                    });
                }

                if (this.suppliers.length === 1) {
                    if (Array.isArray(this.suppliers) && this.suppliers.length === 1) {
                        if (
                            !this.payload.lot.inboundData.supplier ||
                            this.payload.lot.inboundData.supplier.supplier_id !== this.suppliers[0].supplier_id
                        ) {
                            this.supplierListOptions.selectedItem = this.suppliers;
                        }
                    }
                } else {
                    this.payload.lot.inboundData.supplier = null;
                }
                if (!this.suppliers || this.suppliers.length === 0) {
                    this.suppliers = [];
                }
            }
        });
    }

    searchStyleOrArticle(event) {
        if (event.key !== '') {
            this.searchFreeHandInbound(this.soaUniqueName);
        }
        if (event.target.value === '') {
            this.suppliers = [];
            this.payload.lot.inboundData.supplier = null;
            this.soaUniqueName = { id_type: '', unique_search: '', supplier: [] };
        }
    }

    updateSupplier(event: any) {
        if (Array.isArray(event)) {
            this.payload.lot.inboundData.supplier = event[0];
        } else {
            this.payload.lot.inboundData.supplier = event;
        }
    }
}
