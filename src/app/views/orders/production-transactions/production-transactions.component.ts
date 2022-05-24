import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { GenerateQrCodeComponent } from '../../../shared/components/generate-qr-code/generate-qr-code.component';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { FacilitiesService } from '../../facilities/facilities.service';
import { CertificateUploadService } from '../../uploads/certificate/cert-upload.service';
import { CertificateTypeValue } from '../../uploads/interface/certificate-type-value-model';
import { OrdersService } from '../orders.service';
import { AuthService } from '../../../core';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { ContextService } from '../../../shared/context.service';
import { UploadTransactionDocumentsComponent } from '../../../shared/modals/upload-transaction-documents/upload-transaction-documents.component';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-production-transactions',
    templateUrl: './production-transactions.component.html',
    styleUrls: ['./production-transactions.component.scss']
})
export class ProductionTransactionsComponent implements OnInit, OnDestroy {
    private lotDetails: any;
    private InputMaterialQRCode: string;
    private qrCode: string;
    referenceIdIsUnique = true;

    @ViewChild('soaSearchHint', { static: false }) soaSearchHint;
    @ViewChild('aSearchHint', { static: false }) articleSearchHint;
    hintColor: string;
    articleHintColor: string;
    certTypeValueList: CertificateTypeValue[];
    subscription: Subscription;
    searchRawData = [];
    rawLotData = [];
    inputLotQtyArray = [];
    totalLotQytArray = [];

