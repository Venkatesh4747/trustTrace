import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { AuditPayload } from '../assessment-audit.model';
import { AssessmentAuditService } from '../assessment-audit.service';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-audit-details',
    templateUrl: './audit-details.component.html',
    styleUrls: ['./audit-details.component.scss']
})
export class AuditDetailsComponent implements OnInit {
    auditId = '';
    pageLoading = true;
    inViewMode = false;
    paramsValueExists = false;
    auditDetails: AuditPayload;
    recordAuditForm: FormGroup;

    sections = [];

    constructor(
        private _formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private assessmentAuditService: AssessmentAuditService,
        private utilsService: UtilsService,
        private toastr: CustomToastrService,
        private analyticsService: AnalyticsService,
        private router: Router,
        public localizationService: LocalizationService,
        public commonServices: CommonServices
    ) {
        this.route.params.subscribe(params => (this.auditId = params['id']));
        this.inViewMode = this.route.snapshot.routeConfig.path.indexOf('edit') !== -1 ? false : true;
    }

    ngOnInit() {
        this.assessmentAuditService.getAuditDetail(this.auditId).subscribe(response => {
            this.pageLoading = false;
            const data = response.data['data'];
            this.auditDetails = response.data['data'];
            console.log('Audit Details' + this.auditDetails);
            this.localizationService.addToMasterData(response.data['masterData']);
            this.sections = data.data.sections;
            this.paramsValueExists = true;
            this.recordAuditForm = this._formBuilder.group({
                assessmentNameCtrl: new FormControl(
                    { value: data.name, disabled: this.inViewMode },
                    Validators.required
                ),
                dateCtrl: new FormControl({ value: new Date(data.dateOfAudit), disabled: true }, Validators.required),
                validityCtrl: new FormControl(
                    { value: new Date(data.validTill), disabled: this.inViewMode },
                    Validators.required
                )
            });
            this.analyticsService.trackEvent('Audit Details Page', {
                Origin: 'Assessment-audit',
                AuditId: this.auditId,
                Action: 'audit details page visited'
            });
        });
    }

    compareDates(from: number, to: number) {
        const f = from;
        const t = to;
        if (f > t) {
            return false;
        } else {
            return true;
        }
    }

    updateAudit() {
        const formDataValues = this.recordAuditForm.value;
        this.auditDetails.name = formDataValues.assessmentNameCtrl;
        this.auditDetails.validTill = new Date(formDataValues.validityCtrl).getTime();
        const auditPayload = {
            name: formDataValues.assessmentNameCtrl,
            validTill: new Date(formDataValues.validityCtrl).getTime()
        };
        if (this.compareDates(this.auditDetails.dateOfAudit, this.auditDetails.validTill)) {
            this.assessmentAuditService.updateAudit(this.auditId, auditPayload).subscribe(response => {
                const auditId = response.data;
                this.toastr.success('Audit Updated', 'Success');
                this.analyticsService.trackEvent('Audit Details Page', {
                    Origin: 'Assessment-audit',
                    AuditId: this.auditId,
                    Action: 'Audit Update'
                });
                this.router.navigate(['/assessment-audit', auditId, 'edit']);
            });
        } else {
            this.toastr.error('Validity Date should be greater than Actual Date');
        }
    }

    getDate(date_val) {
        return this.utilsService.getDate(date_val);
    }

    getUploadedFile(fileId, fileName) {
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
}
