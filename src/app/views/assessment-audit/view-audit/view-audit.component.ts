import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as _ from 'lodash';
import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';
import { forkJoin, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { AssessmentAuditService } from '../assessment-audit.service';
import { NORMALISED_RATINGS } from '../assessment-audit.const';
import {
    INonConformities,
    IAuditPriority,
    IupdateModel
} from '../non-conformities/non-conformities-list/non-conformities-list.model';
import { ContextService } from '../../../shared/context.service';
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
    selector: 'app-view-audit',
    templateUrl: './view-audit.component.html',
    styleUrls: ['./view-audit.component.scss'],
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE]
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ]
})
export class ViewAuditComponent implements OnInit {
    pageLoading = false;
    auditId: string;
    inViewMode = false;
    auditResponse: any;
    auditInfo: any;
    env = environment;
    nonConformitiesCount: {
        addressed: number;
        unaddressed: number;
        total: number;
    };
    _: any = _;

    moment = moment;

    isEditing: any = {};
    isProcessing: any;

    editForm: FormGroup;
    nonConformities: any;
    suppliersList: any;
    auditTypesList: any;
    auditValidFromLocal: any;
    auditInformation: any;
    auditInformationForm: any;
    auditHistoryData = [];

    @ViewChild('editNC', { static: false }) editNC: ElementRef;
    @ViewChild('editSubNC', { static: false }) editSubNC: ElementRef;
    removeFileQueue: any;
    normalisedRatings = NORMALISED_RATINGS;
    nonConformitiesStatic: Array<INonConformities> = [];

    auditPriority: Array<IAuditPriority> = [];

    ncEdit: Subject<IupdateModel> = new Subject();

    // Only PDF supported
    fileExtension = 'pdf';
    uploadProgress = false;

    uploadData = {
        existingData: [],
        newlyAdded: []
    };
    uploadFileProp = [];
    uploadHttpObservers = [];
    removeHttpObservers = [];
    state = {
        uploadIsCalled: false,
        submitIsCalled: false,
        uploadHaveError: false,
        removeHaveError: false
    };

    reqIndexData = {
        sectionIndex: null,
        fieldIndex: null,
        templateName: '',
        fileID: null
    };

    constructor(
        private assessmentAuditService: AssessmentAuditService,
        private toastrService: CustomToastrService,
        private analyticsService: AnalyticsService,
        private route: ActivatedRoute,
        private appContext: ContextService,
        private router: Router,
        public commonServices: CommonServices,
        private _formBuilder: FormBuilder
    ) {
        this.isProcessing = {
            supplierInformationForm: false,
            auditInformationForm: false
        };

        this.auditInformation = {
            sections: '',
            overAllRatingSection: '',
            nonConformanceCategories: '',
            normalisedRating: ''
        };

        this.nonConformities = {};

        this.route.params.subscribe(params => (this.auditId = params['id']));
        this.inViewMode = this.route.snapshot.routeConfig.path.indexOf('edit') !== -1 ? false : true;
    }

