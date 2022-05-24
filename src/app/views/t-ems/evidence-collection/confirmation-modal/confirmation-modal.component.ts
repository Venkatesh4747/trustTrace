import { UtilsService } from './../../../../shared/utils/utils.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {
    pageLoading = false;
    constructor(
        private dialogRef: MatDialogRef<ConfirmationModalComponent>,
        public utilService: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data
    ) {}

    ngOnInit() {}

    closeDialog(action: string) {
        this.dialogRef.close(action);
    }
}
