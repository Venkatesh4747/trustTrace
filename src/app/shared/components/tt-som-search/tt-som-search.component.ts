import { Component, OnInit, Input, EventEmitter, Output, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CommonServices } from '../../commonServices/common.service';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

const TT_STYLE_SEARCH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TtStyleSearchComponent),
    multi: true
};

@Component({
    selector: 'tt-som-search',
    providers: [TT_STYLE_SEARCH_VALUE_ACCESSOR],
    templateUrl: './tt-som-search.component.html',
    styleUrls: ['./tt-som-search.component.scss']
})
export class TtStyleSearchComponent implements OnInit {
    @Input() type: any;
    @Input() optionalParams;
    @Output() handleSelect = new EventEmitter();

    trTypes = {
        style: 'Style',
        material: 'Material'
    };

    searchData = [];
    searchRawData = [];

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

    constructor(
        public commonService: CommonServices,
        private tosterService: CustomToastrService,
        private http: HttpClient
    ) {}

    ngOnInit() {
        if (!this.optionalParams) {
            this.optionalParams = { key: 'key', value: 'value' };
        }
    }

    private searchStyle(payload) {
        switch (this.type) {
            case this.trTypes.style: {
                payload['module'] = 'STYLE';
                return this.http.post(environment.api.traceabilityRequest.searchStyle, payload);
            }
            case this.trTypes.material: {
                payload['module'] = 'ML';
                return this.http.post(environment.api.traceabilityRequest.searchMaterial, payload);
            }
        }
    }

    public getStyleName(item) {
        if (item != null && item.unique_search != null) {
            return item.unique_search;
        }
    }

    private searchFreeHandStyle(searchTerm) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        this.searchStyle(searchPayload).subscribe(
            response => {
                this.searchRawData = response['data'].searchResponse;
                if (this.searchRawData.length > 0) {
                    // used to check only unique values are pushed to this.searchData
                    this.searchData = this.filterForUniqueStyleValue(this.searchRawData);
                } else {
                    if (searchTerm && searchTerm.length >= 3) {
                        this.searchData = [];
                    }
                }
            },
            () => {
                this.tosterService.error('Oops,something went wrong. Try later');
            }
        );
    }

    private filterForUniqueStyleValue(rawStyleData) {
        const filteredStyleTerms = [];
        const filteredStyleData = [];
        rawStyleData.forEach(el => {
            if (filteredStyleTerms.indexOf(el.unique_search) === -1) {
                filteredStyleTerms.push(el.unique_search);
                filteredStyleData.push(el);
            }
        });
        return filteredStyleData;
    }

    public searchStyleName(event) {
        if (event.key !== '') {
            this.searchFreeHandStyle(this._value);
        }
    }

    handleClick(item) {
        if (this.handleSelect) {
            // call tr service and check

            this.handleSelect.emit(item);
        }
    }
}
