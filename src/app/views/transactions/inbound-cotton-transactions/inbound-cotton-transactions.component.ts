import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from './../../../core/analytics/analytics.service';
import { AuthService } from './../../../core/user/auth.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { ContextService } from './../../../shared/context.service';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { UtilsService } from './../../../shared/utils/utils.service';
import {
    COTTON_INBOUND_LABELS,
    ICottonInboundData,
    ITierConfigPayload,
    SEARCH_CONTEXT,
    TRANSACTION_TYPE,
    TierKeys
} from './../transactions.model';
import { TransactionsService } from './../transactions.service';

@Component({
    selector: 'app-inbound-cotton-transactions',
    templateUrl: './inbound-cotton-transactions.component.html',
    styleUrls: ['./inbound-cotton-transactions.component.scss']
})
export class InboundCottonTransactionsComponent implements OnInit {
    cottonInboundLabels = COTTON_INBOUND_LABELS;

    mandatoryFields: string[] = [
        this.cottonInboundLabels.MATERIAL_NAME,
        this.cottonInboundLabels.MATERIAL_COMPOSITION,
        this.cottonInboundLabels.SUPPLIER,
        this.cottonInboundLabels.YARN_LOT_NUMBER,
        this.cottonInboundLabels.NET_WEIGHT,
        this.cottonInboundLabels.YARN_INVOICE_NUMBER,
        this.cottonInboundLabels.YARN_COO,
        this.cottonInboundLabels.COTTON_LINT_COO
    ];
    countries: any = {
        yarn: [],
        cotton_lint: []
    };
    states: any = {
        yarn: [],
        cotton_lint: []
    };

    selectedCountries = {
        yarn: [],
        cotton_lint: []
    };

    selectedProvinces = {
        yarn: [],
        cotton_lint: []
    };

    provinces = [];

    pageLoading = false;

    tierPayload: ITierConfigPayload = {
        brandCompanyId: '000000000000000000000000',
        tier: 'tr_tier2',
        searchContext: SEARCH_CONTEXT.T2_COTTON_INBOUND,
        txType: TRANSACTION_TYPE.COTTON_INBOUND
    };

    tierConfig: any;
    config: any = {};

    tier_session = 'transactions_tier';
    tiers = TierKeys;

    payload: ICottonInboundData = {
        date: new Date(),
        companyId: '',
        mode: 'WEB_UI',
        txType: TRANSACTION_TYPE.COTTON_INBOUND,
        facility: null,
        inboundData: {
            sellerLotId: null,
            quantity: {
                quantity: '',
                unit: 'un_kilograms'
            },
            invoiceNumber: '',
            materialCompositionList: [
                {
                    id: '',
                    value: ''
                }
            ],
            sellerName: '',
            materialType: '',
            yarnCOO: {
                country: null,
                province: null,
                certificateOfOrigin: null
            },
            cottonLintCOO: {
                country: null,
                province: null,
                certificateOfOrigin: null
            },
            productItemId: '',
            productEntity: '',
            supplierId: ''
        },
        tierId: ''
    };

    parameters = {
        key: 'id',
        value: 'name',
        selectedKey: 'name'
    };

    soaUniqueName = {
        id_type: '',
        unique_search: ''
    };
    showArticleError = false;
    articleError = '';
    productSearchText: any;
    hintColor: string;
    searchRawData = [];
    soaSearchHintText = 'Type all characters to search';
    module = 'TT_TRANSACTION';

    facilities = [];
    facilitiesRawData = [];
    searchTermFacility: any;
    facilitySearchHintText = 'Type all characters to search';

    constructor(
        private transactionsService: TransactionsService,
        private authService: AuthService,
        private utilsService: UtilsService,
        private analyticsService: AnalyticsService,
        private router: Router,
        private toastrService: CustomToastrService,
        private appContext: ContextService,
        private localeService: LocalizationService,
        private commonServices: CommonServices
    ) {}

