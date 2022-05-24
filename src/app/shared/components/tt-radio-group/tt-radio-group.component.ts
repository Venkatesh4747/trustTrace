import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { TestAutomationService } from '../../automation-test-utils/test-automation.service';

const TT_RADIO_GROUP_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TtRadioGroupComponent),
    multi: true
};

export interface IAdditionalInfo {
    key: string; //now only for seletive filed
    filed: {
        type: 'text'; // now text/select supported
        label: string;
        value: string;
    };
}

interface ISelectionEmitter {
    item: any;
    additionalInfo: any;
}

@Component({
    selector: 'tt-radio-group',
    providers: [TT_RADIO_GROUP_VALUE_ACCESSOR],
    templateUrl: './tt-radio-group.component.html',
    styleUrls: ['./tt-radio-group.component.scss']
})
export class TtRadioGroupComponent implements OnInit, ControlValueAccessor {
    @Input() items;
    @Input() title: string;
    @Input() isRequired: boolean;
    @Input() toShowInRow: boolean;
    @Input() toBeDisabled: Boolean = false;
    @Input() optionalParams;
    @Input() additionalInfoInput: IAdditionalInfo = {
        key: null,
        filed: {
            type: 'text',
            label: null,
            value: null
        }
    };

    @Output() handleTypeChange: EventEmitter<ISelectionEmitter> = new EventEmitter();
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

    private _additinalInfo = null;

    set additionalInfo(value: string) {
        if (!value || value.trim() === '') {
            this._additinalInfo = null;
        } else {
            this._additinalInfo = value;
        }
        this.handleChange(this.value);
    }

    get additionalInfo(): string {
        return this._additinalInfo;
    }

    constructor(public testAutomationService: TestAutomationService) {}

    ngOnInit() {
        if (!this.toShowInRow) {
            this.toShowInRow = false;
        }
        if (!this.optionalParams) {
            this.optionalParams = { key: 'key', value: 'value' };
        }
        this.additionalInfo = this.additionalInfoInput.filed.value;
    }

    additinalInfoAvailable(item: any): boolean {
        if (!this.value) {
            return false;
        }

        if (
            item.key === this.additionalInfoInput.key &&
            this.value.hasOwnProperty('key') &&
            // @ts-ignore
            this.value.key === item.key
        ) {
            return true;
        } else {
            return false;
        }
    }

    handleChange(item) {
        if (!item) {
            return;
        }
        const EMIT: ISelectionEmitter = {
            additionalInfo: this.additionalInfo,
            item
        };
        if (!(item.hasOwnProperty('key') && item.key === this.additionalInfoInput.key)) {
            EMIT.additionalInfo = null;
        }
        if (this.handleTypeChange) {
            this.handleTypeChange.emit(EMIT);
        }
    }
}
