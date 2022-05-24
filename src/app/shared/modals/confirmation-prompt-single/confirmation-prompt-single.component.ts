import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataCollectionComponent } from './../../../views/products/tasks/data-collection/data-collection.component';
import { FormGroup, FormBuilder } from '@angular/forms';
interface DialogData {
    ingredientName: string;
    title: string;
    granularityId: string;
    primaryBtn: string;
    secondaryBtn: string;
}
@Component({
    selector: 'app-confirmation-prompt-single',
    templateUrl: './confirmation-prompt-single.component.html',
    styleUrls: ['./confirmation-prompt-single.component.scss']
})
export class ConfirmationPromptSingleComponent implements OnInit {
    title: string = '';
    granularityId: string = '';
    ingredientName: string = '';
    primaryBtn: string = '';
    secondaryBtn: string = '';
    updateForm: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<DataCollectionComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
        private formBuilder: FormBuilder
    ) {
        this.updateForm = this.formBuilder.group({
            mode: ''
        });
    }

    ngOnInit() {
        this.ingredientName = this.dialogData.ingredientName;
        this.title = this.dialogData.title;
        this.granularityId = this.dialogData.granularityId;
        this.primaryBtn = this.dialogData.primaryBtn;
        this.secondaryBtn = this.dialogData.secondaryBtn;
    }

    onSubmit(formValue): void {
        let result = {
            applyToAll: formValue.mode === 'all'
        };
        this.dialogRef.close(result);
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
