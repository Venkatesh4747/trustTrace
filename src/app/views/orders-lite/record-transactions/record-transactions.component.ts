import { Component, OnInit } from '@angular/core';
import { environment as env } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';

@Component({
    selector: 'app-record-transactions',
    templateUrl: './record-transactions.component.html',
    styleUrls: ['./record-transactions.component.scss']
})
export class RecordTransactionsComponent implements OnInit {
    public env = env;

    pageLoading = false;
    // TODO: Repackaging to be added here to the array in order to enable it
    options = ['Inbound', 'Outbound'];
    selectedOption = 'Select Transaction Type';

    constructor(private analyticsService: AnalyticsService) {}

    ngOnInit() {
        this.analyticsService.trackPageVisit('new transaction');
    }
}
