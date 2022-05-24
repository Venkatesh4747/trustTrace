import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import FileSaver from 'file-saver';
import { environment as env } from '../../../../environments/environment';
import { ImportStatuses } from '../../const-values';
import { CustomToastrService } from './../../commonServices/custom-toastr.service';
import { IImportError, steps, IDialogData } from '../../models/import.model';

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
    public env = env;

    importStatuses = ImportStatuses;
    steps = steps;

    step: string;

    isDownloading = false;
    isImporting = false;
    isUploading = false;
    showErrors = false;
    doesSheetNameExists = false;

    uploadedFile: any;

    importErrors: IImportError[];

    constructor(
        private dialogRef: MatDialogRef<ImportComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IDialogData,
        private toastrService: CustomToastrService
    ) {}

    ngOnInit(): void {
        this.step = this.data.step ? this.data.step : steps.SELECTION;
    }

    closeDialog(action: string, data = null): void {
        this.dialogRef.close({ status: action, data: data });
    }

    downloadData(): void {
        this.isDownloading = true;
        this.toastrService.info('Requesting file. Please wait');

        let downloadCallBack =
            steps.CREATE === this.step ? this.data.create.downloadCallBack : this.data.update.downloadCallBack;
        let fileName = steps.CREATE === this.step ? this.data.create.fileName : this.data.update.fileName;

        downloadCallBack().subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, `${fileName}.xlsx`);
                this.isDownloading = false;
            },
            () => {
                this.toastrService.error('File could not be downloaded. Please try after some time.', 'Failed');
                this.isDownloading = false;
            }
        );
    }

    processImportDataResponse(data: any): void {
        if (data && data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            this.importErrors = data.errors;
            if (Array.isArray(this.importErrors)) {
                this.doesSheetNameExists = this.importErrors.some(status => status.sheetName !== undefined);
                this.showErrors = true;
            } else {
                this.importErrors = [];
                this.showErrors = true;
            }
        } else {
            this.importErrors = [];
            if (this.data.handleUploadCompleteCallBack) {
                this.data.handleUploadCompleteCallBack(data);
                this.closeDialog(this.importStatuses.CLOSE, data);
            } else {
                this.closeDialog(this.importStatuses.IMPORT_COMPLETED, data);
            }
            this.showErrors = false;
        }
        this.isImporting = false;
    }

    importData() {
        this.isImporting = true;
        if (this.uploadedFile) {
            let importCallBack =
                steps.CREATE === this.step ? this.data.create.importCallBack : this.data.update.importCallBack;
            importCallBack(this.uploadedFile).subscribe(
                response => {
                    this.processImportDataResponse(response.data);
                },
                (err: HttpErrorResponse) => {
                    let errorMsg = 'File could not be uploaded. Please try after some time.';
                    if (err?.status === 412) {
                        errorMsg = err?.error?.message || errorMsg;
                    }
                    this.toastrService.error(errorMsg, 'Failed');
                    this.isImporting = false;
                }
            );
        } else {
            this.toastrService.error('Kindly select a file to upload', 'Error');
            this.isImporting = false;
        }
    }

    uploadFile(file: File): void {
        this.isUploading = true;
        if (!file) {
            this.isUploading = false;
            return;
        }
        const fileToUpload: File = file[0];
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (!fileExtension || fileExtension === '' || fileExtension !== 'xlsx') {
            this.toastrService.error('This file format is not supported');
            this.isUploading = false;
            return;
        }
        if (fileSize > env.config.maximumFileUploadSize) {
            this.toastrService.info(
                `File size should be within ${env.config.maximumFileUploadSize}MB. Chosen file is ${fileSizeString}MB`
            );
            this.isUploading = false;
            return;
        }
        this.uploadedFile = fileToUpload;
        this.isUploading = false;
    }

    deleteFile(): void {
        this.isUploading = true;
        this.uploadedFile = undefined;
        this.isUploading = false;
    }

    reset(): void {
        this.isDownloading = false;
        this.isImporting = false;
        this.isUploading = false;
        this.showErrors = false;
        this.uploadedFile = undefined;
    }

    handleStepChange(step: string): void {
        if (this.data.step) {
            if (this.steps.CREATE === this.data.step) {
                this.closeDialog(this.importStatuses.CLOSE);
            } else {
                this.step = this.data.step;
            }
        } else {
            this.step = step;
        }
        this.reset();
    }

    closeErrorDialog() {
        this.deleteFile();
        this.showErrors = false;
    }
}
