import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { sortBy } from 'lodash';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface ChipItem {
    id: string;
    value: string;
}

@Component({
    selector: 'app-chip-input',
    templateUrl: './chip-input.component.html',
    styleUrls: ['./chip-input.component.scss']
})
export class ChipInputComponent implements OnInit, OnChanges {
    @Input() placeholderText: string;
    @Input() showPlus: boolean;
    @Input() isRemovable: boolean;
    @Input() chipItems: ChipItem[];
    @Input() autoCompleteList: ChipItem[];
    @Input() data_cy: string;

    isAnObject: boolean;

    separatorKeysCodes: number[] = [ENTER, COMMA];
    chipCtrl = new FormControl();
    filteredAutoCompleteList: ChipItem[];
    searchTextboxControl = new FormControl();

    filteredOptions: Observable<ChipItem[]>;

    @ViewChild('chipInput', { static: true }) chipInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger, { static: true }) matAutocomplete: MatAutocompleteTrigger;

    @Output() valueChange = new EventEmitter();

    ngOnInit() {
        this.autoCompleteList = sortBy(this.autoCompleteList, 'value');

        this.filteredOptions = this.searchTextboxControl.valueChanges.pipe(
            startWith(null),
            map(value => this._filter(value))
        );
        if (!this.showPlus) {
            this.showPlus = false;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        for (const propName in changes) {
            if (propName === 'autoCompleteList') {
                this.ngOnInit();
            }
        }
    }

    autoFocusChipInput(): void {
        this.chipInput.nativeElement.focus();
    }

    emitValueChange(): void {
        this.chipInput.nativeElement.blur();
        this.chipInput.nativeElement.focus();
        this.valueChange.emit(this.chipItems);
    }

    remove(item: ChipItem): void {
        const index = this.chipItems.indexOf(item);

        if (index >= 0) {
            this.chipItems.splice(index, 1);
        }
        this.emitValueChange();
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.chipItems.push(event.option.value);
        this.chipInput.nativeElement.value = '';
        this.searchTextboxControl.setValue(null);
        this.emitValueChange();
    }

    checkIfSelected(item) {
        return this.chipItems.findIndex(x => x.id === item.id) >= 0;
    }

    private _filter(value: string): ChipItem[] {
        if (!value || typeof value === 'object') {
            return this.autoCompleteList;
        }

        const filterValue = value.toLowerCase();

        return this.autoCompleteList.filter(item => item.value.toLowerCase().indexOf(filterValue) === 0);
    }
}
