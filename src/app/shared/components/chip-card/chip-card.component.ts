import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-chip-card',
    templateUrl: './chip-card.component.html',
    styleUrls: ['./chip-card.component.scss']
})
export class ChipCardComponent implements OnInit {
    @Input() cardData;
    @Input() isCardDataStatusExists;
    @Input() showEdit = true;
    @Input() showDelete = true;
    // Condition to be like if key matches value
    // @Input() hideEditDeleteCondition = {
    //     'complianceLabel': false
    // };
    @Input() hideEditDeleteCondition = {};
    @Output() edit = new EventEmitter();
    @Output() delete = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    onEdit(index) {
        this.edit.emit(index);
    }

    onDelete(index) {
        this.delete.emit(index);
    }

    handleShowEditDeleteButton(data: any) {
        const conditionKey = Object.keys(this.hideEditDeleteCondition);

        if (conditionKey.length !== 0) {
            const conditionValue = Object.values(this.hideEditDeleteCondition);
            return data[conditionKey[0]] !== conditionValue[0];
        } else {
            return true;
        }
    }
}