    ngOnInit() {
        this.pageLoading = true;
        this.tierPayload.brandCompanyId =
            this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : '000000000000000000000000';
        this.tierPayload.tier = this.utilsService.getSessionStorageValue(this.tier_session).key;
        this.tierPayload.searchContext = `${this.tierPayload.tier}_${TRANSACTION_TYPE.COTTON_INBOUND}`;
        forkJoin([
            this.commonServices.getCountries(),
            this.transactionsService.getTierConfig(this.tierPayload),
            this.transactionsService.getCottonInboundConfig()
        ]).subscribe(
            response => {
                const data = response[0]['data'];
                this.countries.yarn = JSON.parse(JSON.stringify(data['country']));
                this.countries.cotton_lint = JSON.parse(JSON.stringify(data['country']));
                // Process tier payload
                this.tierConfig = JSON.parse(JSON.stringify(response[1]));
                this.localeService.addToMasterData(response[2]['data']['master_data']);
                this.processInboundData(response[2]);
                this.getProvinces();
                // this.pageLoading = false;
            },
            fail_response => {
                this.toastrService.error('error fetching transaction data');
                this.pageLoading = false;
            }
        );
    }

    checkToShowField(item: string) {
        return this.transactionsService.checkToShowField(item, this.mandatoryFields, this.tierConfig);
    }

    getFieldLabel(item: string) {
        return this.transactionsService.getFieldLabel(item, this.mandatoryFields, this.tierConfig);
    }

    processInboundData(response) {
        this.config = response['data']['data'];
    }

