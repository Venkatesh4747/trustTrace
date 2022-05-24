import { CommonServices } from './../../../shared/commonServices/common.service';
import { AuditService } from './../../user/settings/company/audit.service';
import { UtilsService } from './../../../shared/utils/utils.service';
import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AssessmentAuditService } from '../assessment-audit.service';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import {
    IupdateModel,
    INonConformities,
    IAuditPriority
} from '../non-conformities/non-conformities-list/non-conformities-list.model';
import { IDraft, IauditTemplate, ISection, ICreateAuditPayload } from './draft-data.model';
import { NORMALISED_RATINGS } from '../assessment-audit.const';
import { Router } from '@angular/router';

import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';
import { AuthService } from '../../../core';
import { environment } from '../../../../environments/environment';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
const moment = _rollupMoment || _moment;

@Component({
    selector: 'app-view-audit-extracted',
    templateUrl: './view-audit-extracted.component.html',
    styleUrls: ['./view-audit-extracted.component.scss']
})
export class ViewAuditExtractedComponent implements OnInit {
    env = environment;
    id: string;
    pageLoading = true;

    @Output() auditCreated = new EventEmitter();

    extractedAuditForm: FormGroup = new FormGroup({});
    auditInformationForm: FormGroup = new FormGroup({});

    attachmentId = '';
    pdfSrc: any;

    _: any = _;

    suppliers: any;
    facilities: any;
    facilitiesIsLoading: boolean = false;
    normalisedRatings: Array<string>;
    auditTemplate: IauditTemplate;
    overallRatings: any;
    sections: Array<any>;
    ncEdit: Subject<IupdateModel> = new Subject();
    draft: IDraft;
    nonConformities: Array<INonConformities> = [];

    auditInformation: any;
    auditValidFromLocal: any;

    auditInformationFormReady = false;
    btnStatus = {
        saveDraft: false,
        cancel: false,
        createAudit: false
    };

    auditPriority: Array<IAuditPriority> = [];

    collapse = {
        auditBody: true,
        supplierName: true,
        facility: true,
        auditor: true,
        auditDate: true,
        expiryDate: true
    };

    constructor(
        private _formbuilder: FormBuilder,
        private dialogRef: MatDialogRef<ViewAuditExtractedComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService,
        private auditService: AuditService,
        private commonServices: CommonServices,
        private assessmentAuditService: AssessmentAuditService,
        private toastrService: CustomToastrService,
        private router: Router,
        public auth: AuthService
    ) {
        this.id = data.auditId;
        this.normalisedRatings = NORMALISED_RATINGS;
        this.extractedAuditForm = this._formbuilder.group({
            auditName: [''],
            auditStandard: [null],
            auditBody: [''],
            supplierName: [null, Validators.required],
            facility: [null, Validators.required],
            auditor: [''],
            auditValidFromDate: ['', Validators.required],
            auditValidToDate: ['', Validators.required],
            overallRating: [null, Validators.required],
            normalisedRating: [null]
        });

        this.auditInformation = {
            sections: '',
            overAllRatingSection: '',
            nonConformanceCategories: '',
            normalisedRating: ''
        };
    }

    ngOnInit() {
        this.assessmentAuditService.getAuditPriorities().subscribe(
            data => {
                this.auditPriority = data.nc_priority;
                this.initExtractedData();
            },
            error => this.toastrService.error('Something went wrong')
        );
    }

    initExtractedData() {
        this.auditService.auditExtracted(this.id).subscribe(data => {
            this.attachmentId = data['draft']['attachmentId'];
            this.suppliers = data['suppliers'];
            this.auditTemplate = data['auditTemplate'];
            this.overallRatings = data['auditTemplate']['overallRating'];
            this.commonServices.downloadFile(this.attachmentId).subscribe((file: any) => {
                this.pdfSrc = file;
                this.pageLoading = false;
            });
            this.sections = data['draft']['auditData']['data']['sections'];
            this.draft = data['draft'];
            if (this.draft.auditData.nonConformityList) {
                this.mapNCdata();
            } else {
                this.nonConformities = [];
            }
            this.invokeAuditInformationForm();
            if (this.draft) {
                this.fetchFacilityBySupplier(this.draft.auditData.auditee);
            }
        });
    }

