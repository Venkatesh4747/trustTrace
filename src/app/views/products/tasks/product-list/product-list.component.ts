import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../../core/analytics/analytics.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ContextService } from '../../../../shared/context.service';
import * as productActions from '../../store/products.actions';
import { ProductState } from '../../store/store';
import { ITasks } from '../../template.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { InfoModalComponent } from '../../../../shared/modals/info-modal/info-modal.component';
import { IProductsModel } from '../../store/products.reducer';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { ICustomFieldDisplay } from '../../../../shared/components/additional-information/additional-information.model';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
    products: ITasks[] = [];
    customFieldDisplayList: ICustomFieldDisplay[];
    productsForm: FormGroup;
    @Input() selectAll: Subject<boolean>;

    productState$: Observable<IProductsModel>;

    formSubscription: Subscription;

    submit$: Subscription;
    config$: Subscription;

    productSubmittedStateSubject = new Subject();

    constructor(
        private formBuilder: FormBuilder,
        private toastr: CustomToastrService,
        private appContext: ContextService,
        private store: Store<ProductState>,
        private analyticsService: AnalyticsService,
        private dialog: MatDialog
    ) {
        this.productsForm = new FormGroup({});
    }

    ngOnInit() {
        this.store.dispatch(new productActions.FetchProducts());

        this.getProductConfig();

        this.productState$ = this.store.select('Products');

        this.submit$ = this.appContext.handleProductListSubmit.subscribe(handleSubmit => {
            if (handleSubmit) {
                this.validateAndSubmit();
            }

            this.analyticsService.trackEvent('Products - Data Collection', {
                'Action Performed': 'Submit clicked'
            });
        });
    }

    getProductConfig(): void {
        if (this.config$) {
            this.config$.unsubscribe();
        }
        this.config$ = this.store.select('Products').subscribe(data => {
            if (data.productsConfig && data.productListIsLoading) {
                if (data.productsConfig.tasks && data.productsConfig.tasks.length > 0) {
                    this.products = JSON.parse(JSON.stringify(data.productsConfig['tasks']));
                    this.customFieldDisplayList = data.productsConfig['customFieldDisplayList'];
                    this.constructFormGroup();
                } else {
                    this.products = [];
                    this.customFieldDisplayList = [];
                    this.store.dispatch(new productActions.ConfigLoaded());
                }
            }

            /** */
            if (!data.productListIsLoading && data.productsConfig === null && this.products.length !== 0) {
                this.products = [];
                this.customFieldDisplayList = [];
                this.productsForm = new FormGroup({});
            }

            if (data.lastSubmittedProducts.productIds.length > 0 && !data.lastSubmittedProducts.consumed) {
                this.store.dispatch(new productActions.ClearSubmittedProducts());
                this.productSubmittedStateSubject.next(data.lastSubmittedProducts.productIds);
                this.toastr.success('Products are successfully submitted.');
            }
        });
    }
    attachedProducts(start: number, tasks: ITasks[]): void {
        for (let i = start; i <= tasks.length; i++) {
            if (tasks[i]) {
                const control = new FormControl([]);
                this.products.push(JSON.parse(JSON.stringify(tasks[i])));
                this.productsForm.addControl(tasks[i].id.toString(), control);
            }
        }
    }

    constructFormGroup(): void {
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
        const FORM_DATA = {};
        this.products.forEach(product => {
            FORM_DATA[product.id] = [];
        });
        this.productsForm = this.formBuilder.group(FORM_DATA);

        this.formSubscription = this.productsForm.valueChanges.subscribe(data => {
            const selectedProducts = [];
            Object.keys(this.productsForm.value).forEach(key => {
                if (this.productsForm.value[key] && this.productsForm.value[key]['isSelected']) {
                    selectedProducts.push(key);
                }
            });
            this.store.dispatch(new productActions.LoadCheckedProduct(selectedProducts));
        });
        this.store.dispatch(new productActions.ConfigLoaded());
    }

    validateAndSubmit(): void {
        this.store
            .select('Products')
            .pipe(
                take(1),
                map(productState => productState.checkedProducts)
            )
            .subscribe(ids => {
                let haveError = false;
                let saveProgress = false;
                const finalIds = {
                    validIds: [],
                    invalidIds: []
                };
                ids.forEach(id => {
                    if (!this.productsForm.get(id).valid) {
                        haveError = true;
                        finalIds.invalidIds.push(id);
                    } else {
                        finalIds.validIds.push(id);
                    }
                });
                saveProgress = this.products.some(product => product.status === 'ONPROGRESS');
                if (saveProgress) {
                    this.toastr.info('Some products are not yet saved .try again!!');
                } else if (haveError) {
                    if (finalIds.invalidIds.length === ids.length) {
                        // All the products have an error
                        this.dialog.open(InfoModalComponent, {
                            width: '372px',
                            data: {
                                title: 'Invalid entry!',
                                description:
                                    'For a Product to be submitted, it must have a country of manufacturing and at least one ingredient. Please fill in all mandatory fields and then proceed to submit.',
                                buttonLabel: 'Close'
                            }
                        });
                    } else {
                        // Some of the product has an error
                        const dialogPrompt = this.dialog.open(ConfirmDialogComponent, {
                            width: '390px',
                            data: {
                                title: 'Submit product!',
                                msg:
                                    'For a Product to be submitted, it must have a country of manufacturing and at least one ingredient. Products missing either of these will not be submitted and all other products will be submitted',
                                primaryButton: 'Cancel',
                                secondaryButton: 'Proceed',
                                class: 'proceed-prompt',
                                showClose: false
                            }
                        });

                        dialogPrompt.afterClosed().subscribe(data => {
                            if (data === 'Proceed') {
                                this.store.dispatch(new productActions.SubmitProductStart(finalIds.validIds));
                            }
                        });
                    }
                } else {
                    this.store.dispatch(new productActions.SubmitProductStart(finalIds.validIds));
                }
            });
    }

    ngOnDestroy(): void {
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
        if (this.submit$) {
            this.submit$.unsubscribe();
        }
        if (this.config$) {
            this.config$.unsubscribe();
        }
    }

    customTrackBy(index: number, obj: any): any {
        return index;
    }
}
