import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import FileSaver from 'file-saver';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core';
import { environment } from '../../../../environments/environment';
import { UtilsService } from '../../../shared/utils/utils.service';
import {
    ApprovalStatuses,
    ApprovalReasons,
    ExtractionStatuses,
    ExtractionStatusText,
    IEvidenceSubmitData,
    IExtractedData,
    IIdCodeName,
    IInvoiceInfo,
    IProductInfo,
    IExtractedDetail,
    TierKeys
} from '../evidence.model';
import { EvidenceService } from '../evidence.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { ConfirmDialogComponent } from './../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { InformationConfirmDialogComponent } from './../../../shared/modals/information-confirm-dialog/information-confirm-dialog.component';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { ScopeCertificatesService } from '../../scope-certificates/scope-certificates.service';

@Component({
    selector: 'app-upload-evidence',
    templateUrl: './upload-evidence.component.html',
    styleUrls: ['./upload-evidence.component.scss']
})
export class UploadEvidenceComponent implements OnInit, OnDestroy {
    @ViewChild('evidenceForm') evidenceForm: NgForm;

    extractionStatusText = ExtractionStatusText;
    env = environment;

    config = {
        sellers: [],
        buyers: [],
        consignees: [],
        certs: [],
        yarnCoo: [],
        cottonCoo: [],
        facilities: []
    };

    selectedCountries = {
        yarnCOO: [],
        cottonLintCOO: []
    };

    countryParams = {
        key: 'name',
        value: 'name',
        selectedKey: 'id'
    };
    params = {
        key: 'key',
        value: 'value',
        selectedKey: 'key'
    };
    recordingFacilityParams = {
        key: 'key',
        value: 'code',
        selectedKey: 'key'
    };
    certParams = {
        key: 'id',
        value: 'value',
        selectedKey: 'value'
    };

    soaUniqueName: any;
    searchData = [];
    hintColor: string;
    soaSearchHintText = 'Type all characters to search';
    searchRawData = [];

    facilities = [];
    facilityRawData = [];
    facilitySearchHintText = 'Type all characters to search';
    searchTermFacility: any;
    hintColorFacility: string;

    tierContext: string;

    tiers = TierKeys;

    supportedCerts = ['cer_grs', 'cer_rws', 'cer_rds', 'cer_rcs', 'cer_gots', 'cer_ocs'];

    reasons = [
        { id: 1, name: ApprovalReasons.TC_EXTRACTION_FAILURE, checked: false },
        { id: 2, name: ApprovalReasons.PARTIAL_DATA_EXTRACTED, checked: false },
        { id: 3, name: ApprovalReasons.WRONG_DATA_EXTRACTED, checked: false },
        { id: 4, name: ApprovalReasons.COMBINED_INFO_ON_TC, checked: false }
    ];

    fileToUpload: File;
    traderFileToUpload: File;
    uploadedFile: any;
    traderUploadedFile: any;
    uploadedSrcFile: any;
    master_standards: any[];

    selectedCountry: string = null;

    certificationType: string = 'TC';
    fileType: string = 'CERT';
    extractionStatus: string = '';
    type: string = 'Transaction';
    editBtnText: string = 'Edit';

    showClose: boolean;
    isUploading: boolean = false;
    isTraderUploading: boolean = false;
    isExtracting: boolean = false;
    isExtractedDataAvailable: boolean = false;
    pageLoading: boolean = false;
    modalOpen: boolean = false;
    disableFields: boolean = true;
    disableEditButton: boolean = false;
    isEditMode: boolean = false;

    totalNetWeight: number;
    traderChecked = false;

    extractedData: IExtractedData;
    evidenceData: IEvidenceSubmitData;
    productInfo: IProductInfo;
    invoiceInfo: IInvoiceInfo;
    certStd: string = '';
    brandCompanyId: string;
    otherChecked: boolean = false;
    isMCMatch: boolean = false;
    facilityValidSC: boolean = true;
    certArr: any = [];
    facilityList = [];

    buyerConsigneeValidationTitleMessage = {
        BUYER_TITLE: "Buyer/Consignee name doesn't match with SC",
        BUYER_MESSAGE: 'Do you want to upload another TC?',
        BUYER_TOASTR_MESSAGE: 'Invalid buyer/consignee name, please submit this request to Brand for approval.',
        CONSIGNEE_TITLE: 'Consignee name mismatch, please submit this request to Brand for approval',
        CONSIGNEE_MESSAGE:
            'Please check your company profile if you have relevant Facility Profile and SC for Consignee'
    };

    constructor(
        private dialogRef: MatDialogRef<UploadEvidenceComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService,
        private dialog: MatDialog,
        private toastr: CustomToastrService,
        private commonServices: CommonServices,
        private evidenceService: EvidenceService,
        public localeService: LocalizationService,
        private authService: AuthService,
        private transactionsService: TransactionsService,
        private scService: ScopeCertificatesService
    ) {
        dialogRef.disableClose = true;
        this.showClose = data.showClose !== undefined ? data.showClose : true;
        this.certificationType = data.certificationType;
        this.type = data.type;
        this.tierContext =
            this.authService.user.tiersAssociated.length > 0 ? this.authService.user.tiersAssociated[0].key : null;
    }

    ngOnInit() {
        this.resetForm();
        this.modalOpen = true;
        forkJoin([this.commonServices.getCountries(), this.evidenceService.getSellersBuyersAndConsignees()]).subscribe(
            response => {
                this.config.yarnCoo = JSON.parse(JSON.stringify(response[0]['data']['country']));
                this.config.cottonCoo = JSON.parse(JSON.stringify(response[0]['data']['country']));
                this.localeService.addToMasterData(response[1]['masterData']);
                this.certArr = Object.values(response[1]['masterData']);
                this.config.certs = this.certArr.filter(data => this.supportedCerts.includes(data.id));
                this.config.sellers = response[1]['data']['suppliers'];
                this.config.buyers = response[1]['data']['facilities'];
                this.config.consignees = response[1]['data']['facilities'];
                this.facilityList = this.config.buyers;
                this.pageLoading = false;
            }
        );

        this.brandCompanyId =
            this.authService.user.brandsAssociated && this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : null;
    }

    ngOnDestroy() {
        this.modalOpen = false;
    }

