import {
    Component,
    OnInit,
    Input,
    forwardRef,
    ChangeDetectionStrategy,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef
} from '@angular/core';
import {
    ISupplierListFormOptions,
    IGetSupplierListPayload,
    ISupplierList,
    ISupplier,
    valueChangesFire
} from './supplier-list-form-element.model';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    NG_VALIDATORS,
    FormControl,
    AbstractControl,
    Validators,
    ValidationErrors
} from '@angular/forms';
import {
    IAddSupplierModelData,
    getAddSupplierModelDefaultTemplate,
    IAddSupplierResponse,
    AddSupplierOrigins
} from '../../modals/add-supplier-v2/add-supplier-v2.model';
import { Subscription } from 'rxjs';
import { SuppliersService } from '../../../views/suppliers/suppliers.service';
import { AuthService } from '../../../core';
import { AddSupplierV2ModalComponent } from '../../modals/add-supplier-v2/add-supplier-v2.component';
import { take } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { amplitude } from '../../const-values';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
/**
 * todo: dynamic search , optimization , default selected value flow changes
 * selected item make separate @input { onChange hook have issue}
 */

@Component({
    selector: 'app-supplier-list-element',
    templateUrl: './supplier-list-form-element.component.html',
    styleUrls: ['./supplier-list-form-element.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SupplierListFormElementComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => SupplierListFormElementComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupplierListFormElementComponent implements OnInit, ControlValueAccessor {
    @Input() options: ISupplierListFormOptions;
    @Output() valueChanges: EventEmitter<any> = new EventEmitter<any>();
    @Input() listData: ISupplier[] = null; // selective list
    @Input() origin: AddSupplierOrigins = null; // Analytics

    @Input() unAcceptedTooltip: string;
    @Input() unInvitedTooltip: string;
    @Input() data_cy: string = null;

    control: FormControl = new FormControl('');
    @ViewChild('inputElement', { static: false }) inputElement: ElementRef;
    private subscriptions: Subscription[] = [];

    // chip select
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    selectedItemClone: any;
    rawSupplierListClone: ISupplierList;

    multiSelectCtrl = new FormControl();
    private _multiSelectedValues: ISupplier[] = [];

    public set multiSelectedValues(v: ISupplier[]) {
        this._multiSelectedValues = v;
        this.control.patchValue(this._multiSelectedValues);
    }

    public get multiSelectedValues(): ISupplier[] {
        return this._multiSelectedValues;
    }

    private _rawSupplierList: ISupplierList;

    private set rawSupplierList(v: ISupplierList) {
        this._rawSupplierList = v;
        this._setFilteredValue();
    }

    private get rawSupplierList(): ISupplierList {
        return this._rawSupplierList;
    }

    filteredList: Array<ISupplier> = [];

    private _currentCompany: ISupplier = {
        id: null,
        supplier_id: null,
        supplier_logo: null,
        supplier_name: null,
        supplier_verification_status: null,
        supplier_association_status: null,
        contact_email: null,
        contact_phone_no: null
    };

    public set currentCompany(v: any) {
        ({
            id: this.currentCompany.supplier_id,
            name: this.currentCompany.supplier_name,
            // verificationStatus: this.currentCompany.supplier_verification_status,
            logoUrl: this.currentCompany.supplier_logo
        } = v);
        // this.currentCompany.supplier_association_status = this.currentCompany.supplier_verification_status;
        Object.keys(this.currentCompany).forEach(key => {
            this.currentCompany[key] = this.currentCompany[key] ? this.currentCompany[key] : null;
        });
    }

    public get currentCompany(): any {
        return this._currentCompany;
    }

    private GET_SUPPLIER_LIST_PAYLOAD: IGetSupplierListPayload = {
        filter: {
            SupplierAssociationStatus: []
        },
        sort: {
            sortBy: 'create_ts',
            sortOrder: 'asc'
        },
        pagination: {
            from: 0,
            size: 1000
        }
    };

    get value(): any {
        return this.control.value;
    }

    set value(value: any) {
        this.control.setValue(value);
        this.onChange(value);
        this.onTouched();
    }

    state = {
        rawSupplierListLoading: false,
        rawSupplierListLoadFailed: false,
        currentCompanyAddedToList: false,
        selectedValuesPatched: false,
        supplierListLoaded: false
    };

    constructor(
        private supplierService: SuppliersService,
        private toster: CustomToastrService,
        private authService: AuthService,
        private dialog: MatDialog,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {
        const validators = [];

        this.GET_SUPPLIER_LIST_PAYLOAD['brandContextId'] = this.options['brandContextId'];

        if (this.options.isRequired) {
            validators.push(Validators.required);
        }

        switch (this.options.controlType) {
            case 'single-select':
                if (this.options.acceptOnlyListedValues) {
                    validators.push(this.singleSelectValueValidator.bind(this));
                }

                this.subscriptions.push(
                    this.control.valueChanges.subscribe(value => {
                        this.onChange(value);
                        this.onTouched();
                        this._setFilteredValue();
                    })
                );
                break;
            case 'chip-select':
                if (this.options.acceptOnlyListedValues) {
                    validators.push(this.chipSelectValueValidator.bind(this));
                }
                this.subscriptions.push(
                    this.multiSelectCtrl.valueChanges.subscribe(value => {
                        this._setFilteredValue();
                    }),
                    this.control.valueChanges.subscribe(value => {
                        this.onChange(value);
                        this.onTouched();
                        this._setFilteredValue();
                    })
                );
                this.multiSelectCtrl.setValidators([...validators]);
                break;
            default:
                break;
        }

        this.control.setValidators([...validators]);

        if (this.options.listOnlyThisSuppliers && Array.isArray(this.options.listOnlyThisSuppliers)) {
            this.GET_SUPPLIER_LIST_PAYLOAD.filter.SupplierAssociationStatus = this.createCopy(
                this.options.listOnlyThisSuppliers
            );
        }

        this.currentCompany = this.authService.userCompanyDetails;

        if (!this.authService.userCompanyDetails) {
            this.authService.getUser().subscribe(response => {
                this.authService.setUser(response);
                this.currentCompany = this.authService.userCompanyDetails;
            });
        } else {
            this.currentCompany = this.authService.userCompanyDetails;
        }

        this.getSupplierList();
    }

    ngOnChanges() {
        this._setFilteredValue();
        if (this.selectedItemClone !== this.options.selectedItem && this.state.supplierListLoaded) {
            this.setDefaultValues();
        }
        if (this.rawSupplierListClone && this.state.supplierListLoaded && this.listData) {
            this.useGivenListData();
        }
    }

    /**
     * @method getSupplierList
     * @returns { void }
     * Get the supplier list based on GET_SUPPLIER_LIST_PAYLOAD
     */
    getSupplierList(): void {
        this.state.rawSupplierListLoading = true;
        this.state.rawSupplierListLoadFailed = false;
        this.state.supplierListLoaded = false;
        this.supplierService.getAllSuppliers(this.GET_SUPPLIER_LIST_PAYLOAD).subscribe(
            (response: any) => {
                this.rawSupplierListClone = response['data'];
                if (this.listData) {
                    this.useGivenListData();
                } else {
                    this.rawSupplierList = this.rawSupplierListClone;
                }
                this.state.rawSupplierListLoading = false;
                this.state.supplierListLoaded = true;
                this.control.updateValueAndValidity();
                this.multiSelectCtrl.patchValue(this.multiSelectCtrl.value);
                if (this.options.selectedItem) {
                    this.setDefaultValues();
                }
            },
            error => {
                if (error.error && error.error.message) {
                    this.toster.error(error.error.message, 'Error');
                } else {
                    this.toster.error('Unable to fetch supplier list', 'Internal server error');
                }
                this.state.rawSupplierListLoadFailed = true;
            }
        );
    }
    /**
     * @method useGivenListData
     * Specific data list
     */
    useGivenListData(): void {
        const mapData = this.listData.map(d => {
            const filter = this.rawSupplierListClone.searchResponse.find(raw => raw.supplier_id === d.supplier_id);
            return filter;
        });
        this.rawSupplierList = {
            searchResponse: mapData,
            totalCount: mapData.length
        };
    }
    /**
     * @method setDefaultValues
     * Preselect
     */
    setDefaultValues(): void {
        if (
            !this.options.selectedItem ||
            this.options.selectedItem.length === 0 ||
            typeof this.options.selectedItem === 'string'
        ) {
            this.updateValue(null);
            return;
        }

        let key = '';
        if (Array.isArray(this.options.selectedItem)) {
            if (this.options.selectedItem[0].hasOwnProperty('supplier_id')) {
                key = 'supplier_id';
            } else if (this.options.selectedItem[0].hasOwnProperty('id')) {
                key = 'id';
            }
        } else {
            if (this.options.selectedItem.hasOwnProperty('supplier_id')) {
                key = 'supplier_id';
            } else if (this.options.selectedItem.hasOwnProperty('id')) {
                key = 'id';
            }
        }

        if (Array.isArray(this.options.selectedItem)) {
            const filter = this.options.selectedItem.map(d => {
                let rawFilter = this.rawSupplierListClone.searchResponse.find(s => s.supplier_id === d[key]);

                if (!this.state.currentCompanyAddedToList && this.currentCompany.supplier_id === d[key]) {
                    this.state.currentCompanyAddedToList = true;
                    rawFilter = this.currentCompany;
                }
                return rawFilter;
            });

            if (filter) {
                this.multiSelectedValues = filter;
                this.updateValue(filter);
            } else {
                this.toster.info('Selected Supplier is not exists');
            }
        } else {
            let value = this.rawSupplierList.searchResponse.find(d => d.supplier_id === this.options.selectedItem[key]);
            if (!value) {
                if (this.currentCompany.supplier_id === this.options.selectedItem[key]) {
                    value = this.currentCompany;
                }
            }
            this.updateValue(value);
        }
    }

    updateValue(value: any): void {
        this.control.patchValue(value);
        this.control.updateValueAndValidity();
        this.state.selectedValuesPatched = true;
        this.selectedItemClone = this.options.selectedItem;
        this.update('from-option');
    }

    /**
     * @method singleSelectValueValidator
     * @param control
     * @returns { ValidationErrors }
     * Single select field validator /it only accept value present in raw supplier list
     */
    private singleSelectValueValidator(control: AbstractControl): ValidationErrors {
        let flag = false;
        if (control.value === null) {
            return null;
        }
        if (typeof control.value === 'string' && control.value.trim() === '') {
            return null;
        }
        if (this.options.showCurrentCompany) {
            if (this.currentCompany === control.value) {
                return null;
            }
        }
        if (!this.rawSupplierList || !this.rawSupplierList.searchResponse) {
            return { control: { notValid: false } };
        }
        flag = this.rawSupplierList.searchResponse.some(data => data === control.value);
        return flag ? null : { notValid: true };
    }

    /**
     * @method chipSelectValueValidator
     * @returns { ValidationErrors }
     * Single select field validator /it only accept value present in raw supplier list
     */
    private chipSelectValueValidator(): ValidationErrors {
        if (this.multiSelectedValues.length === 0) {
            return null;
        } else {
            if (!this.rawSupplierList.searchResponse) {
                return { control: { notValid: false } };
            }
            const flag = this.multiSelectedValues.every(d => {
                let flagIndex = this.rawSupplierList.searchResponse.indexOf(d) > 0;
                if (this.options.showCurrentCompany) {
                    if (this.currentCompany === d) {
                        flagIndex = true;
                    }
                }
                return flagIndex;
            });
            return flag ? null : { notValid: true };
        }
    }

    /**
     * @method onFocusChipInput
     * focus input field
     */
    onFocusChipInput(): void {
        this.inputElement.nativeElement.focus();
    }

    /**
     * @method onFocus
     * supplier load failed means it will retry while focus
     */
    onFocus(): void {
        this.control.markAsTouched();
        if (this.state.rawSupplierListLoadFailed || (this.options.selectedItem && !this.state.selectedValuesPatched)) {
            this.control.patchValue(null);
            this.multiSelectedValues = [];
            this.state.selectedValuesPatched = false;
            this.state.currentCompanyAddedToList = false;
            this.getSupplierList();
        }
    }

    /**
     * @method remove
     * @param item
     * Remove supplier list items
     */
    remove(item: ISupplier): void {
        const index = this.multiSelectedValues.indexOf(item);
        const value = this.createCopy(this.multiSelectedValues);
        if (index >= 0) {
            value.splice(index, 1);
        }
        if (item === this.currentCompany) {
            this.state.currentCompanyAddedToList = false;
        }
        this.multiSelectedValues = value;
        this.update('from-option');
    }

    /**
     * @method selected
     * @param event
     * options selection handler
     */
    selected(event: MatAutocompleteSelectedEvent): void {
        switch (this.options.controlType) {
            case 'chip-select':
                const value = event.option.value;
                this.multiSelectedValues = [...this.multiSelectedValues, value];
                this.inputElement.nativeElement.value = '';
                this.multiSelectCtrl.setValue(null);
                if (value === this.currentCompany) {
                    this.state.currentCompanyAddedToList = true;
                }
                break;
            default:
                break;
        }
        this.update('from-option');
    }

    /**
     * @method _setFilteredValue
     * filter / search
     */
    private _setFilteredValue(): void {
        if (!this.rawSupplierList || !this.rawSupplierList.searchResponse) {
            this.filteredList = [];
            return;
        }
        if (
            !(
                this.rawSupplierList &&
                this.rawSupplierList.searchResponse &&
                this.rawSupplierList.searchResponse.length > 0
            )
        ) {
            this.filteredList = [];
            return;
        }

        switch (this.options.controlType) {
            case 'single-select':
                this._setFilteredValueSingleSelectList();
                break;
            case 'chip-select':
                this._setFilteredValueChipSelectList();
            default:
                break;
        }
    }

    /**
     * @method _setFilteredValueSingleSelectList
     * single select filter
     */
    private _setFilteredValueSingleSelectList(): void {
        const control =
            typeof this.control.value === 'object' && this.control.value
                ? this.control.value['supplier_name']
                : this.control.value;

        if (!control || control.trim() === '') {
            this.filteredList = this.rawSupplierList ? this.rawSupplierList.searchResponse : [];
            return;
        }

        this.filteredList = this.rawSupplierList.searchResponse.filter(
            d => d['supplier_name'].toLowerCase().indexOf(control.toLowerCase()) === 0
        );
    }

    /**
     * @method _setFilteredValueChipSelectList
     * single select filter
     */
    private _setFilteredValueChipSelectList(): void {
        const control =
            typeof this.multiSelectCtrl.value === 'object' && this.multiSelectCtrl.value
                ? this.multiSelectCtrl.value['supplier_name']
                : this.multiSelectCtrl.value;
        const selectedValueRemoved = this.rawSupplierList.searchResponse.filter(rawListItem => {
            let flag = this.multiSelectedValues.some(d => d.supplier_id === rawListItem.supplier_id);
            return !flag;
        });

        if (!control || control.trim() === '') {
            this.filteredList = selectedValueRemoved ? selectedValueRemoved : [];
            return;
        }

        this.filteredList = selectedValueRemoved.filter(
            d => d['supplier_name'].toLowerCase().indexOf(control.toLowerCase()) === 0
        );
    }

    getSupplierDetail(supplier: any): ISupplier | any {
        let key = '';
        if (supplier.hasOwnProperty('supplier_id')) {
            key = 'supplier_id';
        } else if (supplier.hasOwnProperty('id')) {
            key = 'id';
        }
        if (
            this.rawSupplierList &&
            this.rawSupplierList.searchResponse &&
            this.rawSupplierList.searchResponse.length > 0
        ) {
            const result = this.rawSupplierList.searchResponse.find(data => data.supplier_id === supplier[key]);
            if (result) {
                return result;
            } else {
                return { supplier_id: supplier[key], supplier_name: supplier['value'] ? supplier['value'] : '' };
            }
        } else {
            return { supplier_id: supplier[key], supplier_name: supplier['value'] ? supplier['value'] : '' };
        }
    }

    public onChange: any = () => {};
    public onTouched: any = () => {};

    /**
     * ControlValueAccessor / registerOnChange
     * @param fn
     */
    registerOnChange(fn) {
        this.onChange = fn;
    }

    /**
     * ControlValueAccessor / write value
     * @param value
     */
    writeValue(value: any) {
        if (value) {
            const finalValue = [];
            if (typeof value === 'object' && Array.isArray(value)) {
                value.forEach(v => {
                    if (v.hasOwnProperty('supplier_name') && v.hasOwnProperty('supplier_id')) {
                        finalValue.push(v);
                    } else {
                        finalValue.push(this.getSupplierDetail(v));
                    }
                });
                this.value = finalValue;
                this.multiSelectedValues = finalValue;
            } else if (typeof value === 'object') {
                if (value.hasOwnProperty('supplier_name') && value.hasOwnProperty('supplier_id')) {
                    this.value = value;
                } else {
                    this.value = this.getSupplierDetail(value);
                }
            }
        }

        if (this.options.showCurrentCompany) {
            if (this.currentCompany === value) {
                this.value = this.currentCompany;
                return;
            }
        }

        if (value === null) {
            this.control.reset();
        }
    }

    /**
     * ControlValueAccessor / registerOnTouched
     * @param fn
     */
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    /**
     * validate
     * @param _
     */
    validate(_: FormControl) {
        return this.control.valid ? null : { notValid: true };
    }

    /**
     * @method update
     * @param type
     * value changes emitter
     */
    public update(type: valueChangesFire) {
        this._setFilteredValue();
        if (
            this.options.valueChangesFire &&
            (this.options.valueChangesFire === 'both' || this.options.valueChangesFire === type)
        ) {
            this.valueChanges.emit(this.control.value);
        }
    }

    /**
     * @method displayValue
     * @param item
     * Returns supplier name
     */
    displayValue(item: ISupplier): string {
        if (!item) {
            return '';
        }
        return typeof item === 'object' ? item['supplier_name'] : item;
    }

    /**
     * @method createCopy
     * @param object
     * @returns { any }
     * create copy/clone for given object
     */
    createCopy(object: any): any {
        return JSON.parse(JSON.stringify(object));
    }

    /**
     * @method onCreateAddSupplierModel
     * Create add supplier model
     */
    onCreateAddSupplierModel(): void {
        this.control.reset();
        const DIALOG_DATA: IAddSupplierModelData = getAddSupplierModelDefaultTemplate();
        DIALOG_DATA.origin = this.origin; // analytics
        this.analyticsService.trackEvent(amplitude.supplier.addSupplierClicked, {
            Origin: this.origin,
            Action: amplitude.supplier.addSupplierClicked
        });

        const dialogRef = this.dialog.open(AddSupplierV2ModalComponent, {
            data: DIALOG_DATA
        });

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((modelData: IAddSupplierResponse) => {
                if (modelData.status === 'SUCCESS') {
                    this.inputElement.nativeElement.blur();
                    this.state.rawSupplierListLoadFailed = true;
                    this.toster.info('New supplier added , now you can select a supplier in the list');
                } else {
                    this.toster.info('Supplier not created ');
                }
            });
    }

    getErrorMessagePlaceholder(): string {
        let value = this.options.placeholder || '';
        if (value !== '' && value.endsWith(':')) {
            value = value.substr(0, value.length - 1);
        }
        return value;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
