import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { AuthService } from '../../../core';
import { ContextService } from '../../../shared/context.service';
import { UploadTransactionDocumentsComponent } from '../../../shared/modals/upload-transaction-documents/upload-transaction-documents.component';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-outbound-transactions',
    templateUrl: './outbound-transactions.component.html',
    styleUrls: ['./outbound-transactions.component.scss']
})
export class OutboundTransactionsComponent implements OnInit, OnDestroy {
    @ViewChild('soaSearchHint', { static: false }) soaSearchHint;
    hintColor: string;
    pageLoading = true;
    displaySaveBtn = true;
    selectedFacilitiesName = [];
    certTypeValueList: CertificateTypeValue[] = [];
    subscription: Subscription;
    searchRawData = [];
    lotRawData = [];
    inputLotValue = 0.0;
    payload = {
        event: {
            smlId: '',
            smlType: '',
            productType: '',
            date: new Date(),
            referenceId: '',
            quantity: {
                quantity: '',
                unit: 'un_kilograms'
            },
            qualityReport: [],
            otherDocuments: [],
            eventType: 'OUTBOUND',
            customerId: ''
        },
        certList: []
    };

    customers = [];

    config: any = {};

    searchTerm: any;
    searchObj = {
        units_value: '',
        soa_id: '',
        quantity: '',
        artifactName_no: '',
        soa_type: '',
        units_key: '',
        external_id: '',
        id: '',
        display_name: ''
    };
    // searchable dropdown Input
    isRequired = true;
    optional = { key: 'id', value: 'external_id', selectedKey: 'id' };
    isPrintReady: boolean;
    qrCodeToPrint: string;

    @ViewChild(GenerateQrCodeComponent, { static: false }) printQRCodeComponent;
    referenceIdIsUnique = true;

    uploadFiles: any = {};

    data: any = {
        certificates_to_collect: []
    };

    isUploading: any = {};
    env = environment;
    validationResponse = {};

    constructor(
        private router: Router,
        private localeService: LocalizationService,
        private confirmDialog: MatDialog,
        private orderService: OrdersService,
        private toastrService: CustomToastrService,
        private certUploadService: CertificateUploadService,
        private facilitiesService: FacilitiesService,
        private appContext: ContextService,
        private certificateManagerService: CertificateManagerService,
        private ordersService: OrdersService,
        private analyticsService: AnalyticsService,
        public authService: AuthService,
        private dialog: MatDialog
    ) {
        this.subscription = this.certUploadService.getCertificates().subscribe(certList => {
            this.certTypeValueList = certList;
        });
    }

