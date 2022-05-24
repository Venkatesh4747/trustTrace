import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { TEmsService } from '../../t-ems/t-ems.service';
import { SuppliersService } from './../../suppliers/suppliers.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { environment } from './../../../../environments/environment';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { MaterialLibraryService } from './../material-library.service';
import { TraceabilityRequestService } from './../../traceability-request/traceability-request.service';
import { OrdersService } from './../../orders/orders.service';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { AuthService } from '../../../core';

@Component({
    selector: 'app-material-library-view',
    templateUrl: './material-library-view.component.html',
    styleUrls: ['./material-library-view.component.scss']
})
export class MaterialLibraryViewComponent implements OnInit {
    env = environment;
    tabs = ['Specifications', 'Supply Chain', 'Evidences'];
    entity = 'ML'; // 'ML', 'SUPPLIER'
    viewPage = 'ML_VIEW'; // 'ML_VIEW', 'SUPPLIER_VIEW'
    viewType = 'FORM'; // 'FORM', 'TABLE', 'CARD'

    pageLoading = true;
    disableInfiniteScroll = false;
    isLoadingSupplyChain = false;
    showDetailedSupplyChain = false;
    isFetchingAdditionalInfo = false;
    materialDetail;
    supplyChainData;
    suppliers: any = [];
    materialStyleAssociation = [];
    supplyChainProduct;
    id: string;
    pageNo = 0;
    totalSize;
    selectedSupplyChain;
    selectedDetailedSupplyChain;
    materialDetailType = this.tabs[0];
    defaultSrc: string;
    queryParams = { params: { tab: this.tabs[1] } };
    uniqueCode: any;
    selectedEvidence: any;
    evidenceDetail: any = [];
    isLoadingProductEvidence = false;
    additionalInfo;
    refId = null;
    acceptedStringLength = environment.TRUNCATE_STRING_LENGTH;
    payload: any;
    fieldResponse: any;
    dataInfo: any;
    parameters: any;

    constructor(
        public dialog: MatDialog,
        private mtrLibService: MaterialLibraryService,
        public localeService: LocalizationService,
        private route: ActivatedRoute,
        private router: Router,
        public commonServices: CommonServices,
        private toastr: CustomToastrService,
        private orderService: OrdersService,
        private trs: TraceabilityRequestService,
        private supplierService: SuppliersService,
        public certificateManagerService: CertificateManagerService,
        public utilService: UtilsService,
        private auth: AuthService,
        private temsService: TEmsService,
        private multiIndustryService: MultiIndustryService
    ) {
        this.route.params.subscribe(params => (this.id = params['materialId']));

        this.route.queryParams.pipe(filter(params => params.tab)).subscribe(params => {
            this.parameters = params;
        });
        if (this.router.url.includes('?')) {
            this.queryParams['returnUrl'] = this.router.url.split('?')[0];
        } else {
            this.queryParams['returnUrl'] = this.router.url;
        }
    }

    resetPayload() {
        const temp = {
            entity: this.entity,
            viewPage: this.viewPage,
            viewType: this.viewType,
            entityId: this.id
        };
        this.payload = Object.assign({}, temp);
    }

    ngOnInit() {
        this.resetPayload();

        // Default Image Url
        this.defaultSrc = `${this.env.IMG_URL}images/products/pdt_default.png`;
        this.pageLoading = true;
        this.disableInfiniteScroll = true;
        this.payload['groupOnly'] = true;

        forkJoin([
            this.mtrLibService.getMaterialDetail(this.id),
            this.mtrLibService.getMaterialStyleAssociation(this.id, this.pageNo),
            this.commonServices.getCustomFieldInfo(this.payload)
        ]).subscribe(
            response => {
                const materialData = response[0]['data'];
                const materialStyleAssociationData = response[1]['data'];
                const additionalInfoData = response[2]['customFieldUITemplateAggResponseMap'];
                this.processMaterialDetail(materialData);
                this.processMaterialStyleAssociation(materialStyleAssociationData);
                this.processAdditionalInfoTabs(additionalInfoData);
                if (this.parameters && this.tabs.indexOf(this.parameters.tab) !== -1) {
                    const paramIndex = this.tabs.indexOf(this.parameters.tab);
                    this.materialDetailType = this.tabs[paramIndex];
                } else {
                    this.materialDetailType = this.tabs[0];
                }
                this.resetPayload();
                this.changeMaterialDetailType(this.materialDetailType);
            },
            () => {
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
                this.resetPayload();
            }
        );
    }

