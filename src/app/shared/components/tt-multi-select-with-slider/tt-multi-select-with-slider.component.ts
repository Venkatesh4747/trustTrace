import { Component, OnInit, ChangeDetectionStrategy, forwardRef, OnDestroy, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormGroup, FormControl } from '@angular/forms';

@Component({
    selector: 'app-tt-multi-select-with-slider',
    templateUrl: './tt-multi-select-with-slider.component.html',
    styleUrls: ['./tt-multi-select-with-slider.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TtMultiSelectWithSliderComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => TtMultiSelectWithSliderComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TtMultiSelectWithSliderComponent implements OnInit, ControlValueAccessor, OnDestroy {
    @Input() config: any = {}; // filter config

    get value(): any {
        const { slider, parameters } = this.filterForm.value;
        return { slider, parameters };
    }
    set value(value: any) {
        this.filterForm.setValue(value);
    }

    filterForm: FormGroup = null;

    constructor() {}

    ngOnInit() {
        this.config['options'] = new Array(10).fill('Lorem ipsum dolor');
        this.config['options'].push('test parameter');
        this.filterForm = new FormGroup({
            searchControl: new FormControl(''),
            parameters: new FormControl(''),
            slider: new FormControl(0)
        });
    }

    filtered(option: string) {
        if (this.filterForm.value['searchControl'] && this.filterForm.value['searchControl'].trim() !== '') {
            return option.toLowerCase().includes(this.filterForm.value['searchControl'].toLowerCase());
        } else {
            return true;
        }
    }

    noOptions() {
        if (!this.filterForm.value['searchControl'] || this.filterForm.value['searchControl'].trim() === '') {
            return true;
        }
        return this.config['options'].some(v =>
            v.toLowerCase().includes(this.filterForm.value['searchControl'].toLowerCase())
        );
    }

    clearAll(): void {
        this.filterForm.get('parameters').reset();
    }

    selectAll(): void {
        this.filterForm.get('parameters').setValue(this.config['options']);
    }

    onSubmit() {
        console.log(this.filterForm.value);
    }

    writeValue(value: any): void {
        if (value) {
            this.value = value;
        }
    }

    onChange: any = () => {};
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    onTouched: any = () => {};
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    reset(): void {
        this.filterForm.reset();
    }

    ngOnDestroy(): void {}
}
