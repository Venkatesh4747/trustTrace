import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import FileSaver from 'file-saver';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IScopeCertificateDetailView } from '../scope-certificates.model';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { UtilsService } from './../../../shared/utils/utils.service';
import { ScopeCertificatesService } from './../scope-certificates.service';

@Component({
    selector: 'app-scope-certificate-detail-view',
    templateUrl: './scope-certificate-detail-view.component.html',
    styleUrls: ['./scope-certificate-detail-view.component.scss']
})
export class ScopeCertificateDetailViewComponent implements OnInit, OnDestroy {
    env = environment;

    pageLoading: boolean = true;
    isFetchingFile: boolean = true;
    showClose: boolean = true;
    modalOpen: boolean = false;

    extractionStatus: string = 'Extracted certificate';
    fileName: string = 'Scope_Certificate_Information.pdf';
    id: string;
    certId: string;

    scopeCertificateData: IScopeCertificateDetailView;

    uploadedFile: any;

    constructor(
        private scopeCertificatesService: ScopeCertificatesService,
        private commonServices: CommonServices,
        private toastr: CustomToastrService,
        private dialogRef: MatDialogRef<ScopeCertificateDetailViewComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService,
        private dialog: MatDialog
    ) {
        dialogRef.disableClose = true;
        this.showClose = data.showClose !== undefined ? data.showClose : true;
        this.id = data.id;
        this.certId = data.certId;
        this.fileName = data.fileName;
    }

    ngOnInit() {
        this.resetForm();
        this.modalOpen = true;
        forkJoin([
            this.scopeCertificatesService.getScopeCertificateDetail(this.id),
            this.commonServices.getCertificate(this.certId)
        ]).subscribe(
            response => {
                this.scopeCertificateData = JSON.parse(JSON.stringify(response[0]));
                this.uploadedFile = response[1];
                this.isFetchingFile = false;
                this.pageLoading = false;
            },
            failResponse => {
                this.resetForm();
                this.toastr.error('Unable to fetch data. Please try after some time.', 'Failed');
                this.isFetchingFile = false;
                this.pageLoading = false;
            }
        );
    }

    resetForm() {
        this.uploadedFile = undefined;
        this.scopeCertificateData = {
            certificateNumber: null,
            certificateStandard: null,
            validFrom: null,
            validUntil: null,
            certificateBody: null,
            supplierInfo: {
                id: null,
                value: null,
                matchedData: null
            },
            facilityInfo: []
        };
    }

    downloadScopeCertificate(certId: string, fileName: string) {
        this.toastr.info('Requesting file. Please wait');
        this.commonServices.downloadCertificate(certId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
            },
            failResponse => {
                this.toastr.error('File could not be uploaded. Please try after some time.', 'Failed');
            }
        );
    }

    /*     getProcesses(processes: string[]): string {
        if (processes && processes.length > 0) {
            return processes.join(', ');
        } else {
            return '';
        }
    } */

    closeDialog() {
        this.dialogRef.close();
    }

    ngOnDestroy() {
        this.modalOpen = false;
    }
}
