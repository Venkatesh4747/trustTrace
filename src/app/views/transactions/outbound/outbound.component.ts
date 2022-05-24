import { Component, OnInit } from '@angular/core';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { CertificateUploadService } from '../../uploads/certificate/cert-upload.service';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { FacilitiesService } from '../../facilities/facilities.service';
import { CertificateTypeValue } from '../../uploads/interface/certificate-type-value-model';
import { IOutboundData } from '../transactions.model';
import { ContextService } from '../../../shared/context.service';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { TransactionsService } from '../transactions.service';
import { AuthService } from '../../../core';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-outbound',
    templateUrl: './outbound.component.html',
    styleUrls: ['./outbound.component.scss']
})
export class OutboundComponent implements OnInit {
    hintColor: string;
    pageLoading = true;
    displaySaveBtn = true;
    selectedFacilitiesName = [];
    certTypeValueList: CertificateTypeValue[] = [];
    subscription: Subscription;
    searchRawData = [];
    lotRawData = [];
    inputLotValue = 0.0;
    payload: IOutboundData = {
        date: new Date(),
        companyId: '',
        mode: 'WEB_UI',
        txType: 'OUTBOUND',
        facilityId: null,
        outboundData: {
            poNumber: '',
            customerId: '',
            productionLotId: '',
            lotManufacturedDate: null,
            productItemId: '',
            quantity: {
                quantity: '',
                unit: 'un_kilograms'
            }
        }
    };

    config: any = {};

    searchTerm: any;
    isRequired = true;
    optional = { key: 'lot_id', value: 'lot_id', selectedKey: 'lot_id' };

    uploadFiles: any = {};

    data: any = {
        certificates_to_collect: []
    };

    isUploading: any = {};
    env = environment;
    validationResponse = {};

    soaSearchHintText = 'Type at least 3 characters to search';

    freeHandSearchSubject: Subject<any> = new Subject();

    constructor(
        private router: Router,
        private localeService: LocalizationService,
        private confirmDialog: MatDialog,
        private toastrService: CustomToastrService,
        private certUploadService: CertificateUploadService,
        private facilitiesService: FacilitiesService,
        private certificateManagerService: CertificateManagerService,
        private transactionsService: TransactionsService,
        private analyticsService: AnalyticsService,
        public authService: AuthService,
        private appContext: ContextService,
        private dialog: MatDialog,
        private multiIndustryService: MultiIndustryService,
        private commonServices: CommonServices
    ) {
        this.payload.companyId = this.authService.companyId;
    }

    ngOnInit() {
        this.analyticsService.trackPageVisit('Outbound transaction');
        this.getOutboundConfig();

        this.freeHandSearchSubject.pipe(debounceTime(150)).subscribe(() => {
            if (this.searchTerm) {
                this.searchFreeHandOutbound(this.searchTerm);
            }
        });
    }

    getOutboundConfig() {
        this.pageLoading = true;
        this.transactionsService.getOutboundConfig().subscribe(
            resp => {
                this.localeService.addToMasterData(resp['data'].masterData);
                this.config = resp['data'].data;
                if (this.config.customers.length === 1) {
                    this.payload.outboundData.customerId = this.config.customers[0].key;
                }
                this.lotRawData = this.config.lots;
                this.config.lots = [];
                this.config.SOA_search = [];
                this.pageLoading = false;
            },
            () => {
                this.toastrService.error('error fetching order data');
                this.pageLoading = false;
            }
        );
    }

    ngOnDestroy() {
        // prevent memory leak when component is destroyed
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    saveOrder() {
        this.pageLoading = true;
        this.payload.date = this.commonServices.adjustDateForTimezone(this.payload.date);
        this.transactionsService.submitTransactions(this.payload).subscribe(
            (response: any) => {
                if (response?.errorMsg === 'Duplicate Transaction') {
                    this.analyticsService.trackSaveFail('outbound transaction');
                    this.toastrService.error('Outbound Transaction already exists', 'Error');
                    this.pageLoading = false;
                } else {
                    this.analyticsService.trackSaveSuccess('outbound transaction');
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
                if (errorResponse?.status === 409) {
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
        if (item) {
            return `${item?.product_name}-${item?.product_number}`;
        }
        return null;
    }

    checkLotAlreadySelected(event) {
        this.payload.outboundData.quantity.quantity = event.quantity.value;
        this.payload.outboundData.quantity.unit = 'un_kilograms';
        this.inputLotValue = event.quantity;
        this.payload.outboundData.productItemId = event.product_id;
        this.payload.outboundData.lotManufacturedDate = event.tx_date;
    }

    resetForm() {
        this.searchTerm = '';
        this.certUploadService.clearCertificates();
        this.facilitiesService.clearFacilities();
        this.config.lots = [];
        this.payload = {
            date: new Date(),
            companyId: this.authService.companyId,
            mode: 'WEB_UI',
            txType: 'OUTBOUND',
            facilityId: null,
            outboundData: {
                poNumber: '',
                customerId: '',
                productionLotId: '',
                lotManufacturedDate: null,
                productItemId: '',
                quantity: {
                    quantity: '',
                    unit: 'un_kilograms'
                }
            }
        };
        this.getOutboundConfig();
    }

    searchFreeHandOutbound(searchTerm: string): void {
        if (searchTerm && typeof searchTerm !== 'string') return;
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        searchPayload['filter'] = {
            'Transaction Type': ['PRODUCTION'],
            Status: ['SUBMITTED']
        };

        this.transactionsService.searchTransaction(searchPayload).subscribe(response => {
            this.searchRawData = response['data'].searchResponse;
            if (searchTerm.length >= 3) {
                if (this.searchRawData.length > 0) {
                    this.config.SOA_search = this.transactionsService.filterForUniqueLots(this.searchRawData);

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

    searchStyle() {
        this.freeHandSearchSubject.next();
    }

    getSOAId(value): string {
        const soaSplit = value.split('-');
        return soaSplit[0];
    }

    getLotId(value) {
        return value.id;
    }

    onSOASelection(value) {
        this.config.lots = this.searchRawData.filter(
            _lot => _lot.product_name === value.product_name && _lot.product_number === value.product_number
        );

        this.payload.outboundData.productionLotId = '';
        this.payload.outboundData.poNumber = '';
        this.payload.outboundData.customerId = '';

        const lot = this.config.lots.filter(_lot => _lot.product_name === value.product_name)[0];

        if (!lot || lot.length === 0) {
            this.toastrService.error(
                this.multiIndustryService.getLabel('Not Lots found for the chosen style / material')
            );
            return;
        }

        // If there is only one customer, then select it for the user
        if (this.config.customers.length === 1) {
            this.payload.outboundData.customerId = this.config.customers[0].key;
        }
    }

    save() {
        this.analyticsService.trackSaveButtonClick('outbound transaction');
        this.saveOrder();
    }

    validateSelectedStyle() {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (this.searchTerm?.hasOwnProperty('unique_search') || !this.searchTerm) {
                return;
            }

            let matchedItems = this.config.SOA_search.filter(x => x === this.searchTerm);

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.searchTerm = '';
                this.toastrService.error('Please select a valid style');
            }
        }, 200);
    }
}
