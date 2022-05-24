import { Component, Input, OnInit } from '@angular/core';
import * as FileSaver from 'file-saver';
import { environment } from '../../../../../environments/environment';
import { AnalyticsService } from '../../../../core/analytics/analytics.service';
import { CertificateManagerService } from '../../../../shared/components/certificate-manager/certificate-manager.service';
import { LocalizationService } from '../../../../shared/utils/localization.service';
import { AssessmentAuditService } from '../../../assessment-audit/assessment-audit.service';
import { MatDialog } from '@angular/material/dialog';
import { CertificateValidatorComponent } from '../../../../shared/components/certificate-validator/certificate-validator.component';
import { AuthService } from '../../../../core';
import { CertificateValidationComponent } from '../../../../shared/components/certificate-validation/certificate-validation.component';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-transaction-tree-node',
    templateUrl: './transaction-tree-node.component.html',
    styleUrls: ['./transaction-tree-node.component.scss']
})
export class TransactionTreeNodeComponent implements OnInit {
    @Input() lotData;
    @Input() rootNode;
    @Input() rootNodeImmediateChild;
    @Input() moreThanOneChildNode;

    RISK_FACTOR = {
        HIGH_RISK: 'High Risk',
        MEDIUM_RISK: 'Medium Risk',
        NO_RISK: 'No Risk'
    };

    certificates = [];
    env = environment;

    get checkAccess(): (name: string) => boolean {
        return this.authService.haveAccess.bind(this.authService);
    }

    constructor(
        public dialog: MatDialog,
        private certificateManager: CertificateManagerService,
        private assessmentAuditService: AssessmentAuditService,
        private toastr: CustomToastrService,
        public localization: LocalizationService,
        private analyticsService: AnalyticsService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.localization.getMasterData().subscribe(response => {
            this.localization.addToMasterData(response.data);
        });
    }

    downloadCertificate(certificate: any) {
        this.analyticsService.trackButtonClick(
            'Download certificate',
            'Transaction tree page',
            'User click on download certificate'
        );
        this.toastr.info('Requesting file. Please wait');
        if (certificate.uploadedFiles.length > 1) {
            this.toastr.info(
                'Please click allow if you are asked for permission to download multiple files',
                'Downloading Multiple Files'
            );
        }
        certificate.uploadedFiles.forEach(file => {
            this.certificateManager.downloadFile(certificate.id, file);
        });
    }

    downloadEvidenceFile(certificate) {
        this.analyticsService.trackButtonClick(
            'Download certificate',
            'Transaction tree page',
            'User click on download certificate'
        );
        this.toastr.info('Requesting file. Please wait');
        if (certificate.fileName.length > 1) {
            this.toastr.info(
                'Please click allow if you are asked for permission to download multiple files',
                'Downloading Multiple Files'
            );
        }
        certificate.fileName.forEach(filename => {
            this.assessmentAuditService.getFile(certificate.id, filename).subscribe(
                response => {
                    const blob = new Blob([response], { type: 'application/octet-stream' });
                    FileSaver.saveAs(blob, filename);
                },
                failData => {
                    this.toastr.error(`Failed to download file. Error: ${failData.error.error}`);
                }
            );
        });
    }

    getDisplayFileNameFromUrl(url: string) {
        return this.removeTimeStampFromFileName(url.substring(url.lastIndexOf('/') + 1));
    }

    removeTimeStampFromFileName(fileName: string) {
        return fileName.substring(fileName.indexOf('_') + 1);
    }

    getBatchIds(tableData: any) {
        return tableData.map(data => data.batchId).toString();
    }

    openBatchDetailPopup(batchData) {
        console.log('Open batch detail popup!');
    }

    showCertificateValidationResult(currentNode) {
        const data = {
            nodeRiskStatus: currentNode.riskFactor,
            validationData: currentNode.extractedData
        };
        const dialogRef = this.dialog.open(CertificateValidatorComponent, {
            data: data
        });
    }

    showDetailedValidationData(certificates): void {
        let data = certificates[0].validationResponse;
        const dialogRef = this.dialog.open(CertificateValidationComponent, {
            data: data
        });
    }
}
