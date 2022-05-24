import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { environment as env, environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core';
import { AnalyticsService } from '../../../../core/analytics/analytics.service';
import { CertificateManagerService } from '../../../../shared/components/certificate-manager/certificate-manager.service';
import { CertificateValidatorComponent } from '../../../../shared/components/certificate-validator/certificate-validator.component';
import { LocalizationService } from '../../../../shared/utils/localization.service';
import { AssessmentAuditService } from '../../../assessment-audit/assessment-audit.service';
import { TcApprovalFlowComponent } from '../../../task-manager/tc-approval-flow/tc-approval-flow.component';
import { CommonServices } from '../../../../shared/commonServices/common.service';

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

    tiers = {
        tr_tier1: 'T1',
        tr_tier2: 'T2'
    };

    constructor(
        public dialog: MatDialog,
        private certificateManager: CertificateManagerService,
        private assessmentAuditService: AssessmentAuditService,
        private toastr: CustomToastrService,
        public localization: LocalizationService,
        private analyticsService: AnalyticsService,
        public authService: AuthService,
        private commonServices: CommonServices
    ) {}

    ngOnInit() {
        this.localization.getMasterData().subscribe(response => {
            this.localization.addToMasterData(response.data);
        });

        this.lotData.forEach(async lot => {
            let file_name = '';
            if (lot.articleType) {
                file_name = lot.articleType.toLowerCase().replace(' ', '_');
                lot['src'] = await this.commonServices.toImageDataURL(
                    `${env.IMG_URL}images/products/simple/pdt_${file_name}.png?t=${new Date().getTime()}`,
                    `${env.IMG_URL}images/products/simple/pdt_default.png?t=${new Date().getTime()}`
                );
            }
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

    showCertificateValidationResult(currentNode) {
        const data = {
            nodeRiskStatus: currentNode.riskFactor,
            validationData: currentNode.extractedData
        };
        this.dialog.open(CertificateValidatorComponent, {
            data: data
        });
    }

    openBOMValidationPopup(bomValidation) {
        console.log('Open batch detail popup!');
    }

    openTransactionCertificateDetailView(nodeData) {
        this.dialog.open(TcApprovalFlowComponent, {
            width: '100vw',
            maxWidth: '98vw',
            height: '97vh',
            panelClass: 'tc-approval-dialog',
            data: {
                taskId: nodeData.certificates[0].ttDocumentId,
                certId: nodeData.certificates[0].id,
                type: 'Transaction',
                showClose: true,
                certificationType: 'TC',
                showActionButtons: false,
                actionType: 'View',
                fromPage: 'Transaction Tree'
            }
        });
    }
}
