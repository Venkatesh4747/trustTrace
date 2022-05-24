import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as _ from 'lodash';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { AssessmentType, AuditPayload, Supplier, TTScoreField, TTScoreParam } from '../assessment-audit.model';
import { AssessmentAuditService } from '../assessment-audit.service';
import { Facility } from './../assessment-audit.model';

@Component({
    selector: 'app-record-audit',
    templateUrl: './record-audit.component.html',
    styleUrls: ['./record-audit.component.scss']
})
export class RecordAuditComponent implements OnInit {
    _: any = _;
    env = environment;
    overallRating: any = {};
    overallRatingSelected: any;
    numberOfNonConformities: number;

    sections: any = [];
    section_data: any = [];
    recordAuditFormError = '';
    mandatoryFieldError = 'Please fill mandatory fields';
    outOfRangeErrorMsg = 'Please set the value within range';
    outOfRangeError = false;
    assessmentType = '';

    pageLoading = true;
    showTTScores = false;

    recordAuditForm: FormGroup;
    selectedAssessmentType: AssessmentType;
    selectedSupplier: Supplier;
    selectedFacility: Facility;
    assessmentTypes: AssessmentType[] = [];
    suppliers: Supplier[] = [];
    facilities: Facility[] = [];
    ttScoreFields: TTScoreField[] = [];
    ttScores: TTScoreParam[] = [];

    constructor(
        private _formBuilder: FormBuilder,
        private router: Router,
        private toastr: CustomToastrService,
        private assessmentAuditService: AssessmentAuditService,
        private analyticsService: AnalyticsService,
        private localizationService: LocalizationService
    ) {}

    ngOnInit() {
        this.recordAuditForm = this._formBuilder.group(
            {
                assessmentNameCtrl: ['', Validators.required],
                supplierNameCtrl: ['', Validators.required],
                facilityNameCtrl: ['', Validators.required],
                dateCtrl: ['', Validators.required],
                validityCtrl: ['', Validators.required],
                assessmentTypeCtrl: ['', Validators.required]
            },
            { validator: this.validateDate('dateCtrl', 'validityCtrl') }
        );

        this.assessmentAuditService.addAudit().subscribe(response => {
            const data = response.data;
            this.localizationService.addToMasterData(response.data['masterData']);

            // Get Assessment Types
            for (const [key, value] of Object.entries(data['templates'])) {
                const assessmentType: any = {
                    id: '',
                    name: ''
                };
                assessmentType['id'] = key;
                assessmentType['name'] = value;
                this.assessmentTypes.push(assessmentType);
            }

            // Get Suppliers List
            for (const [key, value] of Object.entries(data['suppliers'])) {
                const supplier: any = {
                    id: '',
                    name: ''
                };
                supplier['id'] = key;
                supplier['name'] = value;
                this.suppliers.push(supplier);
            }
            this.pageLoading = false;
        });
        this.analyticsService.trackEvent('Record Audit Page', {
            Origin: 'Assessment-audit',
            Action: 'Record-Audit page visited'
        });
    }

    handleSupplierSelect() {
        this.pageLoading = true;
        this.facilities = [];
        this.assessmentAuditService.getAllFacility(this.selectedSupplier.id).subscribe(facilitiesResp => {
            this.pageLoading = false;
            // Get Facilities List
            for (const [key, value] of Object.entries(facilitiesResp['data'])) {
                const facility: any = {
                    id: '',
                    name: ''
                };
                facility['id'] = value['id'];
                facility['name'] = value['name'];
                this.facilities.push(facility);
            }
        });
    }

    // Comparing Dates
    validateDate(from: string, to: string) {
        return (group: FormGroup): { [key: string]: any } => {
            const f = group.controls[from];
            const t = group.controls[to];
            if (f.value > t.value) {
                this.recordAuditFormError = 'Validity date must be greater than actual date';
                return {
                    notValid: true
                };
            }
            this.recordAuditFormError = '';
            return {};
        };
    }

    compareDates(from: string, to: string) {
        const f = from;
        const t = to;
        if (f > t) {
            return false;
        } else {
            return true;
        }
    }

    // Get Templates to add new audit
    getTemplates() {
        this.ttScoreFields = [];
        this.ttScores = [];
        this.assessmentType = this.selectedAssessmentType.name;
        const formDataValues = this.recordAuditForm.value;
        if (this.compareDates(formDataValues.dateCtrl, formDataValues.validityCtrl)) {
            this.assessmentAuditService
                .getTemplates(this.selectedAssessmentType, this.selectedSupplier, this.selectedFacility)
                .subscribe(response => {
                    this.section_data = response.data;
                    this.sections = response.data['sections'];
                    this.overallRating = response.data['overallRating'];
                    this.pageLoading = false;
                });
        }
    }

