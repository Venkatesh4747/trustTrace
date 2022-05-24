import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../../utils/utils.service';

@Component({
    selector: 'app-lot-origin-chart',
    templateUrl: './lot-origin-chart.component.html',
    styleUrls: ['./lot-origin-chart.component.scss']
})
export class LotOriginChartComponent implements OnInit {
    public lotOriginChartData: Array<string> = [];

    constructor(
        private dialogRef: MatDialogRef<LotOriginChartComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService
    ) {}

    ngOnInit() {
        if (this.data.chartData) {
            let transaction = JSON.parse(JSON.stringify(this.data.chartData));
            while (true) {
                console.log(transaction);
                this.lotOriginChartData.push(transaction.displayName);
                if (transaction.hasOwnProperty('fromLotView') && transaction.fromLotView !== null) {
                    transaction = JSON.parse(JSON.stringify(transaction.fromLotView[0]));
                } else {
                    break;
                }
            }
            console.log(this.lotOriginChartData.reverse());
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
