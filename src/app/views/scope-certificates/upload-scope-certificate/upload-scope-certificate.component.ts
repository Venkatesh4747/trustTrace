import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import FileSaver from 'file-saver';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { UtilsService } from '../../../shared/utils/utils.service';
import {
    ApprovalStatuses,
    ExtractionStatuses,
    ExtractionStatusText,
    IExtractedData,
    IExtractedDetail,
    IKeyValue,
    IKeyValueCode,
    IScopeCertificateSubmitData
} from '../scope-certificates.model';
import { ScopeCertificatesService } from '../scope-certificates.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { ConfirmDialogComponent } from './../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { InformationConfirmDialogComponent } from './../../../shared/modals/information-confirm-dialog/information-confirm-dialog.component';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { IFacilityInfo } from './../scope-certificates.model';

const moment = _rollupMoment || _moment;

@Component({
    selector: 'app-upload-scope-certificate',
    templateUrl: './upload-scope-certificate.component.html',
    styleUrls: ['./upload-scope-certificate.component.scss']
})
export class UploadScopeCertificateComponent implements OnInit, OnDestroy {
    @ViewChild('scopeCertificateForm') scopeCertificateForm: NgForm;
    extractionStatusText = ExtractionStatusText;

    env = environment;

    config = {
        suppliers: [],
        facilities: [],
        CertificationStandard: []
    };
    params = {
        key: 'value',
        value: 'value',
        selectedKey: 'key'
    };

    certParams = {
        key: 'id',
        value: 'value',
        selectedKey: 'value'
    };

    supportedCerts = ['cer_grs', 'cer_rws', 'cer_rds', 'cer_rcs', 'cer_gots', 'cer_ocs'];
    fileToUpload: File;
    uploadedFile: any;
    uploadedSrcFile: any;
    master_standards: any[];

    certificationType: string = 'SC';
    fileType: string = 'CERT';
    extractionStatus: string = '';
    type: string = 'Scope Certificate';
    ttWorkflowId: string;

    showClose: boolean;
    isUploading: boolean = false;
    isExtracting: boolean = false;
    isExtractedDataAvailable: boolean = false;
    pageLoading: boolean = true;
    disableFields: boolean = true;
    modalOpen: boolean = false;
    isFacilityInfoEmpty: boolean = false;

    extractedData: IExtractedData;
    scopeCertificateData: IScopeCertificateSubmitData;
    certStd: string = '';
    brandCompanyId: string;

    facilityInfo: IFacilityInfo = {
        nameOfUnit: null,
        address: null,
        processes: null,
        doCreate: false,
        matchedData: {
            key: null,
            value: null,
            code: null
        }
    };
    scExtractedData: IExtractedDetail = {
        certTypeId: null,
        bodyIssuingCertificate: null,
        referenceNumber: null,
        sellerOfProduct: {
            id: null,
            value: null,
            matchedData: {
                key: null,
                value: null,
                code: null
            }
        },
        certStandard: null,
        validUntil: null,
        validFrom: null,
        placeAndDateOfIssue: null,
        facilityInfo: [
            {
                nameOfUnit: null,
                address: null,
                processes: null,
                doCreate: false,
                matchedData: {
                    key: null,
                    value: null,
                    code: null
                }
            }
        ]
    };

    submitHandlerCallback: Function;
    isEditMode: boolean = false;
    editBtnText: string = 'Edit';
    facilityList = [];

    reasons = [{ id: 1, name: 'SC extraction failure', checked: false }];
    disableEditButton: boolean = true;
    certArr: any = [];

    constructor(
        private dialogRef: MatDialogRef<UploadScopeCertificateComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService,
        private dialog: MatDialog,
        private toastr: CustomToastrService,
        private commonServices: CommonServices,
        private scopeCertificateServices: ScopeCertificatesService,
        public localeService: LocalizationService,
        private authService: AuthService
    ) {
        dialogRef.disableClose = true;
        this.showClose = data.showClose !== undefined ? data.showClose : true;
        this.certificationType = data.certificationType;
        this.type = data.type;
        this.submitHandlerCallback = data.submitHandler;
        this.ttWorkflowId = data.taskId;
    }

