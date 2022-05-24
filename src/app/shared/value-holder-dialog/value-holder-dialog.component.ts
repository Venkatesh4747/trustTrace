import { ElementRef } from '@angular/core';
import { Component, Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
    inputs: InputData[];
    trigger: ElementRef;
    data_cy: string;
}

export interface InputData {
    id: string;
    value: string;
}

@Component({
    selector: 'app-settings-modal',
    templateUrl: './value-holder-dialog.component.html',
    styleUrls: ['./value-holder-dialog.component.scss']
})
export class ValueHolderDialogComponent implements OnInit {
    private readonly _matDialogRef: MatDialogRef<ValueHolderDialogComponent>;
    private readonly triggerElementRef: ElementRef;

    @Input() data_cy: string = null;

    constructor(
        public dialogRef: MatDialogRef<ValueHolderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this._matDialogRef = dialogRef;
        this.triggerElementRef = data.trigger;
        this.data_cy = data.data_cy;
    }

    ngOnInit() {
        if (this.data['inputs'].length === 0) {
            this.initializeInput();
        }
        const matDialogConfig: MatDialogConfig = new MatDialogConfig();
        const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
        matDialogConfig.position = { left: `${rect.left}px`, top: `${rect.bottom - 50}px` };
        // matDialogConfig.width = '300px';
        // matDialogConfig.height = '400px';
        this._matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
        this._matDialogRef.updatePosition(matDialogConfig.position);
    }

    removeSpace(data_cy: string) {
        return 'product-category-' + data_cy.replace(/ /g, '-');
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onDeleteInput(index) {
        this.data['inputs'].splice(index, 1);
    }
    initializeInput() {
        const inputVal: InputData = {
            id: '',
            value: ''
        };
        this.data['inputs'].unshift(inputVal);
    }
    onAddInput(e) {
        if (e.keyCode === 13) {
            this.initializeInput();
        }
    }
}
