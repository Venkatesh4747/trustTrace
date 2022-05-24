import { Component, OnInit, Input } from '@angular/core';
import { ITtTable } from './tt-table.model';

@Component({
    selector: 'app-tt-table',
    templateUrl: './tt-table.component.html',
    styleUrls: ['./tt-table.component.scss']
})
export class TtTableComponent implements OnInit {
    @Input() tableData: ITtTable = null;
    constructor() {}

    ngOnInit() {}
}
