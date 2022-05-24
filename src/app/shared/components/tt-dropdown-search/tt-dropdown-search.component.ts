import {
    Component,
    forwardRef,
    Input,
    OnInit,
    Output,
    SimpleChange,
    EventEmitter,
    ChangeDetectionStrategy
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { sortBy } from 'lodash';
import { Observable } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
import { LocalizationService } from '../../utils/localization.service';

const TTDROPDOWN_SEARCH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TTDropdownSearchComponent),
    multi: true
};
@Component({
    selector: 'app-tt-dropdown-search',
    providers: [TTDROPDOWN_SEARCH_VALUE_ACCESSOR],

    templateUrl: './tt-dropdown-search.component.html',
    styleUrls: ['./tt-dropdown-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TTDropdownSearchComponent implements OnInit, ControlValueAccessor {
    constructor(private localeService: LocalizationService, private toastr: CustomToastrService) {
        if (!this.optionalParams) {
            this.optionalParams = { key: 'key', value: 'value', selectedKey: 'id' };
        }
    }
    @Output() selectionChange = new EventEmitter<any>();
    @Input() searchOptions;
    @Input() placeholder;
    @Input() isRequired: Boolean = false;
    @Input() selectedItem;
    @Input() optionalParams;
    @Input() floatLabel;
    @Input() isReadonly: Boolean = false;
    @Input() dontCheckString: boolean = false;
    @Input() data_cy: string;
    @Output() onClearInput = new EventEmitter<any>();
    @Input() showToastr = true;
    @Input() showTooltip = false;
    @Input() canTextBeWrapped = false;

    searchTextboxControl = new FormControl();
    filteredOptions: Observable<any[]>;
    selectedOption: string;
    _value: any[]; // Private variable for input value
    onChange: any = Function.prototype; // Trascend the onChange event
    onTouched: any = Function.prototype; // Trascend the onTouch eventconstructor(private localeService: LocalizationService) {}
    objectType;
    ngOnChanges(changes: SimpleChange) {
        this.ngChangeOnSelection();
    }
    ngOnInit() {
        if (this.selectedItem) {
            this.selectedOption = this.selectedItem[0].id;
        }
    }

    ngChangeOnSelection() {
        this.searchOptions = sortBy(this.searchOptions, this.optionalParams.value);
        if (this.searchOptions && this.searchOptions.length > 0) {
            this.objectType = typeof this.searchOptions[0];
        }
        // Set filter event based on value changes
        this.filteredOptions = this.searchTextboxControl.valueChanges.pipe(
            startWith<string>(''),
            delay(0),
            map(name => this._filter(name))
        );
        if (this.isReadonly) {
            this.searchTextboxControl.disable();
        } else {
            this.searchTextboxControl.enable();
        }
    }
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

    /**
     * Used to filter data based on search input
     */
    private _filter(name: string): any {
        let filterValue = '';
        let filteredList = [];

        if (name) {
            filterValue = name.toLowerCase();
        }
        if (this.objectType === 'object') {
            filteredList = this.searchOptions.filter(
                data =>
                    data[this.optionalParams.value] &&
                    this.localeService
                        .getDisplayText(data[this.optionalParams.value])
                        .toLowerCase()
                        .indexOf(filterValue) !== -1
            );
        } else {
            const filteredIdList = this.searchOptions.filter(
                data =>
                    data &&
                    this.localeService
                        .getDisplayText(data)
                        .toLowerCase()
                        .indexOf(filterValue) !== -1
            );

            if (filteredIdList && filteredIdList.length > 0) {
                filteredIdList.forEach(element => {
                    filteredList.push({
                        id: element,
                        value: this.localeService.getDisplayText(element)
                    });
                });
            }
        }
        return filteredList;
    }
    onChangeOption(event) {
        this.selectionChange.emit(event);
    }

    getDisplayName(value: string): string | undefined {
        if (!value) {
            return '';
        } else if (this.objectType === 'object') {
            return this.localeService.getDisplayText(
                this.searchOptions.find(data => value === data[this.optionalParams.key])[this.optionalParams.value]
            );
        }
        return this.localeService.getDisplayText(value);
    }

    selectedItemClick(event: any) {
        this.selectedOption = event.option.value;
    }

    checkSelectedOption(event: any) {
        if (
            event &&
            event.target.nodeName === 'INPUT' &&
            (event.relatedTarget === null || (event.relatedTarget && event.relatedTarget.nodeName !== 'MAT-OPTION')) &&
            this.searchTextboxControl.value !== '' &&
            this.selectedOption !== this.searchTextboxControl.value
        ) {
            if (this.dontCheckString && this.stringIsAvailableInList()) {
                return;
            }

            if (this.showToastr) {
                this.toastr.error('Please choose a valid option');
            }
            this.searchTextboxControl.setValue(null);
            this.selectedOption = '';
        }

        if (
            event &&
            event.target.nodeName === 'INPUT' &&
            (event.relatedTarget === null || (event.relatedTarget && event.relatedTarget.nodeName !== 'MAT-OPTION')) &&
            this.searchTextboxControl.value === '' &&
            this.onClearInput
        ) {
            this.onClearInput.emit();
        }
    }

    stringIsAvailableInList() {
        return this.searchOptions.some(data => data[this.optionalParams.value] === this.searchTextboxControl.value);
    }
    checkIfSelectedItem(item) {
        if (!this.selectedItem) {
            return false;
        }
        let index;
        if (this.objectType === 'object') {
            index = this.selectedItem.findIndex(
                x => x[this.optionalParams.selectedKey] === item[this.optionalParams.key]
            );
        } else {
            index = this.selectedItem.findIndex(x => x[this.optionalParams.selectedKey] === item);
        }
        if (index >= 0) {
            return true;
        }
        return false;
    }

    getErrorMessagePlaceholder() {
        let value = this.placeholder ? this.placeholder : '';
        if (value !== '' && value.endsWith(':')) {
            value = value.substr(0, value.length - 1);
        }
        return value;
    }
}
