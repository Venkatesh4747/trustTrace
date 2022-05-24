import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IOptionsModel, IProductTaskViewData } from '../../../views/products/template.model';

@Component({
    selector: 'app-filter-with-search',
    templateUrl: './filter-with-search.component.html',
    styleUrls: ['./filter-with-search.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FilterWithSearchComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => FilterWithSearchComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterWithSearchComponent implements ControlValueAccessor, OnDestroy, OnInit, AfterContentInit {
    @ViewChild('select', { static: true }) select;
    @Input() toggle = false;
    @Input() options: IOptionsModel[];
    @Input() label: string;
    @Input() key: string;
    @Input() showSearch = true;
    @Input() isFilter = false;
    @Input() control: IProductTaskViewData;
    @Input() filterState: any;
    @Output() onValueChanges: EventEmitter<any> = new EventEmitter();
    @Output() inputModelClosed: EventEmitter<any> = new EventEmitter();
    @Input() multiSelect = true;
    @Input() disableClear = false;
    @Input() isDisabled = false;
    @Input() readOnly = false;
    @Input() hasError = false;
    @Input() showSelectAll: boolean = false;

    formControl = new FormControl(null);
    subscriptions: Subscription[] = [];

    filterControl = new FormControl(null);
    rawOptions = null;

    ignoreChanges = false;

    previousValue: any = null;

    get value() {
        return this.formControl.value;
    }

    set value(value: any) {
        this.formControl.setValue(value);
        this.onChange(value);
        this.onTouched();
    }

    constructor() {
        this.subscriptions.push(
            this.formControl.valueChanges.subscribe(value => {
                if (!this.ignoreChanges) {
                    this.onValueChanges.emit(value);
                }
                this.onChange(value);
                this.onTouched();
                this.ignoreChanges = false;
            })
        );
    }

    modelCloseOpen($event: boolean): void {
        if ($event) {
            this.previousValue = JSON.parse(JSON.stringify(this.value));
        } else {
            this.reconstructOptions();

            const emitPayload = {
                isFilter: this.isFilter,
                value: this.value,
                sameState: JSON.stringify(this.previousValue) === JSON.stringify(this.value),
                filterKey: this.key
            };

            this.inputModelClosed.emit(emitPayload);
        }
    }
    /**
     * Push selected values to top
     */
    reconstructOptions(): void {
        this.filterControl.reset();
        if (!this.rawOptions) {
            this.rawOptions = this.options;
        }
        if (
            this.value === null ||
            this.value.length === 0 ||
            (this.control && this.control.fieldType === 'SINGLE_SELECT')
        ) {
            return;
        }
        const selected = [];
        const notSelected = [];

        this.rawOptions.forEach((o: IOptionsModel) => {
            if (this.value.includes(o.id)) {
                selected.push(o);
            } else {
                notSelected.push(o);
            }
        });
        selected.push(...notSelected);
        this.options = selected;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    onChange: any = () => {};
    onTouched: any = () => {};

    registerOnChange(fn: () => void): void {
        this.onChange = fn;
    }

    writeValue(value: any): void {
        if (value) {
            this.value = value;
        }

        if (value === null) {
            this.formControl.reset();
        }
        this.reconstructOptions();
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    validate(_: FormControl): any {
        return this.formControl.valid ? null : { filter: { valid: false } };
    }

    reset(): void {
        if (!this.disableClear) {
            this.formControl.reset();
            this.reconstructOptions();
        }
    }
    selectAll(): void {
        const VALUES = this.options.map(options => options.id);
        this.formControl.setValue(VALUES);
    }

    ngOnInit(): void {
        if (this.isFilter && this.filterState[this.key]) {
            this.ignoreChanges = true;
            const optionValues = this.options.map(op => op.id);
            const matchedValues = this.getMatchingValues(optionValues, this.filterState[this.key]);
            this.value = matchedValues && matchedValues.length > 0 ? matchedValues : null;
        }
    }

    getMatchingValues(arr1: string[], arr2: string[]): string[] {
        if (!arr2) {
            return [];
        }
        const res = [];
        for (const i in arr1) {
            if (arr2.indexOf(arr1[i]) > -1) {
                res.push(arr1[i]);
            }
        }
        return res;
    }

    filtered(option: string) {
        if (this.filterControl.value && this.filterControl.value.trim() !== '') {
            return option.toLowerCase().includes(this.filterControl.value.toLowerCase());
        } else {
            return true;
        }
    }
    noOptions(): boolean {
        if (this.filterControl.value) {
            return !this.options.some(option =>
                option.value.toLowerCase().includes(this.filterControl.value.toLowerCase())
            );
        } else {
            return false;
        }
    }

    ngAfterContentInit() {
        setTimeout(() => {
            if (!this.isFilter && !this.showSelectAll) {
                this.reconstructOptions();
            }
            if (this.toggle) {
                this.select.open();
            }
        });
    }
}
