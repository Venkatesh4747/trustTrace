import { Component, Input } from '@angular/core';
import { SupplierVerificationStatus } from '../supplier-list-form-element/supplier-list-form-element.model';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-supplier-status',
    template: `
        <ng-container [ngSwitch]="status">
            <img
                [ngStyle]="customStyle"
                *ngSwitchCase="10"
                [src]="IMG_URL.unInvitedSupplier"
                alt=" uninvited supplier"
                matTooltipPosition="right"
                [matTooltip]="unInvitedTooltip ? unInvitedTooltip : 'Uninvited Supplier'"
            />
            <img
                [ngStyle]="customStyle"
                *ngSwitchCase="15"
                [src]="IMG_URL.unAcceptedSupplier"
                alt="Unaccepted supplier"
                matTooltipPosition="right"
                [matTooltip]="unAcceptedTooltip ? unAcceptedTooltip : 'Unaccepted Supplier'"
            />

            <span *ngSwitchDefault></span>
        </ng-container>
    `,
    styles: [
        `
            img {
                width: 20px;
                user-select: none;
            }
        `
    ]
})
export class SupplierStatusComponent {
    @Input() status: SupplierVerificationStatus;
    @Input() unAcceptedTooltip: string;
    @Input() unInvitedTooltip: string;
    @Input() customStyle: any = {};

    IMG_URL = {
        unAcceptedSupplier: environment.IMG_URL + 'images/unaccepted_supplier.png',
        unInvitedSupplier: environment.IMG_URL + 'images/not-verified-supplier.png'
    };
    constructor() {}
}