    uploadedCertInfoList = [];
    pageLoading = false;
    config: any = {};
    inputMaterials = [];
    inputMaterial = {};
    inputLotDropdown = [];

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
        articleId: '',
        externalId: '',
        lotId: '',
        quantity: {
            quantity: '',
            unit: ''
        },
        fieldName: ''
    };

    transaction = {
        lot: {
            soaId: '',
            soaType: '',
            productType: '',
            date: new Date(),
            mode: '',
            quantity: {
                quantity: '',
                unit: ''
            },
            facilities: [],
            externalId: '',
            qualityReport: [],
            otherDocuments: [],
            productionInputLots: []
        },
        certList: []
    };

    certifications = [];

    inputLotsSelected = [];

    // searchable dropdown
    isRequired = true;
    optional = { key: 'id', value: 'external_id', selectedKey: 'lotId' };

    isPrintReady: boolean;
    qrCodeToPrint: string;

    @ViewChild(GenerateQrCodeComponent, { static: false }) printQRCodeComponent;

    uploadFiles: any = {};

    data: any = {
        certificates_to_collect: []
    };

    isUploading: any = {};
    env = environment;

    validationResponse = {};

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
        private ordersService: OrdersService,
        private analyticsService: AnalyticsService,
        private appContext: ContextService,
        public authService: AuthService,
        private multiIndustryService: MultiIndustryService,
        private dialog: MatDialog
    ) {
        this.subscription = this.certUploadService.getCertificates().subscribe(certList => {
            this.certTypeValueList = certList;
        });
    }

    ngOnInit() {
        this.analyticsService.trackPageVisit('production transaction');
        this.getProductionConfig();
        this.data.certificates_to_collect.push({
            id: 'QUALITY_REPORT',
            value: 'quality report'
        });
        this.data.certificates_to_collect.push({
            id: 'OTHERS',
            value: 'other documents'
        });
        this.data.certificates_to_collect.forEach(certificate => {
            this.uploadFiles[certificate.id] = {
                certificateId: null,
                files: []
            };
        });
    }
    getProductionConfig() {
        this.pageLoading = true;
        this.certTypeValueList = [];
        this.orderService.getProductionConfig().subscribe(response => {
            this.config = response['data']['data'];
            // remove this from backend
            this.config.lots = [];
            this.localeService.addToMasterData(response['data'].masterData);
            // this.constructArticlesAutoCompleteList();
            if (this.transaction.lot.productionInputLots && this.transaction.lot.productionInputLots.length === 0) {
                this.addInputMaterial();
            }
            this.searchRawData = this.config.SOA_search;
            this.pageLoading = false;
        });
    }
    ngOnInitView() {
        this.certTypeValueList = [];
    }

    ngOnDestroy() {
        // prevent memory leak when component is destroyed
        // if(this.subscription){
        this.subscription.unsubscribe();
        // }
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

    addInputMaterial() {
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.transaction.lot.productionInputLots.push(JSON.parse(JSON.stringify(this.productionInput)));
        this.inputLotsSelected.push({});
        // this.getMatchingLotsByArticleId(this.inputLotsSelected.length - 1);
        this.articlesSearchText.push('');
    }
    deleteInputMaterial(index) {
        if (index < this.transaction.lot.productionInputLots.length - 1) {
            this.transaction.lot.productionInputLots.splice(index, 1);
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
            this.transaction.lot.productionInputLots[i].quantity.quantity = undefined;
        }
    }

    // artifactName_no: 'Blue Linen cotton-2FGHI';
    // display_name: 'LOT-60';
    // external_id: '2222222';
    // id: '5c4ff1925b5332dd7bc34cf6b3';
    // quantity: '100';
    // soa_id: '5c89e06c7a5eee25f1e7fe1f';
    // soa_type: 'material_lib';
    // units_key: 'un_metres';
    // units_value: 'Metres';

    inputLotChanged(event, index, isScanned = false) {
        this.inputLotsSelected[index] = event;
        this.transaction.lot.productionInputLots[index].lotId = this.inputLotsSelected[index].id;
        this.transaction.lot.productionInputLots[index].quantity.quantity = this.inputLotsSelected[index].quantity;
        this.inputLotQtyArray[index] = this.inputLotsSelected[index].quantity;
        this.transaction.lot.productionInputLots[index].quantity.unit = this.inputLotsSelected[index].units_key;
        this.transaction.lot.productionInputLots[index].externalId = event.external_id;
        this.transaction.lot.productionInputLots[index]['articleId'] = JSON.parse(JSON.stringify(event));
        this.addInputMaterial();
    }

    getMatchingLotsByArticleId(index) {
        let newDropDownList = [];
        if (index !== undefined && this.config.lots) {
            if (this.transaction.lot.productionInputLots[index].soaId) {
                this.config.lots.forEach(x => {
                    if (x.id === this.transaction.lot.productionInputLots[index].soaId) {
                        newDropDownList.push(JSON.parse(JSON.stringify(x)));
                    }
                });
            } else {
                newDropDownList = JSON.parse(JSON.stringify(this.config.lots));
            }

            this.inputLotsSelected.forEach(x => {
                newDropDownList = newDropDownList.filter(element => element.id !== x.id);
            });
        }
        this.inputLotDropdown.push(newDropDownList);
    }

    openSubmissionDialog(): void {
        const submissionDialog = this.confirmDialog.open(ConfirmDialogComponent, {
            width: '460px',
            data: {
                title: '',
                msg: 'One more thing',
                primaryButton: 'Close',
                secondaryButton: 'Submit',
                showClose: false,
                isProvisionToAddInput: true,
                placeholder: 'External id to be associated'
            }
        });
        submissionDialog.afterClosed().subscribe(response => {
            if (response != null) {
                const responseArr = response.split(','); // what if user enter a data with "," ?
                if (response[0] === 'Close') {
                    // Do nothing as the user want to go back to the create form
                } else if (responseArr.length > 1) {
                    this.transaction.lot.externalId = responseArr[1]; // 1 is index here
                    this.saveProductionOrder();
                }
            }
        });
    }

    openConfirmationDialog(data): void {
        const confirmationDialog = this.confirmDialog.open(ConfirmDialogComponent, {
            width: '460px',
            data: {
                title: 'Transaction created successfully',
                msg: `Reference ID: <span class="tt-font font-family-semi-bold">${data}</span>`,
                primaryButton: 'View',
                secondaryButton: 'Record new',
                showClose: false
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response != null) {
                if (response === 'Record new') {
                    this.clearForm();
                } else if (response === 'View') {
                    this.router.navigate(['orders']);
                }
            }
        });
        setTimeout(() => {
            this.appContext.cardViewRefresh.next(true);
        }, 2000);
    }

    private clearForm() {
        this.soaUniqueName = { id_type: '', unique_search: '' };
        this.certUploadService.clearCertificates();
        this.facilitiesService.clearFacilities();
        this.config.lots = [];
        this.transaction = {
            lot: {
                soaId: '',
                soaType: '',
                productType: '',
                date: new Date(),
                mode: '',
                quantity: {
                    quantity: '',
                    unit: ''
                },
                facilities: [],
                externalId: '',
                qualityReport: [],
                otherDocuments: [],
                productionInputLots: []
            },
            certList: []
        };
        this.articleUniqueName = '';
        this.styleSearchText = {};
        this.productionInput = {
            articleId: '',
            externalId: '',
            lotId: '',
            quantity: {
                quantity: '',
                unit: ''
            },
            fieldName: ''
        };
        this.inputLotsSelected = [];
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.transaction.lot.productionInputLots.push(JSON.parse(JSON.stringify(this.productionInput)));
        this.getProductionConfig();
    }

    getSOADisplayName(item) {
        if (item) {
            return item.unique_search;
        }
    }

    getLotDisplayName(item) {
        if (item) {
            return item.artifactName_no;
        }
    }

    searchFreeHandProduction(searchTerm, isScanned = false) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        this.orderService.searchFreeHandStyle(searchPayload).subscribe(response => {
            if (searchTerm.length >= 3) {
                this.config.SOA_search = this.filterForUniqueSOAValue(response['data'].searchResponse);
                if (this.config.SOA_search.length > 0) {
                    if (isScanned) {
                        let searchTermMatch = false;
                        this.config.SOA_search.forEach(data => {
                            if (data.id_type.indexOf(this.styleSearchText.id_type) >= 0) {
                                this.styleSearchText = JSON.parse(JSON.stringify(data));
                                searchTermMatch = true;
                            }
                        });

                        if (!searchTermMatch) {
                            this.toastrService.error(
                                this.multiIndustryService.getLabel('The scanned item is not a valid Style'),
                                'No matching data'
                            );
                        } else {
                            this.onStyleSelection(this.styleSearchText);
                        }
                    }
                    this.hintColor = '';
                    this.soaSearchHint.nativeElement.innerText = '';
                } else {
                    if (isScanned) {
                        this.toastrService.error(
                            this.multiIndustryService.getLabel('The scanned item is not a valid Style'),
                            'No matching data'
                        );
                    }

                    this.hintColor = 'red';
                    this.soaSearchHint.nativeElement.innerText = 'No results found';
                }
            } else {
                this.hintColor = 'red';
                this.soaSearchHint.nativeElement.innerText = 'No results found';
            }
        });
    }

    searchInputMaterial(searchTerm, isScanned = false) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        searchPayload['filter'] = {
            soaType: ['material_lib'],
            status: ['UN_USED'],
            txType: ['INBOUND', 'PRODUCTION', 'RE_PACKAGING', 'SYS_RE_PACKAGING']
        };
        this.orderService.searchLot(searchPayload).subscribe(response => {
            // this.config.article_search = response['data'].searchResponse;
            this.rawLotData = response['data'].searchResponse;
            if (this.rawLotData.length > 0) {
                this.config.article_search = this.filterForUniqueLots(this.rawLotData);

                if (isScanned) {
                    let searchTermMatch = false;

                    this.config.article_search.forEach(data => {
                        if (data.soa_id === this.lotDetails.id) {
                            const index = this.transaction.lot.productionInputLots.length - 1;
                            this.transaction.lot.productionInputLots[index]['articleId'] = JSON.parse(
                                JSON.stringify(data)
                            );
                            this.onArticleSelection(this.transaction.lot.productionInputLots[index]['articleId']);
                            const selectedLot = this.config.lots.filter(lot => {
                                return lot.display_name === this.lotDetails.display_name;
                            })[0];
                            this.inputLotChanged(selectedLot, index, true);
                            searchTermMatch = true;
                        }
                    });

                    if (!searchTermMatch) {
                        this.toastrService.error(
                            'Please make sure the scanned item is present in the input transactions',
                            'No matching data'
                        );
                    }
                }
            }
            if (searchTerm.length >= 3) {
                if (this.rawLotData.length > 0) {
                    this.articleHintColor = '';
                    this.articleSearchHint.nativeElement.innerText = '';
                } else {
                    this.config.article_search = [];
                    this.articleHintColor = 'red';
                    this.articleSearchHint.nativeElement.innerText = 'No results found';
                }
            }
        });
    }

    private filterForUniqueLots(rawLotData) {
        const filteredArticleNames = [];
        const filteredLotData = [];
        rawLotData.forEach(lot => {
            lot.artifactName_no = lot.artifactName_no.replace(/-$/, '');
            if (filteredArticleNames.indexOf(lot.artifactName_no) === -1) {
                filteredArticleNames.push(lot.artifactName_no);
                filteredLotData.push(lot);
            }
        });
        return filteredLotData;
    }

    onStyleSelection(value) {
        this.data.certificates_to_collect = this.data.certificates_to_collect.filter(
            certificate_to_collect =>
                certificate_to_collect.id === 'QUALITY_REPORT' || certificate_to_collect.id === 'OTHERS'
        );
        if (value.hasOwnProperty('certifications')) {
            value.certifications.forEach(c => {
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

        const soaSplit = value.id_type.split('-');
        this.transaction.lot.soaId = soaSplit[0];
        this.transaction.lot.soaType = soaSplit[1];
        this.transaction.lot.productType = value.product_type.id;
        this.transaction.lot.productionInputLots = [];
        this.productionInput.fieldName = this.commonServices.makeId(5);
        this.transaction.lot.productionInputLots.push(JSON.parse(JSON.stringify(this.productionInput)));
    }

    onArticleSelection(value) {
        this.config.lots = this.rawLotData.filter(lot => {
            return lot.artifactName_no === value.artifactName_no;
        });
    }

    searchArticle(event, i) {
        if (event.key !== '') {
            // console.log(this.articleUniqueName);
            this.searchInputMaterial(this.transaction.lot.productionInputLots[i].articleId);
        }
    }

    searchStyle(event) {
        if (event.key !== '') {
            this.searchFreeHandProduction(this.styleSearchText);
        }
    }

    saveProductionOrder(print = false) {
        this.pageLoading = true;
        const certificationPayload = [];
        this.certTypeValueList.forEach(element => {
            const kv = {
                certification_type: element.certType,
                evidence_id: element.evidenceId
            };
            certificationPayload.push(kv);
        });

        let certList = [];

        Object.keys(this.uploadFiles)
            .filter(key => !['QUALITY_REPORT', 'OTHERS'].includes(key))
            .forEach(x => certList.push(this.uploadFiles[x].certificateId));

        certList = certList.filter(x => x);

        this.transaction.lot.otherDocuments = [
            {
                fileName: this.uploadFiles['OTHERS'].files.map(x => x.fileName),
                id: this.uploadFiles['OTHERS'].certificateId
            }
        ];
        this.transaction.lot.qualityReport = [
            {
                fileName: this.uploadFiles['QUALITY_REPORT'].files.map(x => x.fileName),
                id: this.uploadFiles['QUALITY_REPORT'].certificateId
            }
        ];
        this.transaction.certList = certList;
        this.transaction.lot.mode = 'web';

        if (this.transaction.lot.productionInputLots.length <= 1) {
            this.toastrService.info('Please add the input materials', 'No input materials');
            this.pageLoading = false;
            return;
        }

        this.transaction.lot.productionInputLots.splice(this.transaction.lot.productionInputLots.length - 1, 1);

        this.transaction.lot.productionInputLots.forEach(PIL => {
            delete PIL.articleId;
            delete PIL.fieldName;
        });

        this.orderService.saveProductionTransaction(this.transaction).subscribe(
            (response: any) => {
                this.analyticsService.trackSaveSuccess('production transaction');
                let invalidCertificatesPresent = this.ordersService.checkIfInvalidCertificatesPresent(
                    response.data.validationResponse
                );
                if (invalidCertificatesPresent) {
                    this.validationResponse = this.ordersService.constructValidationResponseMap(
                        response.data.validationResponse
                    );

                    let transactionData = {
                        id: response.data.id,
                        external_id: this.transaction.lot.externalId
                    };
                    this.ordersService.getRequiredCertificatesList(transactionData.id).subscribe(
                        response => {
                            const dialogRef = this.dialog.open(UploadTransactionDocumentsComponent, {
                                width: '500px',
                                height: '825px',
                                data: {
                                    transaction: transactionData,
                                    certList: JSON.parse(JSON.stringify(response['certList'])),
                                    other_documents: JSON.parse(JSON.stringify(response['other_documents'])),
                                    quality_report: JSON.parse(JSON.stringify(response['quality_report'])),
                                    certificates_to_collect: JSON.parse(
                                        JSON.stringify(response['certificates_to_collect'])
                                    )
                                }
                            });
                            dialogRef.afterClosed().subscribe(uploadDocResponse => {
                                this.nextStep(response, print);
                            });
                        },
                        errorResponse => {
                            console.log(errorResponse);
                        }
                    );
                } else {
                    this.nextStep(response, print);
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

    private nextStep(response: object, print: boolean): void {
        this.openConfirmationDialog(this.transaction.lot.externalId);
        if (print) {
            this.qrCodeToPrint = response['data'].UNIQUE_CODE;
            this.isPrintReady = true;
            setTimeout(() => {
                this.printQRCodeComponent.printQRCode();
            }, 100);
        }
        this.clearForm();
        this.pageLoading = false;
    }

    styleSelectionChanged(event) {
        this.transaction.lot.soaId = event.option.value.id;
        this.transaction.lot.soaType = event.option.value.type;
        this.transaction.lot.productType = event.option.value.product_type.id;
    }

    articleSelectionChanged(event, index) {
        this.transaction.lot.productionInputLots[index].soaId = event.option.value.id;
        this.transaction.lot.productionInputLots[index].soaType = event.option.value.type;
    }

    save() {
        this.analyticsService.trackSaveButtonClick('production transaction');
        this.saveProductionOrder();
    }

    saveAndPrint() {
        this.saveProductionOrder(true);
    }

    handleQRResponse(response) {
        this.qrCode = response.qrCode;
        const entity = response['entity_data'];
        this.styleSearchText = {};
        this.styleSearchText.id_type = entity.id;
        this.styleSearchText.unique_search = [entity.name, entity.number, entity.year, entity.season]
            .filter(Boolean)
            .join('-');
        this.searchFreeHandProduction(this.styleSearchText.unique_search, true);
    }

    handleInputMaterialQRResponse(response) {
        this.InputMaterialQRCode = response.qrCode;
        const entity = response['entity_data'];
        this.lotDetails = {};
        this.lotDetails.display_name = entity.displayName;
        this.lotDetails.id = entity.soaId;
        this.searchInputMaterial([entity.soaName, entity.soaNumber].filter(Boolean).join('-'), true);
    }

    checkIfReferenceIdIsUnique() {
        this.orderService.isReferenceIfUnique(this.transaction.lot.externalId).subscribe(
            response => {
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

    uploadFile(files: any, certificateId) {
        if (!this.uploadFiles[certificateId]) {
            this.uploadFiles[certificateId] = [];
        }

        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);

        if (certificateId !== 'QUALITY_REPORT' && certificateId !== 'OTHERS') {
            // eslint-disable-next-line prefer-const
            let certificateDetails;
            let certificate_id = null;
            let uploadedFiles = [];

            if (certificateDetails && certificateDetails.length > 0) {
                uploadedFiles = JSON.parse(JSON.stringify(certificateDetails[0].uploadedFiles));
                certificate_id = JSON.parse(JSON.stringify(certificateDetails[0].id));
            }

            const payload = {
                certificateId: certificate_id || null,
                Certificate_Type: certificateId,
                Certification_Body: '',
                Certificate_Expiry_Date: '',
                Entity_Type: 'TRANSACTION',
                Category: 'PRODUCT',
                Uploaded_Files: uploadedFiles || [],
                Entity_Id: null
            };

            if (this.uploadFiles[certificateId].certificateId) {
                payload.certificateId = this.uploadFiles[certificateId].certificateId;
            }

            this.isUploading[certificateId] = true;

            this.certificateManagerService.uploadFile(fileToUpload, payload).subscribe(response => {
                this.uploadFiles[certificateId] = {
                    certificateId: response.id,
                    files: []
                };
                const _files = JSON.parse(JSON.stringify(response.uploadedFiles));
                for (let i = 0; i < _files.length; i++) {
                    const raw_fileName = _files[i].substring(_files[i].lastIndexOf('/') + 1);
                    this.uploadFiles[certificateId].files[i] = {
                        fileUrl: _files[i],
                        fileName: raw_fileName,
                        displayFileName: raw_fileName.substring(raw_fileName.indexOf('_') + 1)
                    };
                }
                this.isUploading[certificateId] = false;
            });
        } else {
            let certificateDetails = null;

            if (certificateId === 'QUALITY_REPORT') {
                certificateDetails = this.data.quality_report;
            } else {
                certificateDetails = this.data.other_documents;
            }
            let evidence_id = null;
            let uploadedFiles = [];

            if (certificateDetails && certificateDetails.length > 0) {
                uploadedFiles = JSON.parse(JSON.stringify(certificateDetails[0].fileName));
                evidence_id = JSON.parse(JSON.stringify(certificateDetails[0].id));
            }

            if (this.uploadFiles[certificateId].certificateId) {
                evidence_id = this.uploadFiles[certificateId].certificateId;
            }

            this.isUploading[certificateId] = true;
            this.ordersService.uploadCertificate(evidence_id, fileToUpload, certificateId).subscribe(response => {
                this.uploadFiles[certificateId] = {
                    certificateId: response.id,
                    files: []
                };
                const _files = JSON.parse(JSON.stringify(response.fileName));
                for (let i = 0; i < _files.length; i++) {
                    const raw_fileName = _files[i].substring(_files[i].lastIndexOf('/') + 1);
                    this.uploadFiles[certificateId].files[i] = {
                        fileUrl: _files[i],
                        fileName: raw_fileName,
                        displayFileName: raw_fileName.substring(raw_fileName.indexOf('_') + 1)
                    };
                }
                this.isUploading[certificateId] = false;
            });
        }
    }

    removeFile(id: any, index: number) {
        if (id !== 'QUALITY_REPORT' && id !== 'OTHERS') {
            this.certificateManagerService
                .deleteFile(this.uploadFiles[id].certificateId, this.uploadFiles[id].files[index].fileName)
                .subscribe(response => {
                    this.uploadFiles[id] = {
                        certificateId: response.id,
                        files: []
                    };
                    const files = JSON.parse(JSON.stringify(response.uploadedFiles));
                    for (let i = 0; i < files.length; i++) {
                        const raw_fileName = files[i].substring(files[i].lastIndexOf('/') + 1);
                        this.uploadFiles[id].files[i] = {
                            fileUrl: files[i],
                            fileName: raw_fileName,
                            displayFileName: raw_fileName.substring(raw_fileName.indexOf('_') + 1)
                        };
                    }
                });
        } else {
            this.ordersService
                .removeEvidenceFile(this.uploadFiles[id].certificateId, this.uploadFiles[id].files[index].fileName)
                .subscribe(response => {
                    this.uploadFiles[id].files.splice(index, 1);
                });
        }
    }

    validateSelectedStyle() {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (this.styleSearchText.hasOwnProperty('unique_search') || !this.styleSearchText) {
                return;
            }

            let matchedItems = this.config.SOA_search.filter(x => x === this.styleSearchText);

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.styleSearchText = '';
                this.toastrService.error('Please select a valid Article / Style');
            }
        }, 100);
    }
}
