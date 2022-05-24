import { Component, OnInit } from '@angular/core';
import { CertificateTypeValue } from '../../uploads/interface/certificate-type-value-model';
import { TransactionsService } from '../transactions.service';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import {
    ISupplierListFormOptions,
    SupplierListTypes
} from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { FacilitiesService } from '../../facilities/facilities.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { ContextService } from '../../../shared/context.service';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { CertificateUploadService } from '../../uploads/certificate/cert-upload.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { OrdersService } from '../../orders/orders.service';
import { Router } from '@angular/router';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { debounceTime } from 'rxjs/operators';
import { TxType } from '../transactions.model';

@Component({
    selector: 'app-production',
    templateUrl: './production.component.html',
    styleUrls: ['./production.component.scss']
})
export class ProductionComponent implements OnInit {
    referenceIdIsUnique = true;

    TxType = TxType;
    hintColor: string;
    articleHintColor: string;
    certTypeValueList: CertificateTypeValue[];
    subscription: Subscription;
    searchRawData = [];
    rawLotData = [];
    inputLotQtyArray = [];
    pageLoading = false;
    config: any = {};
    inputMaterials = [];
    inputMaterial = {};
    inputLotDropdown = [];
    suppliers = [];

    styleSearchText: any;
    articlesSearchText = [];

    articleSearchText = [];
    stylesAutoCompleteList = [];

    soaUniqueName = {
        id_type: '',
        unique_search: ''
    };

    articleUniqueName = '';

    productionInput = {
        lotId: '',
        quantity: {
            quantity: '',
            unit: 'un_kilograms'
        },
        inputTxDate: '',
        inputTxId: '',
        supplierId: '',
        txType: '',
        articleId: '',
        fieldName: ''
    };

    transaction = {
        date: new Date(),
        companyId: '',
        mode: 'WEB_UI',
        txType: TxType.production,
        facilityId: null,
        productionData: {
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
            productionInputLots: []
        }
    };

    certifications = [];

    inputLotsSelected = [];

    // searchable dropdown
    isRequired = true;
    optional = { key: 'id', value: 'lot_id', selectedKey: 'lot_id' };

    supplierOptional = { key: 'id', value: 'value', selectedKey: 'id' };

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

    uploadFiles: any = {};

    data: any = {
        certificates_to_collect: []
    };

    isUploading: any = {};
    env = environment;

    validationResponse = {};

    styleComposition = [];

    soaSearchHintText = 'Type at least 3 characters to search';
    articleSearchHintText = 'Type at least 3 characters to search';

    freeHandSearchSubject: Subject<any> = new Subject();

    constructor(
        private localeService: LocalizationService,
        private confirmDialog: MatDialog,
        private orderService: OrdersService,
        private router: Router,
        private toastrService: CustomToastrService,
        private certUploadService: CertificateUploadService,
        private facilitiesService: FacilitiesService,
        public commonServices: CommonServices,
        private certificateManagerService: CertificateManagerService,
        private analyticsService: AnalyticsService,
        private appContext: ContextService,
        public authService: AuthService,
        private multiIndustryService: MultiIndustryService,
        private dialog: MatDialog,
        private transactionsService: TransactionsService
    ) {
        this.transaction.companyId = this.authService.companyId;
    }

    ngOnInit() {
        this.analyticsService.trackPageVisit('production transaction');
        this.getProductionConfig();

        this.freeHandSearchSubject.pipe(debounceTime(150)).subscribe(() => {
            if (this.styleSearchText) {
                this.searchFreeHandProduction(this.styleSearchText);
            }
        });
    }
    getProductionConfig() {
        this.pageLoading = true;
        this.certTypeValueList = [];
        this.transactionsService.getProductionConfig().subscribe(response => {
            this.config = response['data']['data'];
            // remove this from backend
            this.config.lots = [];
            this.config.suppliers = [];
            this.localeService.addToMasterData(response['data'].masterData);
            if (
                this.transaction.productionData.productionInputLots &&
                this.transaction.productionData.productionInputLots.length === 0
            ) {
                this.addInputMaterial();
            }
            this.searchRawData = this.config.SOA_search;
            this.pageLoading = false;
        });
    }

