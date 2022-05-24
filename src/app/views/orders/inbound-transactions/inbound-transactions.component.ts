import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { GenerateQrCodeComponent } from '../../../shared/components/generate-qr-code/generate-qr-code.component';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { FacilitiesService } from '../../facilities/facilities.service';
import { CertificateUploadService } from '../../uploads/certificate/cert-upload.service';
import { CertificateTypeValue } from '../../uploads/interface/certificate-type-value-model';
import { OrdersService } from '../orders.service';
import {
    ISupplierListFormOptions,
    SupplierListTypes
} from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { MatOptionSelectionChange } from '@angular/material/core';
import { AuthService } from '../../../core';
import { ContextService } from '../../../shared/context.service';
import { UploadTransactionDocumentsComponent } from '../../../shared/modals/upload-transaction-documents/upload-transaction-documents.component';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-inbound-transactions',
    templateUrl: './inbound-transactions.component.html',
    styleUrls: ['./inbound-transactions.component.scss']
})
export class InboundTransactionsComponent implements OnInit, OnDestroy {
    @ViewChild('soaSearchHint', { static: false }) soaSearchHint;
    @ViewChild('referenceId', { static: false }) referenceId: NgModel;

    hintColor: string;

    pageLoading = false;
    certTypeValueList: CertificateTypeValue[];
    subscription: Subscription;

    certifications = [];
    units = [];
    associatedFacility = [];
    suppliers = [];

    soaUniqueName: any;
    searchData = [];
    searchRawData = [];
    payload = {
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

    isPrintReady: boolean;
    qrCodeToPrint: string;

    @ViewChild(GenerateQrCodeComponent, { static: false }) printQRCodeComponent;
    private suppliersList: any;
    referenceIdIsUnique = true;

    uploadFiles: any = {};

    data: any = {
        certificates_to_collect: []
    };

    isUploading: any = {};
    env = environment;

    selectedUnit = [];

    validationResponse = {};

    constructor(
        private confirmDialog: MatDialog,
        private ordersService: OrdersService,
        private localeService: LocalizationService,
        private router: Router,
        private toastrService: CustomToastrService,
        private certUploadService: CertificateUploadService,
        private facilitiesService: FacilitiesService,
        private appContext: ContextService,
        private certificateManagerService: CertificateManagerService,
        private analyticsService: AnalyticsService,
        public authService: AuthService,
        private dialog: MatDialog
    ) {
        this.subscription = this.certUploadService.getCertificates().subscribe(certList => {
            this.certTypeValueList = certList;
        });
    }

    ngOnInit() {
        if (sessionStorage.getItem('tx_inbound_unit')) {
            this.selectedUnit[0] = { id: sessionStorage.getItem('tx_inbound_unit') };
        }
        this.analyticsService.trackPageVisit('inbound transaction');
        this.pageLoading = true;
        this.certTypeValueList = [];
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
        this.ordersService.getInboundConfig().subscribe(response => {
            this.localeService.addToMasterData(response['data'].masterData);
            this.associatedFacility = response['data'].data.facilities;
            this.certifications = response['data'].data.certifications;
            this.units = response['data'].data.unit;
            this.pageLoading = false;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getSOAName(item) {
        if (item != null && item.unique_search != null) {
            return item.unique_search;
        }
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
                const responseArr = response.split(',');
                if (response[0] === 'Close') {
                    // Do nothing as the user want to go back to the create form
                } else if (responseArr.length > 1) {
                    this.payload.lot.externalId = responseArr[1]; // 1 is index here
                    this.saveInbound();
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
                primaryButton: 'View Lot',
                secondaryButton: 'Record new',
                showClose: true
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response != null) {
                if (response === 'Record new') {
                    this.resetForm();
                } else if (response === 'View Lot') {
                    this.router.navigate(['orders']);
                } else if (response === 'close') {
                    this.router.navigate(['orders']);
                }
            }
        });
        setTimeout(() => {
            this.appContext.cardViewRefresh.next(true);
        }, 2000);
    }

    resetForm() {
        this.soaUniqueName = { id_type: '', unique_search: '', supplier: [] };
        this.certUploadService.clearCertificates();
        this.facilitiesService.clearFacilities();
        this.suppliers = [];
        this.certTypeValueList = [];
        this.payload = {
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
                    unit: sessionStorage.getItem('tx_inbound_unit')
                },
                inboundData: {
                    poNumber: '',
                    supplier: null
                },
                qualityReport: [],
                otherDocuments: []
            },
            certList: []
        };
        this.ordersService.getInboundConfig();
    }

