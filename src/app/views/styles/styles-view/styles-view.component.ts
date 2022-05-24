import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { ProductTraceabilityService } from '../../product-traceability/product-traceability.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { TEmsService } from '../../t-ems/t-ems.service';
import { vpIcons } from '../styles.const';
import { ShipmentDetails, SupplyChainDetail } from '../styles.model';
import { StylesService } from './../styles.service';
import { OrdersService } from '../../orders/orders.service';
import { forkJoin } from 'rxjs';
import { TraceabilityRequestService } from './../../traceability-request/traceability-request.service';
import { SuppliersService } from './../../suppliers/suppliers.service';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { AuthService } from '../../../core';

@Component({
    selector: 'app-styles-view',
    templateUrl: './styles-view.component.html',
    styleUrls: ['./styles-view.component.scss']
})
export class StylesViewComponent implements OnInit {
    tabs = [
        {
            name: 'Specifications',
            icon: '',
            isComplianceTab: false
        },
        {
            name: 'Supply Chain',
            icon: '',
            isComplianceTab: false
        },
        {
            name: 'Evidences',
            icon: '',
            isComplianceTab: false
        }
    ];

    @ViewChild('productFlowModal', { static: true }) productFlowModal;

    bsModalRef: BsModalRef;

    env = environment;

    icons = vpIcons;
    styleId = '';
    favoriteColor = '';
    favoriteSize = '';
    selectedPO = '';
    styleDetail = this.tabs[0];
    availableSizes = [];
    availableLengths = [];
    availableFits = [];
    variants = [];
    countries = [];
    displayedArticleComposition = [
        'name',
        'type',
        'supplier',
        'areaOfUsage',
        'quantity',
        'materialComposition',
        'colors',
        'traceable'
    ];
    displayedShipmentDetails = ['date', 'po', '_id'];
    pageLoading = true;
    isLoadingSupplyChain = false;
    showDetailedSupplyChain = false;
    refId = null;

    supplyChainDetails: ShipmentDetails[] = [];
    supplyChainDetail: SupplyChainDetail[] = [];
    articleComposition = [];
    articleDataSource;
    supplyChainDataSource;
    product: any = {};
    manufacturers: any = [];
    modalFlowData: any;
    productFlowDataReady: boolean;
    supplyChainOrders = [];
    supplyChainProduct;
    selectedSupplyChain;
    selectedDetailedSupplyChain;
    supplyChainData;
    suppliers: any = [];
    supplyChainItems = [];
    orderId = '';
    defaultSrc: string;
    queryParams = { params: { tab: 'Supply Chain' } };
    uniqueCode: any;
    selectedEvidence: any;
    evidenceDetail: any = [];
    isLoadingProductEvidence = false;
    acceptedStringLength = environment.TRUNCATE_STRING_LENGTH;

    complianceOutcome: any;
    entity = 'STYLE'; // 'ML', 'SUPPLIER'
    viewPage = 'STYLE_VIEW'; // 'ML_VIEW', 'SUPPLIER_VIEW'
    viewType = 'FORM'; // 'FORM', 'TABLE', 'CARD'
    payload: any;
    additionalInfo: any;
    fieldResponse: any;
    isFetchingAdditionalInfo = false;
    parameters: any;

    get industry(): string {
        return this.multiIndustryService.industry;
    }

    constructor(
        private pts: ProductTraceabilityService,
        private stylesService: StylesService,
        public localizationService: LocalizationService,
        private route: ActivatedRoute,
        public commonService: CommonServices,
        private toastr: CustomToastrService,
        public utilService: UtilsService,
        private orderService: OrdersService,
        private trs: TraceabilityRequestService,
        private temsService: TEmsService,
        private auth: AuthService,
        private supplierService: SuppliersService,
        private router: Router,
        private multiIndustryService: MultiIndustryService,
        public certificateManagerService: CertificateManagerService
    ) {
        this.route.params.subscribe(params => {
            this.styleId = params['styleId'];
        });

        this.route.queryParams.subscribe(params => {
            this.parameters = params.tab;
        });

        if (this.router.url.includes('?')) {
            this.queryParams['returnUrl'] = this.router.url.split('?')[0];
        } else {
            this.queryParams['returnUrl'] = this.router.url;
        }
    }

