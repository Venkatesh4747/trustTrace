import { CommonServices } from './../../../commonServices/common.service';
import { Component, OnInit, Input, AfterViewInit, forwardRef } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { environment } from './../../../../../environments/environment';
import * as FileSaver from 'file-saver';
import { IFileInfo } from '../additional-information.model';
import { CustomToastrService } from '../../../commonServices/custom-toastr.service';

const MULTI_SELECT_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EditCustomizationFieldsComponent),
    multi: true
};

export class EditCustomizationFieldsMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}
@Component({
    selector: 'app-edit-customization-fields',
    providers: [MULTI_SELECT_VALUE_ACCESSOR],
    templateUrl: './edit-customization-fields.component.html',
    styleUrls: ['./edit-customization-fields.component.scss']
})
export class EditCustomizationFieldsComponent implements OnInit, AfterViewInit {
    @Input() data;
    @Input() parentForm: FormGroup;
    @Input() fieldResponse;
    @Input() removedFiles = [];

    uploadingFile = false;
    uploadedFiles = [];
    uploadedFile;

    fileType = 'CUSTOM';
    fileInfos: IFileInfo[];

    env = environment;

    matcher = new EditCustomizationFieldsMatcher();

    // Table field
    tableDataSource;
    tableHeaders = [];

    _value: any[]; // Private variable for input value
    onChange: any = Function.prototype; // Trascend the onChange event
    onTouched: any = Function.prototype; // Trascend the onTouch event

    get value(): any[] {
        return this._value;
    }

    set value(v: any[]) {
        if (v !== this._value) {
            this._value = v;
            this.onChange(v);
        }
    }
    // Required for ControlValueAccessor interface
    writeValue(value: any[]) {
        this._value = value;
    }

