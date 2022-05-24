import { Component, Input, OnInit } from '@angular/core';
import * as FileSaver from 'file-saver';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../../environments/environment';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { ICertification } from './add-certifications.model';
import { AddCertificationsService } from './add-certifications.service';

@Component({
    selector: 'app-add-certifications',
    templateUrl: './add-certifications.component.html',
    styleUrls: ['./add-certifications.component.scss']
})
export class AddCertificationsComponent implements OnInit {
    public env = environment;
    @Input() certifications_types: any;
    @Input() trId: any;
    // @Input() certification: any;
    @Input() isDisabled: boolean;
    certifications: ICertification[] = [];
    certificate: ICertification = {
        type: '',
        attachmentId: '',
        files: []
    };
    selectedCertificateType: any = 'Select Certifications';
    uploadedFiles: any;

    constructor(
        private localeService: LocalizationService,
        private toastr: CustomToastrService,
        private addCertificationsService: AddCertificationsService
    ) {}

    ngOnInit() {
        this.addCertificationsService.getAllCertifications(this.trId).subscribe(response => {
            this.certifications = response['data']['CERTIFICATION'];
        });
    }

    addMoreCertifications() {
        this.selectedCertificateType = 'Select Certifications';
        this.certifications.push(this.certificate);
    }

    InvokeCertificationFileUpload(certificationType) {
        const element = document.getElementById('file_upload_' + certificationType);
        element.click();
    }

    uploadCertification(certificationType, files: FileList) {
        if (files.length === 0) {
            return;
        }
        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (
            !fileExtension ||
            fileExtension === '' ||
            environment.config.allowedFileExtensions.indexOf(fileExtension.toLowerCase()) === -1
        ) {
            this.toastr.error('This file format is not supported');
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            this.toastr.info(
                'File size should be within ' +
                    environment.config.maximumFileUploadSize +
                    'MB. Chosen file is ' +
                    fileSizeString +
                    'MB'
            );
            return;
        }
        this.addCertificationsService.uploadCertifications(certificationType, fileToUpload, this.trId).subscribe(
            response => {
                this.toastr.success('Certification uploaded', 'Success');
                this.certifications = response['data']['certificationFiles'];
            },
            () => {
                this.toastr.error('The file could not be uploaded.', 'Error Uploading File!');
            }
        );
    }

    getUploadedFile(attachmentId, fileName) {
        this.toastr.info('Requesting file. Please wait');
        this.addCertificationsService.getFile(attachmentId, fileName).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
            },
            failData => {
                this.toastr.error(`Failed to download file. Error: ${failData.error.error}`);
            }
        );
    }

    removeCertification(attachmentId, fileName) {
        this.addCertificationsService.removeFile(attachmentId, fileName, this.trId).subscribe(
            response => {
                this.toastr.success('Certification removed', 'Success');
                this.certifications = response['data']['certificationFiles'];
            },
            failData => {
                this.toastr.error(`Failed to remove file. Error: ${failData.error.error}`);
            }
        );
    }
}