    resetEvidenceFormData() {
        this.evidenceData = {
            certId: null,
            certType: null,
            ttDocumentId: null,
            companyId: null,
            brandId: null,
            recordingFacilityId: null,
            tierId: null,
            creationDate: null,
            systemMessages: [],
            tcExtractedData: {
                bodyIssuingCertificate: null,
                licenseCode: null,
                referenceNumber: null,
                sellerOfProduct: {
                    value: null
                },
                facility: { key: null, value: null },
                inspectionBody: null,
                lastProcessorOfProducts: null,
                countryOfDispatch: null,
                buyerOfProduct: {
                    value: null,
                    isExist: true
                },
                consigneeOfProduct: {
                    value: null,
                    isExist: true
                },
                countryOfConsignee: null,
                productAndShipmentInformation: null,
                grossWeight: null,
                netWeight: null,
                commercialWeight: null,
                placeAndDateOfIssue: null,
                certTypeId: null,
                isScExpired: false,
                productInfo: [JSON.parse(JSON.stringify(this.productInfo))]
            }
        };
    }

    resetForm(): void {
        this.isUploading = false;
        this.isTraderUploading = false;
        this.traderChecked = false;
        this.isExtracting = false;
        this.isExtractedDataAvailable = false;
        this.isEditMode = false;
        this.editBtnText = 'Edit';
        this.uploadedFile = undefined;
        this.traderUploadedFile = undefined;
        this.fileToUpload = undefined;
        this.traderFileToUpload = undefined;
        this.selectedCountry = null;
        this.extractionStatus = '';
        this.totalNetWeight = null;
        this.certStd = '';
        this.soaUniqueName = { product_unique_code: '', supplier: [] };
        this.searchTermFacility = '';
        this.facilities = [];
        this.searchData = [];
        this.isMCMatch = false;
        this.facilityValidSC = true;
        this.productInfo = {
            productName: null,
            tradeName: null,
            lotNumbers: null,
            grossWeight: null,
            netWeight: null,
            labelGrade: null,
            packedIn: null,
            supplierForTraderTC: null,
            yarnCOO: { country: [] },
            cottonLintCOO: { country: [] },
            productItem: null
        };
        this.invoiceInfo = {
            invoiceNo: null,
            invoiceDate: new Date()
        };
        this.extractedData = {
            id: null,
            updateTs: null,
            createTs: null,
            createdBy: null,
            lastModifiedBy: null,
            certType: null,
            companyId: null,
            tcExtractedData: {
                bodyIssuingCertificate: null,
                licenseCode: null,
                referenceNumber: null,
                sellerOfProduct: null,
                facility: { key: null, value: null },
                inspectionBody: null,
                lastProcessorOfProducts: null,
                countryOfDispatch: null,
                buyerOfProduct: { value: null, isExist: true },
                consigneeOfProduct: { value: null, isExist: true },
                countryOfConsignee: null,
                productAndShipmentInformation: null,
                grossWeight: null,
                netWeight: null,
                commercialWeight: null,
                placeAndDateOfIssue: null,
                certTypeId: null,
                productInfo: null,
                isScExpired: false
            }
        };
        this.selectedCountries = {
            yarnCOO: [],
            cottonLintCOO: []
        };
        this.resetEvidenceFormData();
    }