    ngOnDestroy() {
        // prevent memory leak when component is destroyed
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    addInputMaterial() {
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.transaction.productionData.productionInputLots.push(JSON.parse(JSON.stringify(this.productionInput)));
        this.inputLotsSelected.push({});
        this.articlesSearchText.push('');
    }

    deleteInputMaterial(index) {
        if (index < this.transaction.productionData.productionInputLots.length - 1) {
            this.transaction.productionData.productionInputLots.splice(index, 1);
            this.inputLotsSelected.splice(index, 1);
            this.inputLotDropdown.splice(index, 1);
            this.articlesSearchText.splice(index, 1);
        }
    }

    checkQuantityEntered(userQty, i) {
        const lotQty = this.inputLotQtyArray[i];
        const lot = this.inputLotsSelected[i];
        if (userQty === 0 || userQty > +lotQty) {
            this.toastrService.error(
                'Invalid Quantity Entered: Available Quantity in selected Lot:' +
                    lotQty +
                    ' ' +
                    this.localeService.getDisplayText(lot.units_key)
            );
            this.transaction.productionData.productionInputLots[i].quantity.quantity = undefined;
            this.transaction.productionData.productionInputLots[i].quantity.unit = 'un_kilograms';
        }
    }

    inputLotChanged(event, index) {
        this.inputLotsSelected[index] = event;
        this.transaction.productionData.productionInputLots[index].lotId = this.inputLotsSelected[index].lot_id;
        this.transaction.productionData.productionInputLots[index].txType = this.inputLotsSelected[index].tx_type;
        this.transaction.productionData.productionInputLots[index].quantity.quantity = this.inputLotsSelected[
            index
        ].quantity.value;
        if (this.inputLotsSelected[index]?.supplier) {
            this.transaction.productionData.productionInputLots[index].supplierId = this.inputLotsSelected[
                index
            ].supplier.id;
        } else {
            delete this.transaction.productionData.productionInputLots[index].supplierId;
        }
        this.inputLotQtyArray[index] = this.inputLotsSelected[index].quantity;
        this.transaction.productionData.productionInputLots[index].quantity.unit = 'un_kilograms';
        this.transaction.productionData.productionInputLots[index].inputTxId = event.id;
        this.transaction.productionData.productionInputLots[index].inputTxDate = new Date(event.tx_date);
        if (Array.isArray(event.supplier)) {
            this.config.suppliers = event.supplier;
        } else if (event?.supplier) {
            this.config.suppliers = [];
            this.config.suppliers.push(event.supplier);
        }

        this.addInputMaterial();
    }

    private clearForm() {
        this.soaUniqueName = { id_type: '', unique_search: '' };
        this.suppliers = [];
        this.config.lots = [];
        this.config.suppliers = [];
        this.styleComposition = [];
        this.productionInput = {
            lotId: '',
            quantity: {
                quantity: '',
                unit: 'un_kilograms'
            },
            inputTxDate: '',
            inputTxId: '',
            supplierId: '',
            txType: 'INBOUND',
            articleId: '',
            fieldName: ''
        };

        this.transaction = {
            date: new Date(),
            companyId: this.authService.companyId,
            mode: 'WEB_UI',
            txType: TxType.production,
            facilityId: null,
            productionData: {
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
                productionInputLots: []
            }
        };
        this.articleUniqueName = '';
        this.styleSearchText = {};
        this.inputLotsSelected = [];
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.transaction.productionData.productionInputLots.push(JSON.parse(JSON.stringify(this.productionInput)));
        this.getProductionConfig();
    }

    getSOADisplayName(item) {
        if (item) {
            return `${item.code}-${item.name}-${item.year}-${item.season.value}`;
        }
    }

    getLotDisplayName(item) {
        if (item) {
            return `${item.product_name}-${item.product_number}`;
        }
    }

    searchFreeHandProduction(searchTerm: string): void {
        if (searchTerm && typeof searchTerm !== 'string') return;
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        this.transactionsService.searchFreeHandStyle(searchPayload).subscribe(response => {
            if (searchTerm?.length >= 3) {
                this.config.SOA_search = this.transactionsService.filterForUniqueSOAValue(
                    response['data'].searchResponse
                );
                if (this.config.SOA_search.length > 0) {
                    this.hintColor = '';
                    this.soaSearchHintText = '';
                } else {
                    this.hintColor = 'red';
                    this.soaSearchHintText = 'No results found';
                }
            } else {
                this.hintColor = 'red';
                this.soaSearchHintText = 'No results found';
            }
        });
    }

    searchInputMaterial(searchTerm) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        searchPayload['filter'] = {
            'Transaction Type': ['INBOUND', 'PRODUCTION'],
            Status: ['SUBMITTED']
        };
        this.transactionsService.searchTransaction(searchPayload).subscribe(response => {
            this.rawLotData = response['data'].searchResponse;
            if (this.rawLotData.length > 0) {
                this.config.article_search = this.transactionsService.filterForUniqueLots(this.rawLotData);
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

    onStyleSelection(value) {
        this.transaction.productionData.outputProductItemId = value?.id;
        this.transaction.productionData.productionInputLots = [];
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.transaction.productionData.productionInputLots.push(JSON.parse(JSON.stringify(this.productionInput)));

        // Get Lots related to this style
        const searchPayload = {};
        searchPayload['freeHand'] = this.styleSearchText.unique_search;
        searchPayload['filter'] = {
            id: [value.id]
        };

        this.transactionsService.getStyleDetails(searchPayload).subscribe(data => {
            this.styleComposition = data['material_composition'];
        });
    }

    onArticleSelection(value) {
        this.config.lots = this.rawLotData.filter(lot => {
            return lot.product_name === value.product_name && lot.product_number === value.product_number;
        });
    }

    searchArticle(event, i) {
        if (event.key !== '') {
            this.searchInputMaterial(this.transaction.productionData.productionInputLots[i].articleId);
        }
    }

    searchStyle() {
        this.freeHandSearchSubject.next();
    }

    saveProductionOrder() {
        this.pageLoading = true;

        if (this.transaction.productionData.productionInputLots.length <= 1) {
            this.toastrService.info('Please add the input materials', 'No input materials');
            this.pageLoading = false;
            return;
        }

        this.transaction.productionData.productionInputLots.splice(
            this.transaction.productionData.productionInputLots.length - 1,
            1
        );

        this.transaction.productionData.productionInputLots.forEach(inputLot => {
            delete inputLot.articleId;
            delete inputLot.fieldName;
        });

        if (this.transaction.productionData.sellerUOM.quantity === null) {
            delete this.transaction.productionData.sellerUOM;
        }

        this.transaction.date = this.commonServices.adjustDateForTimezone(this.transaction.date);
        this.transactionsService.submitTransactions(this.transaction).subscribe(
            (response: any) => {
                if (response?.errorMsg === 'Duplicate Transaction') {
                    this.analyticsService.trackSaveFail('production transaction');
                    this.toastrService.error('Production Transaction already exists', 'Error');
                    this.pageLoading = false;
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
                    this.referenceIdIsUnique = false;
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
        this.transaction.productionData.productionInputLots[index].soaId = event.option.value.id;
        this.transaction.productionData.productionInputLots[index].soaType = event.option.value.type;
    }

    save() {
        this.analyticsService.trackSaveButtonClick('production transaction');
        this.saveProductionOrder();
    }

    checkIfReferenceIdIsUnique() {
        this.orderService.isReferenceIfUnique(this.transaction.productionData.outputLotId).subscribe(
            () => {
                this.referenceIdIsUnique = true;
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.referenceIdIsUnique = false;
                    this.toastrService.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.referenceIdIsUnique = true;
                }
            }
        );
    }

    validateSelectedStyle() {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (this.styleSearchText.hasOwnProperty('unique_search') || !this.styleSearchText) {
                return;
            }

            let matchedItems = this.config.SOA_search.filter(x => {
                return x.unique_search === this.styleSearchText;
            });

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.styleSearchText = '';
                this.toastrService.error('Please select a valid style');
            }
        }, 200);
    }

    updateSupplier(event: any, index: number) {
        if (event.id) {
            this.transaction.productionData.productionInputLots[index].supplierId = event.id;
        }
    }
}
