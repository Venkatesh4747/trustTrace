import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { environment } from '../../../../environments/environment';
import { CertificateManagerService } from './certificate-manager.service';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL'
    },
    display: {
        dateInput: 'DD MMM YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD MMM YYYY',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};
/* 

enum fieldLabels {
    certificateCategory = 'Certificate Category',
    certificateType = 'Certificate Type',
    certificationBody = 'Certification Body',
    certificateExpiryDate = 'Certificate Expiry Date'
}

enum FieldType {
    radio = 'radio',
    select = 'select',
    text = 'text',
    date = 'date',
    singleSelect = 'singleSelect'
} */

enum certificateType {
    product = 'PRODUCT',
    facility = 'FACILITY'
}

/* interface IFieldOption {
    label: string;
    value: string;
    default?: boolean;
}

interface IField {
    formControlName?: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: IFieldOption[];
    required?: boolean;
    min?: number;
    max?: number;
    minDate?: Date;
    maxDate?: Date;
    minLength?: number;
    maxLength?: number;
    disabled?: boolean;
    hidden?: boolean;
} */

@Component({
    selector: 'app-certificate-manager',
    templateUrl: './certificate-manager.component.html',
    styleUrls: ['./certificate-manager.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ]
})
export class CertificateManagerComponent implements OnInit {
    certificates: any = [];
    isReady: any;
    isProcessing: any;
    env = environment;
    isRemovingFile: boolean[];
    cerExpiryDate: any = null;

    @Input() entityType: string;
    @Input() certificateType: certificateType;
    @Output() certificateHttpObservers = new EventEmitter();
    master_standards: any[];
    private deletedCertificates = [];

    /*   certificateDetailsForm: FormGroup;
    uploadedFiles: any[] = [];
    isEditingCertificate: boolean;
    isUploading: boolean;
    fieldsList: IField[];
    elementId = 'upload-certificate';
    @Output() certificateIds = new EventEmitter();
    @Input() showCertificateCategories: boolean;

    dropdownValues = {
        Certificate_Type: ''
    };
    parameters = {
        Certificate_Type: {
            key: 'value',
            value: 'label',
            selectedKey: 'value'
        }
    };
    @ViewChild('certificateDetailsFGD', { static: false }) certificateDetailsFGD: FormGroupDirective;
    masterData: any;
    private editedCertificates = [];
    private removedCertificateFiles = [];
    private updatedCertificateFiles = []; */

    constructor(
        private certificateManagerService: CertificateManagerService /*  private route: ActivatedRoute,
    private commonServices: CommonServices,
    private router: Router */
    ) {
        /*   this.certificateDetailsForm = this._formBuilder.group({
            type: [''],
            body: [''],
            expiry_date: ['']
        });
        this.isReady = {
            certificateManager: false
        };
        this.isUploading = false;
        this.isRemovingFile = []; */
    }

    ngOnInit() {
        if (!this.certificateType) {
            this.certificateType = certificateType.facility;
        }
        this.initManager(this.certificateType);
    }
    deleteCertificate(certificateId, index) {
        console.log(certificateId, index);

        this.deletedCertificates.push(this.certificateManagerService.deleteCertificate(certificateId));
        this.certificates.splice(index, 1);
        // this.clearCertificatesForm();
    }
    getFileNameFromUrl(url: string) {
        return url.substring(url.lastIndexOf('/') + 1);
    }

    removeTimeStampFromFileName(fileName: string) {
        return fileName.substring(fileName.indexOf('_') + 1);
    }
    updateCertificateEntries(certificateResponse: any[]) {
        this.certificates = [];
        console.log(certificateResponse);

        certificateResponse.forEach(certificate => {
            const uploadedFiles = [];

            certificate.uploadedFiles.forEach(url => {
                uploadedFiles.push({
                    label: this.removeTimeStampFromFileName(url),
                    value: this.getFileNameFromUrl(url)
                });
            });

            if (certificate.expiryDate) {
                this.cerExpiryDate = moment(certificate.expiryDate).format('DD MMM YYYY');
            } else {
                this.cerExpiryDate = null;
            }
            const certificateDetails = {
                Certificate_Expiry_Date: this.cerExpiryDate,
                Certificate_Type: certificate.typeId,
                Certification_Body: certificate.body,
                Entity_Type: certificate.entityType,
                certificateId: certificate.id,
                entityId: certificate.entityId,
                uploadedFiles: JSON.parse(JSON.stringify(uploadedFiles))
            };
            this.certificates.push(certificateDetails);
        });
        // this.certificateIds.emit(this.certificates.map(certificate => certificate.certificateId));
    }

    sortAlphabetically(objectToSort, labelToUse) {
        return objectToSort.sort((a, b) => {
            const textA = a[labelToUse]?.toUpperCase();
            const textB = b[labelToUse]?.toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
    }
    getCertificateNameById(Certificate_Type: any) {
        const cert = this.master_standards.filter(certificate => certificate.key === Certificate_Type);
        if (cert && cert.length > 0) {
            return cert[0].value;
        }
        return 'Certificate Not Found';
    }
    initManager(certType: certificateType) {
        console.log(certType);

        certType = certificateType[certType.toLowerCase()];
        this.certificateManagerService.getCertificates(certType).subscribe(certificatesResponse => {
            this.master_standards = JSON.parse(JSON.stringify(certificatesResponse));
            this.sortAlphabetically(this.master_standards, 'value');
            const certificateOptions = [];
            this.master_standards.forEach(certificate => {
                certificateOptions.push({
                    label: certificate.value,
                    value: certificate.key
                });
            });
            /*              this.fieldsList = [
                        {
                            label: fieldLabels.certificateCategory,
                            type: FieldType.radio,
                            options: [
                                {
                                    label: 'Product',
                                    value: 'PRODUCT'
                                },
                                {
                                    label: 'Facility',
                                    value: 'FACILITY'
                                }
                            ],
                            hidden: !this.showCertificateCategories
                        },
                        {
                            label: fieldLabels.certificateType,
                            placeholder: `${this.commonServices.getTranslation('Eg')}., ${this.commonServices.getTranslation(
                                'BSCI'
                            )}`,
                            type: FieldType.singleSelect,
                            options: JSON.parse(JSON.stringify(certificateOptions)),
                            required: true
                        },
                        {
                            label: fieldLabels.certificationBody,
                            placeholder: `${this.commonServices.getTranslation('Eg')}., ${this.commonServices.getTranslation(
                                'Control Union Certifications'
                            )}`,
                            type: FieldType.text,
                            required: true
                        },
                        {
                            label: fieldLabels.certificateExpiryDate,
                            placeholder: `${this.commonServices.getTranslation('Eg')}., 29 May 2027'`,
                            type: FieldType.date,
                            required: true
                        }
                    ];
                    this.fieldsList.forEach(field => {
                        if (field.label === fieldLabels.certificateCategory) {
                            // this.certificateDetailsForm.value[field.formControlName] = certType;
                            field.options.forEach(option => {
                                if (option.value === certType) {
                                    option.default = true;
                                }
                            });
                        }
                    });
                    this.fieldsList.forEach((field: IField) => {
                        field.formControlName = field.label.replace(/[^a-zA-Z ]/g, '').replace(/ /g, '_');
                    });
                    setTimeout(() => {
                        const _simpleFormGroup: FormGroup | any = {};
                        _simpleFormGroup['certificateId'] = this._formBuilder.control('', [Validators.required]);
                        _simpleFormGroup['Entity_Type'] = this._formBuilder.control('', [Validators.required]);
                        this.fieldsList.forEach((field: IField) => {
                            const validators = [];
                            if (field.hasOwnProperty('required') && field.required) {
                                validators.push(Validators.required);
                            }
                            if (field.hasOwnProperty('min')) {
                                validators.push(Validators.min(field.min));
                            }
                            if (field.hasOwnProperty('max')) {
                                validators.push(Validators.max(field.max));
                            }
                            if (field.hasOwnProperty('minLength')) {
                                validators.push(Validators.minLength(field.minLength));
                            }
                            if (field.hasOwnProperty('maxLength')) {
                                validators.push(Validators.maxLength(field.maxLength));
                            }
                            _simpleFormGroup[field.formControlName] = this._formBuilder.control('', { validators });
                            this.isReady.certificateManager = true;
                        });
                        _simpleFormGroup['certificateFiles'] = this._formBuilder.control('', { validators: [Validators.required] });
                        this.certificateDetailsForm = this._formBuilder.group(_simpleFormGroup);
                        this.initCertificateDetailsForm();
                        setTimeout(() => {
                            this.fieldsList.forEach(field => {
                                if (field.label === fieldLabels.certificateCategory) {
                                    this.certificateDetailsForm.value[field.formControlName] = certType;
                                }
                            });
                        });
                    });
        */
        });
    }

    /*   removeSpace(label: any) {
        return 'certificate-manager-' + label.replace(/ /g, '-');
    }
    ngAfterViewInit() {
        setTimeout(() => {
            if (this.route && this.route && this.route.snapshot.children[0] && this.route.snapshot.children[0].params) {
                let certificate = [];
                const id = this.route.snapshot.children[0].params.id;
                certificate = this.certificates.filter(cert => cert.certificateId === id);
                if (certificate && certificate.length > 0) {
                    this.editCertificate(certificate[0]);
                    this.commonServices.scrollToElement(this.elementId);
                }
            }
        }, 1000);
    }
    updateCertificateOptions(certType) {
        certType = certificateType[certType.toLowerCase()];

        this.certificateManagerService.getCertificates(certType).subscribe(certificatesResponse => {
            this.master_standards = JSON.parse(JSON.stringify(certificatesResponse));

            this.sortAlphabetically(this.master_standards, 'value');

            const certificateOptions = [];

            this.master_standards.forEach(certificate => {
                certificateOptions.push({
                    label: certificate.value,
                    value: certificate.key
                });
            });

            this.fieldsList.forEach(field => {
                if (field.label === fieldLabels.certificateType) {
                    field.options = JSON.parse(JSON.stringify(certificateOptions));
                }
            });
        });
    }

    initCertificateDetailsForm() {
        this.certificateDetailsForm.patchValue({
            Entity_Type: this.entityType
        });
    }

    validateDuplicateCertificateWithCombinationOfTypeBodyAndExpiryDate(payload, isEditingCertificate) {
        if (isEditingCertificate) {
            const certificateList = this.certificates.filter(
                cer =>
                    cer.Certificate_Expiry_Date === moment(payload.Certificate_Expiry_Date).format('DD MMM YYYY') &&
                    cer.Certificate_Type === payload.Certificate_Type &&
                    cer.Certification_Body === payload.Certification_Body &&
                    cer.certificateId !== payload.certificateId
            );
            return certificateList.length > 0;
        } else {
            const certificateList = this.certificates.filter(
                cer =>
                    cer.Certificate_Expiry_Date === moment(payload.Certificate_Expiry_Date).format('DD MMM YYYY') &&
                    cer.Certificate_Type === payload.Certificate_Type &&
                    cer.Certification_Body === payload.Certification_Body
            );
            return certificateList.length > 0;
        }
    }

    uploadFile(files: FileList) {
        const payload = JSON.parse(JSON.stringify(this.certificateDetailsForm.value));

        if (!payload.Certificate_Type || !payload.Certification_Body || !payload.Certificate_Expiry_Date) {
            this.toastrService.error('Please enter certificate mandatory fields', 'Error');
            return;
        }
        if (
            this.validateDuplicateCertificateWithCombinationOfTypeBodyAndExpiryDate(payload, this.isEditingCertificate)
        ) {
            this.toastrService.error('certificate with type,body and expiry date already exists', 'Error');
            return;
        }
        this.isUploading = true;
        if (files.length === 0) {
            this.isUploading = false;
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
            environment.config.allowedExtensions['certificates'].indexOf(fileExtension.toLowerCase()) === -1
        ) {
            this.toastrService.error('This file format is not supported');
            this.isUploading = false;
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
            this.isUploading = false;
            return;
        }
        const fileId = this.certificateDetailsForm.value.certificateId;
        if (!fileId) {
            this.certificateManagerService.uploadFile(fileToUpload, payload).subscribe(
                response => {
                    this.toastrService.success('File uploaded', 'Success');

                    this.certificateDetailsForm.patchValue({
                        certificateId: response['id']
                    });

                    let index = 0;

                    const uploadedFiles = [];

                    response.uploadedFiles.forEach(url => {
                        response.uploadedFiles[index] = this.getFileNameFromUrl(url);
                        uploadedFiles.push({
                            label: this.removeTimeStampFromFileName(response.uploadedFiles[index]),
                            value: response.uploadedFiles[index]
                        });
                        index++;
                    });

                    this.uploadedFiles = JSON.parse(JSON.stringify(uploadedFiles));
                    this.isUploading = false;
                },
                uploadFileErrorResponse => {
                    if (uploadFileErrorResponse['error']['message'].indexOf('duplicate key error') !== -1) {
                        this.toastrService.error('A record with identical details already exist.', 'Duplicate entry');
                    } else {
                        this.toastrService.error('The file could not be uploaded.', 'Error Uploading File!');
                    }
                    this.isUploading = false;
                }
            );
        } else {
            this.updatedCertificateFiles.push(this.certificateManagerService.uploadFile(fileToUpload, payload));
            this.uploadedFiles.push({
                label: fileName,
                value: fileName
            });

            this.isUploading = false;
        }
    }

    updateUploadedFiles(uploadedFilesResponse: any) {
        let index = 0;

        const uploadedFiles = [];

        uploadedFilesResponse.forEach(url => {
            uploadedFilesResponse[index] = this.getFileNameFromUrl(url);
            uploadedFiles.push({
                label: this.removeTimeStampFromFileName(uploadedFilesResponse[index]),
                value: uploadedFilesResponse[index]
            });
            index++;
        });

        this.uploadedFiles = JSON.parse(JSON.stringify(uploadedFiles));
    }

    removeFile(certificateId, fileName, fileIndex) {
        this.isRemovingFile[fileIndex] = true;
        this.removedCertificateFiles.push(this.certificateManagerService.deleteFile(certificateId, fileName));
        this.uploadedFiles.splice(fileIndex, 1);
        this.isRemovingFile[fileIndex] = false;
    }

    addCertificate() {
        this.certificateDetailsForm.markAsTouched();
        if (!this.certificateDetailsForm.valid) {
            this.toastrService.error('Fill all mandatory fields', 'Form Validation Error');
            return;
        }

        const certificateDetails = JSON.parse(JSON.stringify(this.certificateDetailsForm.value));

        certificateDetails.uploadedFiles = JSON.parse(JSON.stringify(this.uploadedFiles));
        if (
            this.validateDuplicateCertificateWithCombinationOfTypeBodyAndExpiryDate(
                certificateDetails,
                this.isEditingCertificate
            )
        ) {
            this.toastrService.error('certificate with type,body and expiry date already exists', 'Error');
            return;
        }

        if (this.isEditingCertificate) {
            if (certificateDetails.uploadedFiles && certificateDetails.uploadedFiles.length === 0) {
                this.toastrService.error('Please upload the files', 'Error');
                return;
            }
            this.editedCertificates.push(
                this.certificateManagerService.updateCertificate(certificateDetails.certificateId, certificateDetails)
            );

            this.certificates.forEach((value, key) => {
                if (this.certificates[key].certificateId === certificateDetails.certificateId) {
                    this.certificates[key].Certificate_Expiry_Date = moment(
                        certificateDetails.Certificate_Expiry_Date
                    ).format('DD MMM YYYY');
                    this.certificates[key].Certificate_Type = certificateDetails.Certificate_Type;
                    this.certificates[key].Certification_Body = certificateDetails.Certification_Body;
                    this.certificates[key].Entity_Type = certificateDetails.Entity_Type;
                    this.certificates[key].uploadedFiles = JSON.parse(JSON.stringify(certificateDetails.uploadedFiles));
                }
            });
            this.certificateIds.emit(this.certificates.map(certificate => certificate.certificateId));
            this.clearCertificatesForm();
        } else {
            certificateDetails.Certificate_Expiry_Date = moment(certificateDetails.Certificate_Expiry_Date).format(
                'DD MMM YYYY'
            );
            this.certificates.push(certificateDetails);
            this.certificateIds.emit(this.certificates.map(certificate => certificate.certificateId));
            this.clearCertificatesForm();
        }
    }

    discardCertificates() {
        const certIds = this.certificates.map(certificate => certificate.certificateId);
        this.certificateManagerService.discardCertificates(certIds).subscribe(() => {
            this.certificates = [];
            this.toastrService.success('Certificates have been discarded', 'Success');
        });
    }

    clearCertificatesForm() {
        this.uploadedFiles = [];
        this.isEditingCertificate = false;
        this.isUploading = false;
        this.isRemovingFile = [];
        this.certificateDetailsForm.reset();
        this.certificateDetailsFGD.resetForm();
        this.certificateDetailsForm.markAsPristine();
        this.certificateDetailsForm.markAsUntouched();
        this.certificateDetailsForm.clearValidators();
        Object.keys(this.certificateDetailsForm.controls).forEach(key => {
            this.certificateDetailsForm.get(key).setErrors(null);
        });
        this.initCertificateDetailsForm();
        this.dropdownValues.Certificate_Type = null;
    }

    editCertificate(certificateData: any) {
        const certificateDetails = JSON.parse(JSON.stringify(certificateData));
        if (certificateData.entityId) {
            this.router.navigate([
                '/company/edit-facility/' + certificateData.entityId + '/edit-certificate/',
                certificateDetails.certificateId
            ]);
        }
        if (certificateDetails.Certificate_Expiry_Date) {
            certificateDetails.Certificate_Expiry_Date = moment(certificateDetails.Certificate_Expiry_Date);
        } else {
            certificateDetails.Certificate_Expiry_Date = null;
        }
        this.certificateDetailsForm.patchValue({
            Certificate_Category: certificateDetails.Certificate_Category,
            Certificate_Expiry_Date: certificateDetails.Certificate_Expiry_Date,
            Certificate_Type: certificateDetails.Certificate_Type,
            Certification_Body: certificateDetails.Certification_Body,
            Entity_Type: certificateDetails.Entity_Type,
            certificateId: certificateDetails.certificateId
        });
        this.dropdownValues.Certificate_Type = certificateDetails.Certificate_Type;
        this.uploadedFiles = JSON.parse(JSON.stringify(certificateDetails.uploadedFiles));
        this.isEditingCertificate = true;
    }

    radioButtonChange(formControlName: any, $event: MatRadioChange) {
        if (formControlName === 'Certificate_Category') {
            this.updateCertificateOptions($event.value);
        }

        const certificateDetails = JSON.parse(JSON.stringify(this.certificateDetailsForm.value));
        certificateDetails.Certificate_Expiry_Date = moment(certificateDetails.Certificate_Expiry_Date).format(
            'DD MMM YYYY'
        );

        this.certificates.push(certificateDetails);

        this.clearCertificates();
    }

    clearCertificates() {
        this.uploadedFiles = [];
        this.certificateDetailsFGD.resetForm();
        this.certificateDetailsForm.reset();
        this.initCertificateDetailsForm();
    }

    certificateDetailsFormHasError(controlName: string, errorName: string) {
        return (
            this.certificateDetailsForm.touched &&
            this.certificateDetailsForm.invalid &&
            this.certificateDetailsForm.controls[controlName].hasError(errorName)
        );
    } */

    onFacilitySaveProcessCertificateHttpRequest() {
        const certificateHttp = [];
        if (this.deletedCertificates) {
            this.deletedCertificates.forEach(deletedCertificate => {
                certificateHttp.push(deletedCertificate);
            });
        }
        this.certificateHttpObservers.emit(certificateHttp);

        /*      if (this.editedCertificates) {
            this.editedCertificates.forEach(editedCertificate => {
                certificateHttp.push(editedCertificate);
            });
        }
            if (this.updatedCertificateFiles) {
                this.updatedCertificateFiles.forEach(updatedCertificateFile => {
                    certificateHttp.push(updatedCertificateFile);
                });
            }
            if (this.removedCertificateFiles) {
                this.removedCertificateFiles.forEach(removedCertificateFile => {
                    certificateHttp.push(removedCertificateFile);
                });
            }

            this.clearCertificatesForm();
        }

        selectionChange(controlName, event): void {
            this.certificateDetailsForm.get(controlName).patchValue(event.value); */
    }
}
