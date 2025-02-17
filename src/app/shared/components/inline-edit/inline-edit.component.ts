import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const INLINE_EDIT_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InlineEditComponent),
    multi: true
};

@Component({
    selector: 'app-inline-edit',
    templateUrl: './inline-edit.component.html',
    providers: [INLINE_EDIT_CONTROL_VALUE_ACCESSOR],
    styleUrls: ['./inline-edit.component.css']
})
export class InlineEditComponent implements ControlValueAccessor, OnInit {
    @Output() valueChange = new EventEmitter();
    @ViewChild('inlineEditControl', { static: false }) inlineEditControl: ElementRef; // input DOM element
    @Input() label: String = ''; // Label value for input element
    @Input() type: String = 'text'; // The type of input element
    @Input() required: Boolean = false; // Is input requried?
    @Input() disabled: Boolean = false; // Is input disabled?
    _value: String = ''; // Private variable for input value
    preValue: String = ''; // The value before clicking to edit
    editing: Boolean = false; // Is Component in edit mode?
    onChange: any = Function.prototype; // Trascend the onChange event
    onTouched: any = Function.prototype; // Trascend the onTouch event

    // Control Value Accessors for ngModel
    get value(): any {
        return this._value;
    }

    set value(v: any) {
        if (v !== this._value) {
            this._value = v;
            this.onChange(v);
        }
    }

    constructor(element: ElementRef) {}

    // Required for ControlValueAccessor interface
    writeValue(value: any) {
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

    // Do stuff when the input element loses focus
    onBlur($event: Event) {
        this.editing = false;
        this.valueChange.emit($event);
    }

    // Start the editting process for the input element
    edit(value) {
        if (this.disabled) {
            return;
        }

        this.preValue = value;
        this.editing = true;
        // Focus on the input element just as the editing begins
        setTimeout(() => {
            if (this.inlineEditControl) {
                this.inlineEditControl.nativeElement.focus();
            }
        });
    }

    ngOnInit() {}
}
