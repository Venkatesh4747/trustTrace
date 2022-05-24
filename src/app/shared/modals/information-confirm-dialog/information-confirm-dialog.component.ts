import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../../utils/utils.service';

export interface IValue {
    title: string;
    msg: string;
}

@Component({
    selector: 'app-information-confirm-dialog',
    templateUrl: './information-confirm-dialog.component.html',
    styleUrls: ['./information-confirm-dialog.component.scss']
})
export class InformationConfirmDialogComponent implements OnInit {
    dialogData: IValue[];
    buttonText: string;
    showClose: boolean;
    isMultiple = false;

    constructor(
        private dialogRef: MatDialogRef<InformationConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService
    ) {
        if (data.isMultiple) {
            this.dialogData = JSON.parse(JSON.stringify(data.dialogData));
        } else {
            this.dialogData = [];
            this.dialogData.push({
                title: data.title,
                msg: data.msg
            });
        }
        this.buttonText = data.buttonText ? data.buttonText : 'Ok';
        this.showClose = data.showClose === undefined ? true : data.showClose;
        dialogRef.disableClose = data.disableClose === undefined ? true : data.disableClose;
    }

    ngOnInit() {}

    closeDialog(event = 'Close') {
        this.dialogRef.close(event);
    }
}
