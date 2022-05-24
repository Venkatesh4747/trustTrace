import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

interface IDialog {
    title: string;
    description: string | string[];
    buttonLabel: string;
}

@Component({
    selector: 'app-info-modal',
    template: `
        <div class="info-container">
            <div class="row">
                <div class="col-md-12">
                    <h5 class="title">{{ data.title | translate }}</h5>
                    <ng-container *ngIf="isArray(data.description); else notArray">
                        <ul class="description-list">
                            <li *ngFor="let item of data.description">
                                {{ item | translate }}
                            </li>
                        </ul>
                    </ng-container>

                    <ng-template #notArray>
                        <p class="description">
                            {{ data.description | translate }}
                        </p>
                    </ng-template>

                    <button type="button" class="action-btn mat-button " (click)="onClickBtn()">
                        {{ data.buttonLabel | translate }}
                    </button>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./info-model.style.scss']
})
export class InfoModalComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IDialog,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {}

    onClickBtn() {
        const btnName = this.data.buttonLabel ? this.data.buttonLabel : '';
        this.analyticsService.trackEvent(`Info modal ${btnName} clicked`, {
            Origin: 'Info Modal',
            Action: `${btnName} cancelled`
        });
        this.dialogRef.close();
    }
    isArray(object: any): boolean {
        return Array.isArray(object);
    }
}