    ngOnInit() {
        this.analyticsService.trackPageVisit('Outbound transaction');
        this.getOutboundConfig();
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

    getOutboundConfig() {
        this.pageLoading = true;
        this.orderService.getOutboundConfig().subscribe(
            resp => {
                this.localeService.addToMasterData(resp['data'].masterData);
                this.config = resp['data'].data;
                if (this.config.customers.length == 1) {
                    this.payload.event.customerId = this.config.customers[0].key;
                }
                this.pageLoading = false;
            },
            fail_response => {
                this.toastrService.error('error fetching order data');
                this.pageLoading = false;
            }
        );
    }

    ngOnDestroy() {
        // prevent memory leak when component is destroyed
        this.subscription.unsubscribe();
    }

    saveOrder(print = false) {
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

        this.payload.event.otherDocuments = [
            {
                fileName: this.uploadFiles['OTHERS'].files.map(x => x.fileName),
                id: this.uploadFiles['OTHERS'].certificateId
            }
        ];
        this.payload.event.qualityReport = [
            {
                fileName: this.uploadFiles['QUALITY_REPORT'].files.map(x => x.fileName),
                id: this.uploadFiles['QUALITY_REPORT'].certificateId
            }
        ];
        this.payload.certList = certList;

        this.searchRawData.filter(e => {
            // && this.containsSelectedSupplierId(e)
            // TODO fix this issue
            if (this.searchTerm.unique_search === e.unique_search) {
                const soaSplit = e.id_type.split('-');
                this.payload.event.smlId = soaSplit[0];
                this.payload.event.smlType = soaSplit[1];
                this.payload.event.productType = e.product_type.id;
                // break; TODO: Is there a better solution for this
            }
        });

        this.orderService.saveOutbound(this.payload).subscribe(
            (resp: any) => {
                this.analyticsService.trackSaveSuccess('outbound transaction');
                let invalidCertificatesPresent = this.ordersService.checkIfInvalidCertificatesPresent(
                    resp.data.validationResponse
                );
                if (invalidCertificatesPresent) {
                    this.validationResponse = this.ordersService.constructValidationResponseMap(
                        resp.data.validationResponse
                    );

                    let transactionData = {
                        id: resp.data.id
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
                                    ),
                                    entity_type: 'TRANSACTION_LITE'
                                }
                            });
                            dialogRef.afterClosed().subscribe(uploadDocResponse => {
                                this.nextStep(resp, print);
                            });
                        },
                        errorResponse => {
                            console.log(errorResponse);
                        }
                    );
                } else {
                    this.nextStep(resp, print);
                }
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.analyticsService.trackSaveFail('outbound transaction', 'Error: Duplicate Reference Id');
                    this.referenceIdIsUnique = false;
                    this.toastrService.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.analyticsService.trackSaveFail('outbound transaction');
                    this.toastrService.error('error fetching order data');
                    this.pageLoading = false;
                }
            }
        );
    }

    private nextStep(response: object, print: boolean): void {
        this.displaySaveBtn = false;
        setTimeout(() => {
            this.router.navigate(['/', 'orders-lite']);
            this.resetForm();
            this.pageLoading = false;
            this.appContext.cardViewRefresh.next(true);
        }, 1000);
        if (print) {
            this.qrCodeToPrint = response['data'].UNIQUE_CODE;
            this.isPrintReady = true;
            setTimeout(() => {
                this.printQRCodeComponent.printQRCode();
            }, 100);
        }
    }

    getStyleName(item) {
        if (item != null && item.unique_search != null) {
            return item.unique_search;
        }
    }

    checkLotAlreadySelected(event) {
        this.payload.event.quantity.quantity = event.quantity;
        this.payload.event.quantity.unit = event.units_key;
        this.inputLotValue = event.quantity;
        this.payload.event.smlId = event.soa_id;
        this.payload.event.smlType = event.soa_type;
        this.payload.event.productType = event.product_type.id;
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
                    this.saveOrder();
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
                    this.resetForm();
                } else if (response === 'View') {
                    this.router.navigate(['orders-lite']);
                }
            }
        });
    }

    resetForm() {
        this.searchTerm = '';
        this.certUploadService.clearCertificates();
        this.facilitiesService.clearFacilities();
        this.config.lots = [];
        this.payload = {
            event: {
                smlId: '',
                smlType: '',
                productType: '',
                date: new Date(),
                referenceId: '',
                quantity: {
                    quantity: '',
                    unit: 'un_kilograms'
                },
                qualityReport: [],
                otherDocuments: [],
                eventType: 'OUTBOUND',
                customerId: ''
            },
            certList: []
        };
        this.getOutboundConfig();
    }

    searchFreeHandOutbound(searchTerm, isScanned = false, entity = { displayName: '' }) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;

        this.orderService.searchFreeHandArticleOrStyle(searchPayload).subscribe(response => {
            // this.config.SOA_search = response['data'].searchResponse;
            // unique
            this.searchRawData = response['data'].searchResponse;
            if (searchTerm.length >= 3) {
                if (this.searchRawData.length > 0) {
                    if (isScanned) {
                        this.config.SOA_search = this.filterForUniqueLots(this.searchRawData);
                    } else {
                        this.config.SOA_search = this.filterForUniqueLots(this.searchRawData);
                    }
                    this.hintColor = '';
                    this.soaSearchHint.nativeElement.innerText = '';

                    if (isScanned) {
                        let searchTermMatch = false;
                        this.config.SOA_search.forEach(data => {
                            if (data.display_name === entity.displayName) {
                                this.searchTerm = JSON.parse(JSON.stringify(data));
                                searchTermMatch = true;
                            }
                        });
                        if (!searchTermMatch) {
                            this.toastrService.error(
                                'Make sure the item scanned is present in the inbound transaction.',
                                'No matching data'
                            );
                        } else {
                            this.onSOASelection(this.searchTerm);
                        }
                    }
                } else {
                    if (isScanned) {
                        this.toastrService.error(
                            'Make sure the item scanned is present in the inbound transaction.',
                            'No matching data'
                        );
                    }
                    this.config.SOA_search = [];
                    this.hintColor = 'red';
                    this.soaSearchHint.nativeElement.innerText = 'No results found';
                }
            }
        });
    }

    private filterForUniqueLots(rawSOAData) {
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

    searchStyle(event) {
        if (event.key !== '') {
            this.searchFreeHandOutbound(this.searchTerm);
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
            }
        });
        // this.config.lots = this.searchRawData.filter(_lot => {
        //     return _lot.artifactName_no === value.artifactName_no;
        // });

        // this.ordersService.getRequiredCertificates(value.soa_id).subscribe(
        //     response => {
        //         if (response && response.length > 0) {
        //             this.data.certificates_to_collect = this.data.certificates_to_collect.filter(
        //                 certificate_to_collect =>
        //                     certificate_to_collect.id === 'QUALITY_REPORT' || certificate_to_collect.id === 'OTHERS'
        //             );
        //             response.forEach(c => {
        //                 this.data.certificates_to_collect.unshift(c);
        //             });
        //             this.data.certificates_to_collect.forEach(certToCollect => {
        //                 if (certToCollect.id !== 'OTHERS' && certToCollect.id !== 'QUALITY_REPORT') {
        //                     certToCollect.value = certToCollect.value + ' certificate';
        //                 }
        //             });
        //             this.data.certificates_to_collect.forEach(certificate => {
        //                 if (!this.uploadFiles[certificate.id]) {
        //                     this.uploadFiles[certificate.id] = {
        //                         certificateId: null,
        //                         files: []
        //                     };
        //                 }
        //             });
        //         }
        //     },
        //     errorResponse => {
        //         this.data.certificates_to_collect = [];
        //     }
        // );

        this.payload.event.customerId = '';

        // const lot = this.config.lots.filter(_lot => _lot.display_name === value.display_name)[0];

        // if (!lot || lot.length === 0) {
        //     this.toastrService.error('Not Lots found for the chosen style / material');
        //     return;
        // }

        // this.checkLotAlreadySelected(lot);

        // If there is only one customer, then select it for the user
        if (this.config.customers.length == 1) {
            this.payload.event.customerId = this.config.customers[0].key;
        }
    }
    save() {
        this.analyticsService.trackSaveButtonClick('outbound transaction');
        this.saveOrder();
    }

    saveAndPrint() {
        this.saveOrder(true);
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
                Entity_Type: 'TRANSACTION_LITE',
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
            if (this.searchTerm.hasOwnProperty('unique_search') || !this.searchTerm) {
                return;
            }

            let matchedItems = this.config.SOA_search.filter(x => x === this.searchTerm);

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.searchTerm = '';
                this.toastrService.error('Please select a valid Article / Style');
            }
        }, 100);
    }
}
