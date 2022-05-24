import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

const MULTI_SELECT_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EditFieldsComponent),
    multi: true
};

export class EditFieldsMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

@Component({
    selector: 'app-edit-fields',
    templateUrl: './edit-fields.component.html',
    styleUrls: ['./edit-fields.component.scss']
})
export class EditFieldsComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() filterCriteriaItem: any;

    matcher = new EditFieldsMatcher();

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

    ngOnInit() {}
}
