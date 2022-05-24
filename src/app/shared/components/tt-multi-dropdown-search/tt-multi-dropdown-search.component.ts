import { Component, ElementRef, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
import { FacilitiesService } from '../../../views/facilities/facilities.service';
import { LocalizationService } from '../../utils/localization.service';

const TTMultiDropdown_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TTMultiDropdownSearchComponent),
    multi: true
};
@Component({
    providers: [TTMultiDropdown_CONTROL_VALUE_ACCESSOR],
    selector: 'app-tt-multi-dropdown-search',
    templateUrl: './tt-multi-dropdown-search.component.html',
    styleUrls: ['./tt-multi-dropdown-search.component.scss']
})
export class TTMultiDropdownSearchComponent implements OnInit, ControlValueAccessor {
    @Input() options;
    @Input() placeholder;
    @Input() data_cy: string = null;
    @Input() isRequired: boolean = true;
    @ViewChild('search', { static: true }) searchTextBox: ElementRef;
    subscription: Subscription;
    _value: string[]; // Private variable for input value
    onChange: any = Function.prototype; // Trascend the onChange event
    onTouched: any = Function.prototype; // Trascend the onTouch event
    selectFormControl = new FormControl();
    searchTextboxControl = new FormControl();
    selectedValues = [];
    filteredOptions: Observable<any[]>;
    ngOnInit() {
        // Set filter event based on value changes
        this.filteredOptions = this.searchTextboxControl.valueChanges.pipe(
            startWith<string>(''),
            delay(0),
            map(name => this._filter(name))
        );
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
        private facilitiesService: FacilitiesService,
        public localeService: LocalizationService
    ) {
        this.subscription = this.facilitiesService.getFacilities().subscribe(facList => {
            this.selectedValues = facList;
        });
    }

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

        const filteredList = this.options.filter(
            option =>
                option.value &&
                this.localeService
                    .getDisplayText(option.value)
                    .toLowerCase()
                    .indexOf(filterValue) === 0
        );
        return filteredList;
    }

    openedChange(e) {
        // Set search textbox value as empty while opening selectbox
        this.searchTextboxControl.patchValue('');
        // Focus to search textbox while clicking on selectbox
        if (e === true) {
            this.searchTextBox.nativeElement.focus();
        }
    }

    // Clearing search textbox value
    clearSearch() {
        event.stopPropagation();
        this.searchTextboxControl.patchValue('');
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
