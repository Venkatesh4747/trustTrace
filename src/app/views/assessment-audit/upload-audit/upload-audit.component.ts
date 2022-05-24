import { AnalyticsService } from './../../../core/analytics/analytics.service';
import { AuditService } from './../../user/settings/company/audit.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { Component, OnInit } from '@angular/core';
import { environment } from './../../../../environments/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import FileSaver from 'file-saver';
import { Router } from '@angular/router';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-upload-audit',
    templateUrl: './upload-audit.component.html',
    styleUrls: ['./upload-audit.component.scss']
})
export class UploadAuditComponent implements OnInit {
    env = environment;
    uploadAuditForm: FormGroup = new FormGroup({});
    uploadedFile;
    fileType = this.env.certificateTypes.facilityAuditDraft;
    // Only PDF supported
    fileExtension = 'pdf';
    pageLoading = false; // Pipeline #1011  build fix
    auditStandards: any;
    formProcessing = false;

    constructor(
        private _formbuilder: FormBuilder,
        private toastr: CustomToastrService,
        private commonServices: CommonServices,
        private auditService: AuditService,
        private analyticsService: AnalyticsService,
        private router: Router
    ) {
        this.uploadAuditForm = this._formbuilder.group({
            auditStandard: ['', Validators.required],
            auditName: [''],
            auditDocument: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.analyticsService.trackEvent('Upload Audit Page', { Action: 'Upload audit page visited' });
        this.auditService.getAuditTemplates().subscribe(response => {
            this.auditStandards = JSON.parse(JSON.stringify(response['templates']));
        });
    }

    onCancelUploadAudit() {
        this.analyticsService.trackEvent('Upload Audit - Cancel', {
            Origin: 'Upload Audit Page',
            Action: 'Cancel Button Clicked'
        });
        this.commonServices.goBack(['/', 'assessment-audit']);
    }

    onExtractAuditDocument() {
        this.formProcessing = true;
        this.analyticsService.trackEvent('Upload Audit - Extract', {
            Origin: 'Upload Audit Page',
            Action: 'Extract Button Clicked'
        });
        const formDataValues = this.uploadAuditForm.value;
        const payload = {
            auditTypeId: formDataValues.auditStandard,
            auditName: formDataValues.auditName,
            attachmentId: formDataValues.auditDocument
        };
        this.auditService.auditDrafts(payload).subscribe(
            response => {
                this.formProcessing = false;
                this.toastr.success('Draft has been created', 'Success');
                this.router.navigate(['/', 'assessment-audit'], { fragment: 'Drafts' });
            },
            failResponse => {
                this.formProcessing = false;
                this.toastr.error('We could not submit your audit. Please try after some time', 'Oops!');
            }
        );
    }

    InvokeFileUpload() {
        const element = document.getElementById('file_upload');
        element.click();
    }

    uploadFile(files) {
        if (files.length === 0) {
            return;
        }

        if (this.uploadedFile) {
            this.toastr.info(
                'Document already uploaded. Kindly delete existing one to replace with a new document',
                'Info'
            );
            return;
        }

        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (!fileExtension || fileExtension === '' || fileExtension !== this.fileExtension) {
            this.toastr.error('Please use a supported file format: pdf', 'Unsupported File Extension');
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            this.toastr.error(
                `File size should be within ${environment.config.maximumFileUploadSize}MB.
                Chosen file is ${fileSizeString}MB, File Size too large!`
            );
            return;
        }
        this.commonServices.uploadFile(fileToUpload, this.fileType).subscribe(
            response => {
                this.toastr.success('File has been uploaded', 'Success');
                const data = response['data'];
                this.uploadedFile = {};
                this.uploadedFile = data;
                this.uploadAuditForm.controls['auditDocument'].setValue(data.id);
            },
            failResponse => {
                this.toastr.error('File could not be uploaded. Please try after some time.', 'Failed');
            }
        );
    }

    downloadFile(fileId: string, fileName: string) {
        this.toastr.info('Requesting file. Please wait');
        this.commonServices.downloadFile(fileId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
            },
            failResponse => {
                this.toastr.error('File could not be uploaded. Please try after some time.', 'Failed');
            }
        );
    }

    deleteFile(fileId: string, fileName: string, info?: any) {
        this.toastr.info('File is being deleted. Please wait');
        this.commonServices.removeFile(fileId, fileName[0]).subscribe(
            response => {
                this.uploadedFile = undefined;
                this.uploadAuditForm.controls['auditDocument'].setValue(null);
            },
            failResponse => {
                this.toastr.error('File could not be removed. Please try after some time.', 'Failed');
            }
        );
    }
}
