import { environment } from './../../../../../environments/environment';
import { UtilsService } from './../../../../shared/utils/utils.service';
import { CertificateManagerService } from './../../../../shared/components/certificate-manager/certificate-manager.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { LocalizationService } from '../../../../shared/utils/localization.service';
import { AnalyticsService } from '../../../../core/analytics/analytics.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MatDialog } from '@angular/material/dialog';
import { CertificateValidatorComponent } from '../../../../shared/components/certificate-validator/certificate-validator.component';
import { CertificateValidationComponent } from '../../../../shared/components/certificate-validation/certificate-validation.component';
import { AuthService } from '../../../../core';

@Component({
    selector: 'app-evidence-article-table-view',
    templateUrl: './evidence-article-table-view.component.html',
    styleUrls: ['./evidence-article-table-view.component.scss']
})
export class EvidenceArticleTableViewComponent implements OnInit {
    @Input() article;
    @Input() listIndex;
    public env = environment;

    ANALYTICS_EVENT_T_EMS_DETAILED_VIEW_CERTIFICATE_LIST = 'T-EMS Detailed-View Certificate-List';

    get checkAccess(): (name: string) => boolean {
        return this.authService.haveAccess.bind(this.authService);
    }

    constructor(
        public dialog: MatDialog,
        public localeService: LocalizationService,
        private certificateManagerService: CertificateManagerService,
        public utilService: UtilsService,
        private analyticsService: AnalyticsService,
        private authService: AuthService
    ) {}

    ngOnInit() {}

    downloadFiles(certificateId, fileUrls) {
        if (!fileUrls || fileUrls.length === 0) {
            return;
        }
        const fileCount = fileUrls.length;
        for (let i = 0; i < fileCount; i++) {
            this.certificateManagerService.downloadFile(certificateId, fileUrls[i]);
        }
    }

    analyticsDownloadButtonClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_EMS_DETAILED_VIEW_CERTIFICATE_LIST + ' Download#Clicked',
            analyticsOptions
        );
    }

    checkIfValidData() {
        if (this.article && this.article.ttCertificate && this.article.ttCertificate.validationResponse) {
            if (this.article.ttCertificate.validationResponse.validationStatus) {
                return 'valid';
            } else {
                return 'invalid';
            }
        }
    }

    getLotInfo() {
        if (this.article && this.article.ttCertificate && this.article.ttCertificate.extractedData) {
            if (this.article.ttCertificate.extractedData.lots) {
                let lotInfo = '';
                this.article.ttCertificate.extractedData.lots.forEach(element => {
                    lotInfo += element + ',';
                });
                lotInfo = lotInfo.substring(0, lotInfo.length - 1);
                return lotInfo;
            }
        }
    }

    extractedDataModalOpened() {
        const data = {
            validationData: this.article.extractedData
        };
        const dialogRef = this.dialog.open(CertificateValidatorComponent, {
            data: data
        });
    }

    showDetailedValidationData() {
        let data = this.article.ttCertificate.validationResponse;
        const dialogRef = this.dialog.open(CertificateValidationComponent, {
            data: data
        });
    }
}
