import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { CommonServices } from '../../commonServices/common.service';
import { ContextService } from '../../context.service';
import { UtilsService } from '../../utils/utils.service';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL'
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD/MM/YYYY',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};

export interface IDateRange {
    id: string;
    value: string;
    hideField: boolean;
}

@Component({
    selector: 'app-tt-date-filter',
    templateUrl: './tt-date-filter.component.html',
    styleUrls: ['./tt-date-filter.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ]
})
export class TtDateFilterComponent implements OnInit {
    onChange: any = Function.prototype;
    onTouched: any = Function.prototype;

    @Input() dateRanges: IDateRange[] = [
        { id: '0', value: 'Today', hideField: false },
        { id: '1', value: 'This week', hideField: false },
        { id: '2', value: 'Custom date', hideField: false }
    ];
    @Input() filter_session: string;
    @Input() label: any;
    @Input() showClearAll: boolean = false;
    @Input() className = '';
    @Input() arrowIcon = 'keyboard_arrow_down';

    @Output() selectionChange = new EventEmitter<any>();
    @Output() refreshFilter = new EventEmitter<any>();

    moment = moment;
    today = moment();

    selectedValue: string;

    filterPayload: any = {
        today: true,
        startDate: this.today,
        endDate: this.today
    };

    filterValues = ['today', 'thisWeek', 'customDate'];

    constructor(
        private appContext: ContextService,
        private utilsService: UtilsService,
        private commonServices: CommonServices
    ) {}

    // Required forControlValueAccessor interface
    public registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }

    // Required forControlValueAccessor interface
    public registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
    }

    ngOnInit() {
        this.today = moment();
        this.selectedValue = this.dateRanges[0].value;
        this.appContext.resetFilterOptions.subscribe(resetFilterOptions => {
            if (resetFilterOptions) {
                this.resetFilters();
            }
        });

        // Set data from session storage for already selected values
        const filter_session = this.utilsService.getSessionStorageValue(this.filter_session);

        if (filter_session && filter_session[this.label]) {
            this.processSelectedValueFromSessionStorage(filter_session[this.label]);
        }
    }

    processSelectedValueFromSessionStorage(value) {
        const data = JSON.parse(value[0]);
        if (data[this.filterValues[0]]) {
            this.today = moment();
            this.selectedValue = this.dateRanges[0].value;
            this.filterPayload = {
                today: true,
                startDate: this.today,
                endDate: this.today
            };
        } else if (data[this.filterValues[1]]) {
            const from_date = moment().subtract(7, 'days');
            const to_date = this.today;
            this.selectedValue = this.dateRanges[1].value;
            this.filterPayload = {
                thisWeek: true,
                startDate: from_date,
                endDate: to_date
            };
        } else if (data[this.filterValues[2]]) {
            this.selectedValue = this.dateRanges[2].value;
            this.filterPayload = {
                customDate: true,
                startDate: data.startDate,
                endDate: data.endDate
            };
        }
    }

    resetFilters() {
        this.selectedValue = this.dateRanges[0].value;
        this.filterPayload = {
            today: true,
            startDate: this.today,
            endDate: this.today
        };
    }

    handleDateFilterTypeChange(event: MatRadioChange) {
        // Get and set today's date from moment
        this.today = moment();

        switch (event.value) {
            // Today
            case this.dateRanges[0].value:
                this.selectedValue = this.dateRanges[0].value;
                this.filterPayload = {
                    today: true,
                    startDate: this.today,
                    endDate: this.today
                };
                break;

            // This week
            case this.dateRanges[1].value:
                const from_date = moment().subtract(7, 'days');
                const to_date = this.today;
                this.selectedValue = this.dateRanges[1].value;
                this.filterPayload = {
                    thisWeek: true,
                    startDate: from_date,
                    endDate: to_date
                };
                break;

            // Custom Date
            default:
                this.selectedValue = this.dateRanges[2].value;
                this.filterPayload = {
                    customDate: true,
                    startDate: this.today,
                    endDate: this.today
                };
                break;
        }
    }

    applyDateChanges() {
        const tempPayload = JSON.parse(JSON.stringify(this.filterPayload));
        if (this.selectedValue === this.dateRanges[1].value) {
            delete this.filterPayload.startDate;
            delete this.filterPayload.endDate;
        }
        if (this.selectedValue !== this.dateRanges[1].value) {
            this.filterPayload.startDate = this.commonServices.adjustDateForTimezone(
                new Date(this.filterPayload.startDate)
            );
            this.filterPayload.endDate = this.commonServices.adjustDateForTimezone(
                new Date(this.filterPayload.endDate)
            );
        }

        this.utilsService.updateSessionStorageValues(
            this.filter_session,
            [JSON.stringify(this.filterPayload)],
            this.label
        );
        this.selectionChange.emit(this.filterPayload);

        // reset filter with pre existing value
        if (this.selectedValue === this.dateRanges[1].value) {
            this.filterPayload.startDate = tempPayload.startDate;
            this.filterPayload.endDate = tempPayload.endDate;
        }
    }

    handleClose(event) {
        if (!event) {
            this.refreshFilter.emit();
        }
    }
}
