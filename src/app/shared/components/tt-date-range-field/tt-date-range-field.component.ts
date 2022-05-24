import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
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
    selector: 'app-tt-date-range-field',
    templateUrl: './tt-date-range-field.component.html',
    styleUrls: ['./tt-date-range-field.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ]
})
export class TtDateRangeFieldComponent implements OnInit {
    @Input() dateRanges: IDateRange[] = [
        { id: '0', value: '90 days', disableInputFields: true, config: { action: 'sub', days: 90 } },
        { id: '1', value: '180 days', disableInputFields: true, config: { action: 'sub', days: 180 } },
        { id: '2', value: 'Custom date', disableInputFields: false, config: { action: 'custom', days: 0 } }
    ];
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

    constructor(private commonServices: CommonServices) {
        this.dateFormGroup = new FormGroup({
            selectedValue: new FormControl({}, [Validators.required]),
            startDate: new FormControl('', [Validators.required]),
            endDate: new FormControl('', [Validators.required])
        });
    }

    ngOnInit() {}

    handleDateFilterTypeChange(event: MatRadioChange) {
        this.selectedValue = event.value;
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
}