    saveInbound(print = false) {
        this.pageLoading = true;
        if (
            !this.payload.lot.inboundData.supplier ||
            typeof this.payload.lot.inboundData.supplier.supplier_id !== 'string'
        ) {
            this.toastrService.error('Please fix the errors on the form');
            this.pageLoading = false;
            return;
        }

        this.searchRawData.filter(e => {
            // && this.containsSelectedSupplierId(e)
            // TODO fix this issue
            if (this.soaUniqueName.unique_search === e.unique_search) {
                const soaSplit = e.id_type.split('-');
                this.payload.lot.soaId = soaSplit[0];
                this.payload.lot.soaType = soaSplit[1];
                this.payload.lot.productType = e.product_type.id;
                // break; TODO: Is there a better solution for this
            }
        });

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

        this.payload.lot.otherDocuments = [
            {
                fileName: this.uploadFiles['OTHERS'].files.map(x => x.fileName),
                id: this.uploadFiles['OTHERS'].certificateId
            }
        ];
        this.payload.lot.qualityReport = [
            {
                fileName: this.uploadFiles['QUALITY_REPORT'].files.map(x => x.fileName),
                id: this.uploadFiles['QUALITY_REPORT'].certificateId
            }
        ];
        this.payload.certList = certList;
        this.payload.lot.mode = 'web';
        const payload = JSON.parse(JSON.stringify(this.payload));
        payload.lot.inboundData.supplierId = this.payload.lot.inboundData.supplier.supplier_id;
        delete payload.lot.inboundData.supplier;

        this.ordersService.saveInbound(payload).subscribe(
            (response: any) => {
                this.analyticsService.trackSaveSuccess('inbound transaction');

                let invalidCertificatesPresent = this.ordersService.checkIfInvalidCertificatesPresent(
                    response.data.validationResponse
                );
                if (invalidCertificatesPresent) {
                    this.validationResponse = this.ordersService.constructValidationResponseMap(
                        response.data.validationResponse
                    );

                    let transactionData = {
                        id: response.data.id,
                        external_id: this.payload.lot.externalId
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
                    this.analyticsService.trackSaveFail('inbound transaction', 'Error: Duplicate Reference Id');
                    this.referenceIdIsUnique = false;
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

    private nextStep(response: object, print: boolean): void {
        this.openConfirmationDialog(this.payload.lot.externalId);
        if (print) {
            this.qrCodeToPrint = response['data'].UNIQUE_CODE;
            this.isPrintReady = true;
            setTimeout(() => {
                this.printQRCodeComponent.printQRCode();
            }, 100);
        }
        this.resetForm();
        this.pageLoading = false;
    }

    private containsSelectedSupplierId(e: any) {
        if (e.supplier) {
            e.supplier.filter(supplier => {
                if (supplier.id === this.payload.lot.inboundData.supplier.supplier_id) {
                    return true;
                }
            });
        }
        return false;
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
                    this.searchData = this.filterForUniqueSOAValue(this.searchRawData);

                    if (isScanned) {
                        let searchTermMatch = false;

                        this.searchData.forEach(data => {
                            if (data.id_type.indexOf(this.soaUniqueName.id_type) >= 0) {
                                this.soaUniqueName = JSON.parse(JSON.stringify(data));
                                this.onSOASelection(this.soaUniqueName);
                                if (Array.isArray(this.suppliers) && this.suppliers.length == 1) {
                                    if (
                                        !this.payload.lot.inboundData.supplier ||
                                        this.payload.lot.inboundData.supplier.supplier_id !==
                                            this.suppliers[0].supplier_id
                                    ) {
                                        this.supplierListOptions.selectedItem = this.suppliers;
                                    }
                                }
                                // this.payload.lot.inboundData.supplier =
                                //     this.suppliersList[0] && this.suppliersList[0].hasOwnProperty('supplier_id')
                                //         ? this.suppliersList[0]
                                //         : null;
                                searchTermMatch = true;
                            }
                        });

                        if (!searchTermMatch) {
                            this.toastrService.error('The scanned item is not a valid Material', 'No matching data');
                        }
                    }
                    this.hintColor = '';
                    this.soaSearchHint.nativeElement.innerText = '';
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
                        this.soaSearchHint.nativeElement.innerText = 'No results found';
                    }
                }
            },
            () => {
                if (searchTerm && searchTerm.length >= 3) {
                    this.searchData = [];
                    this.hintColor = 'red';
                    this.soaSearchHint.nativeElement.innerText = 'No results found';
                }
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

                if (this.suppliers.length == 1) {
                    if (Array.isArray(this.suppliers) && this.suppliers.length == 1) {
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
                    this.onCreateSupplierNotAvailableModel();
                }
            }
        });
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

    searchStyleOrArticle(event) {
        if (event.key !== '') {
            this.searchFreeHandInbound(this.soaUniqueName);
        }
        if (event.target.value.trim('') === '') {
            this.suppliers = [];
            this.payload.lot.inboundData.supplier = null;
            this.soaUniqueName = { id_type: '', unique_search: '', supplier: [] };
        }
    }

    save() {
        this.analyticsService.trackSaveButtonClick('inbound transaction');
        this.saveInbound();
    }

    saveAndPrint() {
        this.saveInbound(true);
    }

    handleQRResponse(response: any) {
        const entity = response['entity_data'];
        this.suppliersList = entity.supplierList;
        this.soaUniqueName = {
            id_type: '',
            unique_search: '',
            supplier: []
        };
        this.soaUniqueName.id_type = entity.id;
        this.soaUniqueName.unique_search = [entity.name, entity.number, entity.year, entity.season]
            .filter(Boolean)
            .join('-');
        this.searchFreeHandInbound(this.soaUniqueName.unique_search, true);
    }

    checkIfReferenceIdIsUnique() {
        this.ordersService.isReferenceIfUnique(this.payload.lot.externalId).subscribe(
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

    setDefaultUnitSelection(event: MatOptionSelectionChange) {
        let unit = event.source.value;
        sessionStorage.setItem('tx_inbound_unit', unit);
    }

    updateSupplier(event: any) {
        if (Array.isArray(event)) {
            this.payload.lot.inboundData.supplier = event[0];
        } else {
            this.payload.lot.inboundData.supplier = event;
        }
    }
}
