import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

export interface IErrorData {
    transactionId: string;
    lotId: string;
    errorMsg: string;
}

@Component({
    selector: 'app-submit-error-popup',
    templateUrl: './submit-error-popup.component.html',
    styleUrls: ['./submit-error-popup.component.scss']
})
export class SubmitErrorPopupComponent implements OnInit {
    errors: IErrorData[];

    constructor(
        private dialogRef: MatDialogRef<SubmitErrorPopupComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data
    ) {
        this.errors = data.submitErrors;
    }

    ngOnInit() {}

    closeDialog() {
        this.dialogRef.close();
    }
}