    ngOnInit() {
        this.resetPayload();
        this.payload['groupOnly'] = true;
        // Default Image Url
        this.defaultSrc = `${this.env.IMG_URL}images/products/pdt_default.png`;
        forkJoin([
            this.stylesService.getStyleDetails(this.styleId),
            this.commonService.getCustomFieldInfo(this.payload),
            this.stylesService.getStyleCompliance(this.styleId)
        ]).subscribe(
            response => {
                this.processStyleDetails(response[0]['data']);
                const additionalInfoData = response[1]['customFieldUITemplateAggResponseMap'];
                this.processAdditionalInfoTabs(additionalInfoData);
                this.processCompliance(response[2]);

                // Auto select tab base on url param
                if (this.parameters && this.tabs.findIndex(tabItem => tabItem.name === this.parameters.tab) !== -1) {
                    const paramIndex = this.tabs.findIndex(tabItem => tabItem.name === this.parameters.tab);
                    this.styleDetail = this.tabs[paramIndex];
                } else {
                    this.styleDetail = this.tabs[0];
                }
                this.resetPayload();
                this.pageLoading = false;
                this.changeStyleDetail(this.styleDetail);
            },
            () => {
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
                this.pageLoading = false;
            }
        );
        this.commonService.getCountries().subscribe(response => {
            this.countries = response['data']['country'];
        });
    }

    resetPayload() {
        this.payload = {
            entity: this.entity,
            viewPage: this.viewPage,
            viewType: this.viewType,
            entityId: this.styleId
        };
    }

