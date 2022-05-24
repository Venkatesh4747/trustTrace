import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../../utils/utils.service';

export interface IConfirmDialogV2 {
    customClass: string;
    description: string[];
    title: string;
    primaryBtn: string;
    showClose: boolean;
    secondaryBtn?: string;
}

@Component({
    selector: 'app-confirm-dialog-v2',
    template: `
        <div class="dialog-container {{ data.customClass }}">
            <div class="row">
                <div class="col-md-12">
                    <div class="head">
                        <span class="title">{{ data.title | translate }}</span>
                        <a (click)="onClickBtn('close')" *ngIf="data.showClose">
                            <img alt="close" class="icon" src="{{ cdnImage('close-model.png') }}" />
                        </a>
                    </div>
                    <div class="description">
                        <p *ngFor="let description of data.description">
                            {{ description || ('Not available' | translate) }}
                        </p>
                    </div>

                    <div [ngClass]="{ 'button-grp': data.secondaryBtn }">
                        <button
                            *ngIf="data.secondaryBtn"
                            type="button"
                            class="secondary-btn mat-button "
                            (click)="onClickBtn(data.secondaryBtn)"
                        >
                            {{ data.secondaryBtn | translate }}
                        </button>
                        <button type="button" class="primary-btn mat-button " (click)="onClickBtn(data.primaryBtn)">
                            {{ data.primaryBtn | translate }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./confirm-dialog-v2.component.scss']
})
export class ConfirmDialogV2 implements OnInit {
    get cdnImage() {
        return this.utilService.getcdnImage.bind(this.utilService);
    }
    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogV2>,
        private utilService: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: IConfirmDialogV2
    ) {}

    ngOnInit() {}

    onClickBtn(buttonLabel: string) {
        this.dialogRef.close(buttonLabel);
    }
}
