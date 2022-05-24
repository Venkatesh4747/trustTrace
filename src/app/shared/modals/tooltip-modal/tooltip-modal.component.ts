import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../../value-holder-dialog/value-holder-dialog.component';

@Component({
    selector: 'app-tooltip-modal',
    templateUrl: './tooltip-modal.component.html',
    styleUrls: ['./tooltip-modal.component.scss']
})
export class TooltipModalComponent implements OnInit {
    private readonly _matDialogRef: MatDialogRef<TooltipModalComponent>;

    constructor(
        public dialogRef: MatDialogRef<TooltipModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this._matDialogRef = dialogRef;
    }

    ngOnInit() {}
}