    mapNCdata() {
        const ncData = this.draft.auditData.nonConformityList;

        const finalNC: Array<INonConformities> = [];

        ncData.forEach(data => {
            let main = {
                categoryName: '',
                catergoryId: '',
                subCategories: []
            };
            main.categoryName = data.categoryName;
            main.catergoryId = data.catergoryId;

            if (data.subCategoryNonConformityViewList) {
                data.subCategoryNonConformityViewList.forEach(sub => {
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
        this.nonConformities = finalNC;
    }

    getFormControls(formControlName: string) {
        return this.extractedAuditForm.get(formControlName);
    }

    patchExtractForm() {
        this.extractedAuditForm.setValue({
            auditName: this.draft.auditName,
            auditStandard: this.draft.auditTypeId,
            auditBody: this.draft.auditData.auditBody ? this.draft.auditData.auditBody : '',
            supplierName: this.draft.auditData.auditee ? this.draft.auditData.auditee : null,
            facility: this.draft.auditData.facilityId ? this.draft.auditData.facilityId : null,
            auditor: this.draft.auditData.auditor ? this.draft.auditData.auditor : null,
            auditValidFromDate: this.draft.auditData.dateOfAudit ? new Date(this.draft.auditData.dateOfAudit) : null,
            auditValidToDate: this.draft.auditData.validTill ? new Date(this.draft.auditData.validTill) : null,
            overallRating: this.draft.auditData.overallRating ? this.draft.auditData.overallRating : null,
            normalisedRating: this.draft.auditData.normalisedRating ? this.draft.auditData.normalisedRating : null
        });

        this.getFormControls('auditName').disable();
        this.getFormControls('auditStandard').disable();
    }

    getFiledValue(sectionName: string, filedname: string): string {
        const section: ISection = this.sections.find(data => data.header === sectionName);
        if (section) {
            const filed = section.fields.find(data => data.name === filedname);
            if (filed) {
                return filed.value;
            }
        }
        return null;
    }

    replaceWith_(name: string, reverseIt: boolean = false) {
        if (reverseIt) {
            return name.replace(new RegExp('_', 'g'), ' ');
        } else {
            return name.replace(new RegExp(' ', 'g'), '_');
        }
    }

    invokeAuditInformationForm() {
        const final = {};
        this.auditTemplate.sections.forEach(section => {
            if (
                section.hasOwnProperty('metadata') &&
                section.metadata.hasOwnProperty('text_extraction_supported') &&
                section.metadata.text_extraction_supported
            ) {
                const fromGrp = {};
                section.fields.forEach(filed => {
                    const name = this.replaceWith_(filed.name);
                    filed.value = this.getFiledValue(section.header, filed.name);
                    fromGrp[name] = new FormControl(
                        filed.value ? filed.value : null,
                        filed.mandatory ? [Validators.required] : []
                    );
                    filed['fromControl'] = name;
                });
                const sectionName = this.replaceWith_(section.header);
                section['fromControl'] = sectionName;
                final[sectionName] = new FormGroup({
                    ...fromGrp
                });
            }
        });
        this.auditInformationForm = new FormGroup({
            ...final
        });
        this.auditInformationFormReady = true;
    }

    fetchFacilityBySupplier(supplierIdInitial: string = null) {
        this.facilities = null;
        this.extractedAuditForm.patchValue({
            facility: null
        });
        let supplierId = this.extractedAuditForm.value.supplierName;
        if (supplierIdInitial) {
            supplierId = supplierIdInitial;
        }
        if (supplierId === null && supplierIdInitial === null) {
            return this.patchExtractForm();
        }
        this.facilitiesIsLoading = true;
        this.assessmentAuditService.getAllFacility(supplierId).subscribe(
            getAllFacilityResponse => {
                this.facilities = this.utilService.sortOptions(
                    JSON.parse(JSON.stringify(getAllFacilityResponse)),
                    'name'
                );

                this.facilitiesIsLoading = false;
                if (supplierIdInitial) {
                    this.patchExtractForm();
                }
            },
            getAllFacilityErrorResponse => {
                this.toastrService.error(
                    'Something went wrong. Please try again later or contact us if the problem persists.',
                    'Oops!'
                );
                this.facilitiesIsLoading = false;
            }
        );
    }

    closeDialog() {
        this.dialogRef.close();
    }

    onUpdateNonconformities(nc: Array<INonConformities>): void {
        this.nonConformities = nc;
    }

    onUpdateNC(data: IupdateModel): void {
        this.ncEdit.next(data);
    }

    getFacilityName(id: string): string {
        if (id === null) {
            return '';
        }
        return this.facilities.find(data => data.id === id).name;
    }

    onCreateAudit(): void {
        if (this.auth.haveAccess('AUDIT_DRAFT_UPDATE')) {
            if (this.validateForms()) {
                const payload = this.constructPayload();
                this.btnStatus.createAudit = true;

                this.assessmentAuditService.draftToCreateAudit(this.id, payload).subscribe(
                    res => {
                        this.toastrService.success('Audit created', 'Success');
                        if (res.data.auditId) {
                            this.landViewAudit(res.data.auditId);
                        } else {
                            this.landAuditList(100);
                        }
                        this.btnStatus.createAudit = false;
                        this.auditCreated.emit('success');
                    },
                    error => {
                        this.toastrService.error('Something went wrong', 'Error');
                        this.btnStatus.createAudit = false;
                    }
                );
            } else {
                this.toastrService.info('Please fill all the mandatory fileds', 'Info');
            }
        } else {
            this.toastrService.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    onSaveDraft(): void {
        if (this.auth.haveAccess('AUDIT_DRAFT_UPDATE')) {
            const payload = this.constructPayload();
            this.btnStatus.saveDraft = true;

            this.assessmentAuditService.saveDraft(this.id, payload).subscribe(
                res => {
                    if (res.successful) {
                        this.toastrService.success('Draft Saved', 'Success');
                        this.landDraftList(100);
                        this.btnStatus.saveDraft = false;
                    } else {
                        this.toastrService.error('Something went wrong', 'Error');
                    }
                },
                error => {
                    this.toastrService.error('Something went wrong', 'Error');
                    this.btnStatus.saveDraft = false;
                }
            );
        } else {
            this.toastrService.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    validateForms(): boolean {
        return this.extractedAuditForm.valid && this.auditInformationForm.valid;
    }

    constructPayload(): ICreateAuditPayload {
        const auditInfo = this.extractedAuditForm.value;
        this.btnStatus.createAudit = true;
        const payload: ICreateAuditPayload = {
            auditData: {
                auditor: auditInfo.auditor,
                auditee: auditInfo.supplierName,
                facilityId: auditInfo.facility,
                auditBody: auditInfo.auditBody,
                dateOfAudit: auditInfo.auditValidFromDate,
                validTill: auditInfo.auditValidToDate,
                overallRating: auditInfo.overallRating,
                normalisedRating: auditInfo.normalisedRating,
                nonConformities: this.removeAddon(JSON.parse(JSON.stringify(this.nonConformities))),
                data: {
                    sections: this.mapSectionDatas()
                }
            }
        };

        return payload;
    }

    mapSectionDatas(): Array<ISection> {
        const clone: Array<ISection> = JSON.parse(JSON.stringify(this.auditTemplate.sections));
        clone.forEach((section, index) => {
            if (
                section.hasOwnProperty('metadata') &&
                section.metadata.hasOwnProperty('text_extraction_supported') &&
                section.metadata.text_extraction_supported
            ) {
                section.fields.forEach(filed => {
                    filed.value = this.auditInformationForm.value[this.replaceWith_(section.header)][
                        this.replaceWith_(filed.name)
                    ];
                    if (filed.hasOwnProperty('fromControl')) {
                        delete section['fromControl'];
                    }
                });
                delete section['metadata'];
            } else {
                //clone.splice(index, 1);
                this.sections.forEach(extractedDataSection => {
                    if (extractedDataSection.header === section.header) {
                        clone[index] = extractedDataSection;
                    }
                });
                if (section.hasOwnProperty('fromControl')) {
                    delete section['fromControl'];
                }
            }
        });
        return clone;
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
                            delete subNC['updatedOn'];
                            delete subNC['isProgress'];
                        });
                    }
                });
            }
        });
        return data;
    }

    landAuditList(withIn: number): void {
        this.closeDialog();
        setTimeout(() => {
            this.router.navigate(['/assessment-audit']);
        }, withIn);
    }

    landViewAudit(auditId: string): void {
        this.closeDialog();
        this.router.navigate([`/assessment-audit/${auditId}`]);
    }

    landDraftList(withIn: number): void {
        this.closeDialog();
        setTimeout(() => {
            this.router.navigate(['/assessment-audit'], { fragment: 'Drafts' });
        }, withIn);
    }

    getExtractedValue(header: string, filedName: string) {
        const section = this.draft.extractedData.data.sections.find(data => data.header === header);
        if (section && section.hasOwnProperty('fields')) {
            const value = section.fields.find(data => data.name === filedName);
            if (value && value.hasOwnProperty('extracted_score')) {
                return value.extracted_score;
            }
        }
        return null;
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

    toggleCollapse(filed: string) {
        this.collapse[filed] = !this.collapse[filed];
    }
}
