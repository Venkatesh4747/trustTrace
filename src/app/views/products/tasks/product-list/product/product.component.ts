import { ChangeDetectionStrategy, Component, forwardRef, Input, OnChanges, OnDestroy } from '@angular/core';
import {
    ControlValueAccessor,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CustomToastrService } from '../../../../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../core';
import { AnalyticsService } from '../../../../../core/analytics/analytics.service';
import { ConfirmDialogComponent } from '../../../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { ConfirmationPromptSingleComponent } from '../../../../../shared/modals/confirmation-prompt-single/confirmation-prompt-single.component';
import { InfoModalComponent } from '../../../../../shared/modals/info-modal/info-modal.component';
import { SubscriptionType } from '../../../../../shared/multi-industry-support/application-menu.model';
import { ProductsService } from '../../../products.service';
import * as ProductActions from '../../../store/products.actions';
import { ProductState } from '../../../store/store';
import { GroupStatus, INGREDIENT_META_DATA, UNKNOWN } from '../../../template.model';
import {
    IBulkUpdatePayload,
    ITasks,
    ProductAutoSaveRequestPayload,
    ProductDeclarationPayload,
    Section
} from '../../../template.model';
import { ICustomFieldDisplay } from '../../../../../shared/components/additional-information/additional-information.model';
import { ProductCommonComponent } from '../../../product-common.component';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ProductComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => ProductComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ProductComponent extends ProductCommonComponent implements ControlValueAccessor, OnDestroy, OnChanges {
    @Input() product: ITasks;
    @Input() customFieldDisplayList: ICustomFieldDisplay[];
    @Input() isSimulation = false;
    env = environment;

    @Input() productSubmittedStateSubject: Subject<any>;
    @Input() index: number;
    @Input() selectAll: Subject<boolean>;

    selectAllSubscription: Subscription;

    productForm: FormGroup;
    subscriptions: Subscription[] = [];
    isLoaded = false;
    isSelected = false;
    selectedFieldPath: any;

    previousState = {
        selectedFieldPath: '',
        status: ''
    };

    ingredientsData: any = {};

    get value(): any {
        return this.productForm.value;
    }

    get isBrandSupplier(): boolean {
        return (this.authService.user.subscriptionType as SubscriptionType) === 'BRAND_SUPP';
    }

    set value(value) {
        if (this.productForm && this.isLoaded && !Array.isArray(value)) {
            this.productForm.setValue(value);
            this.onChange(value);
            this.onTouched();
        }
    }

    saveSubscription: Subscription;

    readonly ARRAY_LIST_GRANULARITY_ID = 'ingredients_coos';

    constructor(
        private productsService: ProductsService,
        private formBuilder: FormBuilder,
        private toastr: CustomToastrService,
        private dialog: MatDialog,
        private store: Store<ProductState>,
        private analyticsService: AnalyticsService,
        private router: Router,
        private authService: AuthService
    ) {
        super();
        this.productForm = this.formBuilder.group({
            isSelected: ['']
        });
    }

    ngOnChanges(): void {
        if (this.product && !this.isLoaded && !this.isSimulation) {
            this.store
                .select('Products')
                .pipe(take(1))
                .subscribe(productStore => {
                    if (productStore.loadedProducts.length === this.index && !this.isLoaded) {
                        this.isLoaded = false;
                        this.constructForm();
                    }
                });
        }
        if (this.isSimulation) {
            this.constructForm();

            this.subscriptions.push(
                this.productForm.valueChanges.subscribe(() => {
                    const value = this.productForm.getRawValue();
                    this.onChange(value);
                    this.onTouched();
                })
            );
        }
    }

    constructForm(): void {
        const FORM_DATA = {
            isSelected: [
                {
                    value: null,
                    disabled: true
                }
            ]
        };
        try {
            this.product.productTaskViewData.forEach(control => {
                switch (control.fieldTypeInfo) {
                    case 'FORM_CONTROL':
                        const d = [null];

                        if (control.fieldRequired) {
                            d.push(Validators.required);
                        }
                        if (control.fieldData && control.fieldData[0]) {
                            if (control.fieldType === 'SINGLE_SELECT') {
                                d[0] = control.fieldData[0];
                            } else {
                                d[0] = control.fieldData;
                            }
                        }

                        FORM_DATA[control.id] = d;
                        break;
                    case 'FORM_ARRAY':
                        FORM_DATA[control.id] = this.formBuilder.array(
                            [],
                            control.fieldRequired ? this.unknownItemValidator.bind(this) : []
                        );
                        break;
                    default:
                        break;
                }
            });

            this.productForm = this.formBuilder.group(FORM_DATA);

            this.product.productTaskViewData.forEach(control => {
                switch (control.fieldTypeInfo) {
                    case 'FORM_ARRAY':
                        const add = this.productForm.get(control.id) as FormArray;
                        control.productTaskMetaData.forEach(fg => {
                            const FC_DATA = {};
                            fg.productTaskMetaData.forEach(co => {
                                const d = [null];
                                if (co.fieldRequired) {
                                    d.push(Validators.required);
                                }

                                if (co.fieldData && co.fieldData[0]) {
                                    d[0] = co.fieldData;
                                    if (co.fieldType === 'SINGLE_SELECT') {
                                        d[0] = co.fieldData[0];
                                    } else {
                                        d[0] = co.fieldData;
                                    }
                                }
                                FC_DATA[co.id] = d;

                                if (co.displayValueAlone) {
                                    this.ingredientsData[co.id] = co.label;
                                }
                            });
                            const FG_DATA = {};
                            FG_DATA[fg.id] = this.formBuilder.group(FC_DATA);
                            add.push(this.formBuilder.group(FG_DATA));
                        });
                        break;
                    default:
                        break;
                }
            });
            this.isLoaded = true;
            if (!this.isSimulation) {
                this.store.dispatch(new ProductActions.AddLoadedProduct(this.product.id));
                this.subscriptions.push(
                    this.productSubmittedStateSubject.subscribe(ids => {
                        if (ids.indexOf(this.product.id) > -1) {
                            this.selectedFieldPath = null;
                            this.productForm.get('isSelected').patchValue(false);
                            this.productForm.updateValueAndValidity();
                            this.product.status = 'SUBMITTED';
                            this.selectedFieldPath = null;
                        }
                    })
                );
                if (this.selectAllSubscription) {
                    this.selectAllSubscription.unsubscribe();
                }

                this.selectAllSubscription = this.selectAll.subscribe(flag => {
                    if (this.isSelected !== flag && this.product.status !== 'SUBMITTED') {
                        this.productForm.get('isSelected').setValue(flag);
                        this.selectedFieldPath = null;
                    }
                });
            } else {
                setTimeout(() => {
                    this.onChange(this.productForm.getRawValue());
                    this.onTouched();
                }, 1000);
            }

            this.subscriptions.push(
                this.productForm.valueChanges.subscribe(() => {
                    const value = this.productForm.getRawValue();
                    if (
                        !value.hasOwnProperty('isSelected') ||
                        value.isSelected === null ||
                        this.isSelected === value.isSelected
                    ) {
                        this.save();
                    }
                    this.isSelected = value.isSelected;
                    this.onChange(value);
                    this.onTouched();
                })
            );
        } catch (exp) {
            this.isLoaded = false;
            if (!this.isSimulation) {
                this.store.dispatch(new ProductActions.AddLoadedProduct(this.product.id));
            }
            console.error(`Error loading product ${this.product.productName}`);
        }
    }

    private unknownItemValidator(arrayControl: FormArray): ValidationErrors {
        if (arrayControl.length === 0) {
            return { valid: false };
        }

        const listOfIngredients: string[] = arrayControl.value.reduce(
            (accumulator: string[], ingredientArray: any[]) => {
                if (Object.keys(ingredientArray)[0].indexOf(UNKNOWN) === -1) {
                    accumulator = [...accumulator, ...Object.keys(ingredientArray)];
                }
                return accumulator;
            },
            []
        );

        if (listOfIngredients.length === 0) {
            return { valid: false };
        }
        return null;
    }

    isHavingError(controls: string[]): boolean {
        let finalControl;
        controls.forEach((control, index) => {
            if (index === 0) {
                finalControl = this.productForm.get(control);
            } else if (typeof +control === 'number') {
                finalControl = finalControl.controls[control];
            } else {
                finalControl = finalControl.get(control);
            }
        });
        return finalControl ? finalControl.hasError('required') : false;
    }

    generateSavePayload(): ProductAutoSaveRequestPayload {
        const listOfIngredients = this.productForm.value[this.ARRAY_LIST_GRANULARITY_ID].reduce(
            (accumulator: string[], ingredientArray: any[]) => {
                if (Object.keys(ingredientArray)[0].indexOf(UNKNOWN) === -1) {
                    accumulator = [...accumulator, ...Object.keys(ingredientArray)];
                }
                return accumulator;
            },
            []
        );

        const declaration: ProductDeclarationPayload[] = [];
        this.product.productTaskViewData.forEach(control => {
            switch (control.fieldTypeInfo) {
                case 'FORM_CONTROL':
                    const controlValue = this.productForm.value[control.id];
                    declaration.push({
                        _id: this.product.productId,
                        granularity_id: control.id,
                        label: control.label,
                        order: control.order,
                        save_value: Array.isArray(controlValue)
                            ? controlValue[0] === null
                                ? []
                                : controlValue
                            : controlValue === null
                            ? []
                            : [controlValue],
                        section: Section.Product
                    });
                    break;
                case 'FORM_ARRAY':
                    let orderCounter = 0;
                    control.productTaskMetaData.forEach((ingredient, ingIndex) => {
                        const ingData = ingredient['productTaskMetaData']; // one ingredient task
                        const oneIngredientValue = this.productForm.value[control.id][ingIndex][ingData[0].id]; // one ingredient value
                        let isCounted = false;
                        Object.keys(ingData).forEach((key, index) => {
                            if (index !== 0 && ingData[0].id.indexOf(UNKNOWN) === -1) {
                                const _value = oneIngredientValue[ingData[key].id];
                                if (!isCounted) {
                                    orderCounter += 1;
                                    isCounted = true;
                                }

                                declaration.push({
                                    _id: ingData[0].id,
                                    granularity_id: ingData[key].id,
                                    label: ingData[key].label,
                                    order: orderCounter,
                                    save_value: Array.isArray(_value)
                                        ? _value[0] === null
                                            ? []
                                            : _value
                                        : _value === null
                                        ? []
                                        : [_value],
                                    section: Section.Ingredient
                                });
                            }
                        });
                    });
                    break;
                default:
                    break;
            }
        });
        const payload: ProductAutoSaveRequestPayload = {
            product_data: {
                composition: listOfIngredients
            },
            product_declaration_payload: declaration
        };

        return payload;
    }

    save(): void {
        if (!this.selectedFieldPath || !this.selectedFieldPath.formControl) {
            return;
        }

        if (this.ingredientChangeDetect()) {
            this.updateIngredient();
            return;
        }

        if (this.isSimulation) {
            return;
        }

        this.previousState.status = this.product.status;
        if (this.saveSubscription && this.previousState.selectedFieldPath === this.selectedFieldPath) {
            this.saveSubscription.unsubscribe();
        }
        this.previousState.selectedFieldPath = this.selectedFieldPath;

        this.product.status = 'ONPROGRESS';

        const payload: ProductAutoSaveRequestPayload = this.generateSavePayload();

        this.saveSubscription = this.productsService
            .saveData_v1(this.product.productId, this.product.id, payload)
            .subscribe(
                res => {
                    if (res.data?.containsInvalidLabel) {
                        this.dialog.open(InfoModalComponent, {
                            width: '372px',
                            data: {
                                title: 'Invalid entry!',
                                description:
                                    'A label that was previously available and added on your products is now removed. Kindly refresh your page and then proceed.',
                                buttonLabel: 'Close'
                            }
                        });
                        return;
                    }
                    this.product.updateTs = res.data.updateTs;
                    this.product.status = 'DRAFT';
                    this.product.lastModifiedBy = res.data.lastModifiedBy;
                    this.store.dispatch(new ProductActions.UpdateAutoSaved(res.data.updateTs));
                    if (res.data.status) {
                        this.store.dispatch(new ProductActions.FetchFilters());
                    }

                    if (this.previousState.status === 'SUBMITTED') {
                        this.store.dispatch(new ProductActions.ProductSaved(this.product.id));
                    }

                    this.analyticsService.trackEvent('Products - Data Collection', {
                        'Action Performed': `Product saved ${this.product.productName} ${this.product.productNumber}`
                    });
                },
                () => {
                    this.product.status = this.previousState.status as GroupStatus;
                    this.toastr.error('Something went wrong');
                }
            );
    }

    productSelect(): void {
        this.selectedFieldPath = null;
        if (this.product.status === 'SUBMITTED') {
            return;
        } else {
            this.productForm.get('isSelected').patchValue(!this.productForm.getRawValue().isSelected);
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        if (this.saveSubscription) {
            this.saveSubscription.unsubscribe();
        }
        if (this.selectAllSubscription) {
            this.selectAllSubscription.unsubscribe();
        }
    }

    onChange: any = () => {};
    onTouched: any = () => {};

    registerOnChange(fn: Function): void {
        this.onChange = fn;
    }

    writeValue(value: any): void {
        if (value) {
            this.value = value;
        }

        // if (value === null) {
        //     this.productForm.reset();
        // }
    }

    registerOnTouched(fn: Function): void {
        this.onTouched = fn;
    }

    validate(_: FormControl): any {
        return this.productForm.valid ? null : { product: { valid: false } };
    }

    reset(): void {
        this.productForm.reset();
    }

    onOpenDuplicatePrompt($event: any): void {
        if ($event.isFilter || $event.sameState || this.isSimulation) {
            return;
        }
        let selectedValue = $event.value;
        if (typeof selectedValue === 'string') {
            selectedValue = new Array(selectedValue);
        }

        if (this.selectedFieldPath.isDuplicated) {
            const dialogRef = this.dialog.open(ConfirmationPromptSingleComponent, {
                width: '372px',
                data: {
                    ingredientName: this.getIngredientName(this.selectedFieldPath.groupId),
                    title: 'Same ingredient found!',
                    granularityId: this.selectedFieldPath.g_formControl,
                    primaryBtn: 'Submit',
                    secondaryBtn: 'Cancel'
                }
            });

            dialogRef
                .afterClosed()
                .pipe(take(1))
                .subscribe(result => {
                    if (result && result.applyToAll) {
                        const payload: IBulkUpdatePayload = {
                            data: selectedValue,
                            ingredientId: this.selectedFieldPath.groupId,
                            granularityId: this.selectedFieldPath.g_formControl
                        };

                        this.store.dispatch(new ProductActions.BulkUpdate(payload));
                    }
                });
        }
    }

    trackProductSelection(): void {
        this.analyticsService.trackEvent('Products - Data Collection', {
            'Action Performed': `Product selected for submission ${this.product.productName} ${this.product.productNumber}`
        });
    }

    navigateToProductDetailPage(id: string, ...sortId: string[]): void {
        let url = '/products/tasks';
        let productId = id;
        if (this.router.url === '/products/finished/simulation') {
            url = '/products/finished';
            productId = this.authService.user.companyId + '_' + id;
        }
        if (sortId && sortId.length > 0) {
            this.router.navigate([url, productId], { queryParams: { searchAfter: sortId } });
        } else {
            this.router.navigate([url, productId]);
        }
    }

    addIngredient(formControlId: any): void {
        this.analyticsService.trackEvent('Add ingredient button clicked', {
            'Action Performed': `Add ingredient button clicked for product ${this.product.id}`
        });
        // @ts-ignore
        const existingIngredientCount = this.productForm.get(formControlId).controls.length;
        const add = this.productForm.get(formControlId) as FormArray;

        this.selectedFieldPath = null;

        if (existingIngredientCount === 5) {
            this.analyticsService.trackEvent('Add ingredient error', {
                'Action Performed': `Trying to add more than 5 ingredients for product ${this.product.id}`
            });
            this.dialog.open(InfoModalComponent, {
                width: '372px',
                data: {
                    title: 'Invalid entry!',
                    description:
                        'You cannot add more than 5 ingredients per product. If you would like to add another ingredient please delete one of the existing ingredients.',
                    buttonLabel: 'Close'
                }
            });
        } else {
            const ingredientGranularities = INGREDIENT_META_DATA.productTaskMetaData.map(granularity => granularity.id);
            const random = Math.random()
                .toString(36)
                .substring(5);
            const ingredientId = UNKNOWN.concat(random);
            const FC_DATA = {};
            ingredientGranularities.forEach((granularity, index) => {
                const d = [null];
                if (index === 0) {
                    granularity = ingredientId;
                }
                if (INGREDIENT_META_DATA.productTaskMetaData[index].fieldRequired) {
                    d.push(Validators.required);
                }
                FC_DATA[granularity] = d;
            });
            const FG_DATA = {};
            FG_DATA[ingredientId] = this.formBuilder.group(FC_DATA);

            const ingredientMetaData = this.product.productTaskViewData.find(control => control.id === formControlId);

            const clone = JSON.parse(JSON.stringify(INGREDIENT_META_DATA));
            clone.id = ingredientId;
            clone.productTaskMetaData.forEach((cl, index) => {
                if (index === 0) {
                    cl.id = ingredientId;
                    cl.fieldData = [ingredientId];
                }
                cl.fieldData = [];
            });

            ingredientMetaData.productTaskMetaData.push(clone);
            add.push(this.formBuilder.group(FG_DATA));
        }
    }

    ingredientChangeDetect(): boolean {
        if (!this.selectedFieldPath.g_formControl || this.selectedFieldPath.g_formControl.indexOf('ign_') === -1) {
            return false;
        }

        const value = this.productForm.value[this.selectedFieldPath.formControl];

        return !(
            this.selectedFieldPath.groupId ===
                value[this.selectedFieldPath.index][this.selectedFieldPath.groupId][
                    this.selectedFieldPath.g_formControl
                ] ||
            (this.selectedFieldPath.groupId.indexOf(UNKNOWN) !== -1 &&
                value[this.selectedFieldPath.index][this.selectedFieldPath.groupId][
                    this.selectedFieldPath.g_formControl
                ] === null)
        );
    }

    updateIngredient(): void {
        this.analyticsService.trackEvent('Update ingredient', {
            'Action Performed': `Update ingredient for product ${this.product.id}`
        });
        const formArray = this.productForm.get(this.selectedFieldPath.formControl) as FormArray;
        const tempSelectedPath = JSON.parse(JSON.stringify(this.selectedFieldPath));

        this.selectedFieldPath = null;
        const formArrayValue = formArray.value;

        const index = tempSelectedPath.index;

        const ingredientGranularities = Object.keys(formArrayValue[index][tempSelectedPath.g_formControl]);

        const FC_DATA = {};
        let newIngredientName = formArrayValue[index][tempSelectedPath.g_formControl][tempSelectedPath.g_formControl];
        if (!newIngredientName) {
            const random = Math.random()
                .toString(36)
                .substring(5);
            newIngredientName = UNKNOWN.concat(random);
        }

        ingredientGranularities.forEach((granularity, i) => {
            const d = [null];
            if (granularity === tempSelectedPath.g_formControl) {
                d[0] = formArrayValue[index][tempSelectedPath.g_formControl][tempSelectedPath.g_formControl];
                granularity = newIngredientName;
            } else {
                d[0] = formArrayValue[index][tempSelectedPath.g_formControl][granularity];
            }
            if (INGREDIENT_META_DATA.productTaskMetaData[i].fieldRequired) {
                d.push(Validators.required);
            }
            FC_DATA[granularity] = d;
        });
        const FG_DATA = {};
        FG_DATA[newIngredientName] = this.formBuilder.group(FC_DATA);

        const ingredientMetaData = this.product.productTaskViewData.find(
            control => control.id === tempSelectedPath.formControl
        );

        const clone = JSON.parse(JSON.stringify(INGREDIENT_META_DATA));
        clone.id = newIngredientName;
        clone.productTaskMetaData.forEach((cl, index) => {
            if (index === 0) {
                cl.id = newIngredientName;
                cl.fieldData = [newIngredientName];
            }
            if (index === 1) {
                cl.optionTemplateId = ingredientMetaData.optionTemplateId;
            }
            cl.fieldData = [];
        });

        (ingredientMetaData.productTaskMetaData as any[]).splice(index, 1, clone);
        formArray.removeAt(index);
        this.selectedFieldPath = tempSelectedPath;
        this.selectedFieldPath.g_formControl = newIngredientName;
        this.selectedFieldPath.groupId = newIngredientName;
        formArray.insert(index, this.formBuilder.group(FG_DATA));
    }

    deleteIngredient(index: number, formControlId: string): void {
        this.selectedFieldPath = null;
        const formArray = this.productForm.get(formControlId) as FormArray;

        const dialogPrompt = this.dialog.open(ConfirmDialogComponent, {
            width: '390px',
            data: {
                title: 'Delete Ingredient?',
                msg: 'Are you sure you want to delete this ingredient?',
                primaryButton: 'Cancel',
                secondaryButton: 'Delete Ingredient',
                class: 'bg-red-btn-delete-modal-dialog-block',
                showClose: false
            }
        });
        dialogPrompt.afterClosed().subscribe(result => {
            if (result && result === 'Delete Ingredient') {
                this.analyticsService.trackEvent('Delete ingredient', {
                    'Action Performed': `Delete ingredient for product ${this.product.id}`
                });
                const ingredientMetaData = this.product.productTaskViewData.find(
                    control => control.id === formControlId
                );
                ingredientMetaData.productTaskMetaData.splice(index, 1);
                this.selectedFieldPath = {
                    formControl: 'DELETE'
                };
                formArray.removeAt(index);
            } else {
                this.analyticsService.trackEvent('Delete ingredient cancelled', {
                    'Action Performed': `Delete ingredient cancelled for product ${this.product.id}`
                });
            }
        });
    }

    reArrangeIngredientOrder(from: number, to: number, formControlId: string): void {
        this.analyticsService.trackEvent('Arrange ingredient', {
            'Action Performed': `From ${from + 1} - To ${to + 1}`
        });
        this.selectedFieldPath = null;

        const formArray = this.productForm.get(formControlId) as FormArray;
        const reArrangeFA = formArray.at(from);
        formArray.removeAt(from);
        const ingredientMetaData = this.product.productTaskViewData.find(control => control.id === formControlId);
        const reArrangeTD = ingredientMetaData.productTaskMetaData[from];
        ingredientMetaData.productTaskMetaData.splice(from, 1);
        ingredientMetaData.productTaskMetaData.splice(to, 0, reArrangeTD);
        this.selectedFieldPath = {
            formControl: 'RE_ARRANGE'
        };
        formArray.insert(to, reArrangeFA);
    }

    isUnknownIngredient(formControlId: string, groupId: string, groupFormControlId: string): boolean {
        return groupId === groupFormControlId ? false : groupId.indexOf(UNKNOWN) !== -1;
    }

    getOrderValue(orderNumber: number): string {
        switch (orderNumber) {
            case 1:
                return 'Move to 1st';
            case 2:
                return 'Move to 2nd';
            case 3:
                return 'Move to 3rd';
            case 4:
                return 'Move to 4th';
            case 5:
                return 'Move to 5th';
            default:
                break;
        }
    }

    openInstructionModal(): void {
        this.analyticsService.trackEvent('Food data collection info icon clicked', {
            'Action Performed': 'Ingredient data instruction/Info clicked'
        });
        this.dialog.open(InfoModalComponent, {
            width: '567px',
            data: {
                title: 'Information!',
                description: [
                    'The ingredients should be arranged in the order of its quantity within the products',
                    'The ingredients having the highest quantity first and ingredients have the lowest quantity last',
                    'The weightage for the calculations will also be weighted accordingly',
                    'Please be very careful when you rearrange the ingredients'
                ],
                buttonLabel: 'Close'
            }
        });
        return;
    }

    getIngredientName(ingredientId: string): string {
        let ingredientName = null;
        this.store
            .select('Products')
            .pipe(take(1))
            .subscribe(productStore => {
                productStore.options.forEach(option => {
                    if (option.name === 'PRODUCT_INGREDIENT') {
                        option.data.forEach(values => {
                            if (values.id === ingredientId) {
                                ingredientName = values.value;
                            }
                        });
                    }
                });
            });
        return ingredientName;
    }

    getHintText(length: number): string {
        if (length) {
            return 'Please use the arrow button to arrange the ingredients from increasing to decreasing order';
        } else {
            return 'No ingredients found. Click below to add new ingredients';
        }
    }
}
