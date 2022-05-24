import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonServices } from '../../commonServices/common.service';

@Component({
    selector: 'app-tt-table-with-checkbox',
    templateUrl: './tt-table-with-checkbox.component.html',
    styleUrls: ['./tt-table-with-checkbox.component.scss']
})
export class TtTableWithCheckboxComponent implements OnInit {
    @Input() data: any;
    @Input() selectedValues: any[];
    @Output() handleSelection = new EventEmitter<string[]>();

    masterSelected: boolean;
    checklist: any[] = [];
    checkedItemIds: string[];

    constructor(public commonService: CommonServices) {
        this.masterSelected = false;
    }

    ngOnInit() {
        // Initialize the selected values in case it is undefined
        if (!this.selectedValues) {
            this.selectedValues = [];
        }

        this.data.forEach(item => {
            if (this.selectedValues.length > 0 && this.selectedValues.some(value => value.id === item.id)) {
                this.checklist.push({
                    id: item.id,
                    name: item.name,
                    isSelected: true
                });
            } else {
                this.checklist.push({
                    id: item.id,
                    name: item.name,
                    isSelected: false
                });
            }
        });
        this.masterSelected = this.checklist.every(item => item.isSelected === true);
    }

    checkUncheckAll() {
        this.checklist.forEach(item => (item.isSelected = this.masterSelected));
        this.onSelection();
    }

    onSelection() {
        this.checkedItemIds = [];
        this.checklist.forEach(item => {
            if (item.isSelected) {
                this.checkedItemIds.push(item);
            }
        });
        this.masterSelected = this.checklist.every(item => item.isSelected === true);
        this.handleSelection.emit(this.checkedItemIds);
    }
}
