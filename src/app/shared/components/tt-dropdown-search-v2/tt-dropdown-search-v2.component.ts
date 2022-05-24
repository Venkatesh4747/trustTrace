import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    forwardRef,
    OnDestroy,
    ChangeDetectionStrategy,
    OnChanges
} from '@angular/core';

import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
    Validators,
    NG_VALIDATORS,
    FormControl,
    AbstractControl
} from '@angular/forms';
import { Subscription } from 'rxjs';
type IvalueChangesFire = 'text' | 'selection' | 'both';

@Component({
    selector: 'tt-dropdown-search-v2',
    templateUrl: './tt-dropdown-search-v2.component.html',
    styleUrls: ['./tt-dropdown-search-v2.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TTDropdownSearchV2Component),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => TTDropdownSearchV2Component),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TTDropdownSearchV2Component implements OnInit, ControlValueAccessor, OnChanges, OnDestroy {
    @Input() inputLabel: string = null;
    @Input() float: string = 'auto';
    @Input() listItem: Array<any>;
    @Input() optionDisplayTextKey: string = null; // if the given listItem is object
    @Input() selectedItem: any;
    @Input() errorMessage: any = null;
    @Input() isRequired: boolean = false;
    @Input() isDisabled: boolean = false;
    @Input() placeholder: string = null;
    @Input() data_cy: string = null;
    @Input() customStyle: any = {};
    @Input() requiredSymbolRemove: boolean = false;
    @Input() valueChangesFire: IvalueChangesFire = 'both';
    @Input() acceptOnlyListedValue: boolean = true;
    @Input() customOptionMethod: Function = null; // this helps to filter option list / control from parent component
    @Input() customEditNotAllowedTooltip: string = 'Edit not allowed';

    @Output() valueChanges: EventEmitter<any> = new EventEmitter<any>();

    control: FormControl = new FormControl('');
    subscriptions: Subscription[] = [];

    filterdList = [];

    get value(): any {
        return this.control.value;
    }

    set value(value: any) {
        this.control.setValue(value);
        this.onChange(value);
        this.onTouched();
    }

    constructor() {
        this.subscriptions.push(
            this.control.valueChanges.subscribe(value => {
                this.onChange(value);
                this.onTouched();
            })
        );
    }

    valueValidator(control: AbstractControl) {
        if (control.value === null) {
            return null;
        }
        if (typeof control.value === 'string' && control.value.trim() === '') {
            return null;
        }
        if (typeof control.value === 'object') {
            return null;
        }
        return { notValid: true };
    }

    getFilteredValue(): void {
        if (!this.listItem) {
            return;
        }
        if (!(this.listItem.length > 0)) {
            this.filterdList = [];
        }
        const control =
            typeof this.control.value === 'object' && this.control.value
                ? this.control.value[this.optionDisplayTextKey]
                : this.control.value;

        if (control === null || control.trim() === '') {
            this.filterdList = this.listItem;
            return;
        }
        if (typeof this.listItem[0] === 'object') {
            this.filterdList = this.listItem.filter(
                d => d[this.optionDisplayTextKey].toLowerCase().indexOf(control.toLowerCase()) === 0
            );
        } else {
            this.filterdList = this.listItem.filter(d => d.toLowerCase().indexOf(control.toLowerCase()) === 0);
        }
    }

    ngOnChanges() {
        this.getFilteredValue();
    }

    ngOnInit() {
        const validators = [];
        if (this.acceptOnlyListedValue) {
            validators.push(this.valueValidator.bind(this));
        }
        if (this.isRequired) {
            validators.push(Validators.required);
        }
        this.control.setValidators([...validators]);
        if (this.selectedItem) {
            this.control.setValue(this.selectedItem);
        }
    }

    customValidate(item: any): boolean {
        if (!this.customOptionMethod) {
            return true;
        } else {
            return this.customOptionMethod(item);
        }
    }

    public onChange: any = () => {};
    public onTouched: any = () => {};

    registerOnChange(fn) {
        this.onChange = fn;
    }

    writeValue(value) {
        if (value) {
            this.value = value;
        }

        if (value === null || typeof value === 'string' || value === '') {
            this.control.reset();
        }
        this.getFilteredValue();
    }

    public update = (type: IvalueChangesFire) => {
        this.getFilteredValue();
        if (this.valueChangesFire === 'both' || this.valueChangesFire === type) {
            this.valueChanges.emit(this.control.value);
        }
    };

    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    validate(_: FormControl) {
        return this.control.valid ? null : { notValid: true };
    }

    displayValue(item: any): string {
        if (!item) {
            return '';
        }
        return typeof item === 'object' ? item[this.optionDisplayTextKey] : item;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}