    ngOnInit() {
        this.resetForm();
        this.modalOpen = true;
        this.scopeCertificateServices.getSuppliersAndFacilities().subscribe(response => {
            this.localeService.addToMasterData(response['masterData']);
            // this.config.suppliers = response['data']['suppliers'];
            if (response['data']['facilities']) {
                this.config.facilities = response['data']['facilities'];
                this.facilityList = this.config.facilities;
                // this.facilityList.push({ key: 'Create new', value: 'Create new', code: null });
                // this.facilityList.push({ key: 'Not Available', value: 'Not Available', code: null });
            }
            if (response['data']['CertificationStandard']) {
                this.config.CertificationStandard = response['data']['CertificationStandard'].map(
                    (eachCS: IKeyValue) => ({
                        id: eachCS.key,
                        value: eachCS.value,
                        defaultValue: eachCS.value
                    })
                );
            }
            this.pageLoading = false;
        });

        this.brandCompanyId =
            this.authService.user.brandsAssociated && this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : null;
    }

    ngOnDestroy() {
        this.modalOpen = false;
    }

    resetApprovalStatusFormData(status) {
        this.scopeCertificateData.workflowStatus = status;
        this.scopeCertificateData.comments = {
            selectedComments: [],
            otherComments: ''
        };
    }

    resetForm(): void {
        this.isUploading = false;
        this.isExtracting = false;
        this.disableEditButton = true;
        this.isExtractedDataAvailable = false;
        this.uploadedFile = undefined;
        this.fileToUpload = undefined;
        this.certStd = '';
        this.extractionStatus = '';
        this.isFacilityInfoEmpty = true;
        this.extractedData = {
            id: null,
            certType: null,
            companyId: null,
            scExtractedData: JSON.parse(JSON.stringify(this.scExtractedData)),
            status: null
        };
        this.scopeCertificateData = {
            certId: null,
            ttDocumentId: null,
            certType: null,
            companyId: null,
            brandId: null,
            scExtractedData: JSON.parse(JSON.stringify(this.scExtractedData)),
            status: null,
            creationDate: null,
            notifyTT: false
        };
        this.resetApprovalStatusFormData(ApprovalStatuses.APPROVED);
    }

