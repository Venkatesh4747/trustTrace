import { Component, OnInit, ViewChild, ElementRef, AfterContentChecked, EventEmitter, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { MatDialog } from '@angular/material/dialog';
import { TransactionsService } from '../transactions.service';
import { ITransactionTree } from './../transactions.model';
import { LocalizationService } from '../../../shared/utils/localization.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AssessmentAuditService } from '../../assessment-audit/assessment-audit.service';
import { combineLatest, Observable } from 'rxjs';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-transaction-tree',
    templateUrl: './transaction-tree.component.html',
    styleUrls: ['./transaction-tree.component.scss']
})
export class TransactionTreeComponent implements OnInit, AfterContentChecked {
    pageLoading = true;
    transaction_id: string;
    transactionTreeDetails: ITransactionTree[] = [];
    zipFile: JSZip;

    @ViewChild('transactionTreeContainer') treeEle: ElementRef;

    isScrollChecked = false;
    treeContainerScrollWidth: number;
    treeContainerScrollHeight: number;
    isDownloading: boolean;
    screenshotEventEmitter: EventEmitter<any> = new EventEmitter();
    downloadFileName: string;
    fileDownloads: Observable<any>[] = [];

    constructor(
        public dialog: MatDialog,
        public commonService: CommonServices,
        private route: ActivatedRoute,
        private transactionService: TransactionsService,
        private analyticsService: AnalyticsService,
        private localization: LocalizationService,
        private toastr: CustomToastrService,
        private renderer: Renderer2,
        private assessmentAuditService: AssessmentAuditService,
        private certificateManager: CertificateManagerService
    ) {
        this.zipFile = new JSZip();
        JSZip.support.nodebuffer = false;
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.pageLoading = true;
            this.transaction_id = params['transaction_id'];
            this.analyticsService.trackPageVisit('Transaction Tree', '', this.transaction_id);
            this.transactionService.getTransaction(this.transaction_id).subscribe(
                (response: ITransactionTree) => {
                    this.transactionTreeDetails.push(JSON.parse(JSON.stringify(response)));
                    this.downloadFileName = this.transactionTreeDetails[0].productNameAndNumber;
                    this.pageLoading = false;
                },
                error => {
                    this.pageLoading = false;
                }
            );
        });
    }

    ngAfterContentChecked(): void {
        if (this.isScrollChecked) return;

        try {
            const treeViewContainer = this.treeEle.nativeElement;
            this.treeContainerScrollWidth = treeViewContainer.scrollWidth;
            this.treeContainerScrollHeight = treeViewContainer.scrollHeight;
            const scrollLeft = (this.treeContainerScrollWidth - treeViewContainer.offsetWidth) / 2;
            if (scrollLeft) {
                treeViewContainer.scrollLeft = scrollLeft;
                this.isScrollChecked = true;
            }
        } catch (e) {
            console.error('Exception: Setting scroll position failed', 'Failed');
        }
    }

    triggerScreenShot(): void {
        this.screenshotEventEmitter.emit('take screenshot');
    }

    private processEvidence(otherDocs): void {
        otherDocs.forEach(file => {
            if (file.id && file.fileName?.length > 0) {
                file.fileName.forEach(filename => {
                    this.fileDownloads.push(this.assessmentAuditService.getFileForZipDownload(file.id, filename));
                });
            }
        });
    }

    private processCertificates(certificates): void {
        certificates.forEach(file => {
            if (file.id && file.uploadedFiles?.length > 0) {
                file.uploadedFiles.forEach(filename => {
                    this.fileDownloads.push(this.certificateManager.getFile(file.id, filename));
                });
            }
        });
    }

    private processTransactionLotData(lotData): void {
        lotData.forEach(lot => {
            if (lot?.certificates) {
                this.processCertificates(lot.certificates);
            }

            if (lot?.qualityReports) {
                this.processEvidence(lot.qualityReports);
            }

            if (lot?.otherDocs) {
                this.processEvidence(lot.otherDocs);
            }

            if (lot?.inputEpcs) {
                lot.inputEpcs.forEach(_lot => {
                    let temp = [];
                    temp.push(_lot);
                    this.processTransactionLotData(temp);
                });
            }
        });
    }

    private async getScreenshot(): Promise<string> {
        const canvas = await this.commonService.getCanvas(this.treeEle);
        return canvas.toDataURL('image/jpeg', 1.0);
    }

    async downloadAll(fileName: string): Promise<void> {
        this.isDownloading = true;
        this.pageLoading = true;
        this.fileDownloads = [];

        try {
            this.processTransactionLotData(this.transactionTreeDetails);
            if (this.fileDownloads?.length <= 0) {
                this.triggerScreenShot();
            }
            combineLatest(...this.fileDownloads).subscribe(
                async response => {
                    response.forEach(resp => {
                        if (resp?.filename) {
                            const blob = new Blob([resp.response], { type: 'application/octet-stream' });
                            this.zipFile.file(resp.filename, blob);
                        }
                    });
                    this.zipFile.file(
                        `${fileName}.jpg`,
                        (await this.getScreenshot()).replace('data:image/jpeg;base64,', ''),
                        { base64: true }
                    );
                    await this.zipFile.generateAsync({ type: 'blob' }).then(function(content) {
                        saveAs(content, `${fileName}.zip`);
                    });
                    this.toastr.success('The files have been downloaded successfully.', 'Success');
                },
                errorResponse => {
                    this.toastr.error('There was a problem downloading your file', 'Error');
                }
            );
        } catch (e) {
            this.toastr.error('Error in processing the request. Please try again after sometime.', 'Failed');
        } finally {
            this.pageLoading = false;
            this.isDownloading = false;
        }
    }
}