    ngOnInit() {
        this.pageLoading = true;
        this.assessmentAuditService.addAudit().subscribe(
            addAuditResponse => {
                this.suppliersList = this.ripKeyValueFromObject(addAuditResponse['suppliers']);
                this.auditTypesList = this.ripKeyValueFromObject(addAuditResponse['templates']);

                this.assessmentAuditService.getAuditDetail(this.auditId).subscribe(
                    auditDetailResponse => {
                        const _simpleFormGroup: FormGroup | any = {};

                        this.auditResponse = JSON.parse(JSON.stringify(auditDetailResponse));
                        const auditInfo = this.auditResponse['data'];

                        this.auditInfo = {};
                        this.auditInfo['summary'] = [
                            {
                                title: 'Audit Name',
                                canEdit: true,
                                type: 'TEXT',
                                formControlName: 'name',
                                value: auditInfo.name,
                                required: true
                            },
                            {
                                title: 'Audit Standard',
                                canEdit: false,
                                formControlName: 'auditStandard',
                                value: auditInfo.auditStandard
                            },
                            {
                                title: 'Audit Type',
                                canEdit: false,
                                type: 'TEXT',
                                formControlName: 'type',
                                value: auditInfo.type
                            },
                            {
                                title: 'Audit Body',
                                canEdit: false,
                                type: 'TEXT',
                                formControlName: 'auditBody',
                                value: auditInfo.auditBody
                            },
                            {
                                title: 'Auditor',
                                canEdit: true,
                                type: 'TEXT',
                                formControlName: 'auditor',
                                value: auditInfo.auditor,
                                required: false
                            },
                            {
                                title: 'Supplier',
                                canEdit: false,
                                formControlName: 'auditee',
                                value: auditInfo.auditee
                            },
                            {
                                title: 'Facility',
                                canEdit: false,
                                formControlName: 'facilityName',
                                value: auditInfo.facilityName
                            },
                            {
                                title: 'Normalised Rating',
                                canEdit: true,
                                formControlName: 'normalisedRating',
                                value: auditInfo.normalisedRating,
                                required: false,
                                type: 'SELECT'
                            },
                            {
                                title: 'Overall Rating',
                                canEdit: true,
                                formControlName: 'OverAll_Rating',
                                value: auditInfo.overallRating
                            },
                            {
                                title: 'Date of Audit',
                                canEdit: false,
                                type: 'DATE',
                                formControlName: 'dateOfAudit',
                                value: moment(auditInfo.dateOfAudit).format('DD MMM YYYY')
                            },
                            {
                                title: 'Expiry',
                                canEdit: false,
                                type: 'DATE',
                                formControlName: 'validTill',
                                value: moment(auditInfo.validTill).format('DD MMM YYYY')
                            },
                            {
                                title: 'Validity Status',
                                canEdit: false,
                                formControlName: 'status',
                                value: auditInfo.validityStatus
                            }
                        ];

                        this.auditInfo['sections'] = JSON.parse(JSON.stringify(auditInfo['data'].sections));

                        this.auditInfo['nonConformities'] = [];

                        this.nonConformitiesCount = {
                            addressed: 0,
                            unaddressed: 0,
                            total: 0
                        };

                        auditInfo.nonConformityList.forEach(nonConformity => {
                            this.nonConformitiesCount[nonConformity.catergoryId] = {
                                addressed: 0,
                                unaddressed: 0,
                                total: 0
                            };

                            const ncData = {
                                categoryId: nonConformity.catergoryId,
                                categoryName: nonConformity.categoryName,
                                subCategories: []
                            };

                            if (
                                nonConformity.subCategoryNonConformityViewList &&
                                nonConformity.subCategoryNonConformityViewList.length > 0
                            ) {
                                nonConformity.subCategoryNonConformityViewList.forEach(sc => {
                                    const sc_addressed = sc.subNCData.filter(data => data.status === 'IN_ACTIVE');
                                    const sc_unaddressed = sc.subNCData.filter(data => data.status === 'ACTIVE');

                                    sc.addressed = sc_addressed;
                                    sc.unaddressed = sc_unaddressed;

                                    this.nonConformitiesCount.addressed += sc_addressed.length;
                                    this.nonConformitiesCount.unaddressed += sc_unaddressed.length;
                                    this.nonConformitiesCount.total += sc_addressed.length + sc_unaddressed.length;

                                    this.nonConformitiesCount[nonConformity.catergoryId].addressed +=
                                        sc_addressed.length;
                                    this.nonConformitiesCount[nonConformity.catergoryId].unaddressed +=
                                        sc_unaddressed.length;
                                    this.nonConformitiesCount[nonConformity.catergoryId].total +=
                                        sc_unaddressed.length + sc_addressed.length;

                                    this.nonConformitiesCount[nonConformity.catergoryId][sc.subCategoryId] = {
                                        addressed: sc_addressed.length,
                                        unaddressed: sc_unaddressed.length,
                                        total: sc_addressed.length + sc_unaddressed.length
                                    };
                                });
                                ncData.subCategories = JSON.parse(
                                    JSON.stringify(nonConformity.subCategoryNonConformityViewList)
                                );
                            }

                            this.auditInfo['nonConformities'].push(ncData);
                        });

                        const auditTemplate = this.auditTypesList.filter(
                            data => data.name === auditInfo.auditStandard
                        )[0];

                        this.assessmentAuditService.getTemplates(auditTemplate, { id: '' }, { id: '' }).subscribe(
                            getTemplatesResponse => {
                                const section_data = getTemplatesResponse['template'];
                                this.auditInformation.sections = section_data['sections'];
                                this.auditInformation.overAllRatingSection = section_data['overallRating'];
                                this.auditInformation.overAllRatingSection = section_data['overallRating'];
                                this.auditInformation.normalisedRating = {};

                                this.auditInformation.nonConformanceCategories =
                                    getTemplatesResponse['non_conformance_categories'];
                                this.mapNCdata();
                                this.auditInformation.sections = JSON.parse(JSON.stringify(this.auditInfo['sections']));

                                this.auditInfo['summary'].forEach(item => {
                                    if (item.formControlName === 'OverAll_Rating') {
                                        item['field'] = JSON.parse(
                                            JSON.stringify(this.auditInformation.overAllRatingSection)
                                        );
                                    }
                                });

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
                                        validations.push(
                                            Validators.min(this.auditInformation.overAllRatingSection.min)
                                        );
                                    }
                                    if (this.auditInformation.overAllRatingSection.hasOwnProperty('max')) {
                                        validations.push(
                                            Validators.max(this.auditInformation.overAllRatingSection.max)
                                        );
                                    }
                                }
                                if (this.auditInformation.overAllRatingSection.type === 'TEXT') {
                                    if (this.auditInformation.overAllRatingSection.hasOwnProperty('minLength')) {
                                        validations.push(
                                            Validators.minLength(this.auditInformation.overAllRatingSection.minLength)
                                        );
                                    }
                                    if (this.auditInformation.overAllRatingSection.hasOwnProperty('maxLength')) {
                                        validations.push(
                                            Validators.maxLength(this.auditInformation.overAllRatingSection.maxLegth)
                                        );
                                    }
                                }
                                if (!this.auditInformation.overAllRatingSection.hasOwnProperty('value')) {
                                    this.auditInformation.overAllRatingSection['value'] = null;
                                }
                                _simpleFormGroup[formControlName] = this._formBuilder.control(
                                    this.auditInformation.overAllRatingSection.value,
                                    {
                                        validators: validations
                                    }
                                );
                                // create form control for normalised Rating
                                const normalisedRatingFormControl = 'normalisedRating';
                                this.auditInformation.normalisedRating[formControlName] = normalisedRatingFormControl;
                                _simpleFormGroup[normalisedRatingFormControl] = this._formBuilder.control('');

                                // Generate FormControls for dynamic fields.
                                this.auditInformation.sections.forEach((section: any) => {
                                    const fields = section.fields;

                                    fields.forEach((field: any) => {
                                        const formControlName = field.name
                                            .replace(/[^a-zA-Z0-9 ]/g, '')
                                            .replace(/ /g, '_');
                                        field.formControlName = formControlName;
                                        const validations = [];
                                        if (field.mandatory) {
                                            validations.push(Validators.required);
                                        }
                                        if (field.type === 'NUMBER') {
                                            if (field.hasOwnProperty('min')) {
                                                validations.push(Validators.min(field.min));
                                            }
                                            if (field.hasOwnProperty('max')) {
                                                validations.push(Validators.max(field.max));
                                            }
                                        }
                                        if (field.type === 'TEXT') {
                                            if (field.hasOwnProperty('minLength')) {
                                                validations.push(Validators.minLength(field.minLength));
                                            }
                                            if (field.hasOwnProperty('maxLength')) {
                                                validations.push(Validators.maxLength(field.maxLegth));
                                            }
                                        }

                                        if (!field.hasOwnProperty('value')) {
                                            field.value = null;
                                        }

                                        _simpleFormGroup[formControlName] = this._formBuilder.control(field.value, {
                                            validators: validations
                                        });
                                    });
                                });

                                this.auditInformation.nonConformanceCategories.forEach(
                                    (nonConformanceCategory: any) => {
                                        if (!nonConformanceCategory.subCategories) {
                                            nonConformanceCategory.subCategories = [];
                                        }

                                        nonConformanceCategory.subCategories.forEach(sc => {
                                            const sc_formControlName =
                                                'sc_non_conformity_' +
                                                nonConformanceCategory.catergoryId +
                                                sc.value.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
                                            sc.formControlName = sc_formControlName;

                                            _simpleFormGroup[sc_formControlName] = this._formBuilder.control('');
                                        });

                                        _simpleFormGroup[formControlName] = this._formBuilder.control('');
                                    }
                                );

                                // this.editForm = this._formBuilder.group({
                                //     name: [auditInfo.name, Validators.required],
                                //     auditTypeName: [{ value: auditInfo.auditTypeName, disabled: true }, Validators.required],
                                //     auditee: [{ value: auditInfo.auditee, disabled: true }, Validators.required],
                                //     auditor: [{ value: auditInfo.auditor, disabled: true }, Validators.required],
                                //     dateOfAudit: [moment(auditInfo.dateOfAudit), Validators.required],
                                //     validTill: [moment(auditInfo.validTill), Validators.required],
                                //     OverAll_Rating: [auditInfo.overallRating, Validators.required]
                                // });

                                _simpleFormGroup['name'] = this._formBuilder.control(auditInfo.name, {
                                    validators: [Validators.required]
                                });

                                _simpleFormGroup['auditStandard'] = this._formBuilder.control(
                                    {
                                        value: this.auditResponse['data'].auditStandard,
                                        disabled: true
                                    },
                                    {
                                        validators: [Validators.required]
                                    }
                                );

                                _simpleFormGroup['auditee'] = this._formBuilder.control(
                                    {
                                        value: this.auditResponse['data'].auditee,
                                        disabled: true
                                    },
                                    {
                                        validators: [Validators.required]
                                    }
                                );

                                _simpleFormGroup['auditor'] = this._formBuilder.control(
                                    this.auditResponse['data'].auditor
                                );

                                _simpleFormGroup['dateOfAudit'] = this._formBuilder.control(
                                    moment(this.auditResponse['data'].dateOfAudit),
                                    {
                                        validators: [Validators.required]
                                    }
                                );

                                _simpleFormGroup['validTill'] = this._formBuilder.control(
                                    moment(this.auditResponse['data'].validTill),
                                    {
                                        validators: [Validators.required]
                                    }
                                );
                                _simpleFormGroup['normalisedRating'] = this._formBuilder.control(
                                    this.auditResponse['data'].normalisedRating
                                );
                                if (!this.inViewMode) {
                                    const section_data = this.auditResponse['data'];
                                    const sections = section_data['data']['sections'];

                                    section_data['nonConformityList'].forEach((nonConformanceCategory: any) => {
                                        nonConformanceCategory.subCategoryNonConformityViewList.forEach(sc => {
                                            const sc_formControlName =
                                                'sc_non_conformity_' +
                                                nonConformanceCategory.catergoryId +
                                                sc.subCategoryName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
                                            sc.formControlName = sc_formControlName;

                                            this.nonConformities[sc_formControlName] = JSON.parse(
                                                JSON.stringify(sc.subNCData.filter(data => data.status !== 'DELETED'))
                                            );

                                            _simpleFormGroup[sc_formControlName] = this._formBuilder.control('');
                                        });

                                        this.auditInformation.nonConformanceCategories.forEach((ncc: any) => {
                                            if (ncc.id === nonConformanceCategory.id) {
                                                ncc.subCategories = JSON.parse(
                                                    JSON.stringify(
                                                        nonConformanceCategory.subCategoryNonConformityViewList
                                                    )
                                                );
                                            }
                                        });

                                        _simpleFormGroup[formControlName] = this._formBuilder.control('');
                                    });
                                }

                                this.auditInformationForm = this._formBuilder.group(_simpleFormGroup);

                                if (!this.inViewMode) {
                                    const section_data = this.auditResponse['data'];
                                    const sections = section_data['data']['sections'];

                                    this.auditInformationForm.patchValue({
                                        OverAll_Rating: section_data['overallRating']
                                    });

                                    sections.forEach(section => {
                                        section.fields.forEach(field => {
                                            const formControlName = field.name
                                                .replace(/[^a-zA-Z0-9 ]/g, '')
                                                .replace(/ /g, '_');
                                            const tempFormControl = {};
                                            tempFormControl[formControlName] = field.value;
                                            this.auditInformationForm.patchValue(tempFormControl);
                                        });
                                    });
                                }
                                this.getAuditHistory();
                                this.pageLoading = false;
                                const fileNames = this.getFileNamesFormControl();
                                if (fileNames) {
                                    this.uploadData.existingData = fileNames.hasOwnProperty('fileName')
                                        ? fileNames.fileName
                                        : [];
                                    this.reqIndexData.fileID = fileNames.hasOwnProperty('id') ? fileNames.id : [];
                                    this.uploadData.newlyAdded = JSON.parse(
                                        JSON.stringify(this.uploadData.existingData)
                                    );
                                }
                            },
                            getTemplatesErrorResponse => {
                                this.toastrService.error(
                                    'Something went wrong. Please try after some time or contact us if the issue persists',
                                    'Oops!'
                                );
                                this.pageLoading = false;
                            }
                        );
                    },
                    auditDetailErrorResponse => {
                        this.toastrService.error(
                            'Something went wrong. Could not fetch the data from server.',
                            'Oops!'
                        );
                        this.pageLoading = false;
                    }
                );
            },
            addAuditErrorResponse => {
                this.toastrService.error(
                    'Something went wrong. Please try again later or contact us if the problem persists.',
                    'Oops!'
                );
            }
        );

        this.analyticsService.trackEvent('Audit Details Page', {
            Origin: 'Assessment-audit',
            AuditId: this.auditId,
            Action: 'audit details page visited'
        });

        this.assessmentAuditService.getAuditPriorities().subscribe(
            data => {
                this.auditPriority = data.nc_priority;
            },
            error => this.toastrService.error('Something went wrong')
        );
    }

    getFileNamesFormControl(): any | null {
        const sections = this.auditInformation.sections;
        if (sections) {
            const document = sections.find(data => data.header === 'Documents Required');
            if (document && document.hasOwnProperty('fields') && document.fields.length > 0) {
                return this.auditInformationForm.value[document.fields[0].formControlName];
            }
        }
        return null;
    }
    getAuditHistory() {
        this.assessmentAuditService.getAuditHistory(this.auditId).subscribe(
            response => {
                this.auditHistoryData = response['data']['data'];
            },
            errorResponse => {
                this.toastrService.error('Something went wrong. Please try again later', 'Oops');
            }
        );
    }
    getSubCategoryFormControlName(ncName, scName) {
        return 'sc_non_conformity_' + ncName + scName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
    }

    auditFormHasError(controlName: string, errorName: string) {
        return this.auditInformationForm.controls[controlName].hasError(errorName);
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
        return rippedObject;
    }

    auditValidFromFilter(date: Date) {
        return moment(date).isSameOrBefore(new Date());
    }

    auditValidToFilter(date: Date) {
        return moment(date).isAfter(moment(this.auditValidFromLocal));
    }

    auditValidFromLocalUpdate($event) {
        this.auditValidFromLocal = moment($event.value);
    }

    submitAuditDetails() {
        if (!this.auditInformationForm.valid) {
            this.toastrService.error('Please correct the errors on the form to proceed recording the audit', 'Error');
            this.isProcessing.auditInformationForm = false;
            return;
        }

        this.isProcessing.auditInformationForm = true;

        const auditForm = JSON.parse(JSON.stringify(this.auditInformationForm.value));

        const sections = JSON.parse(JSON.stringify(this.auditInformation.sections));

        sections.forEach(section => {
            const fields = section.fields;

            fields.forEach(field => {
                field.value = auditForm[field.formControlName];
                delete field.formControlName;
            });
        });
        const ncData: Array<any> = this.removeAddon(JSON.parse(JSON.stringify(this.nonConformitiesStatic)));

        const payload = {
            name: auditForm.name,
            auditor: auditForm.auditor,
            standard: this.auditResponse['data'].auditStandard.toUpperCase().replace(/ /g, '_'),
            dateOfAudit: this.auditInfo.dateOfAudit, // moment(auditForm.dateOfAudit),
            validTill: this.auditInfo.validTill, // moment(auditForm.validTill),
            overallRating: auditForm.OverAll_Rating,
            normalisedRating: auditForm.normalisedRating,
            data: {
                sections: this.reconstructSection(sections)
            },
            nonConformities: ncData
        };
        this.isProcessing.auditInformationForm = false;

        this.assessmentAuditService.updateAudit(this.auditId, payload).subscribe(
            saveAuditResponse => {
                this.analyticsService.trackEvent('Audit Details Page', {
                    Origin: 'Assessment-audit',
                    AuditId: this.auditId,
                    Action: 'Audit Update'
                });
                this.isProcessing.auditInformationForm = false;
                if (this.state.uploadHaveError) {
                    this.toastrService.info('some files are not uploaded , Please try again', 'info');
                }
                if (this.state.removeHaveError) {
                    this.toastrService.info('some files are not removed. Please try again', 'info');
                }

                if (!this.state.uploadHaveError && !this.state.removeHaveError) {
                    this.toastrService.success(
                        'The audit has been recorded. Redirecting to audit list page',
                        'Success'
                    );
                    this.router.navigate(['/assessment-audit', this.auditId]);
                    setTimeout(() => {
                        this.appContext.cardViewRefresh.next(true);
                    }, 3000);
                }
                setTimeout(() => {
                    this.auditInformationForm = null;
                    this.nonConformities = null;
                    this.suppliersList = null;
                    this.auditInformation = null;
                });
                this.resetData();
                // forkJoin(this.removeFileQueue).subscribe(response => {
                //     // Files deleted
                // });
            },
            saveAuditErrorResponse => {
                this.toastrService.error(
                    'Something went wrong. Please try again later or contact us if the issue persists',
                    'Oops!'
                );
                this.resetData();
                this.isProcessing.auditInformationForm = false;
            }
        );
    }

    reconstructSection(sections) {
        sections.forEach(section => {
            if (section.header === 'Documents Required') {
                section.fields[0].fileName = this.uploadData.newlyAdded;
                section.fields[0].id = this.reqIndexData.fileID;
                section.fields[0].value = {
                    id: this.reqIndexData.fileID,
                    fileName: this.uploadData.newlyAdded
                };
            }
        });
        return sections;
    }

    resetData() {
        this.uploadHttpObservers = [];
        this.removeHttpObservers = [];
        this.state = {
            uploadIsCalled: false,
            submitIsCalled: false,
            uploadHaveError: false,
            removeHaveError: false
        };
        this.uploadFileProp = [];
    }

    editAudit() {
        this.router.navigate(['edit'], { relativeTo: this.route });
    }

    goBack() {
        if (this.inViewMode) {
            this.commonServices.goBack(['/', 'assessment-audit']);
        } else {
            this.commonServices.goToLocationBack();
        }
    }

    InvokeFileUpload(template_name) {
        const element = document.getElementById('file_upload_' + template_name);
        element.click();
    }

    uploadFile(template_name: string, files: FileList, sectionIndex: number, fieldIndex: number) {
        if (this.uploadData.newlyAdded.length > 0) {
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

        if (this.uploadData.newlyAdded.indexOf(fileName) === -1) {
            this.uploadData.newlyAdded.push(fileName);
            this.uploadFileProp.push({ fileName, file: fileToUpload });
        } else {
            this.toastrService.info('The file is already in queue', 'Info');
        }
    }

    getUploadedFile(template_name, fileName, sectionIndex, fieldIndex) {
        let fileId = '';
        if (this.inViewMode) {
            fileId = this.auditInformation.sections[sectionIndex].fields[fieldIndex].id;
        } else {
            fileId = this.auditInformationForm.value[template_name].id;
        }
        this.toastrService.info('Requesting file. Please wait');
        this.assessmentAuditService.getFile(fileId, fileName).subscribe(
            response => {
                const blob = new Blob([response], {
                    type: 'application/octet-stream'
                });
                FileSaver.saveAs(blob, fileName);
            },
            failData => {
                this.toastrService.error(`Failed to download file. Error: ${failData.error.error}`);
            }
        );
    }

    getFileNames(template_name, sectionIndex, fieldIndex) {
        if (!this.inViewMode) {
            const formControlName = template_name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
            if (
                this.auditInformationForm.value[formControlName] &&
                this.auditInformationForm.value[formControlName].fileName
            ) {
                return this.auditInformationForm.value[formControlName].fileName;
            }
        } else {
            if (this.auditInformation.sections[sectionIndex].fields[fieldIndex].fileName) {
                return this.auditInformation.sections[sectionIndex].fields[fieldIndex].fileName;
            }
        }
    }

    removeFile(template_name, fileName, sectionIndex, fieldIndex, fileIndex) {
        let fileId = '';
        if (this.inViewMode) {
            if (this.auditInformation.sections[sectionIndex].fields[fieldIndex]) {
                fileId = this.auditInformation.sections[sectionIndex].fields[fieldIndex].id;
            }
        } else {
            if (this.auditInformationForm.value[template_name]) {
                fileId = this.auditInformationForm.value[template_name].id;
            }
        }

        if (this.reqIndexData.fieldIndex === null) {
            this.reqIndexData = {
                fieldIndex,
                sectionIndex,
                templateName: template_name,
                fileID: fileId
            };
        }

        this.uploadData.newlyAdded.splice(fileIndex, 1);
        const index = this.uploadFileProp.find(data => data.fileName === fileName);
        if (index) {
            this.uploadFileProp.forEach((file, i) => {
                if (file.fileName === fileName) {
                    this.uploadFileProp.splice(i, 1);
                }
            });
        }
    }

    shouldMainCategoryBeShown(nc_category, type = 'unaddressed') {
        let isShown = false;

        if (nc_category.hasOwnProperty(type) && nc_category[type].length > 0) {
            return (isShown = true);
        }

        nc_category.subCategories.forEach(sc => {
            if (!sc.hasOwnProperty(type)) {
                return;
            }
            if (sc[type].length > 0) {
                isShown = true;
            }
        });

        return isShown;
    }

    nonConformitiesLength(): number {
        let ncLength = 0;
        this.nonConformitiesStatic.forEach(ele => {
            ele.subCategories.forEach(sub => {
                sub.subNCData.forEach(nc => {
                    if (nc.status === 'ACTIVE' || nc.status === 'IN_ACTIVE') {
                        ncLength = ncLength + 1;
                    }
                });
            });
        });
        return ncLength;
    }

    mapNCdata() {
        const ncData = this.auditInfo.nonConformities;

        const finalNC: Array<INonConformities> = [];

        ncData.forEach(data => {
            let main = {
                categoryName: '',
                catergoryId: '',
                subCategories: []
            };
            main.categoryName = data.categoryName;
            main.catergoryId = data.categoryId;

            if (data.subCategories) {
                data.subCategories.forEach(sub => {
                    let subcat = {
                        subCategoryId: '',
                        value: '',
                        subNCData: []
                    };
                    subcat.subCategoryId = sub.subCategoryId;
                    subcat.value = sub.subCategoryName;

                    if (sub.subNCData) {
                        sub.subNCData.forEach(nc => {
                            let subnc = {
                                addedOn: new Date(),
                                value: '',
                                updatedOn: '',
                                priorityId: '',
                                priorityValue: '',
                                status: '',
                                id: ''
                            };
                            subnc.addedOn = nc.addedOn;
                            subnc.id = nc.id;
                            subnc.value = nc.value;
                            subnc.updatedOn = nc.updatedOn;
                            subnc.priorityId = nc.priorityId;
                            subnc.priorityValue = this.getPriority(nc.priorityId).categoryName;
                            subnc.status = nc.status;
                            subcat.subNCData.push(subnc);
                        });
                    }
                    main.subCategories.push(subcat);
                });
            }
            finalNC.push(main);
        });
        this.nonConformitiesStatic = finalNC;
    }

    getPriority(id: string): IAuditPriority {
        const resp = {
            categoryId: null,
            categoryName: 'NA',
            ncDeadlineValue: null,
            ncDeadLineUnit: null,
            mailReminderValue: null,
            mailReminderUnit: null,
            status: 'IN_ACTIVE'
        };
        if (id === undefined || id === '' || id === null) {
            return resp;
        }
        const filteredValue = this.auditPriority.find(data => data.categoryId === id);
        if (filteredValue) {
            return filteredValue;
        } else {
            return resp;
        }
    }

    onUpdateNonconformities(nc: Array<INonConformities>): void {
        this.nonConformitiesStatic = nc;
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
                    sub.subCategoryName = sub.value; // remove this once api fix done
                    if (sub.subNCData) {
                        sub.subNCData.forEach(subNC => {
                            // delete subNC['addedOn'];
                            delete subNC['priorityValue'];
                            // delete subNC['updatedOn'];
                            delete subNC['isProgress'];
                        });
                    }
                });
            }
        });
        return data;
    }

    removeFileProcess() {
        if (this.removeHttpObservers.length === 0) {
            this.uploadFileProcess();
            return;
        }
        forkJoin(this.removeHttpObservers).subscribe(
            response => {
                if (!this.state.uploadIsCalled) {
                    this.uploadFileProcess();
                    this.state.uploadIsCalled = true;
                }
            },
            err => {
                this.state.removeHaveError = true;
                const failData = err.error;
                const tempObject = {};

                if (Array.isArray(failData)) {
                    failData.forEach(failUpload => {
                        this.uploadData.newlyAdded.push(failUpload['data'].fileName);
                    });
                } else {
                    this.uploadData.newlyAdded.push(failData['data'].fileName);
                }
                this.auditInformationForm.patchValue(tempObject);
                if (!this.state.uploadIsCalled) {
                    this.uploadFileProcess();
                    this.state.uploadIsCalled = true;
                }
            }
        );
    }

    uploadFileProcess() {
        if (this.uploadHttpObservers.length === 0) {
            this.submitAuditDetails();
        }
        forkJoin(this.uploadHttpObservers).subscribe(
            data => {
                if (Array.isArray(data)) {
                    data.forEach(fileUpload => {
                        this.uploadData.newlyAdded = fileUpload['data'].fileName;
                        this.uploadData.existingData = fileUpload['data'].fileName;
                        this.reqIndexData.fileID = fileUpload['data'].id;
                    });
                } else {
                    this.uploadData.newlyAdded = data['data']['fileName'];
                    this.uploadData.existingData = data['data']['fileName'];
                }
                if (!this.state.submitIsCalled) {
                    this.submitAuditDetails();
                }
            },
            error => {
                this.state.uploadHaveError = true;
                if (!this.state.submitIsCalled) {
                    this.submitAuditDetails();
                }
            }
        );
    }

    startProcessAuditSave() {
        this.isProcessing.auditInformationForm = true;
        this.uploadData.newlyAdded.forEach(added => {
            if (this.uploadData.existingData.indexOf(added) === -1) {
                const data = this.uploadFileProp.find(file => file.fileName === added);
                this.uploadHttpObservers.push(
                    this.assessmentAuditService.uploadFile(data.file, this.reqIndexData.fileID)
                );
            }
        });

        this.uploadData.existingData.forEach(exis => {
            if (this.uploadData.newlyAdded.indexOf(exis) === -1) {
                this.removeHttpObservers.push(this.assessmentAuditService.removeFile(this.reqIndexData.fileID, exis));
            }
        });

        this.removeFileProcess();
    }
}