    get checkAccess(): (name: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    processAdditionalInfoTabs(data: any) {
        let tab = {
            name: '',
            icon: '',
            isComplianceTab: false
        };
        if (data !== null) {
            Object.keys(data).forEach(key => {
                let tabData = Object.assign({}, tab);
                tabData.name = key;
                this.tabs.push(tabData);
            });
        }
    }

    processStyleDetails(data: any) {
        this.refId = data['style']['referenceId'];
        // Add Master Data to localization
        this.localizationService.addToMasterData(data['masterData']);

        this.uniqueCode = data['style']['uniqueCode'];
        this.product = data['style'];
        this.manufacturers = data['style']['manufacturers'];
        this.variants = data['style']['variants'];
        if (this.variants && this.variants.length > 0) {
            this.favoriteColor = this.variants[0]['color'].id;
            if (this.variants[0]['sizes']) {
                this.variants[0]['sizes'].forEach(size => {
                    this.availableSizes.push(size.size.value);
                    if (size.lengths) {
                        size.lengths.forEach(length => {
                            if (this.availableLengths.indexOf(length.value) === -1) {
                                this.availableLengths.push(length.value);
                            }
                        });
                    }
                    if (size.fit) {
                        size.fit.forEach(fit => {
                            if (this.availableFits.indexOf(fit.value) === -1) {
                                this.availableFits.push(fit.value);
                            }
                        });
                    }
                });
            }
        }
        if (this.product['bom']) {
            this.product['bom'].forEach(article => {
                const articleComp = {};
                articleComp['type'] = article.article['type'];
                articleComp['name'] = article.article['name'];
                articleComp['code'] = article.article['code'];
                articleComp['traceable'] = article.article['traceable'];
                articleComp['articleId'] = article.article['articleId'];
                articleComp['areaOfUsage'] = article.areaOfUsage;
                if (article && article.qty) {
                    articleComp['quantity'] = article.qty.quantity;
                    articleComp['units'] = article.qty.unit;
                }
                if (article.usedIn) {
                    articleComp['colors'] = [];
                    article.usedIn.forEach(color => {
                        articleComp['colors'].push(color.name);
                    });
                }
                if (article.article.materialComposition) {
                    articleComp['materialComposition'] = article.article.materialComposition;
                }
                if (article.supplier) {
                    articleComp['supplier'] = article.supplier;
                }
                this.articleComposition.push(articleComp);
            });
            this.articleDataSource = new MatTableDataSource(this.articleComposition);
        }
    }

    processCompliance(data: any) {
        this.complianceOutcome = data['complianceOutcome'];
        let index = -1;

        Object.keys(this.complianceOutcome).forEach(key => {
            index = this.tabs.findIndex(item => item.name === key);
            if (index !== -1) {
                if (this.complianceOutcome[key] !== null) {
                    this.tabs[index].icon = this.complianceOutcome[key].compliant ? 'traced.png' : 'caution.png';
                    this.tabs[index].isComplianceTab = true;
                } else {
                    this.tabs.splice(index, 1);
                }
            }
        });
    }

    getSrc(item: any) {
        return `${this.env.IMG_URL}images/products/${item.key}.png`;
    }

    processAdditionalInfo(data: any) {
        this.additionalInfo = data;
        this.pageLoading = false;
    }

    getAdditionalInfo(option: any) {
        this.isFetchingAdditionalInfo = true;
        this.payload['tabs'] = [option.name];

        // In case of Additional Information tab, need to send empty string
        if (option.name === 'Additional Information') {
            this.payload['tabs'] = [];
        }

        this.commonService.getCustomFieldInfo(this.payload).subscribe(
            data => {
                this.processAdditionalInfo(data['customFieldUITemplateAggResponseMap'][option.name]);
                this.fieldResponse = data['fieldResponse'];
                this.resetPayload();
                this.isFetchingAdditionalInfo = false;
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
                this.isFetchingAdditionalInfo = false;
            }
        );
    }

    getStyleComplianceAndAdditionalInfo(option: any) {
        this.pageLoading = true;
        this.isFetchingAdditionalInfo = true;
        this.payload['tabs'] = [option.name];

        // In case of Additional Information tab, need to send empty string
        if (option.name === 'Additional Information') {
            this.payload['tabs'] = [];
        }
        forkJoin([
            this.commonService.getCustomFieldInfo(this.payload),
            this.stylesService.getStyleCompliance(this.styleId)
        ]).subscribe(response => {
            this.processAdditionalInfo(response[0]['customFieldUITemplateAggResponseMap'][option.name]);
            this.fieldResponse = response[0]['fieldResponse'];
            this.processCompliance(response[1]);
            this.resetPayload();
            this.isFetchingAdditionalInfo = false;
            this.pageLoading = false;
        });
    }

    changeStyleDetail(option) {
        this.styleDetail = option;

        switch (option.name) {
            case this.tabs[0].name:
            case this.tabs[1].name:
            case this.tabs[2].name:
                break;
            default:
                if (option.isComplianceTab) {
                    this.getStyleComplianceAndAdditionalInfo(option);
                } else {
                    this.getAdditionalInfo(option);
                }
                break;
        }
        if (this.router.url.split('?')[1] !== 'back=true') {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                    tab: option.name
                }
            });
        }
    }
    goBack() {
        this.commonService.goBack(['/', 'styles']);
    }

    onColorChange(colorValue, index) {
        if (this.favoriteColor !== colorValue) {
            this.favoriteColor = colorValue;
            this.availableSizes = [];
            this.availableLengths = [];
            this.availableFits = [];
            this.variants[index]['sizes'].forEach(size => {
                this.availableSizes.push(size.size.value);
                if (size.lengths) {
                    size.lengths.forEach(length => {
                        this.availableLengths.push(length.value);
                    });
                }
                if (size.fit) {
                    size.fit.forEach(fit => {
                        this.availableFits.push(fit.value);
                    });
                }
            });
        }
    }

    handleSelectedEvidence(data) {
        this.selectedEvidence = data;
        this.fetchEvidenceDetails(data._id);
    }

    fetchEvidenceDetails(tr_id) {
        this.isLoadingProductEvidence = true;
        this.evidenceDetail = [];
        this.temsService.getEvidence(tr_id).subscribe(
            response => {
                const data = response['data'];
                this.localizationService.addToMasterData(data.masterData);
                this.evidenceDetail = data['evidence'];
                this.isLoadingProductEvidence = false;
            },
            () => {
                this.isLoadingProductEvidence = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
                return;
            }
        );
    }

    handleSupplyChainFlow(data) {
        this.selectedSupplyChain = data;
        if (data.module === 'TRACEABILITY') {
            this.handleTraceabilitySupplyChainFlow(data._id);
        } else {
            this.handleOrderSupplyChainFlow(data._id);
        }
    }
    handleTraceabilitySupplyChainFlow(id) {
        this.isLoadingSupplyChain = true;
        this.supplyChainProduct = undefined;
        this.orderService.getTraceabilitySupplyChain(id).subscribe(
            response => {
                const data = response.data;
                this.isLoadingSupplyChain = false;
                this.supplyChainProduct = data;
                this.localizationService.addToMasterData(response.masterData);
            },
            () => {
                this.isLoadingSupplyChain = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
                return;
            }
        );
    }
    getDate(dateString) {
        const dateParts = dateString.split('/');
        return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    }
    handleOrderSupplyChainFlow(id) {
        this.isLoadingSupplyChain = true;
        this.supplyChainProduct = undefined;
        this.orderService.getOrdersSupplyChain(id).subscribe(
            response => {
                const data = response['data']['data']['data'];
                this.isLoadingSupplyChain = false;
                let payload = {
                    id: '',
                    display_name: '',
                    date: '',
                    name: '',
                    address: null
                };
                data.forEach(item => {
                    if (!this.supplyChainProduct) {
                        this.supplyChainProduct = {};
                    }
                    if (!this.supplyChainProduct[item._id]) {
                        this.supplyChainProduct[item._id] = [];
                    }
                    item['chain'].forEach(chainData => {
                        payload = {
                            id: chainData.order_id,
                            display_name: chainData.display_name,
                            date: chainData.date,
                            name: chainData.supplier_name,
                            address: chainData.supplier_address
                        };
                        this.supplyChainProduct[item._id].push(payload);
                    });
                });
                this.localizationService.addToMasterData(response['data'].masterData);
            },
            () => {
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
                return;
            }
        );
    }

    getCountryCode(countryName) {
        for (let i = 0; i < this.countries.length; i++) {
            if (this.countries[i].name === countryName) {
                return this.countries[i].code.toLowerCase();
            }
        }
        return false;
    }

    getDetailedSupplyChain(data) {
        this.selectedDetailedSupplyChain = data;
        this.supplyChainData = undefined;
        const payload = {
            // filter: { SupplierVerificationStatus: [20] }, // todo
            sort: { sortBy: 'create_ts', sortOrder: 'desc' },
            pagination: { from: 0, size: 10000 }
        };
        forkJoin([
            this.trs.getSupplyChainData(data._id),
            this.supplierService.getAllSuppliers(JSON.parse(JSON.stringify(payload)))
        ]).subscribe(response => {
            const data = response[0]['data'];
            this.localizationService.addToMasterData(data['masterData']);
            this.supplyChainData = Object.assign({}, JSON.parse(JSON.stringify(data['supplyChain'])));

            if (this.supplyChainData.metaData && this.supplyChainData.metaData.isAgentNode) {
                this.supplyChainData = this.supplyChainData.productSupplyChainList[0];
            }

            this.suppliers = response[1]['data']['searchResponse'];

            for (const supplier in this.suppliers) {
                if (!this.suppliers.hasOwnProperty(supplier)) {
                    continue;
                }

                if (this.suppliers[supplier].supplier_id === this.supplyChainData.supplyChainArticle.supplierId) {
                    this.supplyChainData.supplyChainArticle.supplierLink =
                        '/suppliers/' + this.supplyChainData.supplyChainArticle.supplierId;
                }

                this.assignSupplierLinks(this.supplyChainData.productSupplyChainList);
            }
            this.pageLoading = false;
            this.showDetailedSupplyChain = true;
        });
    }

    assignSupplierLinks(productSupplyChainList) {
        for (const supplier in this.suppliers) {
            if (!this.suppliers.hasOwnProperty(supplier)) {
                continue;
            }
            for (const pscl_index in productSupplyChainList) {
                if (!productSupplyChainList.hasOwnProperty(pscl_index)) {
                    continue;
                }

                if (
                    this.suppliers[supplier].supplier_id ===
                    productSupplyChainList[pscl_index].supplyChainArticle.supplierId
                ) {
                    productSupplyChainList[pscl_index].supplyChainArticle.supplierLink =
                        '/suppliers/' + productSupplyChainList[pscl_index].supplyChainArticle.supplierId;
                }

                if (
                    typeof productSupplyChainList[pscl_index].productSupplyChainList === 'object' &&
                    productSupplyChainList[pscl_index].productSupplyChainList !== null
                ) {
                    this.assignSupplierLinks(productSupplyChainList[pscl_index].productSupplyChainList);
                }
            }
        }
    }

    handleBackClick() {
        this.showDetailedSupplyChain = false;
        this.supplyChainData = undefined;
    }

    viewQRCode() {
        this.stylesService.viewQrCode(this.styleId).subscribe(data => {
            this.uniqueCode = data.uniqueCode;
        });
    }

    downloadFiles(certificateId, fileUrls) {
        if (!fileUrls || fileUrls.length === 0) {
            return;
        }
        const fileCount = fileUrls.length;
        for (let i = 0; i < fileCount; i++) {
            this.certificateManagerService.downloadFile(certificateId, fileUrls[i]);
        }
    }

    onSaveAdditionalInfo(payload: any) {
        this.isFetchingAdditionalInfo = true;
        this.commonService.updateCustomFieldInfo(this.entity, this.styleId, payload.responseData).subscribe(
            data => {
                this.toastr.success('Information has been saved successfully.', 'Success');
                this.getAdditionalInfo(this.styleDetail);
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
                this.isFetchingAdditionalInfo = false;
            }
        );
    }
}
