import { Component, OnInit, ElementRef, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DialogData } from '../../value-holder-dialog/value-holder-dialog.component';
import { CertificateValidationComponent } from '../certificate-validation/certificate-validation.component';

@Component({
    selector: 'app-certificate-validation-status',
    templateUrl: './certificate-validation-status.component.html',
    styleUrls: ['./certificate-validation-status.component.scss']
})
export class CertificateValidationStatusComponent implements OnInit {
    private readonly _matDialogRef: MatDialogRef<CertificateValidationStatusComponent>;
    private readonly triggerElementRef: ElementRef;

    @Input() data: any;
    constructor(private dialog: MatDialog) {}

    ngOnInit() {}

    showDetailedValidationData(data) {
        const dialogRef = this.dialog.open(CertificateValidationComponent, {
            data: data
        });
    }
}
