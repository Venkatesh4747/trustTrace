import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FILTER_SESSION, ProductState } from '../../store/store';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core';
import { AnalyticsService } from '../../../../core/analytics/analytics.service';
import { ContextService } from '../../../../shared/context.service';
import {
    ConfirmDialogV2,
    IConfirmDialogV2
} from '../../../../shared/modals/confirm-dialog-v2/confirm-dialog-v2.component';
import { SubscriptionType } from '../../../../shared/multi-industry-support/application-menu.model';
import { ProductsService } from '../../products.service';
import * as productActions from '../../store/products.actions';
import { IProductsModel } from '../../store/products.reducer';
import { ImportDataComponent } from '../../../../shared/modals/import-data/import-data.component';
@Component({
    selector: 'app-data-collection',
    templateUrl: './data-collection.component.html',
    styleUrls: ['./data-collection.component.scss', '../tasks.component.scss']
})
export class DataCollectionComponent implements OnInit, AfterViewInit {
    productConfig$: Observable<IProductsModel>;

    selectAllSubject: Subject<boolean> = new Subject();
    optionsParam = { key: 'id', value: 'value' };
    FILTER_SESSION: string = FILTER_SESSION;
    searchFormControl = new FormControl();
    tableHeaders = {};
    filters = {};

    DEFAULT_PAGINATION_SIZE = environment.DEFAULT_PAGINATION_SIZE;

    get isBrandSupplier() {
        return (this.authService.user.subscriptionType as SubscriptionType) === 'BRAND_SUPP';
    }

    importProductDataDialogClass = 'import-product-data-dialog';
    env = environment;
    constructor(
        private appContext: ContextService,
        private store: Store<ProductState>,
        private analyticsService: AnalyticsService,
        private dialog: MatDialog,
        private authService: AuthService,
        private productService: ProductsService
    ) {
        this.store.dispatch(new productActions.FetchFilters());
    }

    fetchFilters($event) {
        this.analyticsService.trackEvent('Products - Data Collection', {
            'Action Performed': `Filtered product with ${$event.filterKey} ${$event.value}`
        });
        this.store.dispatch(new productActions.FetchFilters());
    }

    ngOnInit() {
        this.productConfig$ = this.store.select('Products');
        this.productConfig$.pipe(take(1)).subscribe(data => {
            this.searchFormControl.patchValue(data.loadProductReqPayload.freeHand);
        });
        this.productService.getTableHeaders(null).subscribe(data => {
            this.tableHeaders = data;
        });
    }

    selectAll(flag: boolean, count: number) {
        if (count === 0) {
            return;
        }
        this.selectAllSubject.next(flag);
    }

    valueChanged(key: string, $e: any) {
        if ($e === null || $e.length === 0 || $e === [] || $e[0] === '') {
            $e = null;
        }
        this.filters[key] = JSON.parse(JSON.stringify($e));
        const clone = JSON.parse(JSON.stringify(this.filters));

        this.store.dispatch(new productActions.OnFilterProduct(clone, 'IGNORE_SEARCH'));
    }

    onSearch() {
        if (this.searchFormControl.value === '' || this.searchFormControl.value === null) {
            this.store.dispatch(new productActions.OnFilterProduct('IGNORE_FILTERS', null));
        } else {
            if (this.searchFormControl.value.length < 3) {
                return;
            }

            this.analyticsService.trackEvent('Products - Data Collection', {
                'Action Performed': `Searched product with ${this.searchFormControl.value}`
            });
            this.store.dispatch(new productActions.OnFilterProduct('IGNORE_FILTERS', this.searchFormControl.value));
        }
    }

    ngAfterViewInit() {}

    submit() {
        this.appContext.handleProductListSubmit.next(true);
    }

    submitAllProducts(): void {
        const submitAll = 'Submit All';

        const data: IConfirmDialogV2 = {
            customClass: 'multiple-qus-description',
            description: [
                'Are you sure you want to submit all products?',
                'All products from all pages will be submitted, provided they do not have any missing information.'
            ],
            primaryBtn: submitAll,
            secondaryBtn: 'Cancel',
            title: 'Confirm submission?',
            showClose: true
        };
        const dialogRef = this.dialog.open(ConfirmDialogV2, {
            width: '420px',
            data,
            disableClose: true
        });

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe(_data => {
                if (_data === submitAll) {
                    this.store.dispatch(new productActions.SubmitAll());
                }
            });
    }

    paginate(paginate: 'back' | 'forward') {
        this.store
            .select('Products')
            .pipe(take(1))
            .subscribe(storeData => {
                if (
                    storeData.paginationProgress ||
                    storeData.disablePagination ||
                    (paginate === 'back' && storeData.paginationCount === 0)
                ) {
                    return;
                }
                switch (paginate) {
                    case 'back':
                        this.store.dispatch(new productActions.SetPaginationCount(storeData.paginationCount - 1));
                        break;
                    case 'forward':
                        this.store.dispatch(new productActions.SetPaginationCount(storeData.paginationCount + 1));
                        break;
                    default:
                        break;
                }
            });
    }

    simulateBtnClicked(): void {
        this.analyticsService.trackEvent('Simulate button clicked', {
            'Action Performed': 'Simulate button clicked by BRAND_SUPPLIER'
        });
    }

    resetAllFilters(): void {
        this.store.dispatch(new productActions.OnRefresh(true));
    }

    handleProductDataUploadComplete() {
        this.store.dispatch(new productActions.OnRefresh());
    }

    openImportExcelModal() {
        this.dialog.open(ImportDataComponent, {
            panelClass: this.importProductDataDialogClass,
            data: {
                fileName: 'product_list',
                fileType: 'CERT',
                numberOfErrorsToBeShown: 10,
                downloadDataCallBack: this.productService.downloadProductData.bind(this.productService),
                uploadDataCallBack: this.productService.uploadProductData.bind(this.productService),
                handleUploadComplete: true,
                handleUploadCompleteCallBack: this.handleProductDataUploadComplete.bind(this),
                texts: {
                    title: 'Import product data',
                    subDownloadTitle: 'Download all of the product data, add/modify and re upload the Excel sheet',
                    subUploadTitle: 'Upload an Excel sheet to import all of the product data into the application',
                    downloadButton: 'Download product data',
                    uploadSuccess: 'Products imported successfully.'
                }
            }
        });
    }
}
