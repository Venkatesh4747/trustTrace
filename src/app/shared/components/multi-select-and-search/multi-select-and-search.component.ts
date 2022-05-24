import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
import { ContextService } from '../../context.service';
import { LocalizationService } from '../../utils/localization.service';
import { UtilsService } from '../../utils/utils.service';

const MULTI_SELECT_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiSelectAndSearchComponent),
    multi: true
};
@Component({
    selector: 'app-multi-select-and-search',
    providers: [MULTI_SELECT_CONTROL_VALUE_ACCESSOR],
    templateUrl: './multi-select-and-search.component.html',
    styleUrls: ['./multi-select-and-search.component.scss']
})
export class MultiSelectAndSearchComponent implements ControlValueAccessor, OnInit {
    @Output() selectionChange = new EventEmitter<any>();
    @Input() options: string[];
    @Input() label: any;
    @Input() filter_session: string;
    @ViewChild('search', { static: true }) searchTextBox: ElementRef;
    _value: string[]; // Private variable for input value
    onChange: any = Function.prototype; // Trascend the onChange event
    onTouched: any = Function.prototype; // Trascend the onTouch event
    selectFormControl = new FormControl();
    searchTextboxControl = new FormControl();
    selectedValues = [];
    filteredOptions: Observable<any[]>;

    ngOnInit() {
        // initialize session storage using util service
        this.utilsService.initializeSessionStorageValues(
            this.filter_session,
            this.label,
            '',
            this.options,
            'multi-select'
        );

        // Set data from session storage for already selected values
        const filter_session = this.utilsService.getSessionStorageValue(this.filter_session);

        if (filter_session) {
            this.selectedValues = filter_session[this.label] || [];
        }

        // Set filter event based on value changes
        this.filteredOptions = this.searchTextboxControl.valueChanges.pipe(
            startWith<string>(''),
            delay(0),
            map(name => this._filter(name))
        );

        this.appContext.resetFilterOptions.subscribe(resetFilterOptions => {
            if (resetFilterOptions) {
                this.selectedValues = [];
                this.value = [];
            }
        });
    }
    // Control Value Accessors for ngModel
    get value(): string[] {
        return this._value;
    }

    set value(v: string[]) {
        if (v !== this._value) {
            this._value = v;
            this.onChange(v);
        }
    }

    constructor(
        element: ElementRef,
        public localeService: LocalizationService,
        private appContext: ContextService,
        private utilsService: UtilsService
    ) {}

    // Required for ControlValueAccessor interface
    writeValue(value: string[]) {
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

    /**
     * Used to filter data based on search input
     */
    private _filter(name: string): string[] {
        const filterValue = name.toLowerCase();
        this.setSelectedValues();
        this.selectFormControl.patchValue(this.selectedValues);

        return this.options.filter(
            option =>
                option &&
                this.localeService
                    .getDisplayText(option)
                    .toLowerCase()
                    .indexOf(filterValue) === 0
        );
    }

    selectionChanges() {
        this.clearSearch();

        // set selected value to form control
        this.setSelectedValues();
        this.selectFormControl.patchValue(this.selectedValues);

        // update selection changes value and already selected value
        this.utilsService.updateSessionStorageValues(this.filter_session, this.selectedValues, this.label);
        this.selectionChange.emit(this.selectedValues);
    }

    isSelectAllButtonDisabled(): boolean {
        return this.selectFormControl.value && this.selectFormControl.value.length === this.options.length;
    }
    isClearAllButtonDisabled(): boolean {
        return this.selectFormControl.value && this.selectFormControl.value.length === 0;
    }

    // Clearing search textbox value
    clearSearch() {
        // event.stopPropagation();
        this.searchTextboxControl.patchValue('');
    }

    selectAll() {
        if (this.options.length !== 0) {
            this.selectFormControl.setValue(this.options);
            this.utilsService.updateSessionStorageValues(this.filter_session, this.options, this.label);
            this.selectedValues = this.value;
            this.selectionChange.emit(this.value);
            this.clearSearch();
        }
    }

    clearAll() {
        if (this.options.length !== 0 && this.value.length > 0) {
            this.selectFormControl.patchValue('');
            this.value = [];
            this.selectedValues = [];
            this.utilsService.updateSessionStorageValues(this.filter_session, [], this.label);
            this.selectionChange.emit(['']);
            this.clearSearch();
        }
    }
    onSelectionChange(event) {
        if (event.isUserInput && event.source.selected === false) {
            const index = this.selectedValues.indexOf(event.source.value);
            this.selectedValues.splice(index, 1);
        }
    }
    setSelectedValues() {
        if (this.selectFormControl.value && this.selectFormControl.value.length > 0) {
            this.selectFormControl.value.forEach(e => {
                if (this.selectedValues.indexOf(e) === -1) {
                    this.selectedValues.push(e);
                }
            });
        }
    }
}