    saveInbound() {
        this.pageLoading = true;
        this.payload.tierId = this.tierPayload.tier;
        this.payload['brandContextId'] = this.tierPayload.brandCompanyId;
        this.payload.companyId = this.authService.user.companyId;
        const payload = JSON.parse(JSON.stringify(this.payload));

        if (this.tierPayload.tier !== this.tiers.tier1) {
            delete payload.inboundData.productItemId;
            delete payload.inboundData.productEntity;
        }

        this.transactionsService.submitTransactions(payload).subscribe(
            (response: any) => {
                if (response && response.errorMsg !== null) {
                    this.analyticsService.trackSaveFail('cotton inbound transaction');
                    if (response.errorMsg === 'Duplicate Transaction') {
                        this.toastrService.error('Inbound-cotton Transaction already exists', 'Error');
                        this.pageLoading = false;
                    } else {
                        this.toastrService.error(response.errorMsg, 'Error');
                        this.pageLoading = false;
                    }
                } else {
                    this.analyticsService.trackSaveSuccess('cotton inbound transaction');
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
                    this.analyticsService.trackSaveFail('cotton inbound transaction', 'Error: Duplicate Reference Id');
                    this.toastrService.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.analyticsService.trackSaveFail('cotton inbound transaction');
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
        this.analyticsService.trackSaveButtonClick('inbound transaction');
        this.saveInbound();
    }

    addMaterial() {
        const temp_payload = { id: '', value: '' };
        this.payload.inboundData.materialCompositionList.push(JSON.parse(JSON.stringify(temp_payload)));
    }
    deleteMaterial(index) {
        this.payload.inboundData.materialCompositionList.splice(index, 1);
        if (this.payload.inboundData.materialCompositionList.length === 0) {
            this.addMaterial();
        }
    }

    getCountryId(countryName) {
        if (Array.isArray(this.countries.yarn) && this.countries.yarn.length > 0) {
            for (let i = 0; i < this.countries.yarn.length; i++) {
                if (this.countries.yarn[i].name === countryName) {
                    return this.countries.yarn[i].id;
                }
            }
        }

        this.toastrService.error(
            `There seems to be an issue with the selected country ${countryName}`,
            'Invalid country'
        );
        return false;
    }

    getCountries() {
        this.commonServices.getCountries().subscribe(response => {
            const data = response['data'];
            this.countries.yarn = JSON.parse(JSON.stringify(data['country']));
            this.countries.cotton_lint = JSON.parse(JSON.stringify(data['country']));
        });
    }

    getProvinces(countryName = 'China') {
        const countryId = this.getCountryId(countryName);
        this.commonServices.getStates(countryId).subscribe(
            response => {
                this.provinces = JSON.parse(JSON.stringify(response['data']['state']));
                this.pageLoading = false;
            },
            failResponse => {
                this.pageLoading = false;
            }
        );
    }

    getStates(event, type = 'Yarn') {
        this.pageLoading = true;
        // let countryName = null;
        // if (typeof event === 'object') {
        //     countryName = event.name;
        // } else {
        //     countryName = event;
        // }

        if (type === 'Yarn') {
            this.selectedCountries.yarn = event;
            this.payload.inboundData.yarnCOO.country = [];
            if (typeof event === 'object') {
                this.payload.inboundData.yarnCOO.country.push(event.name);
                if (event.name === 'China') {
                    if (this.states.yarn.length === 0) {
                        this.states.yarn = JSON.parse(JSON.stringify(this.provinces));
                    }
                    this.selectedProvinces.yarn = [];
                }
            } else {
                event.forEach(country => {
                    this.payload.inboundData.yarnCOO.country.push(country.name);
                    if (country.name === 'China') {
                        if (this.states.yarn.length === 0) {
                            this.states.yarn = JSON.parse(JSON.stringify(this.provinces));
                        }
                        this.selectedProvinces.yarn = [];
                    }
                });
            }

            if (!this.payload.inboundData.yarnCOO.country.includes('China')) {
                this.payload.inboundData.yarnCOO.province = [];
            }
        } else {
            this.selectedCountries.cotton_lint = event;
            this.payload.inboundData.cottonLintCOO.country = [];
            event.forEach(country => {
                this.payload.inboundData.cottonLintCOO.country.push(country.name);
                if (country.name === 'China') {
                    if (this.states.cotton_lint.length === 0) {
                        this.states.cotton_lint = JSON.parse(JSON.stringify(this.provinces));
                    }
                    this.selectedProvinces.cotton_lint = [];
                }
            });
            if (!this.payload.inboundData.cottonLintCOO.country.includes('China')) {
                this.payload.inboundData.cottonLintCOO.province = [];
            }
        }

        this.pageLoading = false;
    }

    // processProvinces(event, type = 'Yarn') {
    //     if (event.length > 0) {
    //         if (type === 'Yarn') {
    //             this.selectedProvinces.yarn = event;
    //             this.payload.inboundData.yarnCOO.province = [];
    //             event.forEach(province => {
    //                 this.payload.inboundData.yarnCOO.province.push(province.name);
    //             });
    //         } else {
    //             this.selectedProvinces.cotton_lint = event;
    //             this.payload.inboundData.cottonLintCOO.province = [];
    //             event.forEach(province => {
    //                 this.payload.inboundData.cottonLintCOO.province.push(province.name);
    //             });
    //         }
    //     }
    // }

    processProvinces(event, type = 'Yarn') {
        if (type === 'Yarn') {
            this.selectedProvinces.yarn = event;
            this.payload.inboundData.yarnCOO.province = [];
            this.payload.inboundData.yarnCOO.province.push(event.name);
        } else {
            this.selectedProvinces.cotton_lint = event;
            this.payload.inboundData.cottonLintCOO.province = [];
            this.payload.inboundData.cottonLintCOO.province.push(event.name);
        }
    }

    toShowProvince(type = 'Yarn') {
        if (type === 'Yarn') {
            return this.payload.inboundData.yarnCOO.country &&
                this.payload.inboundData.yarnCOO.country.includes('China')
                ? true
                : false;
        } else if (type === 'Cotton_Lint') {
            return this.payload.inboundData.cottonLintCOO.country &&
                this.payload.inboundData.cottonLintCOO.country.includes('China')
                ? true
                : false;
        }
    }

    searchStyleOrArticle(event) {
        if (event.key !== '') {
            this.searchFreeHandProduction(this.productSearchText);
        }
        if (event.target.value.trim('') === '') {
            this.soaUniqueName = { id_type: '', unique_search: '' };
        }
    }

    searchFreeHandProduction(searchTerm) {
        this.showArticleError = false;
        this.articleError = '';
        const searchPayload = {
            brandContextId: '',
            filter: {}
        };
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        searchPayload['module'] = this.module;

        if (!searchTerm) {
            return;
        }

        searchPayload['filter']['Internal Article Number'] = [];
        searchPayload['filter']['Internal Article Number'].push(searchTerm.toLocaleUpperCase());
        this.transactionsService.searchFreeHandMaterial(searchPayload).subscribe(
            response => {
                this.processSearchResult(response, searchTerm);
            },
            () => {
                this.processSearchError(searchTerm);
            }
        );
    }

    private filterForUniqueSOAValue(rawSOAData) {
        const filteredSOATerms = [];
        const filteredSOAData = [];
        rawSOAData.forEach(el => {
            el.unique_search = el.unique_search.replace('-null', '').replace('null-', '');
            if (filteredSOATerms.indexOf(el.unique_search) === -1) {
                filteredSOATerms.push(el.unique_search);
                filteredSOAData.push(el);
            }
        });
        return filteredSOAData;
    }

    private processSearchError(searchTerm) {
        if (searchTerm && searchTerm.length >= 3) {
            this.config.SOA_search = [];
            this.hintColor = 'red';
            this.soaSearchHintText = 'No results found';
        }
    }

    private processSearchResult(response, searchTerm) {
        this.searchRawData = response['data'].searchResponse;
        if (this.searchRawData.length > 0) {
            // used to check only unique values are pushed to this.config.SOA_search
            this.config.SOA_search = this.filterForUniqueSOAValue(this.searchRawData);

            this.hintColor = '';
            this.soaSearchHintText = '';
        } else {
            if (searchTerm && searchTerm.length >= 3) {
                this.config.SOA_search = [];
                this.hintColor = 'red';
                this.soaSearchHintText = 'No results found';
            }
        }
    }

    validateSelectedProduct(productIdentifier) {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (this.soaUniqueName.hasOwnProperty('unique_search') || !this.soaUniqueName) {
                return;
            }

            let matchedItems = this.config.SOA_search.filter(x => x === this.soaUniqueName);

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.showArticleError = true;
                this.productSearchText = '';
                this.articleError = `${this.getFieldLabel(productIdentifier)} is invalid`;
                // this.toastrService.error('Please select a valid Article / Style');
            }
        }, 100);
    }