    closeUploadScopeCertificate(certId, fileName): void {
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

    deleteScopeCertificate(certId, fileName): void {
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
                this.resetForm();
                if (certId) {
                    //this.deleteCertificate(certId,fileName);
                    this.removeDocument(certId);
                    this.editBtnText = 'Edit';
                    this.isEditMode = false;
                    this.disableFields = true;
                    this.scopeCertificateData.notifyTT = false;
                    this.resetApprovalStatusFormData(ApprovalStatuses.APPROVED);
                }
            }
        });
        this.isUploading = false;
    }

    downloadScopeCertificate(certId: string, fileName: string) {
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

    deleteCertificate(certId, fileName) {
        const payload = {
            certId: certId,
            fileName: fileName
        };
        this.commonServices.deleteCertificate(payload).subscribe();
        this.reasons.forEach(reason => {
            reason.checked = false;
        });
        this.scopeCertificateData.notifyTT = false;
    }

    uploadFile(files): void {
        this.disableFields = true;
        this.isUploading = true;
        if (files.length === 0) {
            return;
        }
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
            this.isUploading = false;
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            this.toastr.error(
                `File size should be within ${environment.config.maximumFileUploadSize}MB.
              Chosen file is ${fileSizeString}MB, File Size too large!`
            );
            this.isUploading = false;
            return;
        }
        this.scopeCertificateServices.uploadFile(this.fileToUpload, this.fileType).subscribe(
            response => {
                // Process uploaded file response
                this.processUploadedFileResponse(response);

                // Extract the uploaded file
                this.extractUploadedScopeCertificate();
            },
            failResponse => {
                const errorMessage = 'File could not be uploaded. Please try after some time.';
                this.toastr.error(
                    this.commonServices.getTranslation(errorMessage),
                    this.commonServices.getTranslation('Failed'),
                    { disableTimeOut: true }
                );
                this.isUploading = false;
            }
        );
    }

    getFileNameFromUrl(url: string) {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        return fileName.substring(fileName.indexOf('_') + 1);
    }

    processUploadedFileResponse(uploadedData): void {
        const data = uploadedData['data'];
        this.uploadedFile = {
            id: data.id,
            name: this.getFileNameFromUrl(data.uploadedFiles[0]),
            fullName: data.uploadedFiles[0].substring(data.uploadedFiles[0].lastIndexOf('/') + 1)
        };
        this.isUploading = false;
    }

    extractUploadedScopeCertificate(): void {
        this.isExtracting = true;
        this.isExtractedDataAvailable = false;
        const payload = { certId: this.uploadedFile['id'], certType: this.certificationType };
        this.getExtractionStatus(ExtractionStatuses.EXTRACTING);
        this.scopeCertificateServices.extractUploadedScopeCertificate(payload).subscribe(
            data => {
                if (data.hasOwnProperty('error')) {
                    if (this.modalOpen) {
                        this.toastr.error(data['error'], 'Error', { disableTimeOut: true });
                    }
                    this.getExtractionStatus(ExtractionStatuses.FAILED);
                    this.isExtracting = false;
                    this.isExtractedDataAvailable = false;
                    if (data['error'] !== 'Duplicate Certificate') {
                        this.disableFields = false;
                        this.reasons[0].checked = true;
                        this.scopeCertificateData.notifyTT = true;
                        this.editBtnText = 'Cancel the edit';
                        this.isEditMode = true;
                        this.disableEditButton = false;
                    } else {
                        this.disableEditButton = true;
                        this.disableFields = false;
                        this.reasons[0].checked = false;
                        this.scopeCertificateData.notifyTT = false;
                        this.editBtnText = 'Edit';
                        this.isEditMode = false;
                    }
                    this.resetApprovalStatusFormData(ApprovalStatuses.APPROVED);
                } else {
                    this.disableEditButton = false;
                    this.extractedData = JSON.parse(JSON.stringify(data['data']));
                    this.scopeCertificateData.scExtractedData = JSON.parse(
                        JSON.stringify(data['data']['scExtractedData'])
                    );
                    this.certStd = this.localeService.getDisplayText(
                        this.scopeCertificateData.scExtractedData.certTypeId
                    );

                    // this.removeSelectedFacilityFromList();

                    // Reset seller of product
                    if (this.extractedData.scExtractedData.sellerOfProduct === null) {
                        this.scopeCertificateData.scExtractedData.sellerOfProduct = {
                            value: null,
                            matchedData: {
                                key: null,
                                value: null,
                                code: null
                            }
                        };
                    }

                    this.getExtractionStatus(ExtractionStatuses.COMPLETED);
                    this.isPartiallyExtracted(this.extractedData.scExtractedData);
                    if (this.extractedData.scExtractedData.facilityInfo === null) {
                        this.addFacilityInfo();
                    } else {
                        this.isFacilityInfoEmpty = false;
                    }
                    this.isExtracting = false;
                    this.isExtractedDataAvailable = true;
                    this.disableFields = false;
                }
            },
            failResponse => {
                this.getExtractionStatus(ExtractionStatuses.FAILED);
                this.isExtracting = false;
                this.isExtractedDataAvailable = false;
                this.disableFields = false;
            }
        );
    }

    getExtractionStatus(statusCode: number): void {
        switch (statusCode) {
            case ExtractionStatuses.EXTRACTING:
                this.extractionStatus = 'Extraction in progress (can take up to a minute)...';
                break;
            case ExtractionStatuses.FAILED:
                this.extractionStatus = 'Extraction failed';
                break;
            case ExtractionStatuses.COMPLETED:
                this.extractionStatus = 'Extraction completed';
                break;
            case ExtractionStatuses.NOT_SUPPORTED:
                this.extractionStatus =
                    'Extraction for this certificate type is not supported, Please enter the data manually';
                break;
            case ExtractionStatuses.PARTIALLY_COMPLETED:
                this.extractionStatus = 'Extraction partially completed';
                break;
            default:
                this.extractionStatus = '';
                break;
        }
    }

    openConfirmationDialog(data: any): void {
        const confirmationDialog = this.dialog.open(InformationConfirmDialogComponent, {
            width: '474px',
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
                this.closeDialog();
                this.resetForm();
            }
        });
    }

    checkForDuplicateNames() {
        const dupArr = [];
        let dupFlag = false;
        for (const facility of this.scopeCertificateData.scExtractedData.facilityInfo) {
            const matchArr = this.facilityList.filter(f => facility.matchedData && f.key === facility.matchedData.key);
            if (matchArr.length > 0) {
                if (
                    dupArr.length !== 0 &&
                    !['Create new', 'Not Available'].includes(matchArr[0].key) &&
                    dupArr.includes(matchArr[0].key)
                ) {
                    dupFlag = true;
                    break;
                }
                if (matchArr.length > 0 && !['Create new', 'Not Available'].includes(matchArr[0].key)) {
                    dupArr.push(matchArr[0].key);
                }
            }
        }
        return dupFlag;
    }

    submitScopeCertificate(): void {
        if (this.checkIfReasonSelected()) {
            this.pageLoading = true;
            this.scopeCertificateData.ttDocumentId = this.extractedData.id;
            this.scopeCertificateData.companyId = this.extractedData.companyId;
            this.scopeCertificateData.certType = this.certificationType;
            this.scopeCertificateData.certId = this.uploadedFile['id'];
            this.scopeCertificateData.creationDate = this.adjustDateForCreationDate(new Date());
            this.scopeCertificateData.brandId = this.brandCompanyId;

            if (this.checkForDuplicateNames()) {
                this.toastr.error('Please select unique Facility Names for mapping', 'Invalid', {
                    disableTimeOut: true
                });
                this.pageLoading = false;
                this.editBtnText = 'Edit';
                this.isEditMode = false;
                this.disableFields = true;
                this.resetScopeCertificateData(this.extractedData.scExtractedData);
            } else {
                if (this.ttWorkflowId) {
                    this.scopeCertificateData.ttWorkflowId = this.ttWorkflowId;
                }

                if (this.scopeCertificateData.workflowStatus) {
                    this.scopeCertificateData.comments.selectedComments = [];
                    this.reasons.forEach(reason => {
                        if (reason.checked) {
                            this.scopeCertificateData.comments.selectedComments.push(reason.name);
                        }
                    });
                }

                if (this.scopeCertificateData.scExtractedData.validFrom) {
                    let validFrom = new Date(
                        this.commonServices.adjustDateForTimezone(
                            new Date(this.scopeCertificateData.scExtractedData.validFrom)
                        )
                    );
                    this.scopeCertificateData.scExtractedData.validFrom = validFrom.toISOString().split('T')[0];
                }

                if (this.scopeCertificateData.scExtractedData.validUntil) {
                    if (moment(this.scopeCertificateData.scExtractedData.validUntil).isAfter(moment())) {
                        let validUntil = new Date(
                            this.commonServices.adjustDateForTimezone(
                                new Date(this.scopeCertificateData.scExtractedData.validUntil)
                            )
                        );
                        this.scopeCertificateData.scExtractedData.validUntil = validUntil.toISOString().split('T')[0];
                    } else {
                        this.toastr.error('Valid until should be greater than today', 'Invalid', {
                            disableTimeOut: true
                        });
                        this.pageLoading = false;
                        return;
                    }
                }

                if (!this.isExtractedDataAvailable) {
                    this.scopeCertificateData.scExtractedData.certTypeId = this.certStd;
                }

                this.scopeCertificateServices.submitScopeCertificate(this.scopeCertificateData).subscribe(
                    responseData => {
                        let dialogData = [];
                        let dialogDataObj = {};
                        if (responseData['message'] === 'success') {
                            dialogDataObj = {
                                title: this.isEditMode
                                    ? 'SC submitted successfully'
                                    : 'Process activities are linked to the extracted facilities'
                            };
                            dialogData.push(JSON.parse(JSON.stringify(dialogDataObj)));
                            this.openConfirmationDialog(dialogData);
                            this.pageLoading = false;
                            if (this.submitHandlerCallback) {
                                this.submitHandlerCallback('SUBMIT_SUCCESS');
                            }
                            this.editBtnText = 'Edit';
                            this.isEditMode = false;
                            this.disableFields = true;
                        } else {
                            let errorMsg = '';
                            if (typeof responseData['data']['error'] === 'string') {
                                errorMsg = responseData['data']['error'];
                            } else {
                                errorMsg = responseData['data']['error'][0]['errorMsg'];
                            }
                            if (this.modalOpen) {
                                this.toastr.error(errorMsg, 'Error', { disableTimeOut: true });
                            }
                            this.pageLoading = false;
                            if (this.submitHandlerCallback) {
                                this.submitHandlerCallback('SUBMIT_ERROR');
                            }
                        }
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
    }

    addFacilityInfo() {
        if (!this.scopeCertificateData.scExtractedData.facilityInfo) {
            this.scopeCertificateData.scExtractedData.facilityInfo = [];
            this.isFacilityInfoEmpty = true;
        }
        this.scopeCertificateData.scExtractedData.facilityInfo.push(JSON.parse(JSON.stringify(this.facilityInfo)));
    }

    deleteFacilityInfo(index: number) {
        this.scopeCertificateData.scExtractedData.facilityInfo.splice(index, 1);
        //this.extractedData.scExtractedData.facilityInfo.splice(index, 1);
        if (this.scopeCertificateData.scExtractedData.facilityInfo.length === 0) {
            this.addFacilityInfo();
        } else {
            this.isFacilityInfoEmpty = false;
        }
    }

    onSelectingFacility(event: IKeyValueCode, index: number) {
        this.scopeCertificateData.scExtractedData.facilityInfo[index].matchedData = {
            key: event.key,
            value: event.value,
            code: event.code
        };
    }

    onSelectingSupplier(event: IKeyValueCode) {
        this.scopeCertificateData.scExtractedData.sellerOfProduct.matchedData = {
            key: event.key,
            value: event.value,
            code: event.code
        };
        this.scopeCertificateData.scExtractedData.sellerOfProduct.id = event.key;
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
                this.disableFields = true;
                this.scopeCertificateData.notifyTT = false;
                this.resetApprovalStatusFormData(ApprovalStatuses.APPROVED);
                // Remove approval status related items from the evidenceData
                //delete this.scopeCertificateData.workflowStatus;
                //delete this.scopeCertificateData.notifyTT;
            } else if (response === 'Yes') {
                this.isEditMode = true;
                this.editBtnText = 'Cancel the edit';
                this.disableFields = false;
                this.scopeCertificateData.notifyTT = false;
                this.resetApprovalStatusFormData(ApprovalStatuses.APPROVED);
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
                this.disableFields = true;
                this.scopeCertificateData.notifyTT = false;
                this.resetApprovalStatusFormData(ApprovalStatuses.APPROVED);
                this.resetScopeCertificateData(this.extractedData.scExtractedData);
                if (
                    !this.extractedData.scExtractedData.facilityInfo ||
                    this.extractedData.scExtractedData.facilityInfo.length === 0
                ) {
                    this.addFacilityInfo();
                } else {
                    this.isFacilityInfoEmpty = false;
                }
            } else if (response === 'Cancel') {
                this.isEditMode = true;
                this.editBtnText = 'Cancel the edit';
                this.disableFields = false;
                this.scopeCertificateData.notifyTT = false;
                this.resetApprovalStatusFormData(ApprovalStatuses.APPROVED);
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
            this.scopeCertificateData.notifyTT = false;
            this.resetApprovalStatusFormData(ApprovalStatuses.APPROVED);
        }
    }

    selectionChange(facilityInfo, value): void {
        if (value === 'Create new') {
            facilityInfo.doCreate = true;
        } else {
            facilityInfo.doCreate = false;
        }

        const matchArr = this.facilityList.filter(x => x.value === value);
        if (matchArr.length > 0) {
            facilityInfo.matchedData.key = matchArr[0].key;
            facilityInfo.matchedData.code = matchArr[0].code ? matchArr[0].code : 'Not Available';
            facilityInfo.matchedData.value = matchArr[0].value;
        }
        this.isFacilityInfoEmpty = false;
    }

    resetScopeCertificateData(data: IExtractedDetail) {
        this.scopeCertificateData.scExtractedData = JSON.parse(JSON.stringify(data));
    }

    removeSelectedFacilityFromList() {
        const facList = this.scopeCertificateData.scExtractedData.facilityInfo;
        facList.forEach(data => {
            const index = this.facilityList.findIndex(
                x => !['Create new', 'Not Available'].includes(x.key) && x.key === data.matchedData.key
            );
            if (index !== -1) {
                this.facilityList.splice(index, 1);
            }
        });
    }

    checkIfReasonSelected() {
        if (this.editBtnText === 'Cancel the edit' && this.extractionStatus === 'Extraction failed') {
            const val = this.reasons.some(reason => reason.checked);
            if (!val) {
                this.toastr.error('Kindly select reasons', 'Error', { disableTimeOut: true });
                this.pageLoading = false;
            }
            return val;
        } else {
            return true;
        }
    }

    adjustDateForCreationDate(date: Date): Date {
        let timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
        date.setTime(date.getTime() - timeOffsetInMS);
        return date;
    }

    isPartiallyExtracted(scExtractedData) {
        let breakFlag = false;
        const excludeKeys = ['certStandard', 'placeAndDateOfIssue', 'address', 'matchedData', 'doCreate'];
        for (const key of Object.keys(scExtractedData)) {
            if (!excludeKeys.includes(key)) {
                if (!scExtractedData[key]) {
                    this.getExtractionStatus(ExtractionStatuses.PARTIALLY_COMPLETED);
                    breakFlag = true;
                    break;
                } else if (key === 'facilityInfo') {
                    for (const facility of scExtractedData[key]) {
                        for (const facilityInfoKey of Object.keys(facility)) {
                            if (!excludeKeys.includes(facilityInfoKey)) {
                                if (!facility[facilityInfoKey]) {
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
}
