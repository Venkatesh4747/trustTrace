import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ITableDialogData {
    title: string;
    description: string;
    tableHeader: string[];
    tableValue: unknown;
    primaryButtonText?: string;
    secondaryButtonText?: string;
}

// ************** NOTE KINDLY FOLLOW THIS **************
// The value of the table must be an array of objects.
// The object key should be same as header
@Component({
    selector: 'app-confirm-dialog-table',
    templateUrl: './confirm-dialog-table.component.html',
    styleUrls: ['./confirm-dialog-table.component.scss']
})
export class ConfirmDialogTableComponent {
    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogTableComponent>,
        @Inject(MAT_DIALOG_DATA) private data: ITableDialogData
    ) {}

    get tableData(): ITableDialogData {
        return this.data;
    }

    closeDialog(action: string): void {
        this.dialogRef.close({ event: action });
    }
}
