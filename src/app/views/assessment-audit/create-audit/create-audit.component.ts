import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Router, ActivatedRoute } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as _ from 'lodash';
import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';
import { environment } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { AssessmentAuditService } from '../assessment-audit.service';
import { NORMALISED_RATINGS } from '../assessment-audit.const';
import { UtilsService } from '../../../shared/utils/utils.service';
import { INonConformities, IupdateModel } from '../non-conformities/non-conformities-list/non-conformities-list.model';
import { Subject, forkJoin } from 'rxjs';
import {
    ISupplierListFormOptions,
    SupplierListTypes
} from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { ContextService } from '../../../shared/context.service';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

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

@Component({
    selector: 'app-create-audit',
    templateUrl: './create-audit.component.html',
    styleUrls: ['./create-audit.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ]
})
export class CreateAuditComponent implements OnInit {
    pageLoading = false;

    _: any = _;

    env = environment;

    suppliersList: any;
    facilitiesList: any = [];
    auditTypesList: any;
    isFetching: any = {};
    isProcessing: any = {};
    isReady: any = {};
    isEditing: any = {};

    auditInformation: any;
    isAuditFormInit = false;

    supplierInformationForm: FormGroup;
    auditInformationForm: FormGroup = new FormGroup({});

    nonConformities: Array<INonConformities> = null;
    selectedSupplier: any;

    auditValidFromLocal: any;

    ncEdit: Subject<IupdateModel> = new Subject();

    initAuditFlag: boolean;
    normalisedRatings = NORMALISED_RATINGS;

    // Only PDF supported
    fileExtension = 'pdf';
    uploadProgress = false;
    customStyle = {
        color: '#325992',
        width: '75%'
    };

    supplierListOptions: ISupplierListFormOptions = {
        controlType: 'single-select',
        listOnlyThisSuppliers: [SupplierListTypes.accepted_supplier, SupplierListTypes.unAccepted_supplier],
        acceptOnlyListedValues: true,
        errorMessage: 'Please select a supplier',
        tooltipPosition: 'below',
        floatLabel: 'auto',
        isRequired: true,
        label: 'Supplier Name: ',
        valueChangesFire: 'both',
        customClass: 'audit-custom-style'
    };

    tempDataFromEmail = {
        supplier: null,
        facility: null
    };

    constructor(
        private assessmentAuditService: AssessmentAuditService,
        private toastrService: CustomToastrService,
        private analyticsService: AnalyticsService,
        private _formbuilder: FormBuilder,
        private localizationService: LocalizationService,
        private router: Router,
        private appContext: ContextService,
        private util: UtilsService,
        private activatedRoute: ActivatedRoute,
        private multiIndustryService: MultiIndustryService
    ) {
        this.isFetching = {
            facilities: false
        };
        this.isProcessing = {
            supplierInformationForm: false,
            auditInformationForm: false
        };
        this.isReady = {
            supplierInformationForm: false,
            auditInformationForm: false
        };

        this.auditInformation = {
            sections: '',
            overAllRatingSection: '',
            nonConformanceCategories: '',
            normalisedRating: ''
        };

        this.supplierInformationForm = this._formbuilder.group({
            auditName: ['', Validators.required],
            supplier: ['', Validators.required],
            auditor: [''],
            facility: ['', Validators.required],
            auditValidFromDate: ['', Validators.required],
            auditValidToDate: ['', Validators.required],
            auditStandard: ['', Validators.required],
            auditBody: ['']
        });
    }

    ngOnInit() {
        this.pageLoading = true;
        this.assessmentAuditService.addAudit().subscribe(
            addAuditResponse => {
                this.localizationService.addToMasterData(addAuditResponse['masterData']);
                this.suppliersList = this.ripKeyValueFromObject(addAuditResponse['suppliers']);
                this.auditTypesList = this.ripKeyValueFromObject(addAuditResponse['templates']);

                /**specific to food industry */
                if (this.multiIndustryService.industry === 'food') {
                    this.auditTypesList = [
                        {
                            id: '5c0f6c3a838b2177c6d6eaea',
                            name: 'BSCI'
                        }
                    ];
                }

                this.pageLoading = false;
            },
            addAuditErrorResponse => {
                this.toastrService.error(
                    'Something went wrong. Please try again later or contact us if the problem persists.',
                    'Oops!'
                );
                this.pageLoading = false;
            }
        );

        this.analyticsService.trackEvent('Record Audit Page', {
            Origin: 'Assessment-audit',
            Action: 'Record-Audit page visited'
        });
    }

    getFormValue(formControlName: string): string {
        return this.supplierInformationForm.value[formControlName];
    }

    submitSupplierInformation() {
        this.isProcessing.supplierInformationForm = true; // Wil be made false in initAuditInformation()
        this.supplierInformationForm.markAsTouched();
        if (!this.supplierInformationForm.valid) {
            this.toastrService.error('Please correct the errors specified in the form to proceed.', 'Error');
            this.isProcessing.supplierInformationForm = false;
            return;
        }

        if (!this.auditInformationForm || this.initAuditFlag) {
            this.initAuditInformationForm();
        }
        this.isProcessing.supplierInformationForm = false;
    }

    auditValidFromFilter(date: Date) {
        return moment(date).isSameOrBefore(new Date());
    }

    auditValidToFilter(date: Date) {
        return moment(date).isSameOrAfter(this.auditValidFromLocal);
    }

    auditValidFromLocalUpdate($event) {
        this.auditValidFromLocal = moment($event.value);
    }
    ngAfterViewInit() {
        this.preSelectExpiringSoonAuditInfoFromEmailTemplate();
    }
    preSelectExpiringSoonAuditInfoFromEmailTemplate() {
        if (this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['supplierId']) {
            this.initAuditFlag = true;
            const supplierId = this.activatedRoute.snapshot.queryParams['supplierId'];
            const facilityId = this.activatedRoute.snapshot.queryParams['facilityId'];
            const standardId = this.activatedRoute.snapshot.queryParams['standardId'];

            let supplier = [],
                facility = [],
                standard = [];
            forkJoin([
                this.assessmentAuditService.addAudit(),
                this.assessmentAuditService.getAllFacility(supplierId)
            ]).subscribe(
                response => {
                    this.suppliersList = this.ripKeyValueFromObject(response[0]['suppliers']);
                    this.auditTypesList = this.ripKeyValueFromObject(response[0]['templates']);
                    this.facilitiesList = response[1];
                    standard = this.auditTypesList.filter(type => type.name === standardId);
                    supplier = this.suppliersList.filter(sup => sup.id === supplierId);
                    facility = this.facilitiesList.filter(fac => fac.id === facilityId);
                    this.supplierListOptions.selectedItem = { id: supplierId };
                    this.tempDataFromEmail.supplier = supplierId;
                    this.tempDataFromEmail.facility = facility[0];
                    this.supplierInformationForm.controls.facility.setValue(facility[0]);
                    this.supplierInformationForm.controls.auditStandard.setValue(standard[0]);
                },
                errorResponse => {
                    this.pageLoading = false;
                    this.toastrService.error(
                        'We could not fetch data. Please try again after sometime or contact support if the issue persists.',
                        'Oops!'
                    );
                }
            );
        }
    }

    submitAuditDetails() {
        this.auditInformationForm.markAsTouched();

        if (!this.auditInformationForm.valid) {
            this.toastrService.error('Please correct the errors on the form to proceed recording the audit', 'Error');
            this.isProcessing.auditInformationForm = false;
            return;
        }

        this.isProcessing.auditInformationForm = true;

        const supplierForm = JSON.parse(JSON.stringify(this.supplierInformationForm.value));
        const auditForm = JSON.parse(JSON.stringify(this.auditInformationForm.value));

        const sections = JSON.parse(JSON.stringify(this.auditInformation.sections));

        sections.forEach(section => {
            const fields = section.fields;

            fields.forEach(field => {
                field.value = auditForm[field.formControlName];
                delete field.formControlName;
            });
        });

        const ncData: Array<any> = this.removeAddon(JSON.parse(JSON.stringify(this.nonConformities)));

        const payload = {
            name: supplierForm.auditName,
            auditee: supplierForm.supplier.supplier_id,
            auditor: supplierForm.auditor,
            facilityId: supplierForm.facility.id,
            standard: supplierForm.auditStandard.name.toUpperCase().replace(/ /g, '_'),
            dateOfAudit: moment(supplierForm.auditValidFromDate),
            validTill: moment(supplierForm.auditValidToDate),
            overallRating: auditForm.OverAll_Rating,
            normalisedRating: auditForm.normalisedRating,
            auditBody: supplierForm.auditBody,
            data: {
                sections: sections
            },
            nonConformities: ncData
        };

        this.assessmentAuditService.saveAudit(payload).subscribe(
            saveAuditResponse => {
                this.isProcessing.auditInformationForm = false;
                this.toastrService.success('Audit successfully recorded', 'Success');
                this.router.navigate(['/assessment-audit', saveAuditResponse['data']]);
                setTimeout(() => {
                    this.auditInformationForm = null;
                    this.supplierInformationForm = null;
                    this.nonConformities = null;
                    this.suppliersList = null;
                    this.facilitiesList = null;
                    this.auditInformation = null;
                });
                setTimeout(() => {
                    this.appContext.cardViewRefresh.next(true);
                }, 2000);
            },
            saveAuditErrorResponse => {
                this.toastrService.error(
                    'Something went wrong. Please try again later or contact us if the issue persists',
                    'Oops!'
                );
                this.isProcessing.auditInformationForm = false;
            }
        );
    }

    initAuditInformationForm() {
        this.assessmentAuditService
            .getTemplates(
                this.supplierInformationForm.value.auditStandard,
                { id: this.supplierInformationForm.value.supplier.supplier_id },
                this.supplierInformationForm.value.facility
            )
            .subscribe(
                getTemplatesResponse => {
                    const section_data = getTemplatesResponse['template'];
                    this.auditInformation.sections = section_data['sections'];
                    this.auditInformation.overAllRatingSection = section_data['overallRating'];
                    this.auditInformation.nonConformanceCategories = this.util.sortOptions(
                        getTemplatesResponse['non_conformance_categories'],
                        'value'
                    );

                    this.auditInformation.normalisedRating = {};

                    const normalisedRatingFormControlName = 'normalisedRating';
                    this.auditInformation.normalisedRating['formControlName'] = normalisedRatingFormControlName;
                    // Create formGroup for overall rating
                    const _simpleFormGroup: FormGroup | any = {};
                    const formControlName = 'OverAll_Rating';
                    const validations = [];
                    this.auditInformation.overAllRatingSection['formControlName'] = formControlName;

                    if (this.auditInformation.overAllRatingSection.mandatory) {
                        validations.push(Validators.required);
                    }
                    if (this.auditInformation.overAllRatingSection.type === 'NUMBER') {
                        if (this.auditInformation.overAllRatingSection.hasOwnProperty('min')) {
                            validations.push(Validators.min(this.auditInformation.overAllRatingSection.min));
                        }
                        if (this.auditInformation.overAllRatingSection.hasOwnProperty('max')) {
                            validations.push(Validators.max(this.auditInformation.overAllRatingSection.max));
                        }
                    }
                    if (this.auditInformation.overAllRatingSection.type === 'TEXT') {
                        if (this.auditInformation.overAllRatingSection.hasOwnProperty('minLength')) {
                            validations.push(
                                Validators.minLength(this.auditInformation.overAllRatingSection.minLength)
                            );
                        }
                        if (this.auditInformation.overAllRatingSection.hasOwnProperty('maxLength')) {
                            validations.push(Validators.maxLength(this.auditInformation.overAllRatingSection.maxLegth));
                        }
                    }
                    if (!this.auditInformation.overAllRatingSection.hasOwnProperty('value')) {
                        this.auditInformation.overAllRatingSection['value'] = null;
                    }
                    _simpleFormGroup[formControlName] = this._formbuilder.control(
                        this.auditInformation.overAllRatingSection.value,
                        {
                            validators: validations
                        }
                    );

                    // form control for normalised rating

                    _simpleFormGroup[normalisedRatingFormControlName] = this._formbuilder.control('');

                    // Generate FormControls for dynamic fields.
                    this.auditInformation.sections.forEach((section: any) => {
                        const fields = section.fields;

                        fields.forEach((field: any) => {
                            const _formControlName = field.name.replace(/[^a-zA-Z ]/g, '').replace(/ /g, '_');
                            field.formControlName = _formControlName;
                            const _validations = [];
                            if (field.mandatory) {
                                _validations.push(Validators.required);
                            }
                            if (field.type === 'NUMBER') {
                                if (field.hasOwnProperty('min')) {
                                    _validations.push(Validators.min(field.min));
                                }
                                if (field.hasOwnProperty('max')) {
                                    _validations.push(Validators.max(field.max));
                                }
                            }
                            if (field.type === 'TEXT') {
                                if (field.hasOwnProperty('minLength')) {
                                    _validations.push(Validators.minLength(field.minLength));
                                }
                                if (field.hasOwnProperty('maxLength')) {
                                    _validations.push(Validators.maxLength(field.maxLegth));
                                }
                            }

                            if (!field.hasOwnProperty('value')) {
                                field.value = null;
                            }

                            _simpleFormGroup[_formControlName] = this._formbuilder.control(field.value, {
                                validators: _validations
                            });
                        });
                    });

                    this.auditInformation.nonConformanceCategories.forEach((nonConformanceCategory: any) => {
                        if (!nonConformanceCategory.subCategories) {
                            nonConformanceCategory.subCategories = [];
                        }

                        nonConformanceCategory.subCategories.forEach(subCategory => {
                            subCategory.formControlName =
                                'sc_' +
                                nonConformanceCategory.value +
                                subCategory.value.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
                            // this.nonConformities[subCategory.formControlName] = [];
                            _simpleFormGroup[subCategory.formControlName] = this._formbuilder.control('');
                        });
                    });

                    this.auditInformationForm = this._formbuilder.group(_simpleFormGroup);

                    this.isReady.auditInformationForm = true;
                    this.isAuditFormInit = true;
                    this.initAuditFlag = false;
                },
                getTemplatesErrorResponse => {
                    this.toastrService.error(
                        'Something went wrong. Please try after some time or contact us if the issue persists',
                        'Oops!'
                    );
                    this.isProcessing.supplierInformationForm = false;
                }
            );
    }

    supplierFormHasError(controlName: string, errorName: string) {
        return this.supplierInformationForm.controls[controlName].hasError(errorName);
    }

    auditFormHasError(controlName: string, errorName: string) {
        return this.auditInformationForm.controls[controlName].hasError(errorName);
    }

    fetchFacilityBySupplier(supplierId: string) {
        if (supplierId === this.tempDataFromEmail.supplier) {
            this.tempDataFromEmail = { facility: null, supplier: null };
            return;
        }
        this.facilitiesList = [];
        this.supplierInformationForm.patchValue({
            facility: ''
        });

        if (!supplierId) {
            return;
        }

        this.isFetching.facilities = true;
        this.assessmentAuditService.getAllFacility(supplierId).subscribe(
            getAllFacilityResponse => {
                this.supplierInformationForm.patchValue({
                    facility: ''
                });

                this.facilitiesList = getAllFacilityResponse
                    ? this.util.sortOptions(JSON.parse(JSON.stringify(getAllFacilityResponse)), 'name')
                    : [];

                this.isFetching.facilities = false;
            },
            getAllFacilityErrorResponse => {
                this.toastrService.error(
                    'Something went wrong. Please try again later or contact us if the problem persists.',
                    'Oops!'
                );
                this.isFetching.facilities = false;
            }
        );
    }

    ripKeyValueFromObject(objectToRip: any) {
        const rippedObject = [];
        // Get Suppliers List
        for (const [key, value] of Object.entries(objectToRip)) {
            const newObject: any = {
                id: '',
                name: ''
            };
            newObject['id'] = key;
            newObject['name'] = value;
            rippedObject.push(newObject);
        }
        return this.util.sortOptions(rippedObject, 'name');
    }

    getNameFromId(id: string, objectToSearch: any) {
        return objectToSearch.filter(item => item.id === id)[0];
    }

    InvokeFileUpload(template_name) {
        const element = document.getElementById('file_upload_' + template_name);
        element.click();
    }

    uploadFile(template_name: string, files: FileList, sectionIndex: number, fieldIndex: number) {
        const FILE_NAMES = this.getFileNames(template_name, sectionIndex, fieldIndex);
        const fileLength = FILE_NAMES ? FILE_NAMES.length : 0;

        if (fileLength > 0) {
            this.toastrService.info(
                'Document already uploaded. Kindly delete existing one to replace with a new document',
                'Info'
            );
            return;
        }

        if (files.length === 0) {
            return;
        }
        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (!fileExtension || fileExtension === '' || fileExtension !== this.fileExtension) {
            this.toastrService.error('Please use a supported file format: pdf', 'Unsupported File Extension');
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
        const fileId = this.auditInformation.sections[sectionIndex].fields[fieldIndex].id;
        if (this.uploadProgress) {
            this.toastrService.info('Please wait upload is in progress', 'Info');
            return;
        } else {
            this.uploadProgress = true;
        }
        this.assessmentAuditService.uploadFile(fileToUpload, fileId).subscribe(
            response => {
                this.toastrService.success('File uploaded', 'Success');
                this.auditInformation.sections[sectionIndex].fields[fieldIndex].id = response['data'].id;
                this.auditInformation.sections[sectionIndex].fields[fieldIndex].fileName = response['data'].fileName;

                const tempObject = {};
                tempObject[this.auditInformation.sections[sectionIndex].fields[fieldIndex].formControlName] = {
                    id: response['data'].id,
                    fileName: response['data'].fileName
                };
                this.uploadProgress = false;
                this.auditInformationForm.patchValue(tempObject);
            },
            () => {
                this.uploadProgress = false;
                this.toastrService.error('The file could not be uploaded.', 'Error Uploading File!');
            }
        );
    }

    getUploadedFile(template_name, fileName, sectionIndex, fieldIndex) {
        const fileId = this.auditInformation.sections[sectionIndex].fields[fieldIndex].id;
        this.toastrService.info('Requesting file. Please wait');
        this.assessmentAuditService.getFile(fileId, fileName).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
            },
            failData => {
                this.toastrService.error(`Failed to download file. Error: ${failData.error.error}`);
            }
        );
    }

    getFileNames(template_name, sectionIndex, fieldIndex) {
        if (this.auditInformation.sections[sectionIndex].fields[fieldIndex].fileName) {
            return this.auditInformation.sections[sectionIndex].fields[fieldIndex].fileName;
        }
    }

    removeFile(template_name, fileName, sectionIndex, fieldIndex) {
        const fileId = this.auditInformation.sections[sectionIndex].fields[fieldIndex].id;
        this.assessmentAuditService.removeFile(fileId, fileName).subscribe(
            response => {
                this.toastrService.success('File removed', 'Success');
                const indexOfFileName = this.auditInformation.sections[sectionIndex].fields[
                    fieldIndex
                ].fileName.indexOf(fileName);
                this.auditInformation.sections[sectionIndex].fields[fieldIndex].fileName.splice(indexOfFileName, 1);
                /* if (this.sections[sectionIndex].fields[fieldIndex].fileName.length < 1) {
                    this.sections[sectionIndex].fields.splice(fieldIndex);
                } */
            },
            failData => {
                this.toastrService.error(`Failed to remove file. Error: ${failData.error.error}`);
            }
        );
    }

    setAuditInitOnSubmit() {
        this.initAuditFlag = true;
    }
    getSubcategories(mainCategoryRef: any) {
        if (mainCategoryRef.selected) {
            const mainCategory = mainCategoryRef.selected.value;
            let subCategories = [];
            subCategories = this.auditInformation.nonConformanceCategories.find(main => main.value === mainCategory)
                .subCategories;
            return subCategories;
        } else {
            return [];
        }
    }

    onUpdateNonconformities(nc: Array<INonConformities>): void {
        this.nonConformities = nc;
    }

    onUpdateNC(data: IupdateModel) {
        this.ncEdit.next(data);
    }

    /**
     * @method removeAddon
     * @param data
     * @returns { Array<any> }
     */
    removeAddon(data: Array<INonConformities>): Array<any> {
        if (data === null) {
            return [];
        }
        data.forEach(main => {
            if (main.subCategories) {
                main.subCategories.forEach(sub => {
                    if (sub.subNCData) {
                        sub.subNCData.forEach(subNC => {
                            delete subNC['addedOn'];
                            delete subNC['priorityValue'];
                        });
                    }
                });
            }
        });
        return data;
    }
    cancel(): void {
        this.router.navigate(['/assessment-audit']);
    }
}
