import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-card-pagination',
    templateUrl: './card-pagination.component.html',
    styleUrls: ['./card-pagination.component.scss']
})
export class CardPaginationComponent implements OnInit, OnChanges {
    paginationEnd = 0;

    @Input() paginationStart: number;
    @Input() fetchSize: number;
    @Input() totalItemsCount: number;
    @Input() moduleName: string;

    @Output() previous = new EventEmitter<any>();
    @Output() next = new EventEmitter<any>();

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('paginationStart') || changes.hasOwnProperty('totalItemsCount')) {
            this.updatePaginationEnd();
        }
    }

    ngOnInit() {
        this.updatePaginationEnd();
    }

    onPaginationActionButton(option) {
        console.log('opss',option);
        switch (option) {

            case -1:
                if (!(this.paginationStart <= 1)) {
                    this.previous.emit();
                }
                break;
            case 1:
                if (this.fetchSize + this.paginationStart <= this.totalItemsCount) {
                    this.next.emit();
                }
                break;
            default:
                break;
        }
    }

    updatePaginationEnd() {
        this.paginationEnd = this.paginationStart + this.fetchSize - 1;
        if (this.paginationEnd > this.totalItemsCount && this.totalItemsCount) {
            this.paginationEnd = this.totalItemsCount;
        }
    }
}