    // Required forControlValueAccessor interface
    public registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }

    // Required forControlValueAccessor interface
    public registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
    }

    constructor(private commonServices: CommonServices, private toastr: CustomToastrService) {}

    ngOnInit() {
        // Process 'MULTI_SELECT' type field
        if (
            this.data &&
            this.data.displayConfig.type === 'MULTI_SELECT' &&
            this.fieldResponse !== null &&
            this.fieldResponse[this.data.fieldId] &&
            this.fieldResponse[this.data.fieldId][0] !== null
        ) {
            const formDataValues = Object.assign([], this.parentForm.value[this.data.fieldId]);
            this.value = formDataValues;
        }
    }

    ngAfterViewInit() {
        if (
            this.data &&
            this.data.displayConfig.type === 'FILE' &&
            this.fieldResponse !== null &&
            this.fieldResponse[this.data.fieldId] &&
            this.fieldResponse[this.data.fieldId][0] !== null
        ) {
            this.processFileType();
        }

        // Process 'TABLE' type field
        if (
            this.data &&
            this.data.displayConfig.type === 'TABLE' &&
            this.fieldResponse !== null &&
            this.fieldResponse[this.data.fieldId] &&
            this.fieldResponse[this.data.fieldId][0] !== null
        ) {
            this.data.displayConfig.options.forEach(option => {
                this.tableHeaders.push(option.key);
            });
        }
    }

    getFileName(fileId: string) {
        let fileInfo: IFileInfo;

        if (fileId) {
            this.commonServices.getFileName(fileId).subscribe(response => {
                const fileName = response['data']
                    .split('_')
                    .splice(1)
                    .join('');
                const doesFileExists = this.uploadedFile && this.uploadedFile['fieldId'] === this.data.fieldId;
                if (doesFileExists) {
                    this.uploadedFile['data'].push({
                        id: fileId,
                        fileName: fileName
                    });
                } else {
                    this.uploadedFile = {};
                    this.uploadedFile['fieldId'] = this.data.fieldId;
                    this.uploadedFile['data'] = [];
                    this.uploadedFile['data'].push({
                        id: fileId,
                        fileName: fileName
                    });
                }
            });
        }
    }

    processFileType() {
        if (
            this.fieldResponse &&
            this.fieldResponse !== null &&
            this.fieldResponse[this.data.fieldId] &&
            (this.fieldResponse[this.data.fieldId][0] !== null || this.fieldResponse[this.data.fieldId][0] !== '')
        ) {
            const fileIds = Object.assign([], this.fieldResponse[this.data.fieldId]);

            for (let i = 0; i < fileIds.length; i++) {
                this.getFileName(fileIds[i]);
            }
        }
    }

    InvokeFileUpload(infoName) {
        const element = document.getElementById(`file_upload_${infoName}`);
        element.click();
    }

    uploadFile(info, files) {
        this.uploadingFile = true;
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
            this.toastr.error(
                'Please use a supported file format: ' + environment.config.allowedFileExtensions.join(', '),
                'Unsupported File Extension'
            );
            this.uploadingFile = false;
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            this.toastr.error(
                `File size should be within ${environment.config.maximumFileUploadSize}MB.
              Chosen file is ${fileSizeString}MB, File Size too large!`
            );
            this.uploadingFile = false;
            return;
        }
        this.commonServices.uploadFile(fileToUpload, this.fileType).subscribe(
            response => {
                this.toastr.success('File has been uploaded', 'Success');
                let data = response['data'];
                data.fileName[0] = data.fileName[0]
                    .split('_')
                    .splice(1)
                    .join('');

                const doesFileExists = this.uploadedFile && this.uploadedFile['fieldId'] === info.fieldId;
                if (doesFileExists) {
                    this.uploadedFile['data'].push(data);
                } else {
                    this.uploadedFile = {};
                    this.uploadedFile['fieldId'] = info.fieldId;
                    this.uploadedFile['data'] = [];
                    this.uploadedFile['data'].push(data);
                }

                let formValues = Object.assign([], this.parentForm.value[this.data.fieldId]);
                if (!formValues || formValues.length === 0 || (formValues.length > 0 && formValues[0] === '')) {
                    formValues = [];
                }
                formValues.push(data.id);
                this.parentForm.controls[info.fieldId].setValue(formValues);
                this.uploadingFile = false;
            },
            failResponse => {
                this.toastr.error('File could not be uploaded. Please try after some time.', 'Failed');
                this.uploadingFile = false;
            }
        );
    }

    removeFile(info: any, fileIndex: number) {
        // Remove content from uploadedFiles
        const removed = this.uploadedFile.data.splice(fileIndex, 1);

        for (let i = 0; i < removed.length; i++) {
            this.removedFiles.push(removed[i]);
        }

        const formValues = Object.assign([], this.parentForm.value[this.data.fieldId]);
        if (formValues && formValues.length > 0) {
            formValues.splice(fileIndex, 1);
        }

        // After removing Id set parent control
        if (formValues && formValues.length > 0) {
            this.parentForm.controls[info.fieldId].setValue(formValues);
        } else {
            this.parentForm.controls[info.fieldId].setValue(['']);
        }

        this.toastr.success('File removed successfully.', 'Success');
    }

    downloadFile(fileId: string, fileName: string) {
        this.uploadingFile = true;
        this.toastr.info('Requesting file. Please wait');
        this.commonServices.downloadFile(fileId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
                this.uploadingFile = false;
            },
            failResponse => {
                this.toastr.error('File could not be uploaded. Please try after some time.', 'Failed');
                this.uploadingFile = false;
            }
        );
    }

    showFileNameFromForm(info: any) {
        const index = this.uploadedFiles.findIndex(item => item.fieldId === info.fieldId);
        if (index > -1) {
            return false;
        } else {
            return true;
        }
    }

    getPlaceHolderValue(type: string) {
        const placeholder = this.data.displayConfig.placeholder;
        const clickToUploadFile = 'Click to upload file';

        switch (type) {
            case 'FILE':
                if (this.data.displayConfig.constraintConfig && this.data.displayConfig.constraintConfig.mandatory) {
                    return `${clickToUploadFile} *`;
                }
                return clickToUploadFile;
            default:
                if (this.data.displayConfig.constraintConfig && this.data.displayConfig.constraintConfig.mandatory) {
                    return `${placeholder} *`;
                }
                return this.data.displayConfig.placeholder;
        }
    }

    handleMultiSelect(option: string) {
        const formDataValues = Object.assign([], this.parentForm.value[this.data.fieldId]);
        const noneIndex = formDataValues.findIndex(item => item === 'None');

        if (option === 'None') {
            this.parentForm.value[this.data.fieldId] = ['None'];
            this.value = ['None'];
        } else {
            if (noneIndex !== -1) {
                formDataValues.splice(noneIndex, 1);
                this.parentForm.value[this.data.fieldId] = formDataValues;
                this.value = formDataValues;
            }
        }
    }
}
