import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const TT_MULTI_SELECT_AUTO_COMPLETE_SEARCH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TtMultiSelectAutoCompleteComponent),
    multi: true
};

@Component({
    selector: 'app-tt-multi-select-auto-complete',
    providers: [TT_MULTI_SELECT_AUTO_COMPLETE_SEARCH_VALUE_ACCESSOR],
    templateUrl: './tt-multi-select-auto-complete.component.html',
    styleUrls: ['./tt-multi-select-auto-complete.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
@Component({
    selector: 'app-tt-multi-select-auto-complete',
    templateUrl: './tt-multi-select-auto-complete.component.html',
    styleUrls: ['./tt-multi-select-auto-complete.component.scss']
})
export class TtMultiSelectAutoCompleteComponent implements OnInit {
    @Input() options;
    @Input() selectedOptions = [];
    @Input() optionalParams;
    @Input() placeholder;
    @Input() data_cy: string;
    @Input() name: string;
    @Input() floatLabel: string = 'always';
    @Input() isRequired: boolean = false;
    @Output() selectionChange = new EventEmitter<any>();

    inputControl = new FormControl();

    filteredOptions: Observable<any[]>;
    lastFilter: string = '';

    _value: any[]; // Private variable for input value
    onChange: any = Function.prototype; // Trascend the onChange event
    onTouched: any = Function.prototype; // Trascend the onTouch event

    constructor() {}

    ngOnInit() {
        if (!this.optionalParams) {
            this.optionalParams = { key: 'id', value: 'name', selectedKey: 'id' };
        }
        if (!this.selectedOptions || this.selectedOptions === null) {
            this.selectedOptions = [];
        }
        this.options = JSON.parse(JSON.stringify(this.options));
        this.options.forEach(option => {
            if (this.selectedOptions.findIndex(x => (x.id = option.id)) !== -1) {
                option['selected'] = true;
            } else {
                option['selected'] = false;
            }
        });

        this.filteredOptions = this.inputControl.valueChanges.pipe(
            startWith<string | any[]>(''),
            map(value => (typeof value === 'string' ? value : this.lastFilter)),
            map(filter => this.filter(filter))
        );

        if (this.selectedOptions && this.selectedOptions.length > 0) {
            this.inputControl.setValue(this.selectedOptions);
        }
    }

    get value(): any[] {
        return this._value;
    }

    set value(v: any[]) {
        if (v !== this._value) {
            this._value = v;
            this.onChange(v);
        }
    }

    // Required for ControlValueAccessor interface
    writeValue(value: any[]) {
        this._value = value;
    }

    // Required forControlValueAccessor interface
    public registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }

    // Required forControlValueAccessor interface
    public registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
    }

    filter(filter: string): any[] {
        this.lastFilter = filter;
        if (filter) {
            return this.options.filter(option => {
                return option.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
            });
        } else {
            return this.options.slice();
        }
    }

    displayFn(valueOptions: any[] | string): string | undefined {
        let displayValue: string;
        if (Array.isArray(valueOptions)) {
            valueOptions.forEach((option, index) => {
                if (index === 0) {
                    displayValue = option.name;
                } else {
                    displayValue = `${displayValue}, ${option.name}`;
                }
            });
        } else {
            displayValue = valueOptions;
        }
        return displayValue;
    }

    optionClicked(event: Event, option: any) {
        event.stopPropagation();
        this.toggleSelection(option);
    }

    toggleSelection(option: any) {
        option.selected = !option.selected;

        const i = this.selectedOptions.findIndex(value => value.id === option.id);
        if (option.selected) {
            if (i === -1) {
                this.selectedOptions.push(option);
            }
        } else {
            this.selectedOptions.splice(i, 1);
        }

        // this.inputControl.setValue('');
    }

    handleClose() {
        this.inputControl.setValue(this.selectedOptions);
        if (this.selectionChange && this.selectedOptions && this.selectedOptions.length > 0) {
            this.selectionChange.emit(this.selectedOptions);
        }
    }
}
