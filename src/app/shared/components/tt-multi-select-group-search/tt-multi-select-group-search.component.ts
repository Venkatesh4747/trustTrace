import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
import { ContextService } from '../../context.service';
import { LocalizationService } from '../../utils/localization.service';
import { UtilsService } from '../../utils/utils.service';

const TTMULTI_SELECT_GROUP_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TtMultiSelectGroupSearchComponent),
    multi: true
};

@Component({
    selector: 'app-tt-multi-select-group-search',
    providers: [TTMULTI_SELECT_GROUP_CONTROL_VALUE_ACCESSOR],
    templateUrl: './tt-multi-select-group-search.component.html',
    styleUrls: ['./tt-multi-select-group-search.component.scss']
})
export class TtMultiSelectGroupSearchComponent implements OnInit {
    @Output() selectionChange = new EventEmitter<any>();
    @Output() refreshFilter = new EventEmitter<any>();
    @Input() options: any;
    @Input() label: any;
    @Input() filter_session: string;
    @Input() optionsParam;
    @Input() data_cy: string;

    @ViewChild('search', { static: true }) searchTextBox: ElementRef;
    _value: string[]; // Private variable for input value
    onChange: any = Function.prototype; // Trascend the onChange event
    onTouched: any = Function.prototype; // Trascend the onTouch event
    selectFormControl = new FormControl();
    searchTextboxControl = new FormControl();
    selectedValues = [];
    filteredOptions: Observable<any[]>;
    step = 0;
    isChangeHappened = false;

    ngOnInit() {
        // initialize session storage using util service
        this.utilsService.initializeSessionStorageValues(
            this.filter_session,
            this.label,
            this.optionsParam,
            this.getAllOptions(),
            'group-multi-select'
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

    filterChanges() {
        if (this.refreshFilter) {
            this.refreshFilter.emit(this.selectedValues);
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
        const filteredList = [];
        let groupObj = {};
        const filterValue = name.toLowerCase();
        this.setSelectedValues();
        this.selectFormControl.patchValue(this.selectedValues);
        this.options['filter-data'].forEach(group => {
            const groupList = group['group-data'].filter(
                option =>
                    option[this.optionsParam.groupKey] &&
                    option[this.optionsParam.groupValue].toLowerCase().indexOf(filterValue) === 0
            );

            if (groupList && groupList.length > 0) {
                groupObj['group-data'] = groupList;
                groupObj['value'] = group.value;
                filteredList.push(groupObj);
            }
            groupObj = {};
        });

        return filteredList;
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
        return this.selectFormControl.value && this.selectFormControl.value.length === this.getAllOptions().length;
    }
    isClearAllButtonDisabled(): boolean {
        return this.selectFormControl.value && this.selectFormControl.value.length === 0;
    }

    // Clearing search textbox value
    clearSearch() {
        // event.stopPropagation();
        this.searchTextboxControl.patchValue('');
    }
    getAllOptions(): any {
        const allOptions = [];
        if (this.options['filter-data'].length !== 0) {
            this.options['filter-data'].forEach(group => {
                group['group-data'].forEach(option => {
                    allOptions.push(option[this.optionsParam.groupKey]);
                });
            });
        }
        return allOptions;
    }
    selectAll(value) {
        this.selectFormControl.setValue(this.getAllOptions());
        this.utilsService.updateSessionStorageValues(this.filter_session, this.getAllOptions(), this.label);
        this.selectedValues = this.value;
        this.selectionChange.emit(value);
        this.clearSearch();
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
    setStep(index) {
        this.step = index;
    }

    notifyChangeHappened() {
        this.isChangeHappened = true;
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