    getTTScore(template_name, value) {
        const index = _.findIndex(this.ttScoreFields, { name: template_name });
        if (index !== -1) {
            const item_index = _.findIndex(this.ttScoreFields[index].options, { name: value });
            if (item_index !== -1) {
                this.ttScores = this.ttScoreFields[index].options[item_index].score;
                this.showTTScores = true;
            } else {
                this.showTTScores = false;
            }
        }
    }

    /*  updateSelectedOption(template_name, value, scores?) {


     const index = _.findIndex(this.selectedOptions, {name: template_name});
     this.selectedOptions[index]['value'] = value;
     if (scores) {
       this.selectedOptions[index]['scores'] = scores;
     }
   } */

    updateSelectedFile(template_name, data, sectionIndex, fieldIndex) {
        this.sections[sectionIndex].fields[fieldIndex].value = data.fileName;
    }
    /* a */

    getFileNames(template_name, sectionIndex, fieldIndex) {
        if (this.sections[sectionIndex].fields[fieldIndex].fileName) {
            return this.sections[sectionIndex].fields[fieldIndex].fileName;
        }
    }

    // Save created Audit
    saveAudit() {
        this.pageLoading = true;
        const formDataValues = this.recordAuditForm.value;
        const section_data = [];
        /*     for(let ind = 0; ind < this.sections.length; ind++) {
          section_data.push(this.sections[ind]);
        }
        for(let index = 0; index < this.selectedFileOptions.length; index++) {
          section_data.push(this.selectedFileOptions[index]);
        } */
        const auditPayload: AuditPayload = {
            auditee: formDataValues.supplierNameCtrl.id,
            name: formDataValues.assessmentNameCtrl,
            type: this.section_data['type'],
            dateOfAudit: new Date(formDataValues.dateCtrl).getTime(),
            validTill: new Date(formDataValues.validityCtrl).getTime(),
            overallRating: this.overallRatingSelected,
            nonConformitiesCount: this.numberOfNonConformities,
            facilityId: this.selectedFacility.id,
            data: {
                sections: this.sections
            }
        };
        this.assessmentAuditService.saveAudit(auditPayload).subscribe(response => {
            const auditId = response.data;
            this.pageLoading = false;
            this.toastr.success('Audit Added', 'Success');
            this.analyticsService.trackEvent('Record Audit Page', {
                Origin: 'Assessment-audit',
                AuditId: auditId,
                Action: 'Audit Added'
            });
            this.router.navigate(['/assessment-audit', auditId]);
        });
    }

    InvokeFileUpload(template_name) {
        const element = document.getElementById('file_upload_' + template_name);
        element.click();
    }

    uploadFile(template_name: string, files: FileList, sectionIndex: number, fieldIndex: number) {
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
            this.toastr.error('This file format is not supported');
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
        const fileId = this.sections[sectionIndex].fields[fieldIndex].id;
        this.assessmentAuditService.uploadFile(fileToUpload, fileId).subscribe(
            response => {
                this.toastr.success('File uploaded', 'Success');
                this.sections[sectionIndex].fields[fieldIndex].id = response['data'].id;
                this.sections[sectionIndex].fields[fieldIndex].fileName = response['data'].fileName;
            },
            () => {
                this.toastr.error('The file could not be uploaded.', 'Error Uploading File!');
            }
        );
    }

    getUploadedFile(template_name, fileName, sectionIndex, fieldIndex) {
        const fileId = this.sections[sectionIndex].fields[fieldIndex].id;
        this.toastr.info('Requesting file. Please wait');
        this.assessmentAuditService.getFile(fileId, fileName).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
            },
            failData => {
                this.toastr.error(`Failed to download file. Error: ${failData.error.error}`);
            }
        );
    }

    clearErrorMessage(target) {
        target.nextElementSibling.className = 'range-err-msg-hide';
    }

    validateForRange(min, max, target) {
        if (min && max) {
            const numbericValue = +target.value;
            if (numbericValue >= min && numbericValue <= max) {
                return true;
            }
            target.value = '';
            target.nextElementSibling.className = 'range-err-msg-show';
            this.outOfRangeErrorMsg = ' ' + target.value + ' should be within ' + min + '-' + max;
            return false;
        }
        return true;
    }
    removeFile(template_name, fileName, sectionIndex, fieldIndex) {
        const fileId = this.sections[sectionIndex].fields[fieldIndex].id;
        this.assessmentAuditService.removeFile(fileId, fileName).subscribe(
            response => {
                this.toastr.success('File removed', 'Success');
                const indexOfFileName = this.sections[sectionIndex].fields[fieldIndex].fileName.indexOf(fileName);
                this.sections[sectionIndex].fields[fieldIndex].fileName.splice(indexOfFileName, 1);
                /* if (this.sections[sectionIndex].fields[fieldIndex].fileName.length < 1) {
                    this.sections[sectionIndex].fields.splice(fieldIndex);
                } */
            },
            failData => {
                this.toastr.error(`Failed to remove file. Error: ${failData.error.error}`);
            }
        );
    }
}
