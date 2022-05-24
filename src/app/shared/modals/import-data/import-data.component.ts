import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import FileSaver from 'file-saver';
import { environment } from '../../../../environments/environment';
import { CommonServices } from '../../commonServices/common.service';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

export interface IError {
    columnName: string;
    suggestionMsg: string;
}
export interface IImportStatus {
    row: string;
    errors: IError[];
    sheetName?: string;
}
export interface IDialogData {
    fileName: string;
    fileType: string;
    filePayload: any;
    numberOfErrorsToBeShown: number;
    downloadDataCallBack: any;
    uploadDataCallBack: any;
    handleUploadComplete: boolean;
    handleUploadCompleteCallBack: Function;
    handleUploadWarningCallBack?: Function;
    uploadResponseProperties?: {
        errorKey?: string;
        warningKey?: string;
    };
    texts: {
        title: string;
        subDownloadTitle: string;
        subUploadTitle: string;
        downloadButton: string;
        uploadSuccess: string;
        uploadError: string;
    };
}

@Component({
    selector: 'app-import-data',
    templateUrl: './import-data.component.html',
    styleUrls: ['./import-data.component.scss']
})
export class ImportDataComponent implements OnInit {
    env = environment;
    showSuccessStatus = true;
    showStatus = false;
    isImporting = false;
    isUploading = false;
    isDownloading = false;
    uploadedFile: any;
    actions: string[] = ['Cancel', 'Upload'];
    importStatus: IImportStatus[];
    errors: IImportStatus[];
    doesSheetNameExists = false;
    uploadControl: FormControl = new FormControl();

    constructor(
        private toastrService: CustomToastrService,
        private dialogRef: MatDialogRef<ImportDataComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IDialogData,
        private commonService: CommonServices
    ) {
        dialogRef.disableClose = true;
    }

    ngOnInit() {}

    downloadData() {
        this.isDownloading = true;
        this.toastrService.info('Requesting file. Please wait');
        this.data.downloadDataCallBack().subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, `${this.data.fileName}.xlsx`);
                this.isDownloading = false;
            },
            () => {
                this.toastrService.error('File could not be downloaded. Please try after some time.', 'Failed');
                this.isDownloading = false;
            }
        );
    }

    uploadFile(file: File) {
        this.isImporting = true;
        if (!file) {
            this.isImporting = false;
            return;
        }
        const fileToUpload: File = file[0];
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (!fileExtension || fileExtension === '' || fileExtension !== 'xlsx') {
            this.toastrService.error('This file format is not supported');
            this.isImporting = false;
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            const expected = this.commonService.getTranslation('File size should be within');
            const chosen = this.commonService.getTranslation('Chosen file is');
            this.toastrService.info(
                `${expected} ${environment.config.maximumFileUploadSize}MB. ${chosen} ${fileSizeString}MB`
            );
            this.isImporting = false;
            return;
        }
        this.uploadedFile = fileToUpload;
        this.isImporting = false;
    }

    deleteFile() {
        this.isImporting = true;
        this.uploadedFile = undefined;
        this.isImporting = false;
        this.uploadControl.reset();
    }

    uploadDataFile() {
        this.isUploading = true;
        if (this.uploadedFile) {
            this.uploadData();
        } else {
            this.toastrService.error('Kindly select a file to upload', 'Error');
            this.isUploading = false;
        }
    }

    closeDialog(action: string = 'Close') {
        this.dialogRef.close({ event: action });
    }

    processUploadResponse(responseData: any) {
        if (responseData && Array.isArray(responseData) && responseData.length > 0) {
            this.importStatus = responseData;
            if (Array.isArray(this.importStatus)) {
                this.doesSheetNameExists = this.importStatus.some(status => status.sheetName !== undefined);
                this.errors = [...this.importStatus].slice(0, this.data.numberOfErrorsToBeShown);
                this.showSuccessStatus = false;
            } else {
                this.errors = [];
                this.showSuccessStatus = false;
            }
        } else {
            if (this.data.handleUploadComplete) {
                this.data.handleUploadCompleteCallBack();
            }
            this.showSuccessStatus = true;
        }
        this.showStatus = true;
        this.isUploading = false;
    }

    uploadData() {
        this.data.uploadDataCallBack(this.uploadedFile, this.data.filePayload).subscribe(
            response => {
                let responseData = response.data;
                const responseDataKeys = Object.keys(responseData);

                if (responseData && responseDataKeys && responseDataKeys.length > 0) {
                    if (
                        responseData[this.data.uploadResponseProperties.errorKey] &&
                        responseData[this.data.uploadResponseProperties.errorKey].length > 0
                    ) {
                        this.processUploadResponse(responseData[this.data.uploadResponseProperties.errorKey]);
                    } else if (
                        responseData[this.data.uploadResponseProperties.warningKey] &&
                        responseData[this.data.uploadResponseProperties.warningKey].length > 0 &&
                        this.data.handleUploadWarningCallBack
                    ) {
                        this.data.handleUploadWarningCallBack(
                            responseData[this.data.uploadResponseProperties.warningKey]
                        );
                        this.isUploading = false;
                    } else {
                        this.processUploadResponse(responseData);
                    }
                } else {
                    this.processUploadResponse(responseData);
                }
            },
            () => {
                let message = this.commonService.getTranslation(
                    'File could not be uploaded. Please try after some time.'
                );

                if (this.data.texts.uploadError) {
                    message = this.commonService.getTranslation(this.data.texts.uploadError);
                }

                let failed = this.commonService.getTranslation('Failed');
                this.toastrService.error(message, failed);
                this.isUploading = false;
            }
        );
    }
}
