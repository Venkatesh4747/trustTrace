import { Component, OnInit, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../../value-holder-dialog/value-holder-dialog.component';

@Component({
    selector: 'app-certificate-validator',
    templateUrl: './certificate-validator.component.html',
    styleUrls: ['./certificate-validator.component.scss']
})
export class CertificateValidatorComponent implements OnInit {
    private readonly _matDialogRef: MatDialogRef<CertificateValidatorComponent>;
    private readonly triggerElementRef: ElementRef;
    constructor(
        public dialogRef: MatDialogRef<CertificateValidatorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this._matDialogRef = dialogRef;
    }

    TRANSACTION_CERTIFICATES = ['GOTS Organic-Transaction', 'GRS-Transaction', 'Responsible Wool Standard-Transaction'];
    ngOnInit() {}

    hide() {
        this.dialogRef.close();
    }
}