    closeUploadEvidence(certId, fileName): void {
        if (this.uploadedFile) {
            const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
                width: '400px',
                data: {
                    title: '',
                    msg: 'Are you sure you want to close this dialog?',
                    primaryButton: 'Cancel',
                    secondaryButton: 'Yes',
                    class: '',
                    showClose: false
                }
            });
            confirmationDialog.afterClosed().subscribe(response => {
                if (response === 'Yes') {
                    this.closeDialog();
                    if (certId) {
                        //this.deleteCertificate(certId,fileName);
                        this.removeDocument(certId);
                    }
                }
            });
        } else {
            this.closeDialog();
        }
    }

    closeDialog() {
        this.toastr.clear();
        this.dialogRef.close();
    }

    deleteEvidence(certId, fileName, fileType): void {
        const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: '',
                msg: 'Are you sure you want to delete this file?',
                primaryButton: 'Cancel',
                secondaryButton: 'Yes',
                class: '',
                showClose: false
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response === 'Yes') {
                if (fileType !== 'trader') {
                    this.resetForm();
                    this.editBtnText = 'Edit';
                    this.isEditMode = false;
                    this.resetEvidenceData(this.evidenceData.tcExtractedData);
                    this.disableFields = true;
                    if (certId) {
                        //this.deleteCertificate(certId,fileName);
                        this.removeDocument(certId);
                    }
                } else {
                    const payload = {
                        certId: certId,
                        fileName: fileName
                    };
                    this.deleteFile(payload);
                }
            }
        });
        if (fileType !== 'trader') {
            this.isUploading = false;
        } else {
            this.isTraderUploading = false;
        }
    }

    downloadEvidence(certId: string, fileName: string) {
        this.toastr.info('Requesting file. Please wait');
        this.commonServices.downloadCertificate(certId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
            },
            failResponse => {
                this.toastr.error('File could not be uploaded. Please try after some time.', 'Failed', {
                    disableTimeOut: true
                });
            }
        );
    }

    removeDocument(certId) {
        this.commonServices.removeDocument(certId).subscribe();
    }

    deleteFile(payload) {
        this.commonServices.deleteCertificate(payload).subscribe(resp => {
            this.traderUploadedFile = undefined;
        });
    }

    deleteCertificate(certId, fileName) {
        const payload = {
            certId: certId,
            fileName: fileName
        };
        this.commonServices.deleteCertificate(payload).subscribe();
    }

    uploadFile(files, fileType): void {
        this.disableFields = true;
        if (fileType !== 'trader') {
            this.isUploading = true;
        } else {
            this.isTraderUploading = true;
        }
        if (files.length === 0) {
            return;
        }
        if (fileType !== 'trader') {
            this.fileToUpload = files.item(0);
            const fileSize: number = this.fileToUpload.size / 1024 / 1024;
            const fileSizeString = fileSize.toFixed(2);
            const fileName = this.fileToUpload.name;
            const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
            if (
                !fileExtension ||
                fileExtension === '' ||
                environment.config.allowedCertificationFileExtensions.indexOf(fileExtension.toLowerCase()) === -1
            ) {
                this.toastr.error(
                    'Please use a supported file format: ' +
                        environment.config.allowedCertificationFileExtensions.join(', '),
                    'Unsupported File Extension'
                );
                if (fileType !== 'trader') {
                    this.isUploading = false;
                } else {
                    this.isTraderUploading = false;
                }
                return;
            }
            if (fileSize > environment.config.maximumFileUploadSize) {
                this.toastr.error(
                    `File size should be within ${environment.config.maximumFileUploadSize}MB.
              Chosen file is ${fileSizeString}MB, File Size too large!`
                );
                if (fileType !== 'trader') {
                    this.isUploading = false;
                } else {
                    this.isTraderUploading = false;
                }
                return;
            }
        }
        this.evidenceService
            .uploadFile(this.fileToUpload, this.fileType, this.uploadedFile ? this.uploadedFile.id : null, fileType)
            .subscribe(
                response => {
                    // Process uploaded file response
                    this.processUploadedFileResponse(response, fileType);

                    if (fileType !== 'trader') {
                        // Extract the uploaded file
                        this.extractUploadedEvidence();
                    }
                },
                failResponse => {
                    const errorMessage = 'File could not be uploaded. Please try after some time.';
                    this.toastr.error(
                        this.commonServices.getTranslation(errorMessage),
                        this.commonServices.getTranslation('Failed')
                    );
                    if (fileType !== 'trader') {
                        this.isUploading = false;
                    } else {
                        this.isTraderUploading = false;
                    }
                }
            );
    }

    uploadTraderFile(files, fileType): void {
        this.disableFields = true;

        this.isTraderUploading = true;

        if (files.length === 0) {
            return;
        }
        this.traderFileToUpload = files.item(0);
        const fileSize: number = this.traderFileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = this.traderFileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (
            !fileExtension ||
            fileExtension === '' ||
            environment.config.allowedCertificationFileExtensions.indexOf(fileExtension.toLowerCase()) === -1
        ) {
            this.toastr.error(
                'Please use a supported file format: ' +
                    environment.config.allowedCertificationFileExtensions.join(', '),
                'Unsupported File Extension'
            );
            this.isTraderUploading = false;
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            this.toastr.error(
                `File size should be within ${environment.config.maximumFileUploadSize}MB.
              Chosen file is ${fileSizeString}MB, File Size too large!`
            );
            this.isTraderUploading = false;
            return;
        }

        this.evidenceService
            .uploadFile(
                this.traderFileToUpload,
                this.fileType,
                this.uploadedFile ? this.uploadedFile.id : null,
                fileType
            )
            .subscribe(
                response => {
                    // Process uploaded file response
                    this.processUploadedFileResponse(response, fileType);
                },
                failResponse => {
                    const errorMessage = 'File could not be uploaded. Please try after some time.';
                    this.toastr.error(
                        this.commonServices.getTranslation(errorMessage),
                        this.commonServices.getTranslation('Failed')
                    );
                    this.isTraderUploading = false;
                }
            );
    }

    getFileNameFromUrl(url: string) {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        return fileName.substring(fileName.indexOf('_') + 1);
    }

    processUploadedFileResponse(uploadedData, fileType): void {
        const data = uploadedData['data'];
        if (fileType !== 'trader') {
            // data.uploadedFiles[0] is assumed to be the transaction certificates
            this.uploadedFile = {
                id: data.id,
                name: this.getFileNameFromUrl(data.uploadedFiles[0]),
                fullName: data.uploadedFiles[0].substring(data.uploadedFiles[0].lastIndexOf('/') + 1)
            };
            this.isUploading = false;
        } else {
            // data.uploadedFiles[1] is assumed to be the trader certificates
            this.traderUploadedFile = {
                id: data.id,
                name: this.getFileNameFromUrl(data.uploadedFiles[1]),
                fullName: data.uploadedFiles[1].substring(data.uploadedFiles[1].lastIndexOf('/') + 1)
            };
            this.isTraderUploading = false;
            this.disableFields = false;
        }
    }

    resetEvidenceData(data: IExtractedDetail) {
        this.evidenceData.tcExtractedData = JSON.parse(JSON.stringify(data));
        /*
        if (
            !this.extractedData.tcExtractedData.productInfo 
            ||this.extractedData.tcExtractedData.productInfo.length === 0
        ) {
            this.addProductInfo();
        } else {
            this.totalNetWeight = this.getTotalNetWeight();
        } */

        /* if (this.extractedData.tcExtractedData.productInfo) {
            this.totalNetWeight = this.getTotalNetWeight();
        } */

        // Reset seller of product
        if (this.extractedData.tcExtractedData.sellerOfProduct === null) {
            this.evidenceData.tcExtractedData.sellerOfProduct = {
                value: null
            };
        }

        // Reset consignee of product
        if (this.extractedData.tcExtractedData.consigneeOfProduct === null) {
            this.evidenceData.tcExtractedData.consigneeOfProduct = {
                value: null,
                isExist: true
            };
        }

        // Reset buyer of product
        if (this.extractedData.tcExtractedData.buyerOfProduct === null) {
            this.evidenceData.tcExtractedData.buyerOfProduct = {
                value: null,
                isExist: true
            };
        }
    }

    extractUploadedEvidence(): void {
        this.isExtracting = true;
        this.isExtractedDataAvailable = false;
        const payload = { certId: this.uploadedFile['id'], certType: this.certificationType };
        this.getExtractionStatus(ExtractionStatuses.EXTRACTING);
        this.evidenceService.extractUploadedEvidence(payload).subscribe(
            data => {
                if (data.hasOwnProperty('error')) {
                    if (this.modalOpen) {
                        this.toastr.error(data['error'], 'Error', { disableTimeOut: true });
                    }
                    this.getExtractionStatus(ExtractionStatuses.FAILED);
                    this.isExtracting = false;
                    this.isExtractedDataAvailable = false;
                    if (data['error'] === 'Duplicate Certificate') {
                        this.disableFields = true;
                        this.reasons[0].checked = false;
                        this.evidenceData.notifyTT = false;
                    } else {
                        this.handleEditClick(true, false);
                        this.disableFields = false;
                        this.reasons[0].checked = true;
                        this.evidenceData.notifyTT = true;
                    }
                } else {
                    this.buyerConsigneeValidation(JSON.parse(JSON.stringify(data['data'])));
                }
            },
            failResponse => {
                this.getExtractionStatus(ExtractionStatuses.FAILED);
                this.isExtracting = false;
                this.isExtractedDataAvailable = false;
                this.handleEditClick(true, false);
                this.disableFields = false;
            }
        );
    }

    getTotalNetWeight(): number {
        if (this.extractedData.tcExtractedData.productInfo.length !== 0) {
            return this.extractedData.tcExtractedData.productInfo.reduce((sum, currentValue) => {
                return sum + +currentValue.netWeight;
            }, 0);
        } else {
            return null;
        }
    }

    getEnteredNetWeight(): number {
        return this.evidenceData.tcExtractedData.productInfo.reduce((sum, currentValue) => {
            return sum + +currentValue.netWeight;
        }, 0);
    }

    getExtractionStatus(statusCode: number): void {
        switch (statusCode) {
            case ExtractionStatuses.EXTRACTING:
                this.extractionStatus = this.extractionStatusText.EXTRACTING;
                break;
            case ExtractionStatuses.FAILED:
                this.extractionStatus = this.extractionStatusText.FAILED;
                break;
            case ExtractionStatuses.COMPLETED:
                this.extractionStatus = this.extractionStatusText.COMPLETED;
                break;
            case ExtractionStatuses.NOT_SUPPORTED:
                this.extractionStatus = this.extractionStatusText.NOT_SUPPORTED;
                break;
            case ExtractionStatuses.PARTIALLY_COMPLETED:
                this.extractionStatus = this.extractionStatusText.PARTIALLY_COMPLETED;
                break;
            default:
                this.extractionStatus = '';
                break;
        }
    }

    deleteProductInfo(index: number): void {
        this.evidenceData.tcExtractedData.productInfo.splice(index, 1);
        if (this.evidenceData.tcExtractedData.productInfo.length === 0) {
            this.addProductInfo();
        }
    }

    addProductInfo(): void {
        if (!this.evidenceData.tcExtractedData.productInfo) {
            this.evidenceData.tcExtractedData.productInfo = [];
        }
        this.evidenceData.tcExtractedData.productInfo.push(JSON.parse(JSON.stringify(this.productInfo)));
    }

    deleteInvoiceInfo(index: number): void {
        console.log('Delete Invoice info');
    }

    addInvoiceInfo(): void {
        console.log('Add Invoice info');
    }

    openConfirmationDialog(data: any): void {
        const confirmationDialog = this.dialog.open(InformationConfirmDialogComponent, {
            width: '450px',
            panelClass: 'tc-upload-confirmation-dialog',
            data: {
                dialogData: data,
                buttonText: 'Ok',
                showClose: false,
                isMultiple: true
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response === 'Ok') {
                this.resetForm();
            }
        });
    }

    openConfirmationDialogForMaterialComposition(data: any): void {
        const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Are you sure that you want to Submit for Brand Approval?',
                msg: data,
                primaryButton: 'Cancel',
                secondaryButton: 'Yes',
                class: 'upload-evidence-buyer-confirmation-modal',
                showClose: false
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response === 'Yes') {
                this.evidenceData.systemMessages.push(data);
                this.pageLoading = true;
                this.isMCMatch = false;
                this.submitData();
            } else if (response === 'Cancel') {
                this.pageLoading = false;
                this.isMCMatch = true;
            }
        });
    }

    checkEnteredQuantity(): boolean {
        const enteredQuantity = parseFloat(parseFloat(this.getEnteredNetWeight().toString()).toFixed(2));
        if (
            this.evidenceData.tcExtractedData &&
            this.evidenceData.tcExtractedData.netWeight &&
            this.evidenceData.tcExtractedData.netWeight !== ''
        ) {
            if (enteredQuantity <= parseFloat(parseFloat(this.evidenceData.tcExtractedData.netWeight).toFixed(2))) {
                return true;
            } else {
                this.toastr.error('Net weight is less than sum of individual lot weight', 'Error', {
                    disableTimeOut: true
                });
                this.pageLoading = false;
            }
        } else {
            this.toastr.error('Net weight is empty', 'Error', { disableTimeOut: true });
            this.pageLoading = false;
        }
    }

    submitEvidence(): void {
        this.pageLoading = true;
        this.hasValidProductNames();
    }

    onSelectingCountry(country: IIdCodeName): void {
        this.evidenceData.tcExtractedData.countryOfDispatch = country.name;
    }

    resetApprovalStatusFormData(status = ApprovalStatuses.PENDING) {
        this.evidenceData.workflowStatus = status;
        this.evidenceData.comments = {
            selectedComments: [],
            otherComments: null
        };
        this.evidenceData.notifyTT = false;
    }

    handleEditConfirmation() {
        const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: '',
                msg: 'Are you sure that you want to edit the fields?',
                primaryButton: 'Cancel',
                secondaryButton: 'Yes',
                class: '',
                showClose: false
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response === 'Cancel') {
                this.isEditMode = false;
                this.editBtnText = 'Edit';
                this.resetEvidenceData(this.evidenceData.tcExtractedData);
                this.disableFields = true;
                // Remove approval status related items from the evidenceData
                delete this.evidenceData.workflowStatus;
                delete this.evidenceData.notifyTT;
            } else if (response === 'Yes') {
                this.isEditMode = true;
                this.editBtnText = 'Cancel the edit';
                this.disableFields = false;
                this.resetApprovalStatusFormData();
            }
        });
    }

    handleCancelTheEditConfirmation() {
        const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: '',
                msg: 'Are you sure that you want to cancel the edit?',
                primaryButton: 'Cancel',
                secondaryButton: 'Yes',
                class: '',
                showClose: false
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response === 'Yes') {
                this.editBtnText = 'Edit';
                this.isEditMode = false;
                this.resetEvidenceData(this.extractedData.tcExtractedData);
                this.disableFields = true;
                if (
                    !this.extractedData.tcExtractedData.productInfo ||
                    this.extractedData.tcExtractedData.productInfo.length === 0
                ) {
                    this.addProductInfo();
                }
                // Remove approval status related items from the evidenceData
                delete this.evidenceData.workflowStatus;
                delete this.evidenceData.notifyTT;
            } else if (response === 'Cancel') {
                this.isEditMode = true;
                this.editBtnText = 'Cancel the edit';
                this.disableFields = false;
            }
        });
    }

    handleEditClick(isEditMode = true, askConfirmation = true) {
        this.isEditMode = isEditMode;
        if (this.isEditMode && askConfirmation) {
            this.handleEditConfirmation();
        } else if (!this.isEditMode) {
            this.handleCancelTheEditConfirmation();
        } else {
            this.editBtnText = this.isEditMode ? 'Cancel the edit' : 'Edit';
            this.resetApprovalStatusFormData();
        }
    }

    checkIfReasonSelected() {
        if (this.isEditMode && this.evidenceData.workflowStatus) {
            const val = this.reasons.some(reason => reason.checked);
            if (!val) {
                if (!this.otherChecked) {
                    this.toastr.error('Please Select a reason for editing transaction certificate data', 'Error', {
                        disableTimeOut: true
                    });
                } else {
                    if (
                        !this.evidenceData.comments.otherComments ||
                        this.evidenceData.comments.otherComments.trim() === ''
                    ) {
                        this.toastr.error('Please provide the reason in the text box', 'Error', {
                            disableTimeOut: true
                        });
                    } else {
                        return true;
                    }
                }
                this.pageLoading = false;
            }
            return val;
        } else {
            return true;
        }
    }

    isBuyerConsigneExists(): boolean {
        let flag: boolean = false;
        if (
            !this.extractedData.tcExtractedData.consigneeOfProduct.isExist == false &&
            !this.extractedData.tcExtractedData.buyerOfProduct.isExist == false
        ) {
            flag = true;
        } else if (
            !this.extractedData.tcExtractedData.consigneeOfProduct.isExist == true &&
            !this.extractedData.tcExtractedData.buyerOfProduct.isExist == true
        ) {
            flag = false;
        } else {
            flag =
                !this.extractedData.tcExtractedData.consigneeOfProduct.isExist &&
                !this.extractedData.tcExtractedData.buyerOfProduct.isExist;
        }
        return flag;
    }

    buyerConfirmation(title, msg, primaryButton, secondryButton) {
        const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            panelClass: 'tc-upload-evidence-buyer-confirmation-modal',
            data: {
                title: title,
                msg: msg,
                primaryButton: primaryButton,
                secondaryButton: secondryButton,
                class: 'upload-evidence-buyer-confirmation-modal',
                showClose: false
            }
        });
        return confirmationDialog;
    }

    buyerConsigneeValidation(extractedData) {
        if (!extractedData.tcExtractedData.buyerOfProduct.isExist) {
            this.buyerConfirmation(
                this.buyerConsigneeValidationTitleMessage.BUYER_TITLE,
                this.buyerConsigneeValidationTitleMessage.BUYER_MESSAGE,
                'No',
                'Yes'
            )
                .afterClosed()
                .subscribe(response => {
                    if (response === 'No') {
                        this.toastr.error(this.buyerConsigneeValidationTitleMessage.BUYER_TOASTR_MESSAGE, '', {
                            disableTimeOut: true
                        });
                        this.extractedData = extractedData;
                        this.resetEvidenceData(extractedData['tcExtractedData']);
                        this.certStd = this.localeService.getDisplayText(this.evidenceData.tcExtractedData.certTypeId);
                        this.getExtractionStatus(ExtractionStatuses.COMPLETED);
                        this.isPartiallyExtracted(extractedData['tcExtractedData']);
                        this.isExtracting = false;
                        this.isExtractedDataAvailable = true;
                        this.disableFields = true;
                        if (this.extractedData.tcExtractedData.productInfo === null) {
                            this.addProductInfo();
                        }
                        // Mark all fields touched
                        Object.keys(this.evidenceForm.form.controls).forEach(key => {
                            console.log(`key = ${key}`);
                            this.evidenceForm.form.get(key).markAsTouched();
                        });
                    } else if (response === 'Yes') {
                        this.resetForm();
                    }
                });
        } else if (
            extractedData.tcExtractedData.buyerOfProduct.isExist &&
            !extractedData.tcExtractedData.consigneeOfProduct.isExist
        ) {
            this.toastr.error(this.buyerConsigneeValidationTitleMessage.CONSIGNEE_TITLE, '', {
                disableTimeOut: true
            });
            this.extractedData = extractedData;
            this.resetEvidenceData(extractedData['tcExtractedData']);
            this.certStd = this.localeService.getDisplayText(this.evidenceData.tcExtractedData.certTypeId);
            this.getExtractionStatus(ExtractionStatuses.COMPLETED);
            this.isPartiallyExtracted(extractedData['tcExtractedData']);
            this.isExtracting = false;
            this.isExtractedDataAvailable = true;
            this.disableFields = true;
            if (this.extractedData.tcExtractedData.productInfo === null) {
                this.addProductInfo();
            }
            // Mark all fields touched
            Object.keys(this.evidenceForm.form.controls).forEach(key => {
                console.log(`key = ${key}`);
                this.evidenceForm.form.get(key).markAsTouched();
            });
        } else {
            this.extractedData = extractedData;
            this.resetEvidenceData(extractedData['tcExtractedData']);
            this.certStd = this.localeService.getDisplayText(this.evidenceData.tcExtractedData.certTypeId);
            this.getExtractionStatus(ExtractionStatuses.COMPLETED);
            this.isPartiallyExtracted(extractedData['tcExtractedData']);
            this.isExtracting = false;
            this.isExtractedDataAvailable = true;
            this.disableFields = true;
            if (this.extractedData.tcExtractedData.productInfo === null) {
                this.addProductInfo();
            }
            // Mark all fields touched
            Object.keys(this.evidenceForm.form.controls).forEach(key => {
                console.log(`key = ${key}`);
                this.evidenceForm.form.get(key).markAsTouched();
            });
        }
    }

    selectCountry(event, type, product) {
        if (!product.yarnCOO || !product.yarnCOO.country) {
            product.yarnCOO = {
                country: []
            };
        }

        if (!product.cottonLintCOO || !product.cottonLintCOO.country) {
            product.cottonLintCOO = {
                country: []
            };
        }

        if (event.length > 0) {
            if (type === 'yarn') {
                product.yarnCOO.country = JSON.parse(JSON.stringify(event));
            } else {
                product.cottonLintCOO.country = JSON.parse(JSON.stringify(event));
            }
        }
    }

    selectYarnCOO(event, product) {
        if (!product.yarnCOO || product.yarnCOO === null) {
            product.yarnCOO = {
                country: []
            };
        }
        if (event) {
            product.yarnCOO.country = [event];
        } else {
            product.yarnCOO.country = [];
        }
    }

    yarnCottonLintProductItemTransform() {
        if (this.evidenceData.tcExtractedData.facility /*&& this.tierContext === 'tr_tier1'*/) {
            this.evidenceData.tcExtractedData.facility.key = this.evidenceData.tcExtractedData.facility.reference_id;
            this.evidenceData.tcExtractedData.facility.value = this.evidenceData.tcExtractedData.facility.name;
        }
        this.evidenceData.tcExtractedData.productInfo.forEach(product => {
            if (product && product.yarnCOO && product.yarnCOO.country) {
                product.yarnCOO.country = JSON.parse(
                    JSON.stringify(product.yarnCOO.country.map(country => country.name))
                );
            }
        });

        this.evidenceData.tcExtractedData.productInfo.forEach(product => {
            if (product && product.cottonLintCOO && product.cottonLintCOO.country) {
                product.cottonLintCOO.country = JSON.parse(
                    JSON.stringify(product.cottonLintCOO.country.map(country => country.name))
                );
            }
            if (product && product.productItem /*&& this.tierContext === 'tr_tier1'*/) {
                product.productItem.key = product.productItem.material_unique_code;
                product.productItem.value = product.productItem.internal_article_name;
            }
        });
    }

    hasValidProductNames() {
        const productNames = this.evidenceData.tcExtractedData.productInfo.map(product => product.productName);
        this.evidenceService.hasValidProductNames(productNames).subscribe(response => {
            if (response) {
                this.yarnCottonLintProductItemTransform();
                /*if (this.tierContext === 'tr_tier1') {*/
                this.evidenceService
                    .hasMatchingMaterialComposition(this.evidenceData.tcExtractedData.productInfo)
                    .subscribe(response1 => {
                        if (response1 && response1['lots'].length === 0) {
                            this.isMCMatch = true;
                            this.submitData();
                        } else {
                            this.isMCMatch = false;
                            const dialogDataObj =
                                'Material Composition does not match for the Lot(s) ' + response1['lots'].join(', ');
                            this.openConfirmationDialogForMaterialComposition(dialogDataObj);
                        }
                    });
                /*} else {
                    this.isMCMatch = true;
                    this.submitData();
                }*/
            } else {
                this.toastr.error('Invalid material composition. Kindly check the product details', 'Error', {
                    disableTimeOut: true
                });
                this.pageLoading = false;
            }
        });
    }

    getProductName(item) {
        let displayText = '';
        if (item) {
            if (this.tierContext === this.tiers[0]) {
                if (item.product_unique_code) {
                    displayText += item.product_unique_code + '-';
                }

                if (item.name) {
                    displayText += item.name;
                }
            } else {
                if (item.material_unique_code) {
                    displayText += item.material_unique_code + '-';
                }

                if (item.internal_article_name) {
                    displayText += item.internal_article_name;
                }
            }
        }
        if (displayText.endsWith('-')) {
            displayText = displayText.slice(0, -1);
        }
        return displayText;
    }

    searchStyleOrArticle(event, product) {
        /* if (!this.evidenceData.tcExtractedData.facility || !this.evidenceData.tcExtractedData.facility.key) {
            this.soaUniqueName = '';
            product.productItem = '';
            return;
        } */

        this.soaUniqueName = product.productItem;
        if (event.key !== '') {
            this.searchFreeHand(this.soaUniqueName);
        }
        if (event.target.value.trim('') === '') {
            this.soaUniqueName = { product_unique_code: '', supplier: [] };
        }
    }

    validateSelectedProduct(product) {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (this.soaUniqueName.hasOwnProperty('product_unique_code') || !this.soaUniqueName) {
                return;
            }

            let matchedItems = this.searchData.filter(x => x.internal_article_number.includes(this.soaUniqueName));

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.soaUniqueName = '';
                product.productItem = '';
            }
        }, 100);
    }

    searchFreeHand(searchTerm) {
        const searchPayload = {
            brandContextId: '',
            filter: {}
        };

        searchPayload['brandContextId'] =
            this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : '000000000000000000000000';

        if (!searchTerm || typeof searchTerm === 'object') {
            return;
        }
        // searchPayload['filter']['Internal Article Number'] = [];
        // searchPayload['filter']['Internal Article Number'].push(searchTerm);

        searchPayload['filter']['Material Unique Code'] = [];
        searchPayload['filter']['Material Unique Code'].push(searchTerm);

        /* if (
            this.evidenceData.tcExtractedData &&
            this.evidenceData.tcExtractedData.facility &&
            this.evidenceData.tcExtractedData.facility.key
        ) {
            searchPayload['filter']['Supplier Facility'] = [this.evidenceData.tcExtractedData.facility.key];
        } */
        this.transactionsService.searchFreeHandMaterial(searchPayload).subscribe(
            response => {
                this.processSearchResult(response, searchTerm);
            },
            () => {
                this.processSearchError(searchTerm);
            }
        );
    }

    private processSearchError(searchTerm) {
        if (searchTerm && searchTerm.length >= 3) {
            this.searchData = [];
            this.hintColor = 'red';
            //this.soaSearchHintText = 'No results found';
        }
    }
    private processSearchResult(response, searchTerm) {
        this.searchRawData = response['data'].searchResponse;
        if (this.searchRawData.length > 0) {
            // used to check only unique values are pushed to this.searchData
            this.searchData = this.filterForUniqueSOAValue(this.searchRawData);
            this.hintColor = '';
            this.soaSearchHintText = '';
        } else {
            if (searchTerm && searchTerm.length >= 3) {
                this.searchData = [];
                this.hintColor = 'red';
                this.soaSearchHintText = '';
                //this.soaSearchHintText = 'No results found';
            }
        }
    }

    private filterForUniqueSOAValue(rawSOAData) {
        const filteredSOATerms = [];
        const filteredSOAData = [];
        rawSOAData.forEach(el => {
            if (this.tierContext === this.tiers[0]) {
                if (filteredSOATerms.indexOf(el.product_unique_code) === -1) {
                    filteredSOATerms.push(el.product_unique_code);
                }
            } else {
                if (filteredSOATerms.indexOf(el.material_unique_code) === -1) {
                    filteredSOATerms.push(el.material_unique_code);
                }
            }
            filteredSOAData.push(el);
        });
        return filteredSOAData;
    }

    validateSelectedFacility() {
        setTimeout(() => {
            if (this.searchTermFacility.hasOwnProperty('reference_id') || !this.searchTermFacility) {
                return;
            }

            let matchedItems = this.facilities.filter(x => x.reference_id === this.searchTermFacility);

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.searchTermFacility = '';
                this.facilities = [];
            }
        }, 100);
    }

    searchFacility(event) {
        if (event.key !== '') {
            const facilityIndex = this.config.facilities.findIndex(
                facility => facility.reference_id === this.searchTermFacility
            );
            if (facilityIndex !== -1) {
                this.facilities = [];
                this.facilities.push(this.config.facilities[facilityIndex]);
            } else {
                if (typeof this.searchTermFacility !== 'object') {
                    this.searchFreeHandFacility(this.searchTermFacility);
                }
            }
        }
    }

    onMaterialSelection(productItem) {
        const errorMsg = 'MLM ID entered is not associated with selected Supplier Facility UID';
        if (this.checkIfFacilitySelected()) {
            if (
                this.evidenceData.tcExtractedData.facility.supplier_facility_id !== productItem.supplier[0].facility_id
            ) {
                this.toastr.error(errorMsg, 'Error', {
                    disableTimeOut: true
                });
            }
        } else {
            this.searchData = [];
            this.hintColor = 'red';
            this.soaSearchHintText = '';
        }
    }

    onFacilitySelection(value, evidenceData) {
        this.facilityValidSC = true;
        /* evidenceData.tcExtractedData.facility = {
            key: value.reference_id,
            value: value.name
        }; */

        /* evidenceData.tcExtractedData.productInfo.forEach(product => {
            if (product.productItem && product.productItem.supplier.length > 0 && product.productItem.supplier[0]) {
                if (value.supplier_facility_id !== product.productItem.supplier[0].facility_id) {
                    product.productItem = null;
                }
            }
        }); */
        const selectedFacilityName = value.name.endsWith(' - ' + value.reference_id)
            ? value.name.replace(' - ' + value.reference_id, '')
            : value.name.endsWith(value.reference_id)
            ? value.name.replace(value.reference_id, '')
            : value.name;
        if (
            evidenceData.tcExtractedData &&
            evidenceData.tcExtractedData.sellerOfProduct &&
            evidenceData.tcExtractedData.sellerOfProduct.value.includes(selectedFacilityName)
        ) {
            this.scService.hasValidSCForComapany(value.supplier_facility_id).subscribe(response => {
                const errorMsg = 'The selected supplier facility UID does not have a valid Scope Certificate';
                if (response) {
                    this.facilityValidSC = true;
                    if (this.evidenceData.systemMessages.includes(errorMsg)) {
                        const index = this.evidenceData.systemMessages.indexOf(errorMsg);
                        if (index !== -1) {
                            this.evidenceData.systemMessages.splice(index, 1);
                        }
                    }
                } else {
                    this.facilityValidSC = false;
                    this.toastr.error(
                        'The selected supplier facility UID does not have a valid Scope Certificate, please submit this request to Brand for review',
                        '',
                        { disableTimeOut: true }
                    );
                    if (!this.evidenceData.systemMessages.includes(errorMsg)) {
                        this.evidenceData.systemMessages.push(errorMsg);
                    }
                }
            });
        } else {
            const errorMsg = 'Seller does not match with selected supplier facility UID';
            this.facilityValidSC = false;
            this.toastr.error(
                'The selected supplier facility UID does not match with the Seller, please submit this request to Brand for review',
                '',
                { disableTimeOut: true }
            );
            if (!this.evidenceData.systemMessages.includes(errorMsg)) {
                this.evidenceData.systemMessages.push(errorMsg);
            }
        }
        evidenceData.tcExtractedData.facility = value;
    }

    searchFreeHandFacility(searchTermFacility) {
        this.facilityValidSC = true;
        const searchPayload = {};
        searchPayload['brandContextId'] =
            this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : '000000000000000000000000';
        searchPayload['filter'] = {
            'Reference Id': [searchTermFacility]
        };

        if (
            !this.evidenceData.tcExtractedData ||
            !this.evidenceData.tcExtractedData.sellerOfProduct ||
            !this.evidenceData.tcExtractedData.sellerOfProduct.value
        ) {
            this.searchTermFacility = '';
            this.toastr.error('Enter Seller first', 'Error', {
                disableTimeOut: true
            });
            return;
        }

        if (!searchTermFacility || typeof searchTermFacility === 'object') {
            return;
        }

        this.transactionsService.getFacilities(searchPayload).subscribe(response => {
            this.facilityRawData = response['data'].searchResponse;
            if (this.facilityRawData.length > 0) {
                this.facilities = JSON.parse(JSON.stringify(this.facilityRawData));
                this.hintColorFacility = '';
                this.facilitySearchHintText = '';
            } else {
                if (this.facilities.length === 0) {
                    this.hintColorFacility = 'red';
                    this.facilitySearchHintText = 'No results found';
                } else {
                    this.hintColorFacility = '';
                    this.facilitySearchHintText = '';
                }
            }
        });
    }

    getFacilityName(item) {
        if (item != null && item.reference_id != null) {
            return `${item.reference_id}-${item.name}`;
        }
    }

    checkIfFacilitySelected(): boolean {
        let flag = false;
        if (this.evidenceData.tcExtractedData.facility) {
            if (!this.evidenceData.tcExtractedData.facility.key) {
                if (!this.evidenceData.tcExtractedData.facility.supplier_facility_id) {
                    this.toastr.error('Select the Supplier Facility UID first', 'Error', {
                        disableTimeOut: true
                    });
                } else {
                    flag = true;
                }
            } else {
                flag = true;
            }
        }

        return flag;
    }

    submitData() {
        if (this.checkEnteredQuantity() && this.checkIfReasonSelected()) {
            this.evidenceData.ttDocumentId = this.extractedData.id;
            this.evidenceData.companyId = this.extractedData.companyId;
            this.evidenceData.creationDate = this.adjustDateForCreationDate(new Date());
            this.evidenceData.certId = this.uploadedFile.id;
            this.evidenceData.certType = this.certificationType;
            this.evidenceData.brandId = this.brandCompanyId;
            this.evidenceData.tierId = this.tierContext;
            // this.evidenceData.tcExtractedData.isTrader = this.traderChecked;
            // Modified data exists
            if (this.evidenceData.workflowStatus) {
                this.evidenceData.comments.selectedComments = [];
                this.reasons.forEach(reason => {
                    if (reason.checked) {
                        this.evidenceData.comments.selectedComments.push(reason.name);
                    }
                });
            } else {
                if (
                    !this.extractedData.tcExtractedData.buyerOfProduct.isExist ||
                    !this.extractedData.tcExtractedData.consigneeOfProduct.isExist ||
                    /*this.tierContext === 'tr_tier1' &&*/ !this.isMCMatch ||
                    !this.facilityValidSC
                ) {
                    this.evidenceData.workflowStatus = 'PENDING';
                } else {
                    this.evidenceData.workflowStatus = 'APPROVED';
                }
            }

            if (!this.isExtractedDataAvailable) {
                this.evidenceData.tcExtractedData.certTypeId = this.certStd;
            }

            /* if (this.tierContext === 'tr_tier1') {
                this.checkIfMaterialsAssociatedToT2Facility(this.evidenceData.tcExtractedData);
            } */

            this.evidenceService.submitEvidence(this.evidenceData).subscribe(
                responseData => {
                    if (responseData['message'] === 'success') {
                        let dialogData = [];
                        let dialogDataObj = {};

                        if (responseData['data']['inboundTCResponse']['workflowRequest']) {
                            dialogDataObj = {
                                title: 'Request submitted for Approval'
                            };
                            dialogData.push(JSON.parse(JSON.stringify(dialogDataObj)));
                        } else {
                            if (
                                responseData['data']['inboundTCResponse'] &&
                                responseData['data']['inboundTCResponse']['successLotIds'].length !== 0
                            ) {
                                dialogDataObj = {
                                    title: 'Transaction Created for the following lots',
                                    msg: responseData['data']['inboundTCResponse']['successLotIds']
                                };
                                dialogData.push(JSON.parse(JSON.stringify(dialogDataObj)));
                            }

                            if (
                                responseData['data']['inboundTCResponse'] &&
                                responseData['data']['inboundTCResponse']['duplicateLotIds'].length !== 0
                            ) {
                                dialogDataObj = {
                                    title: 'Duplicate Lot Ids',
                                    msg: responseData['data']['inboundTCResponse']['duplicateLotIds']
                                };
                                dialogData.push(JSON.parse(JSON.stringify(dialogDataObj)));
                            }
                        }

                        this.openConfirmationDialog(dialogData);
                    } else {
                        const errorMsg = responseData['data']['error'];
                        if (this.modalOpen) {
                            this.toastr.error(errorMsg, 'Error', { disableTimeOut: true });
                        }
                    }
                    this.pageLoading = false;
                },
                failResponse => {
                    const errorMessage = 'File could not be submitted. Please try after some time.';
                    if (this.modalOpen) {
                        this.toastr.error(
                            this.commonServices.getTranslation(errorMessage),
                            this.commonServices.getTranslation('Failed'),
                            { disableTimeOut: true }
                        );
                    }
                    this.pageLoading = false;
                }
            );
        }
    }

    adjustDateForCreationDate(date: Date): Date {
        let timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
        date.setTime(date.getTime() - timeOffsetInMS);
        return date;
    }

    displayMaterialComposition(productItem) {
        let materialComposition = '';
        if (typeof productItem === 'object') {
            const mcList = productItem
                ? productItem.material_composition
                    ? productItem.material_composition
                    : []
                : [];
            mcList.forEach(mc => {
                materialComposition += mc.composition + '% ' + mc.value + ',';
            });
        }
        return materialComposition !== '' ? materialComposition.slice(0, -1) : materialComposition;
    }

    isPartiallyExtracted(tcExtractedData) {
        let breakFlag = false;
        const excludeKeys = [
            'bodyIssuingCertificate',
            'placeAndDateOfIssue',
            'licenseCode',
            'facility',
            'inspectionBody',
            'lastProcessorOfProducts',
            'countryOfConsignee',
            'productAndShipmentInformation',
            'grossWeight',
            'commercialWeight',
            'scExpired',
            'trader',
            'cottonLintCOO',
            'grossWeight',
            'labelGrade',
            'materialComposition',
            'packedIn',
            'productItem',
            'supplierForTraderTC',
            'yarnCOO'
        ];
        for (const key of Object.keys(tcExtractedData)) {
            if (!excludeKeys.includes(key)) {
                if (!tcExtractedData[key]) {
                    this.getExtractionStatus(ExtractionStatuses.PARTIALLY_COMPLETED);
                    breakFlag = true;
                    break;
                } else if (key === 'productInfo') {
                    for (const product of tcExtractedData[key]) {
                        for (const productInfoKey of Object.keys(product)) {
                            if (!excludeKeys.includes(productInfoKey)) {
                                if (!product[productInfoKey]) {
                                    this.getExtractionStatus(ExtractionStatuses.PARTIALLY_COMPLETED);
                                    breakFlag = true;
                                    break;
                                }
                            }
                        }
                        if (breakFlag) {
                            break;
                        }
                    }
                }
            }
            if (breakFlag) {
                break;
            }
        }
    }

    checkIfMaterialsAssociatedToT2Facility(tcExtractedData: IExtractedDetail) {
        const materialArr = [];
        const facilityId = tcExtractedData.facility.supplier_facility_id;

        tcExtractedData.productInfo.forEach(product => {
            if (product.productItem.supplier[0].facility_id !== facilityId) {
                materialArr.push(product.productItem.internal_article_number);
            }
        });

        if (materialArr.length !== 0) {
            this.evidenceData.systemMessages.push(
                'MLM IDs ' + materialArr.join(',') + ' are not associated to selected Supplier Facility UID'
            );
        }
    }
}
