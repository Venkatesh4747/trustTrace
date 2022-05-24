import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { OrdersService } from '../../../views/orders/orders.service';
import { CertificateManagerService } from '../../components/certificate-manager/certificate-manager.service';
import { UtilsService } from '../../utils/utils.service';
import { CertificateValidationComponent } from '../../components/certificate-validation/certificate-validation.component';
import { AuthService } from '../../../core';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
@Component({
    selector: 'app-upload-transaction-documents',
    templateUrl: './upload-transaction-documents.component.html',
    styleUrls: ['./upload-transaction-documents.component.scss']
})
export class UploadTransactionDocumentsComponent implements OnInit {
    isUploading: any = {};
    env = environment;
    uploadFiles: any = {};
    validationDataForCertificateType = {};
    isSavingAssociation: boolean;
    isUploadingFiles = false;
    entity_type = 'TRANSACTION';
    certificateValidationStatusMap = {};
    newFilesUploaded = false;

    get checkAccess(): (name: string) => boolean {
        return this.authService.haveAccess.bind(this.authService);
    }

    constructor(
        private dialogRef: MatDialogRef<UploadTransactionDocumentsComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data,
        private certificateManagerService: CertificateManagerService,
        private ordersService: OrdersService,
        private toastr: CustomToastrService,
        public utilService: UtilsService,
        private analyticsService: AnalyticsService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.analyticsService.trackPageVisit('Transaction card view - upload documents modal');
        this.data.certificates_to_collect.forEach(certToCollect => {
            certToCollect.value = certToCollect.value + ' certificate';
        });
        this.data.certificates_to_collect.push({
            id: 'QUALITY_REPORT',
            value: 'quality report'
        });
        this.data.certificates_to_collect.push({
            id: 'OTHERS',
            value: 'other documents'
        });
        this.data.certificates_to_collect.forEach(certToCollect => {
            this.setAlreadyUploadedFiles(certToCollect.id);
        });
        if (this.data.entity_type) {
            this.entity_type = this.data.entity_type;
        }
    }