    getProductName(item) {
        let displayText = '';
        if (item && item.id_type) {
            if (item.id_type.endsWith('style')) {
                if (item.name) {
                    displayText += item.name + '-';
                }

                if (item.code) {
                    displayText += item.code;
                }
            } else if (item.id_type.endsWith('material_lib')) {
                if (item.internal_article_name) {
                    displayText += item.internal_article_name + '-';
                }

                if (item.internal_article_number) {
                    displayText += item.internal_article_number;
                }
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

    onProductSelection(value) {
        const soaSplit = value.id_type.split('-');

        if (soaSplit[1] === 'style') {
            this.payload.inboundData.productEntity = 'STYLE';
            this.payload.inboundData.productItemId = value.code;
        } else if (soaSplit[1] === 'material_lib') {
            this.payload.inboundData.productEntity = 'MATERIAL_LIBRARY';
            this.payload.inboundData.productItemId = value.internal_article_number;
        }
    }

    onFacilitySelection(value) {
        this.payload.inboundData.supplierId = value.reference_id;
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

    searchFacility(event) {
        if (event.key !== '') {
            this.searchFreeHandFacility(this.searchTermFacility);
        }
    }

    searchFreeHandFacility(searchTermFacility) {
        const searchPayload = {};
        searchPayload['brandContextId'] = this.tierPayload.brandCompanyId;
        searchPayload['module'] = this.module;
        searchPayload['filter'] = {
            'Reference Id': [searchTermFacility.toLocaleUpperCase()]
        };

        // mustNot field is required if tier1
        if (this.tierPayload.tier === this.tiers.tier1) {
            searchPayload['mustNot'] = {
                'Supplier Id': [this.authService.companyId]
            };
        }
        if (this.tierPayload.tier === this.tiers.tier2) {
            searchPayload['filter']['Supplier Id'] = [this.authService.companyId];
        }
        if (!searchTermFacility) {
            return;
        }

        this.transactionsService.getFacilities(searchPayload).subscribe(response => {
            this.facilitiesRawData = response['data'].searchResponse;
            if (this.facilitiesRawData.length > 0) {
                this.facilities = JSON.parse(JSON.stringify(this.facilitiesRawData));
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
    validation() {
        if (typeof this.searchTermFacility !== 'object') {
            this.searchTermFacility = '';
            this.facilities = [];
            this.toastrService.error('Please select a valid Facility');
        }
    }
}
