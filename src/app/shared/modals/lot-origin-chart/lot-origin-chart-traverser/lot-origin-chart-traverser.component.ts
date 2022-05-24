import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-lot-origin-chart-traverser',
    templateUrl: './lot-origin-chart-traverser.component.html',
    styleUrls: ['./lot-origin-chart-traverser.component.scss']
})
export class LotOriginChartTraverserComponent implements OnInit {
    @Input() lot;

    constructor() {}

    ngOnInit() {}
}
