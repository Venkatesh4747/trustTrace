import { Component, OnDestroy, OnInit } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Subscription } from 'rxjs';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { environment as env } from '../../../../environments/environment';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { AssessmentAuditService } from '../../assessment-audit/assessment-audit.service';
import { CertificateUploadService } from '../../uploads/certificate/cert-upload.service';
import { CertificateTypeValue } from '../../uploads/interface/certificate-type-value-model';

@Component({
    selector: 'app-certificates-list',
    templateUrl: './certificates-list.component.html',
    styleUrls: ['./certificates-list.component.scss']
})
export class CertificatesListComponent implements OnInit, OnDestroy {
    certTypeValueList: CertificateTypeValue[] = [];
    public env = env;
    subscription: Subscription;

    constructor(
        private assessmentAuditService: AssessmentAuditService,
        private toastr: CustomToastrService,
        private localeService: LocalizationService,
        private certUploadService: CertificateUploadService
    ) {
        this.subscription = this.certUploadService.getCertificates().subscribe(certList => {
            this.certTypeValueList = certList;
        });
    }

    get getDisplayText() {
        return this.localeService.getDisplayText.bind(this.localeService);
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    deleteAttachment(cerTypeIndex, evidenceId, fileName) {
        this.assessmentAuditService.removeFile(evidenceId, fileName).subscribe(
            response => {
                const item = this.certTypeValueList.find(item => item.evidenceId === evidenceId);
                const index = item.fileName.indexOf(fileName);
                this.toastr.success('file has been deleted', 'Success');
                if (index > -1) {
                    this.certTypeValueList[cerTypeIndex].fileName.splice(index, 1);
                }
                this.certUploadService.setCertificates(this.certTypeValueList);
            },
            err => {
                this.toastr.error('Something went wrong ! Please try later');
            }
        );
    }

    findWithAttr(value) {
        for (let i = 0; i < this.certTypeValueList.length; i += 1) {
            if (this.certTypeValueList[i]['evidenceId'] === value) {
                return i;
            }
        }
        return -1;
    }

    downloadCertificate(evidenceId, fileName) {
        this.toastr.info('Requesting file. Please wait');
        this.assessmentAuditService.getFile(evidenceId, fileName).subscribe(
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
