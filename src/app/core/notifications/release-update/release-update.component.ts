import { Component, OnInit } from '@angular/core';
import * as _moment from 'moment';
import { NotificationService } from '../notifications.service';
import { IReleaseUpdate } from './release-update.model';

@Component({
    selector: 'app-release-update',
    templateUrl: 'release-update.component.html',
    styleUrls: ['release-update.component.scss']
})
export class ReleaseUpdateComponent implements OnInit {
    showNotification: boolean = false;
    releaseData: IReleaseUpdate;
    moment = _moment;

    constructor(private notificationService: NotificationService) {}

    ngOnInit() {
        this.notificationService.getLatestReleaseUpdate().subscribe(data => {
            this.releaseData = data;
            if (this.releaseData) {
                const utcToLocal = this.moment.utc(this.releaseData.expiryTs).local();
                const now = this.moment().local();
                if (now.isBefore(utcToLocal)) {
                    if (localStorage.getItem('re_note') !== this.releaseData.expiryTs.toString()) {
                        this.showNotification = true;
                    }
                }
            }
        });
    }

    /**
     * @method onClose
     * @returns { void }
     * Close release notification toaster and set value to local storage
     */
    onClose(): void {
        this.showNotification = false;
        localStorage.removeItem('re_note');
        localStorage.setItem('re_note', this.releaseData.expiryTs.toString());
    }
}
