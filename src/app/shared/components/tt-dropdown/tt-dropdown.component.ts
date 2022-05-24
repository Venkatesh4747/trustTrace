import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, OnInit, Input, forwardRef } from '@angular/core';

const TT_DROP_DOWN_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TtDropdownComponent),
    multi: true
};

@Component({
    selector: 'tt-dropdown',
    providers: [TT_DROP_DOWN_VALUE_ACCESSOR],
    templateUrl: './tt-dropdown.component.html',
    styleUrls: ['./tt-dropdown.component.scss']
})
export class TtDropdownComponent implements OnInit {
    @Input() title: string;
    @Input() items;
    @Input() panelClass;
    @Input() isRequired: boolean;
    @Input() optionalParams;

    _value: any[]; // Private variable for input value
    onChange: any = Function.prototype; // Trascend the onChange event
    onTouched: any = Function.prototype; // Trascend the onTouch event

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

    constructor() {}

    ngOnInit() {
        if (!this.isRequired) {
            this.isRequired = false;
        }
        if (!this.panelClass) {
            this.panelClass = 'select-panel';
        }
        if (!this.optionalParams) {
            this.optionalParams = { key: 'key', value: 'value' };
        }
    }
}
