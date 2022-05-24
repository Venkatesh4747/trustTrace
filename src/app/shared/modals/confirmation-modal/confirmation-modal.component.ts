import { AnalyticsService } from './../../../core/analytics/analytics.service';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {
    handleDelete = new EventEmitter<EmitPayload>();

    constructor(
        public dialogRef: MatDialogRef<ConfirmationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {}

    onCancel(): void {
        const btnName = this.data.buttonName ? this.data.buttonName : '';
        this.analyticsService.trackEvent('Cancel clicked', {
            Origin: 'Confirmation Modal',
            Action: `${btnName} cancelled`
        });
        this.dialogRef.close();
    }

    handleDeleteFun(entityId: string) {
        const btnName = this.data.buttonName ? this.data.buttonName : '';
        this.analyticsService.trackEvent(`${this.data.buttonName} clicked`, {
            Origin: 'Confirmation Modal',
            Action: `${btnName} clicked`
        });
        this.handleDelete.emit({ id: entityId });
    }

    checkIsString(str: string | string[]): boolean {
        return typeof str === 'string';
    }
}

export interface DialogData {
    groupId: string;
    entityName: string;
    title: string;
    description: string | string[];
    buttonName: string;
    isEnable: boolean;
    showClose?: boolean;
}

export interface EmitPayload {
    id: string;
}
