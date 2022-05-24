import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
import { ContextService } from '../../context.service';
import { LocalizationService } from '../../utils/localization.service';
import { UtilsService } from '../../utils/utils.service';

const TTMULTI_SELECT_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TTMultiSelectSearchComponent),
    multi: true
};
@Component({
    selector: 'app-tt-multi-select-search',
    providers: [TTMULTI_SELECT_CONTROL_VALUE_ACCESSOR],
    templateUrl: './tt-multi-select-search.component.html',
    styleUrls: ['./tt-multi-select-search.component.scss']
})
export class TTMultiSelectSearchComponent implements ControlValueAccessor, OnInit {
    @Output() selectionChange = new EventEmitter<any>();
    @Output() refreshFilter = new EventEmitter<any>();
    @Input() options: any;
    @Input() label: any;
    @Input() filter_session: string;
    @Input() optionsParam;
    @Input() data_cy: string;

    @ViewChild('search', { static: true }) searchTextBox: ElementRef;
    _value: string[]; // Private variable for input value
    onChange: any = Function.prototype; // Transcend the onChange event
    onTouched: any = Function.prototype; // Transcend the onTouch event
    selectFormControl = new FormControl();
    searchTextboxControl = new FormControl();
    selectedValues = [];
    filteredOptions: Observable<any[]>;
    sessionValue = [];
    isChangeHappened = false;

    ngOnInit() {
        // initialize session storage using util service
        this.utilsService.initializeSessionStorageValues(
            this.filter_session,
            this.label,
            this.optionsParam,
            this.options,
            'tt-multi-select'
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
        private localeService: LocalizationService,
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
        this.selectFormControl.patchValue(this.selectedValues);

        return this.options.filter(
            option =>
                option[this.optionsParam.value] &&
                option[this.optionsParam.value].toLowerCase().indexOf(filterValue) !== -1
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

    filterChanges() {
        if (this.refreshFilter) {
            this.refreshFilter.emit(this.selectedValues);
        }
    }

    notifyChangeHappened() {
        this.isChangeHappened = true;
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
        const allOptions = [];
        if (this.options.length !== 0) {
            this.options.forEach(option => {
                allOptions.push(option[this.optionsParam.key]);
            });
            this.selectFormControl.setValue(allOptions);
            this.utilsService.updateSessionStorageValues(this.filter_session, allOptions, this.label);
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
            this.refreshFilter.emit(['']);
            this.clearSearch();
        }
    }
    onSelectionChange(event) {
        this.notifyChangeHappened();
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

    openedChange(opened: boolean) {
        if (!opened && this.isChangeHappened) {
            this.filterChanges();
        }
        this.isChangeHappened = false;
    }

    removeSpace(label: any) {
        return 'dropdown-options-' + label.replace(/ /g, '-');
    }
}
