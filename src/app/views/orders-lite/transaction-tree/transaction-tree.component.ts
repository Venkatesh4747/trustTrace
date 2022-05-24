import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { OrdersService } from '../orders.service';

@Component({
    selector: 'app-transaction-tree',
    templateUrl: './transaction-tree.component.html',
    styleUrls: ['./transaction-tree.component.scss']
})
export class TransactionTreeComponent implements OnInit {
    pageLoading = true;
    transaction_id: string;
    transactionTreeDetails: any = [];

    constructor(
        public dialog: MatDialog,
        public commonService: CommonServices,
        private route: ActivatedRoute,
        private ordersService: OrdersService,
        private analyticsService: AnalyticsService
    ) {
        this.route.params.subscribe(params => {
            this.transaction_id = params['transaction_id'];
        });
    }

    ngOnInit() {
        this.analyticsService.trackPageVisit('Transaction Tree', '', this.transaction_id);
        this.ordersService.fetchLotOriginChart(this.transaction_id).subscribe(response => {
            this.transactionTreeDetails.push(JSON.parse(JSON.stringify(response.data)));
            this.pageLoading = false;
        });
    }
}
