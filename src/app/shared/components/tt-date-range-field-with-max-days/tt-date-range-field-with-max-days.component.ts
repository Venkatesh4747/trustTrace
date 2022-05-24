import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { CommonServices } from './../../commonServices/common.service';

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

export interface IDateRangeConfig {
    action: 'sub' | 'add' | 'custom';
    days: number;
}

export interface IDateRange {
    id: string;
    value: string;
    disableInputFields: boolean;
    config: IDateRangeConfig;
}

export interface IDateRangePayload {
    from: Date;
    to: Date;
}

@Component({
    selector: 'app-tt-date-range-field-with-max-days',
    templateUrl: './tt-date-range-field-with-max-days.component.html',
    styleUrls: ['./tt-date-range-field-with-max-days.component.scss']
})
export class TtDateRangeFieldWithMaxDaysComponent implements OnInit, OnChanges {
    @Input() dateRanges: IDateRange[] = [
        { id: '0', value: 'Last 30 days', disableInputFields: true, config: { action: 'sub', days: 30 } },
        { id: '1', value: 'Custom date', disableInputFields: false, config: { action: 'custom', days: 30 } }
    ];
    @Input() maxDays: string = '30';
    @Input() label: string = 'Select date range';
    @Input() showClearAll: boolean = false;

    @Output() selectionChange = new EventEmitter<any>();

    dateFormGroup: FormGroup;

    disableInputFields: boolean = false;

    selectedValue: IDateRange;

    payload: IDateRangePayload;

    moment = moment;
    today = moment();

    startDate: any;
    endDate: any;
    customMaxDate: any;

    constructor(private commonServices: CommonServices) {
        this.dateFormGroup = new FormGroup({
            selectedValue: new FormControl({}, [Validators.required]),
            startDate: new FormControl('', [Validators.required]),
            endDate: new FormControl('', [Validators.required])
        });
    }

    ngOnInit() {}

    ngOnChanges() {
        this.maxDays = this.maxDays ? this.maxDays : '30';

        // this.dateRanges[0].value = `Last ${this.maxDays} days`;
        // this.dateRanges[0].config.days = +this.maxDays;
        this.dateRanges[1].config.days = +this.maxDays;
    }

    resetDates() {
        // Reset to initial value
        this.today = moment();
        this.startDate = moment()
            .subtract(this.dateRanges[0].config.days, 'd')
            .format();
        this.endDate = moment().format();
        this.selectedValue = this.dateRanges[0];
    }

    handleDateFilterTypeChange(event: MatRadioChange) {
        this.selectedValue = event.value;
        this.disableInputFields = this.selectedValue.disableInputFields;

        // Get and set today's date from moment
        this.today = moment();

        switch (event.value.config.action) {
            case 'sub':
                this.startDate = moment()
                    .subtract(event.value.config.days, 'd')
                    .format();
                this.endDate = moment().format();
                break;
            case 'add':
                this.startDate = moment().format();
                this.endDate = moment()
                    .add(event.value.config.days, 'd')
                    .format();
                break;
            case 'custom':
                this.startDate = moment().format();
                this.customMaxDate = moment(this.startDate)
                    .add(this.maxDays, 'd')
                    .format();
                this.endDate = moment()
                    .add(event.value.config.days, 'd')
                    .format();
                break;
            default:
                this.startDate = moment().format();
                this.endDate = moment().format();
                break;
        }
    }

    handleDropdownToggle(event: boolean) {
        if (!event && this.startDate && this.endDate) {
            this.handleApplyClick();
        }
    }

    disableApply() {
        if (this.selectedValue && this.selectedValue.disableInputFields) {
            return false;
        }

        if (this.selectedValue && !this.selectedValue.disableInputFields && this.startDate && this.endDate) {
            return false;
        }

        return true;
    }

    handleApplyClick() {
        // Set form control value
        this.dateFormGroup.controls['startDate'].setValue(this.startDate);
        this.dateFormGroup.controls['endDate'].setValue(this.endDate);

        // Set payload to emit
        this.payload = {
            from: this.commonServices.adjustDateForTimezone(new Date(this.startDate)),
            to: this.commonServices.adjustDateForTimezone(new Date(this.endDate))
        };
        this.selectionChange.emit(this.payload);
    }

    handleStartDateChange() {
        this.customMaxDate = moment(this.startDate)
            .add(this.maxDays, 'd')
            .format();
        this.endDate = moment(this.startDate)
            .add(this.maxDays, 'd')
            .format();
    }
}
