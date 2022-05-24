import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-notification-bar',
    template: `
        <div class="notification-bar" [ngClass]="notificationClass">
            <div *ngIf="isHTML" [innerHTML]="notification"></div>
            <div *ngIf="!isHTML">{{ notification }}</div>
        </div>
    `,
    styleUrls: ['./notification-bar.component.scss']
})
export class NotificationBarComponent {
    @Input() notification: string;
    @Input() isHTML: boolean = false;
    @Input() notificationClass: string = '';
}