    get checkAccess(): (name: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    processMaterialDetail(data: any) {
        this.uniqueCode = data['material_library']['uniqueCode'];
        this.refId = data['material_library']['referenceId'];
        this.materialDetail = data['material_library'];
        this.localeService.addToMasterData(data['masterData']);

        if (this.materialDetail['certifications']) {
            this.materialDetail['certifications'].forEach(element => {
                element.value = this.localeService.getDisplayText(element.id);
            });
        }
    }

    getSrc(item: any) {
        return `${this.env.IMG_URL}images/products/${item.key}.png`;
    }

    processMaterialStyleAssociation(data: any) {
        const styleAssociation = data['ml_style_association'];
        if (!this.totalSize && data['size']) {
            this.totalSize = data['size'];
        }
        if (styleAssociation && styleAssociation.length > 0) {
            styleAssociation.forEach(style => {
                this.materialStyleAssociation.push(style);
            });
            this.disableInfiniteScroll = false;
        }
    }

    processAdditionalInfoTabs(data: any) {
        if (data !== null) {
            Object.keys(data).forEach(key => {
                this.tabs.push(key);
            });
        }
        this.pageLoading = false;
    }

    processAdditionalInfo(data: any) {
        this.additionalInfo = data;
        this.dataInfo = JSON.parse(JSON.stringify(data));
        this.pageLoading = false;
    }

    getAdditionalInfo(option: string) {
        this.resetPayload();
        this.isFetchingAdditionalInfo = true;
        this.payload['tabs'] = [option];

        // In case of Additional Information tab, need to send empty string
        if (option === 'Additional Information') {
            this.payload['tabs'] = [];
        }

        this.commonServices.getCustomFieldInfo(this.payload).subscribe(
            data => {
                this.processAdditionalInfo(data['customFieldUITemplateAggResponseMap'][option]);
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

    changeMaterialDetailType(option) {
        this.materialDetailType = option;

        switch (option) {
            case this.tabs[0]:
            case this.tabs[1]:
            case this.tabs[2]:
                break;
            default:
                this.getAdditionalInfo(option);
                break;
        }
        if (this.router.url.split('?')[1] !== 'back=true') {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                    tab: option
                }
            });
        }
    }

    goBack() {
        this.commonServices.goBack(['/', 'material-library']);
    }

    onScroll() {
        this.pageNo++;
        this.mtrLibService.getMaterialStyleAssociation(this.id, this.pageNo).subscribe(response => {
            this.processMaterialStyleAssociation(response['data']);
        });
    }

    showEditDialog(materialId: string) {
        const colorEditDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Edit',
                msg: this.multiIndustryService.getLabel(
                    'Editing this material will affect areas where it was previously used. Are you sure you want to edit?'
                ),
                primaryButton: 'No',
                secondaryButton: 'Yes'
            }
        });
        colorEditDialog.afterClosed().subscribe(response => {
            if (response) {
                const responseArray = response.split(',');
                if (responseArray[0] === 'Yes') {
                    this.router.navigate(['/', 'material-library', materialId, 'edit']);
                }
            }
        });
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
                this.localeService.addToMasterData(data.masterData);
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
                this.localeService.addToMasterData(response.masterData);
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

    handleOrderSupplyChainFlow(id) {
        this.isLoadingSupplyChain = true;
        this.supplyChainProduct = undefined;
        this.orderService.getOrdersSupplyChain(id).subscribe(
            response => {
                const data = response['data']['data']['data'];
                this.isLoadingSupplyChain = false;
                this.supplyChainProduct = data;
                this.localeService.addToMasterData(response['data'].masterData);
                return this.supplyChainProduct[0];
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

    getDetailedSupplyChain(data) {
        this.selectedDetailedSupplyChain = data;
        this.showDetailedSupplyChain = true;
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
            this.localeService.addToMasterData(data['masterData']);
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

    onSaveAdditionalInfo(payload: any) {
        this.isFetchingAdditionalInfo = true;
        this.commonServices.updateCustomFieldInfo(this.entity, this.id, payload.responseData).subscribe(
            data => {
                this.toastr.success('Information has been saved successfully.', 'Success');
                this.getAdditionalInfo(this.materialDetailType);
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

    viewQRCode() {
        this.mtrLibService.viewQrCode(this.id).subscribe(data => {
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
}
