import { CertificateManagerService } from './../../components/certificate-manager/certificate-manager.service';
import { environment } from './../../../../environments/environment';
import { CommonServices } from './../../commonServices/common.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from './../../utils/utils.service';
import { AuthService } from '../../../core';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

@Component({
    selector: 'app-upload-certificate-list',
    templateUrl: './upload-certificate-list.component.html',
    styleUrls: ['./upload-certificate-list.component.scss']
})
export class UploadCertificateListComponent implements OnInit {
    pageLoading = false;
    item;
    unique_id = '';
    fileInput = '';
    isUploading: any = [];
    isDeleting: any = [];

    constructor(
        private dialogRef: MatDialogRef<UploadCertificateListComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService,
        private commonServices: CommonServices,
        private toastrService: CustomToastrService,
        private certificateManagerService: CertificateManagerService,
        public authService: AuthService
    ) {}

    ngOnInit() {
        this.item = this.data.item;
        this.unique_id = this.commonServices.makeId(5);
        this.fileInput = `file_upload_${this.unique_id}`;
    }

    closeDialog() {
        this.dialogRef.close();
    }

    getFileNameFromUrl(url: string) {
        return url.substring(url.lastIndexOf('/') + 1);
    }

    uploadFile(files: FileList, uniqueId) {
        if (
            this.item.ttCertificate.companyId &&
            this.authService.user.companyId !== this.item.ttCertificate.companyId
        ) {
            this.item.evidenceId = '';
        }
        const data = {
            certificateId: this.item.evidenceId,
            Certificate_Type: this.item.certId,
            Certification_Body: this.item.ttCertificate.body,
            Certificate_Expiry_Date: this.item.ttCertificate.expiryDate,
            Entity_Type: this.item.ttCertificate.entityType,
            Category: this.item.category,
            Entity_Id: this.item.ttCertificate.entityId,
            Uploaded_Files: this.item.ttCertificate.uploadedFiles
        };
        const payload = JSON.parse(JSON.stringify(data));
        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (
            !fileExtension ||
            fileExtension === '' ||
            environment.config.allowedExtensions['certificates'].indexOf(fileExtension.toLowerCase()) === -1
        ) {
            this.toastrService.error('This file format is not supported');
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            this.toastrService.info(
                'File size should be within ' +
                    environment.config.maximumFileUploadSize +
                    'MB. Chosen file is ' +
                    fileSizeString +
                    'MB'
            );
            return;
        }

        this.isUploading[uniqueId] = true;

        this.certificateManagerService.uploadFile(fileToUpload, payload).subscribe(
            response => {
                this.toastrService.success('File uploaded', 'Success');
                this.item.ttCertificate.uploadedFiles = response.uploadedFiles;
                this.item.ttCertificate.companyId = response.companyId;
                this.item['evidenceId'] = response.id;
                this.isUploading[uniqueId] = false;
            },
            uploadFileErrorResponse => {
                if (uploadFileErrorResponse['error']['message'].indexOf('dupliccoate key error') !== -1) {
                    this.toastrService.error('A record with identical details already exist.', 'Duplicate entry');
                } else {
                    this.toastrService.error('The file could not be uploaded.', 'Error Uploading File!');
                }
                this.isUploading[uniqueId] = false;
            }
        );
    }

    removeFile(certificateId, fileName, fileIndex) {
        const file = this.getFileNameFromUrl(fileName);
        this.isDeleting[fileIndex] = true;
        this.certificateManagerService.deleteFile(certificateId, file).subscribe(
            removeFileResponse => {
                this.item['ttCertificate'].uploadedFiles = removeFileResponse.uploadedFiles;
                this.isDeleting[fileIndex] = false;
            },
            removeFileErrorResponse => {
                // this.isRemovingFile[fileIndex] = false;
                this.isDeleting[fileIndex] = false;
            }
        );
    }
}