    setAlreadyUploadedFiles(certificateID) {
        let certificateDetails = null;
        let files = null;
        if (certificateID !== 'QUALITY_REPORT' && certificateID !== 'OTHERS') {
            certificateDetails = this.data.certList.filter(x => x.typeId === certificateID);
            if (certificateDetails && certificateDetails.length > 0) {
                files = JSON.parse(JSON.stringify(certificateDetails[0].uploadedFiles));

                if (certificateDetails[0].validationResponse && files && files.length > 0) {
                    this.validationDataForCertificateType[certificateID] = certificateDetails[0].validationResponse;
                    if (certificateDetails[0].validationResponse) {
                        this.certificateValidationStatusMap[certificateID] =
                            certificateDetails[0].validationResponse.validationStatus;
                    }
                }
            }
        } else if (certificateID === 'QUALITY_REPORT') {
            certificateDetails = JSON.parse(JSON.stringify(this.data.quality_report));
            if (certificateDetails && certificateDetails.length > 0) {
                files = JSON.parse(JSON.stringify(certificateDetails[0].fileName));
            }
        } else if (certificateID === 'OTHERS') {
            certificateDetails = JSON.parse(JSON.stringify(this.data.other_documents));
            if (certificateDetails && certificateDetails.length > 0) {
                files = JSON.parse(JSON.stringify(certificateDetails[0].fileName));
            }
        }

        if (certificateDetails && certificateDetails.length > 0) {
            if (!this.uploadFiles[certificateID]) {
                this.uploadFiles[certificateID] = {
                    certificateId: certificateDetails[0].id,
                    files: []
                };
            }

            for (let i = 0; i < files.length; i++) {
                const raw_fileName = files[i].substring(files[i].lastIndexOf('/') + 1);
                this.uploadFiles[certificateID].files[i] = {
                    fileUrl: files[i],
                    fileName: raw_fileName,
                    displayFileName: raw_fileName.substring(raw_fileName.indexOf('_') + 1)
                };
            }
        } else {
            this.uploadFiles[certificateID] = {
                certificateId: null,
                files: []
            };
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

    checkIfInvalidCertificatesPresent() {
        let invalidCertificatesPresent = false;
        if (this.certificateValidationStatusMap) {
            Object.keys(this.certificateValidationStatusMap).forEach(certTypeId => {
                invalidCertificatesPresent =
                    invalidCertificatesPresent || this.certificateValidationStatusMap[certTypeId] === false;
            });
        }

        return invalidCertificatesPresent;
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
            const certificateDetails = this.data.certList.filter(x => x.typeId === certificateId);
            let certificate_id = null;
            let uploadedFiles = [];

            if (certificateDetails && certificateDetails.length > 0) {
                uploadedFiles = JSON.parse(JSON.stringify(certificateDetails[0].uploadedFiles));
                certificate_id = JSON.parse(JSON.stringify(certificateDetails[0].id));
            }

            this.analyticsService.trackButtonClick(
                'Upload files button',
                'Transaction card view - upload documents modal',
                'Uploading files',
                certificate_id
            );

            const payload = {
                certificateId: certificate_id || null,
                Certificate_Type: certificateId,
                Certification_Body: '',
                Certificate_Expiry_Date: '',
                Entity_Type: this.entity_type,
                Category: 'PRODUCT',
                Uploaded_Files: uploadedFiles || [],
                Entity_Id: this.data.transaction.id
            };

            if (this.uploadFiles[certificateId].certificateId) {
                payload.certificateId = this.uploadFiles[certificateId].certificateId;
            }

            this.isUploading[certificateId] = true;

            this.certificateManagerService.uploadFile(fileToUpload, payload).subscribe(
                response => {
                    this.uploadFiles[certificateId] = {
                        certificateId: response.id,
                        files: []
                    };
                    this.analyticsService.trackSaveSuccess(
                        'Transaction card view - upload documents modal',
                        'File uploaded successfully',
                        this.uploadFiles[certificateId].certificateId
                    );
                    if (response.validationResponse) {
                        this.validationDataForCertificateType[certificateId] = response.validationResponse;
                    }
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
                    this.newFilesUploaded = true;
                },
                errorResponse => {
                    this.analyticsService.trackSaveFail(
                        'Transaction card view - upload documents modal',
                        'File uploaded failed',
                        certificate_id
                    );
                    this.isUploading[certificateId] = false;
                }
            );
        } else {
            let evidence_id = null;

            if (this.uploadFiles[certificateId]) {
                evidence_id = this.uploadFiles[certificateId].certificateId;
            }

            this.analyticsService.trackButtonClick(
                'Upload files button',
                'Transaction card view - upload documents modal',
                'Uploading files',
                evidence_id
            );

            this.isUploading[certificateId] = true;
            this.ordersService.uploadCertificate(evidence_id, fileToUpload, certificateId).subscribe(
                response => {
                    this.uploadFiles[certificateId] = {
                        certificateId: response.id,
                        files: []
                    };
                    this.analyticsService.trackSaveSuccess(
                        'Transaction card view - upload documents modal',
                        'File uploaded successfully',
                        this.uploadFiles[certificateId].certificateId
                    );
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
                },
                errorResponse => {
                    this.analyticsService.trackSaveFail(
                        'Transaction card view - upload documents modal',
                        'File uploaded failed',
                        evidence_id
                    );
                    this.isUploading[certificateId] = false;
                }
            );
        }
    }

    removeFile(id: any, index: number) {
        this.analyticsService.trackButtonClick(
            'Delete file button - trash icon',
            'Transaction card view - upload documents modal'
        );
        if (id !== 'QUALITY_REPORT' && id !== 'OTHERS') {
            this.certificateManagerService
                .deleteFile(this.uploadFiles[id].certificateId, this.uploadFiles[id].files[index].fileName)
                .subscribe(response => {
                    this.uploadFiles[id] = {
                        certificateId: response.id,
                        files: []
                    };
                    const files = JSON.parse(JSON.stringify(response.uploadedFiles));
                    this.validationDataForCertificateType[id] = response.validationData;
                    if (response.validationData) {
                        this.certificateValidationStatusMap[id] = response.validationResponse.validationStatus;
                    } else {
                        delete this.certificateValidationStatusMap[id];
                    }
                    if (files.length === 0) {
                        delete this.validationDataForCertificateType[id];
                    }
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

    saveAssociation() {
        this.analyticsService.trackSaveButtonClick(
            'Transaction card view - upload documents modal',
            'User clicked Upload Documents button',
            this.data.transaction.id,
            this.data.transaction.external_id
        );

        const certList = [];

        Object.keys(this.uploadFiles)
            .filter(key => !['QUALITY_REPORT', 'OTHERS'].includes(key))
            .forEach(x => {
                if (this.uploadFiles[x].certificateId) {
                    certList.push(this.uploadFiles[x].certificateId);
                }
            });

        const payload = {
            other_documents: [
                {
                    fileName: this.uploadFiles['OTHERS'].files.map(x => x.fileName),
                    id: this.uploadFiles['OTHERS'].certificateId
                }
            ],
            quality_report: [
                {
                    fileName: this.uploadFiles['QUALITY_REPORT'].files.map(x => x.fileName),
                    id: this.uploadFiles['QUALITY_REPORT'].certificateId
                }
            ],
            certList: certList
        };

        this.isSavingAssociation = true;

        this.ordersService
            .saveTransactionCertificateAssociation(this.data.transaction.id, payload, this.entity_type)
            .subscribe(
                response => {
                    this.analyticsService.trackSaveSuccess(
                        'Transaction card view - upload documents modal',
                        this.data.transaction.id,
                        this.data.transaction.external_id
                    );
                    this.isSavingAssociation = false;
                    this.newFilesUploaded = false;
                    this.processValidationData(response['data'].validationResponse);
                    if (!this.checkIfInvalidCertificatesPresent()) {
                        this.closeDialog();
                    }
                },
                errorResponse => {
                    this.analyticsService.trackSaveFail(
                        'Transaction card view - upload documents modal',
                        this.data.transaction.id,
                        this.data.transaction.external_id
                    );
                    this.isSavingAssociation = false;
                    console.log(errorResponse);
                    this.toastr.error(
                        'Something went wrong. We could not save your files. Please try again or contact support',
                        'Oops!'
                    );
                }
            );
    }

    public submit() {
        this.closeDialog();
    }
    public processValidationData(validationData) {
        if (validationData) {
            validationData.forEach(x => {
                if (x.validationResponse) {
                    this.certificateValidationStatusMap[x.typeId] = x.validationResponse.validationStatus;
                }
                this.validationDataForCertificateType[x.typeId] = x.validationResponse;
            });
        }
    }

    showDetailedValidationData(data) {
        const dialogRef = this.dialog.open(CertificateValidationComponent, {
            data: data
        });
    }
}
