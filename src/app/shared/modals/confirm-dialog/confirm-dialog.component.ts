import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../../utils/utils.service';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
    title: string;
    msg: string;
    primaryButton: string;
    secondaryButton: string;
    showClose: boolean;
    addClass: string;
    isProvisionToAddInput = false;
    sendInputText = false;
    inputText: string;
    placeholder: string;
    toBeDisabled: boolean = false;
    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService
    ) {
        this.title = data.title;
        this.msg = data.msg;
        this.primaryButton = data.primaryButton;
        this.secondaryButton = data.secondaryButton;
        this.showClose = data.showClose !== undefined ? data.showClose : true;
        this.addClass = data.class !== undefined ? data.class : '';
        this.isProvisionToAddInput = data.isProvisionToAddInput !== undefined ? data.isProvisionToAddInput : false;
        this.sendInputText = data.sendInputText !== undefined ? data.sendInputText : false;
        this.inputText = data.inputText;
        this.placeholder = data.placeholder;
        this.toBeDisabled = data.toBeDisabled ? data.toBeDisabled : false;
    }

    ngOnInit() {}

    actionDone(action: string, inputText?: string) {
        if (this.sendInputText) {
            this.dialogRef.close(action + ',' + this.inputText);
        } else if (inputText) {
            this.dialogRef.close(action + ',' + inputText);
        } else {
            this.dialogRef.close(action);
        }
    }

    closeDialog() {
        this.dialogRef.close();
        this.actionDone('close');
    }
}
