import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ProductsService } from '../products.service';
import { IProductsModel } from '../store/products.reducer';
import { UNKNOWN } from '../template.model';
import { AnalyticsService } from './../../../core/analytics/analytics.service';
import * as productActions from './../store/products.actions';
import { IProductListAutocompleteReq, IProductListAutocompleteResp, ISimulateReq } from './simulation.model';
import { MatDialog } from '@angular/material/dialog';
import { InfoModalComponent } from '../../../shared/modals/info-modal/info-modal.component';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-simulation',
    templateUrl: './simulation.component.html',
    styleUrls: ['./simulation.component.scss']
})
export class SimulationComponent implements OnInit, OnDestroy {
    tableHeaders: any = null;
    env = environment;
    autoCompleteProductList: IProductListAutocompleteResp[] = [];
    searchControl = new FormControl('');

    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

    selectedProduct = null;
    productForm: FormGroup = null;
    fetchingProduct = false;
    isSimulationDone = false;
    additionalInfo: any;
    fieldData: any;
    ecData = null;

    tabName = 'Finished Products';
    entity = 'FOOD_PRODUCT';
    viewPage = 'FOOD_PRODUCT_VIEW';
    viewType = 'FORM';

    isFetchingAdditionalInfo = false;

    BRAND_OR_RETAILER: 'BRAND' | 'RETAILER' = null;

    constructor(
        private productsService: ProductsService,
        private toastr: CustomToastrService,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private dialog: MatDialog,
        private analyticsService: AnalyticsService,
        private store: Store<{ Products: IProductsModel }>
    ) {}

    ngOnInit(): void {
        this.getTableHeaders();

        this.searchControl.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe(this.getAutoCompleteOptions.bind(this));

        // BRAND / RETAILER
        this.BRAND_OR_RETAILER =
            this.activatedRoute.parent.snapshot.routeConfig.path === 'tasks' ? 'BRAND' : 'RETAILER';

        this.store.dispatch(new productActions.FetchOptions());
    }

    getAutoCompleteOptions(freeHand: any = ''): void {
        if (typeof freeHand === 'object') {
            this.analyticsService.trackEvent('Simulate: Search product', {
                'Action Performed': `Simulate product: Product '${freeHand.name}' selected`
            });
            this.getProductDetails();
        }
        if (freeHand.length > 3) {
            const payload: IProductListAutocompleteReq = {
                filter: {},
                pagination: { from: 0, size: this.env.AUTO_SUGGESTION_SIZE },
                freeHand,
                sort: { sortBy: 'create_ts', sortOrder: 'desc' }
            };
            const callback =
                this.BRAND_OR_RETAILER === 'BRAND'
                    ? this.productsService.simulationGetProductAutoCompleteListBrand
                    : this.productsService.simulationGetProductAutoCompleteListRetailer;

            callback.call(this.productsService, payload).subscribe(
                (data: any) => {
                    this.autoCompleteProductList = data.data;
                },
                () => {
                    console.error('Autocomplete get request failed');
                    this.autoCompleteProductList = [];
                }
            );
        } else {
            this.autoCompleteProductList = [];
        }
    }

    getProductDetails(): void {
        const productId = this.searchControl.value.productId;
        if (productId) {
            this.fetchingProduct = true;
            this.selectedProduct = null;
            this.productForm = null;
            this.isSimulationDone = false;

            this.productsService.simulationGetProductTask(productId).subscribe(
                data => {
                    this.selectedProduct = data.data.tasks[0];
                    this.constructForm();
                },
                () => {
                    const errorMessage = 'Unable to fetch product details';
                    this.toastr.error(errorMessage, 'Server Error');
                    this.fetchingProduct = false;
                }
            );
        }
    }

    constructForm(): void {
        if (this.selectedProduct.productId) {
            this.productForm = this.formBuilder.group({
                [this.selectedProduct.id]: []
            });
        } else {
            this.productForm = null;
        }
        this.fetchingProduct = false;
    }

    simulate(): void {
        if (this.productForm.invalid) {
            this.dialog.open(InfoModalComponent, {
                width: '372px',
                data: {
                    title: 'Invalid entry!',
                    description:
                        'For a Product to be submitted, it must have a country of manufacturing and at least one ingredient. Please fill in all mandatory fields and then proceed to submit.',
                    buttonLabel: 'Close'
                }
            });
            return;
        }
        this.analyticsService.trackEvent('Simulate product clicked', {
            'Action Performed': `Simulate product ${this.selectedProduct.productId}`
        });
        const value = this.productForm.value[this.selectedProduct.id];
        const payload: ISimulateReq = {
            product_id: this.selectedProduct.productId,
            product_labels: value.product_labels ? value.product_labels : [],
            country_of_manufacturing: value.country_of_packaging ? [value.country_of_packaging] : [],
            ingredients: []
        };

        value.ingredients_coos.forEach((ign: any) => {
            const key = Object.keys(ign)[0];
            if (key.indexOf(UNKNOWN) === -1) {
                const ingPayload = {
                    ingredient_id: key,
                    ingredient_labels: ign[key]['ingredient_label'] ? ign[key]['ingredient_label'] : [],
                    production_method: ign[key]['production_method'] ? [ign[key]['production_method']] : [],
                    country_of_origin: ign[key]['country_of_origin'] ? ign[key]['country_of_origin'] : []
                };
                payload.ingredients.push(ingPayload);
            }
        });

        this.isFetchingAdditionalInfo = true;
        this.simulateProduct(payload);
    }

    simulateProduct(payload: ISimulateReq) {
        const errorMessage = 'Unable to fetch simulation data';
        this.productsService.simulateProduct(payload).subscribe(
            data => {
                if (data.data?.containsInvalidLabel) {
                    this.dialog.open(InfoModalComponent, {
                        width: '372px',
                        data: {
                            title: 'Invalid entry!',
                            description:
                                'A label that was previously available and added on your products is now removed. Kindly refresh your page and then proceed.',
                            buttonLabel: 'Close'
                        }
                    });
                    this.isFetchingAdditionalInfo = false;
                    this.additionalInfo = null;
                    this.fieldData = null;
                    return;
                }
                try {
                    this.additionalInfo = data.data['customFieldUITemplateAggResponseMap'][this.tabName];
                    this.fieldData = data.data['fieldResponse'];
                } catch {
                    this.toastr.error(errorMessage, 'Server Error');
                }
                this.isFetchingAdditionalInfo = false;
                this.isSimulationDone = true;
            },
            () => {
                this.toastr.error(errorMessage, 'Server Error');
                this.isFetchingAdditionalInfo = false;
                this.isSimulationDone = false;
            }
        );
    }

    getTableHeaders(): void {
        this.productsService.getTableHeaders(null).subscribe(data => {
            this.tableHeaders = data;
        });
    }

    valueMapper(obj: IProductListAutocompleteResp): string {
        return obj.name;
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
