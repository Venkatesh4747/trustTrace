import { Component, Input, OnInit } from '@angular/core';
import { environment } from './../../../../environments/environment';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { CertificateUploadService } from '../../uploads/certificate/cert-upload.service';
import { CertificateTypeValue } from '../../uploads/interface/certificate-type-value-model';
import { OrdersService } from './../orders.service';
import { Subscription } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-upload-certificates',
    templateUrl: './upload-certificates.component.html',
    styleUrls: ['./upload-certificates.component.scss']
})
export class UploadCertificatesComponent implements OnInit {
    public env = environment;

    private certTypeToEvidenceIdMap: {} = {};
    selectedCertificateType: string = null;

    @Input() certifications;
    certEvidenceList = [];
    subscription: Subscription;
    certTypeValueList: CertificateTypeValue[] = [];
    certificationFile: File;
    fileUploadProgressPercentage: number = 0;
    optional = { key: 'key', value: 'value', selectedKey: 'key' };
    isRequired = true;
    uploadingFile: boolean;
    constructor(
        private toastr: CustomToastrService,
        public localService: LocalizationService,
        private ordersService: OrdersService,
        private certUploadService: CertificateUploadService
    ) {
        this.subscription = this.certUploadService.getCertificates().subscribe(certList => {
            this.certTypeValueList = certList;
            if (certList.length === 0) {
                this.certTypeToEvidenceIdMap = {};
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.certifications.forEach(element => {
            const kv = {
                key: element,
                value: this.localService.getDisplayText(element)
            };
            this.certEvidenceList.push(kv);
        });
    }

    uploadCertification(selectedCertificateType, files: FileList) {
        if (files.length === 0) {
            return;
        }
        this.uploadingFile = true;
        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = selectedCertificateType + '-' + fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (
            !fileExtension ||
            fileExtension === '' ||
            environment.config.allowedFileExtensions.indexOf(fileExtension.toLowerCase()) === -1
        ) {
            this.toastr.error('The chosen file extension is invalid and cannot be uploaded');
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

        // check this.uploadedCertInfo list contains the selectedCertificateType if then fetch the evidenceId
        if (selectedCertificateType) {
            this.ordersService
                .uploadCertificate(this.getEvidenceIdForTheType(selectedCertificateType), fileToUpload)
                .subscribe(
                    events => {
                        if (events.type === HttpEventType.UploadProgress) {
                            this.fileUploadProgressPercentage = Math.round((events.loaded / events.total) * 100);
                        } else if (events.type === HttpEventType.Response) {
                            //pass evidenceID
                            // when the response come populate UploadedCertificateInfo obj and push it
                            //  this.uploadedCertInfo.[]

                            let uploadedCertInfoObj: CertificateTypeValue = {
                                certType: '',
                                evidenceId: '',
                                fileName: []
                            };

                            // If previosuly there are some certificates
                            if (this.certTypeValueList.length !== 0) {
                                let isItemPresent = false;
                                for (let index = 0; index < this.certTypeValueList.length; index++) {
                                    if (this.certTypeValueList[index].evidenceId === events.body['data'].id) {
                                        uploadedCertInfoObj = this.certTypeValueList[index];
                                        uploadedCertInfoObj.fileName = events.body['data'].fileName;
                                        isItemPresent = true;
                                        break;
                                    }
                                }
                                if (!isItemPresent) {
                                    uploadedCertInfoObj.certType = selectedCertificateType;
                                    uploadedCertInfoObj.evidenceId = events.body['data'].id;
                                    uploadedCertInfoObj.fileName = events.body['data'].fileName;
                                    this.certTypeValueList.push(uploadedCertInfoObj);
                                }
                            } else {
                                uploadedCertInfoObj.certType = selectedCertificateType;
                                uploadedCertInfoObj.evidenceId = events.body['data'].id;
                                uploadedCertInfoObj.fileName = events.body['data'].fileName;
                                this.certTypeValueList.push(uploadedCertInfoObj);
                            }

                            this.certTypeToEvidenceIdMap[selectedCertificateType] = uploadedCertInfoObj.evidenceId;
                            this.certUploadService.setCertificates(this.certTypeValueList);
                            //clear the form data
                            this.selectedCertificateType = null;

                            this.toastr.success('file uploaded successfully', 'Success');
                            this.uploadingFile = false;
                        }
                    },
                    () => {
                        this.uploadingFile = false;
                        this.toastr.error('The file could not be uploaded.', 'Error Uploading File!');
                    }
                );
        } else {
            this.uploadingFile = false;
            this.toastr.error('Please select the associated certificate', 'failed');
        }
    }
    getEvidenceIdForTheType(selectedCertificateType: string): string {
        return this.certTypeToEvidenceIdMap[selectedCertificateType];
    }
}
