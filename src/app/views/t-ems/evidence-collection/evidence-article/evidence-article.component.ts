import { environment } from './../../../../../environments/environment';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonServices } from './../../../../shared/commonServices/common.service';
import { UploadCertificateListComponent } from './../../../../shared/modals/upload-certificate-list/upload-certificate-list.component';
import { LocalizationService } from './../../../../shared/utils/localization.service';
import { CertificateManagerService } from '../../../../shared/components/certificate-manager/certificate-manager.service';
import { AuthService } from '../../../../core';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-evidence-article',
    templateUrl: './evidence-article.component.html',
    styleUrls: ['./evidence-article.component.scss']
})
export class EvidenceArticleComponent implements OnInit {
    @Input() item;
    @Input() listIndex;
    @Input() trId;
    @Output() handleDelete = new EventEmitter();

    @ViewChild('updateBodyInput', { static: true }) updateBodyInput: ElementRef;

    unique_id = '';
    fileInput = '';
    uploadedCertificates: any;

    selectedCertificateCategory;
    isUploading: any = [];

    constructor(
        private commonServices: CommonServices,
        public dialog: MatDialog,
        public localizationService: LocalizationService,
        private toastrService: CustomToastrService,
        private certificateManagerService: CertificateManagerService,
        public authService: AuthService
    ) {}

    ngOnInit() {
        this.unique_id = this.commonServices.makeId(8);
        this.fileInput = `file_upload_${this.unique_id}`;
        if (!this.item.ttCertificate) {
            this.item['ttCertificate'] = {};
            this.item['ttCertificate'].body = '';
            this.item['ttCertificate'].expiryDate = '';
            this.item['ttCertificate'].uploadedFiles = [];
            this.item['ttCertificate'].entityType = 'TRACEABILITY';
            this.item['ttCertificate'].category = '';
        } else {
            this.item['ttCertificate'].expiryDate = new Date(this.item['ttCertificate'].expiryDate);
        }

        fromEvent(this.updateBodyInput.nativeElement, 'keyup')
            .pipe(
                // get value
                map((event: any) => {
                    return event.target.value;
                }),
                // Time in milliseconds between key events
                debounceTime(500),
                // If previous query is diffent from current
                distinctUntilChanged()
                // subscription for response
            )
            .subscribe((text: string) => {
                this.updateCertificate();
            });
    }

    onEdit() {
        this.dialog.open(UploadCertificateListComponent, {
            width: '375px',
            height: '350px',
            data: {
                item: this.item
            }
        });
    }

    onDelete(item: any) {
        this.handleDelete.emit(item);
    }

    onSelectingCategory(category: string) {
        this.item.category = category;
    }
    isSystemCreated() {
        if (this.item.creationType && this.item.creationType === 'SYSTEM') {
            return true;
        }
        return false;
    }

    uploadFile(files: FileList, uniqueId) {
        if (
            this.item.ttCertificate.companyId &&
            this.authService.user.companyId !== this.item.ttCertificate.companyId
        ) {
            this.item.evidenceId = '';
        }
        const data = {
            Certificate_Type: this.item.certId,
            Certification_Body: this.item.ttCertificate.body,
            Certificate_Expiry_Date: this.item.ttCertificate.expiryDate,
            Entity_Type: this.item.ttCertificate.entityType,
            Category: this.item.category,
            Entity_Id: this.trId,
            certificateId: this.item.evidenceId || ''
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

    updateCertificate() {
        const data = {
            Certificate_Type: this.item.certId || '',
            Certification_Body: this.item.ttCertificate.body,
            Certificate_Expiry_Date: this.item.ttCertificate.expiryDate,
            Entity_Type: this.item.ttCertificate.entityType,
            Category: this.item.category,
            Entity_Id: this.trId,
            Uploaded_Files: this.item.ttCertificate.uploadedFiles
        };
        const payload = JSON.parse(JSON.stringify(data));
        let evidenceId = '';
        if (
            this.item['evidenceId'] !== undefined &&
            this.authService.user.companyId === this.item.ttCertificate.companyId
        ) {
            evidenceId = this.item['evidenceId'];
        }
        this.certificateManagerService.upsertCertificate(evidenceId, payload).subscribe(updateCertificateResponse => {
            this.item['evidenceId'] = updateCertificateResponse.id;
            this.item.ttCertificate.companyId = updateCertificateResponse.companyId;
        });
    }
}
