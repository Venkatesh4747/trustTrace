import { Component, OnInit, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../../value-holder-dialog/value-holder-dialog.component';

@Component({
    selector: 'app-certificate-validation',
    templateUrl: './certificate-validation.component.html',
    styleUrls: ['./certificate-validation.component.scss']
})
export class CertificateValidationComponent implements OnInit {
    private readonly _matDialogRef: MatDialogRef<CertificateValidationComponent>;
    private readonly triggerElementRef: ElementRef;
    constructor(
        public dialogRef: MatDialogRef<CertificateValidationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this._matDialogRef = dialogRef;
    }

    ngOnInit() {}

    hide() {
        this.dialogRef.close();
    }
}
