import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    forwardRef,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FilterWithSearchComponent } from '../../../../../../shared/components/filter-with-search/filter-with-search.component';
import { ProductState } from '../../../../store/store';
import { FiledTypes, IOptionsModel, IOptionValueModel, IProductTaskViewData } from '../../../../template.model';
import { ValuePlaceholderComponent } from '../value-placeholder/value-placeholder.component';
@Component({
    selector: 'app-product-template',
    templateUrl: './product-template.component.html',
    styleUrls: ['./product-template.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ProductTemplateComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => ProductTemplateComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductTemplateComponent implements ControlValueAccessor, OnDestroy, OnChanges, AfterViewInit {
    @Input() inputType: FiledTypes;
    @Input() control: IProductTaskViewData;
    @Input() disableSelection = false;
    @Input() disabledMessage = '';
    @Input() disableClear = false;
    @Input() isInValid = false;
    @Output() inputModelClosed: EventEmitter<any> = new EventEmitter();

    @ViewChild('multiSelectContainer', { read: ViewContainerRef, static: false })
    multiSelectContainer: ViewContainerRef;

    ValuePlaceholderComponent: ComponentRef<any>;

    options: IOptionsModel[];
    optionSubscription: Subscription;
    formControl = new FormControl(null);
    subscriptions: Subscription[] = [];
    rawOptions: IOptionValueModel[];

    optionsDummy;

    toggle = false;

    get value() {
        return this.formControl.value;
    }

    set value(value) {
        this.formControl.setValue(value);
        this.onChange(value);
        this.onTouched();
    }

    ngOnChanges(data: any) {
        if (!this.toggle && this.ValuePlaceholderComponent?.instance && data.hasOwnProperty('isInValid')) {
            this.componentSwitch();
        }
        this.setOptions();
    }

    inputModelClosedEvent($event: any): void {
        this.inputModelClosed.emit($event);
        this.toggle = false;
    }

    constructor(private store: Store<ProductState>, private resolver: ComponentFactoryResolver) {
        this.subscriptions.push(
            this.formControl.valueChanges.subscribe(value => {
                this.onChange(value);
                this.onTouched();
            })
        );
        this.options = [];
        this.optionSubscription = this.store
            .select('Products')
            .pipe(map(d => d.options))
            .subscribe(options => {
                if (options !== null && !this.rawOptions) {
                    if (this.optionSubscription) {
                        this.optionSubscription.unsubscribe();
                    }
                    this.rawOptions = options;
                    this.setOptions();
                }
            });
    }

    setOptions(): void {
        if (this.rawOptions && this.control) {
            if (typeof this.control.optionTemplateId === 'string' && this.control.fieldType) {
                this.options = this.rawOptions.find(option => option.id === this.control.optionTemplateId).data;
            } else {
                this.options = this.control.optionTemplateId ? this.control.optionTemplateId : [];
            }
            this.optionsDummy = {};
            this.options.forEach(o => {
                this.optionsDummy[o.id] = o.value;
            });
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        if (this.optionSubscription) {
            this.optionSubscription.unsubscribe();
        }
    }

    onChange: any = () => {};
    onTouched: any = () => {};

    registerOnChange(fn: () => void): void {
        this.onChange = fn;
    }

    writeValue(value: any): void {
        if (value) {
            this.value = value;
        }

        if (value === null) {
            this.formControl.reset();
        }
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    validate(_: FormControl): any {
        return this.formControl.valid ? null : { product: { valid: false } };
    }

    reset(): void {
        this.formControl.reset();
    }

    ngAfterViewInit(): void {
        this.componentSwitch();
    }

    componentSwitch(): void {
        if (this.toggle) {
            this.loadFormControl();
        } else {
            this.loadPlaceholder();
        }
    }

    loadPlaceholder(): void {
        if (this.multiSelectContainer) {
            this.multiSelectContainer.clear();
            const factory: ComponentFactory<ValuePlaceholderComponent> = this.resolver.resolveComponentFactory(
                ValuePlaceholderComponent
            );
            this.ValuePlaceholderComponent = this.multiSelectContainer.createComponent(factory);
            this.ValuePlaceholderComponent.instance.displayValue = this.convertKeyToValue();
            this.ValuePlaceholderComponent.instance.isEditMode = true;
            this.ValuePlaceholderComponent.instance.disabled = this.disableSelection;
            this.ValuePlaceholderComponent.instance.disabledMessage = this.disabledMessage;
            this.ValuePlaceholderComponent.instance.isInValid = this.isInValid;
            this.ValuePlaceholderComponent.changeDetectorRef.detectChanges();

            const sub = this.ValuePlaceholderComponent.instance.valueClicked.pipe(take(1)).subscribe(() => {
                this.toggle = true;
                this.componentSwitch();
            });
        }
    }

    loadFormControl(): void {
        if (this.multiSelectContainer) {
            this.multiSelectContainer.clear();
            const factory: ComponentFactory<FilterWithSearchComponent> = this.resolver.resolveComponentFactory(
                FilterWithSearchComponent
            );
            this.ValuePlaceholderComponent = this.multiSelectContainer.createComponent(factory);
            this.ValuePlaceholderComponent.instance.options = this.options;
            this.ValuePlaceholderComponent.instance.toggle = true;
            this.ValuePlaceholderComponent.instance.showSearch = true;
            this.ValuePlaceholderComponent.instance.label = this.control.label;
            this.ValuePlaceholderComponent.instance.control = this.control;
            this.ValuePlaceholderComponent.instance.formControl = this.formControl;
            this.ValuePlaceholderComponent.instance.multiSelect = this.inputType === 'MULTI_SELECT';
            this.ValuePlaceholderComponent.instance.disableClear = this.disableClear;
            this.ValuePlaceholderComponent.changeDetectorRef.detectChanges();
            const sub = this.ValuePlaceholderComponent.instance.inputModelClosed.pipe(take(1)).subscribe($event => {
                this.toggle = false;
                this.componentSwitch();
                this.inputModelClosedEvent($event);
            });
        }
    }

    convertKeyToValue(): string {
        if (Array.isArray(this.formControl.value)) {
            if (this.formControl.value.length > 0) {
                return this.optionsDummy[this.formControl.value[0]] + '...';
            } else {
                return this.control.label;
            }
        } else {
            return this.formControl.value ? this.optionsDummy[this.formControl.value] : this.control.label;
        }
    }
}
