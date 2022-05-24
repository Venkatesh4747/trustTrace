import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { InfoModalComponent } from '../../../shared/modals/info-modal/info-modal.component';
import { ScoreTableComponent } from '../../../shared/modals/score-table/score-table.component';
import { IFinishedProductDetail, IProductDetail } from '../finished-products-list/finished-product.model';
import { ProductsService } from '../products.service';
import { IProductsModel } from '../store/products.reducer';
import { ProductComponent } from '../tasks/product-list/product/product.component';
import { IProductDetailRequestPayload, ISearchRequestPayload } from '../template.model';
import { AnalyticsService } from './../../../core/analytics/analytics.service';
import * as productActions from './../store/products.actions';
import { CustomFieldUITemplateAggResponseMap } from './product-detail.model';
import * as _moment from 'moment';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { DeactivateReactivateModalComponent } from '../../../shared/modals/deactivate-reactivate-modal/deactivate-reactivate-modal.component';
import {
    ScoreDeactivateTypeEnum,
    OperationTypeEnum,
    ScoreDeactivateTypeLabelEnum
} from '../../../shared/modals/deactivate-reactivate-modal/deactivate-reactivate-modal.const';
import { IdValue, ScoreActivateDeactivateModelData } from '../product-detail/product-detail.model';
import { CommonServices } from '../../../shared/commonServices/common.service';
@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss', '../simulation/simulation.component.scss']
})
export class ProductDetailComponent implements OnInit {
    @ViewChild('productComponent') productComponent: ProductComponent;
    activeProductId: string = null;
    searchAfterId: string = null;
    nextProductId: string = null;
    previousProductId: string = null;
    productDetails: IFinishedProductDetail = null;
    productDetail: IProductDetail = null;
    pageLoading = true;
    isFetchingAdditionalInfo = true;
    tabName = 'Finished Products';
    entity = 'FOOD_PRODUCT';
    viewPage = 'FOOD_PRODUCT_VIEW';
    viewType = 'FORM';
    payload: any;
    additionalInfo: CustomFieldUITemplateAggResponseMap;
    fieldData: { [key: string]: string[] };
    env = environment;

    FILTER_SESSION = `products_filters`;
    SORT_SESSION = `products_sort`;
    SEARCH_SESSION = `products_search`;

    BRAND_OR_RETAILER: 'BRAND' | 'RETAILER' = null;

    detailPayload: ISearchRequestPayload;
    isScoreHistoryLoadInProgress = false;

    productDeclarationTableHeaders: any = null;
    productDeclarationFormToggle = false;

    productDeclarationConfig = null;
    productsDeclarationFrom: FormGroup = null;
    fetchingProductDeclarationDetails = false;
    fullPageSpinner = false;
    showApiScore = false;

    moment = _moment;
    syncStatus = '';
    productId = '';

    get isRetailer(): boolean {
        return this.BRAND_OR_RETAILER === 'RETAILER';
    }

    get hasRetailerEditAccess(): boolean {
        return this.authService.haveAccess('RETAILER_DASHBOARD_UPDATE');
    }

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private productService: ProductsService,
        private toastr: CustomToastrService,
        private analyticsService: AnalyticsService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private commonServices: CommonServices,
        private store: Store<{ Products: IProductsModel }>
    ) {}

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(() => {
            const activeRoute = this.activatedRoute.snapshot;
            this.activeProductId = activeRoute.params['id'];
            this.resetPayload();
            if (activeRoute.queryParams['searchAfter']) {
                this.searchAfterId = activeRoute.queryParams['searchAfter'];
            }

            this.pageLoading = true;
            this.analyticsService.trackEvent('Product detail page - Viewed', {
                'Action Performed': `Product detail page with id ${this.activeProductId} is viewed`
            });
            // BRAND / RETAILER
            this.BRAND_OR_RETAILER =
                this.activatedRoute.parent.snapshot.routeConfig.path === 'tasks' ? 'BRAND' : 'RETAILER';
            // Get product details
            this.productService
                .constructSessionPayload(this.FILTER_SESSION, this.SORT_SESSION, this.SEARCH_SESSION)
                .then(payload => {
                    if (this.isRetailer) {
                        this.getProductDetails(payload);
                        this.getEntityCustomization(this.productService.getCustomFieldInfo.bind(this.productService));
                    } else {
                        this.getProductTaskDetails();
                        this.getEntityCustomization(this.productService.getECScoreData.bind(this.productService));
                    }
                });
        });
    }

    resetPayload(): void {
        if (this.isRetailer) {
            this.payload = {
                entity: this.entity,
                viewPage: this.viewPage,
                viewType: this.viewType,
                entityId: this.activeProductId.split('_')[1]
            };
        } else {
            this.payload = {
                entity: this.entity,
                viewPage: this.viewPage,
                viewType: this.viewType,
                entityId: this.activeProductId
            };
        }
    }

    navigateToProductDetailPage(id: string, sortId: string): void {
        this.router.navigate(['/products/finished', id], { queryParams: { searchAfter: sortId } });
    }

    onPaginate(state: 'next' | 'previous'): void {
        this.onDestroyDeclarationForm();
        switch (state) {
            case 'next':
                this.analyticsService.trackEvent('Navigate to product detail page', {
                    'Action Performed': `Clicked on next product with id ${this.nextProductId}`
                });
                this.navigateToProductDetailPage(this.nextProductId, this.productDetail.searchAfterSort[0]);
                break;
            case 'previous':
                this.analyticsService.trackEvent('Navigate to product detail page', {
                    'Action Performed': `Clicked on previous product with id ${this.previousProductId}`
                });
                this.navigateToProductDetailPage(this.previousProductId, this.productDetail.searchAfterSort[0]);
                break;
            default:
                break;
        }
    }

    //BRAND_SUPP
    getProductTaskDetails(): void {
        const payload: any = {
            filter: { PRODUCT_ID: [this.activeProductId] },
            pagination: { from: 0, size: 1 }
        };
        this.productService.getProductTaskDetail(payload).subscribe(
            data => {
                if (data) {
                    this.productDetails = data;
                    this.previousProductId = null;
                    this.nextProductId = null;
                    this.productDetail = {
                        product_labels: data.product_labels,
                        code: data.product_code,
                        name: data.product_name,
                        current_sort: null,
                        id: data.product_id,
                        product_type: null,
                        searchAfterSort: null,
                        season: null,
                        supplier: null,
                        year: null,
                        certifications: null,
                        plu_number: data.plu_number,
                        item_number: data.item_number,
                        country_of_packaging: data.country_of_packaging
                    };
                    this.pageLoading = false;
                    this.syncScoreStatus();
                } else {
                    this.errorHandler(null, 'Unable to fetch product data', 'Failed');
                }
            },
            error => {
                this.errorHandler(error, 'Unable to fetch product data', 'Failed');
            }
        );
    }

    // RETAILER
    getProductDetails(payload: IProductDetailRequestPayload): void {
        const tempPayload = payload;
        tempPayload.pagination.size = 1;
        if (this.searchAfterId !== null) {
            tempPayload.searchAfter = [];
            tempPayload.searchAfter.push(this.searchAfterId);
        }
        tempPayload.documentId = this.activeProductId;

        const productId =
            this.activeProductId.split('_').length > 1 ? this.activeProductId.split('_')[1] : this.activeProductId;

        this.productService.getFinishedProductDetail(tempPayload, productId).subscribe(
            data => {
                this.productDetails = data;
                this.showApiScore = this.productDetails.showApiScore;
                this.previousProductId = data.previous_document_id;
                this.nextProductId = data.next_document_id;
                this.productDetail = data.current_document;
                this.pageLoading = false;
                this.syncScoreStatus();
            },
            failResponse => {
                this.errorHandler(failResponse, 'Unable to fetch product data', 'Failed');
            }
        );
    }

    syncScoreStatus(): void {
        if (this.productDetails.scoreType === 'SYSTEM_UPDATED' && this.productDetails.scoreUpdateTs != null) {
            const productSubmittedTime = this.moment.utc(this.productDetails.updateTs).local();
            const scoreUpdatedTime = this.moment.utc(this.productDetails.scoreUpdateTs).local();
            if (scoreUpdatedTime.isBefore(productSubmittedTime)) {
                const localTime = this.moment().local();
                const oneHourPlusProductTime = this.moment.utc(productSubmittedTime).add(1, 'hours');
                if (localTime.isAfter(oneHourPlusProductTime)) {
                    this.syncStatus = 'Synchronize now';
                } else {
                    this.syncStatus = 'Synchronizing';
                }
            }
        }
    }

    syncProductScore(): void {
        if (this.syncStatus === 'Synchronize now') {
            if (this.isRetailer) {
                this.productId =
                    this.activeProductId.split('_').length > 1
                        ? this.activeProductId.split('_')[1]
                        : this.activeProductId;
            } else {
                this.productId = this.productDetail.id;
            }
            this.syncStatus = 'Synchronizing';
            this.productService.syncScore(this.productId).subscribe(
                data => {
                    this.additionalInfo = null;
                    this.fieldData = null;

                    try {
                        this.additionalInfo =
                            data.data.customFieldResponse.customFieldUITemplateAggResponseMap[this.tabName];
                        this.fieldData = data.data.customFieldResponse.fieldResponse;
                        this.productDetails.scoreUpdateTs = data.data.scoreUpdateTs;
                        this.syncStatus = null;
                    } catch {
                        this.toastr.info('Not enough data');
                    }
                },
                error => {
                    this.errorHandler(error, 'Unable to retrigger score', 'Failed');
                }
            );
        }
    }

    getEntityCustomization(callback: Function): void {
        this.payload['tabs'] = [this.tabName];
        // Todo temp fix
        if (this.activeProductId && this.activeProductId.split('_').length > 1) {
            this.payload['entityId'] = this.activeProductId.split('_')[1];
        }

        callback(this.payload).subscribe(
            data => {
                try {
                    this.additionalInfo = data['customFieldUITemplateAggResponseMap'][this.tabName];
                    this.fieldData = data['fieldResponse'];
                    this.resetPayload();
                } catch {
                    this.additionalInfo = null;
                    this.fieldData = null;
                    this.toastr.info('Entity customization not enabled / Not enough data');
                }
                this.isFetchingAdditionalInfo = false;
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
                this.isFetchingAdditionalInfo = false;
            }
        );
    }

    private errorHandler(error: any, customErrorMessage, status: any): void {
        if (error && error.error && error.error.message) {
            this.toastr.error(error.error.message, status);
        } else {
            this.toastr.error(customErrorMessage, status);
        }
        this.pageLoading = false;
    }

    editScore(): void {
        this.onDestroyDeclarationForm();
        this.analyticsService.trackEvent('Edit score button clicked', {
            'Action Performed': `Product Id: ${this.activeProductId} edit score clicked`
        });
        let productId = this.activeProductId;
        if (this.activeProductId && this.activeProductId.split('_').length > 1) {
            productId = this.activeProductId.split('_')[1];
        }
        this.productService.getScoreToEdit(productId, true).subscribe(
            data => {
                const dialogRef = this.dialog.open(ScoreTableComponent, {
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    height: '97%',
                    width: '98%',
                    data: {
                        data,
                        title: 'Edit Scores',
                        productId,
                        primaryBtn: 'Save Changes',
                        secondaryBtn: 'Cancel',
                        showClose: true
                    }
                });
                dialogRef.afterClosed().subscribe(result => {
                    if (result && result.data) {
                        this.productService.editScore(result.data).subscribe(
                            () => {
                                this.toastr.success('Scores updated successfully', 'Success');
                                this.ngOnInit();
                            },
                            failResponse => {
                                this.toastr.error('Unable to update score', 'Server Error');
                            }
                        );
                    }
                });
            },
            failResponse => {
                this.errorHandler(failResponse, 'Unable to fetch product score history/data', 'Server Error');
            }
        );
    }
    changeHistory(): void {
        this.isScoreHistoryLoadInProgress = true;
        this.onDestroyDeclarationForm();
        this.analyticsService.trackEvent('View Score history button clicked', {
            'Action Performed': `Product Id: ${this.activeProductId} view score history clicked`
        });
        let productId = this.activeProductId;
        if (this.activeProductId && this.activeProductId.split('_').length > 1) {
            productId = this.activeProductId.split('_')[1];
        }
        if (this.isRetailer) {
            this.productService.getVersionHistories({ productId }).subscribe(
                data => {
                    this.dialog.open(ScoreTableComponent, {
                        maxWidth: '100vw',
                        maxHeight: '100vh',
                        height: '97%',
                        width: '98%',
                        data: {
                            title: 'Score History',
                            data,
                            productId,
                            showClose: true,
                            primaryBtn: 'Save Changes',
                            secondaryBtn: 'Cancel',
                            isRetailer: true
                        }
                    });
                    this.isScoreHistoryLoadInProgress = false;
                },
                failResponse => {
                    this.errorHandler(failResponse, 'Unable to fetch product score history/data', 'Server Error');
                    this.isScoreHistoryLoadInProgress = false;
                }
            );
        } else {
            this.productService.getVersionHistoriesSupplier({ productId }).subscribe(
                data => {
                    this.dialog.open(ScoreTableComponent, {
                        maxWidth: '100vw',
                        maxHeight: '100vh',
                        height: '97%',
                        width: '98%',
                        data: {
                            title: 'Score History',
                            data,
                            productId,
                            showClose: true,
                            isRetailer: false
                        }
                    });
                    this.isScoreHistoryLoadInProgress = false;
                },
                failResponse => {
                    this.errorHandler(failResponse, 'Unable to fetch product score history/data', 'Server Error');
                    this.isScoreHistoryLoadInProgress = false;
                }
            );
        }
    }

    isScoreAvailable(): boolean {
        if (this.fieldData) {
            return !!Object.keys(this.fieldData).length;
        }
        return false;
    }

    onCreateSupplierDeclarationFrom(): void {
        this.getTableHeaders();
        this.getProductDeclarationDetails();
        this.productDeclarationFormToggle = true;
    }

    onDestroyDeclarationForm(): void {
        this.productDeclarationFormToggle = false;
        this.productDeclarationTableHeaders = null;
        this.fetchingProductDeclarationDetails = false;
        this.productDeclarationConfig = null;
    }

    getTableHeaders(): void {
        this.productService.getTableHeaders(null).subscribe(data => {
            this.productDeclarationTableHeaders = data;
        });
    }

    getProductDeclarationDetails(): void {
        let productId = null;
        if (this.activeProductId && this.activeProductId.split('_').length > 1) {
            productId = this.activeProductId.split('_')[1];
        } else {
            productId = this.activeProductId;
        }
        if (this.activeProductId) {
            this.fetchingProductDeclarationDetails = true;
            this.productDeclarationConfig = null;
            this.productsDeclarationFrom = null;
            this.store.dispatch(new productActions.FetchOptions());

            this.productService.simulationGetProductTask(productId).subscribe(
                data => {
                    if (data.data.tasks[0].id) {
                        this.productDeclarationConfig = data.data.tasks[0];
                        this.constructForm();
                    } else {
                        this.productDeclarationConfig = null;
                        this.fetchingProductDeclarationDetails = false;
                    }
                },
                () => {
                    const errorMessage = 'Unable to fetch product details';
                    this.toastr.error(errorMessage, 'Server Error');
                    this.fetchingProductDeclarationDetails = false;
                }
            );
        }
    }

    constructForm(): void {
        if (this.productDeclarationConfig.productId) {
            this.productsDeclarationFrom = this.formBuilder.group({
                [this.productDeclarationConfig.id]: []
            });
        } else {
            this.productsDeclarationFrom = null;
        }
        this.fetchingProductDeclarationDetails = false;
    }
    submitProductDeclaration(): void {
        if (this.productsDeclarationFrom.invalid) {
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

        const payload = this.productComponent.generateSavePayload();
        this.fullPageSpinner = true;
        this.productService
            .retailerSupplierDeclarationEdit(
                this.productComponent.product.productId,
                this.productComponent.product.id,
                payload
            )
            .subscribe(
                data => {
                    if (data?.containsInvalidLabel) {
                        this.dialog.open(InfoModalComponent, {
                            width: '372px',
                            data: {
                                title: 'Invalid entry!',
                                description:
                                    'A label that was previously available and added on your products is now removed. Kindly refresh your page and then proceed.',
                                buttonLabel: 'Close'
                            }
                        });
                        this.additionalInfo = null;
                        this.fieldData = null;
                        this.fullPageSpinner = false;
                        return;
                    }
                    try {
                        this.productDetails.lastModifiedBy = data.lastModifiedBy;
                        this.productDetails.updateTs = data.updateTs;
                        this.productDetails.scoreUpdateTs = data.scoreUpdateTs;
                        this.additionalInfo =
                            data.customFieldResponse.customFieldUITemplateAggResponseMap[this.tabName];
                        this.fieldData = data.customFieldResponse.fieldResponse;
                        this.productDetail.product_labels = data.productLabel ? data.productLabel : [];
                        this.productDetail.country_of_packaging = data.country_of_packaging;

                        this.onDestroyDeclarationForm();
                    } catch {
                        this.additionalInfo = null;
                        this.fieldData = null;
                        this.toastr.info('Entity customization not enabled / Not enough data');
                    }

                    this.fullPageSpinner = false;
                },
                error => {
                    this.fullPageSpinner = false;
                    this.errorHandler(error, 'Unable to submit product data', 'Failed');
                }
            );
    }

    openConfirmModal(): void {
        let productId = this.activeProductId;
        if (this.activeProductId && this.activeProductId.split('_').length > 1) {
            productId = this.activeProductId.split('_')[1];
        }
        if (this.showApiScore) {
            this.openDeactivateAndReactivateModal(productId, null);
        } else {
            this.fullPageSpinner = true;
            this.productService.getReactivateType(productId).subscribe(
                value => {
                    this.fullPageSpinner = false;
                    this.openDeactivateAndReactivateModal(productId, value.apiScoreDeactivateType);
                },
                () => {
                    this.fullPageSpinner = false;
                    this.toastr.error('Unable to get Score Deactivated type for this product', 'Server Error');
                }
            );
        }
    }

    openDeactivateAndReactivateModal(productId: string, scoreDeactivateType: number): void {
        let isCancelled = false;
        const modalData = this.constructModalData(this.showApiScore, scoreDeactivateType);
        const data = {
            productId: productId,
            statusTitle: modalData.statusTitle,
            reasonTitle: modalData.reasonTitle,
            primaryBtn: modalData.primaryBtn,
            secondaryBtn: 'Cancel',
            scoreDeactivateTypeMessages: modalData.scoreDeactivateTypeMessages,
            message: modalData.message,
            description: modalData.description,
            scoreReActivateType: scoreDeactivateType
        };
        const dialogRef = this.dialog.open(DeactivateReactivateModalComponent, {
            width: '460px',
            panelClass: 'deactivate-reactivate-modal',
            data
        });
        dialogRef.afterClosed().subscribe(result => {
            switch (result.operationType) {
                case OperationTypeEnum.DEACTIVATE: {
                    this.updateShowApiScore(productId, false, result.scoreDeactivateType, result.operationType);
                    break;
                }
                case OperationTypeEnum.REACTIVATE: {
                    this.updateShowApiScore(productId, true, result.scoreDeactivateType, result.operationType);
                    break;
                }
                default: {
                    isCancelled = true;
                }
            }
        });

        if (isCancelled) {
            return;
        }
    }

    constructModalData(showApiScore: boolean, scoreDeactivateType: number): ScoreActivateDeactivateModelData {
        const operationType = showApiScore ? OperationTypeEnum.DEACTIVATE : OperationTypeEnum.REACTIVATE;
        const message: IdValue[] = [];
        const description: IdValue[] = [];
        const scoreDeactivateTypeMessages: IdValue[] = [];

        if (
            (operationType === OperationTypeEnum.DEACTIVATE ||
                scoreDeactivateType === ScoreDeactivateTypeEnum.SUPPLIER) &&
            this.productDetail.supplier
        ) {
            this.constructOptionsForBrandAndSupplier(
                message,
                description,
                scoreDeactivateTypeMessages,
                operationType,
                ScoreDeactivateTypeEnum.SUPPLIER,
                ScoreDeactivateTypeLabelEnum.SUPPLIER
            );
        }

        if (
            (operationType === OperationTypeEnum.DEACTIVATE ||
                scoreDeactivateType === ScoreDeactivateTypeEnum.SUPPLIER ||
                scoreDeactivateType === ScoreDeactivateTypeEnum.BRAND) &&
            this.productDetail.brand
        ) {
            this.constructOptionsForBrandAndSupplier(
                message,
                description,
                scoreDeactivateTypeMessages,
                operationType,
                ScoreDeactivateTypeEnum.BRAND,
                ScoreDeactivateTypeLabelEnum.BRAND
            );
        }

        if (
            operationType === OperationTypeEnum.DEACTIVATE ||
            scoreDeactivateType !== ScoreDeactivateTypeEnum.HIDE_SCORE
        ) {
            this.constructOptionsForProductAndHideScore(
                message,
                description,
                scoreDeactivateTypeMessages,
                operationType,
                ScoreDeactivateTypeEnum.PRODUCT,
                scoreDeactivateType !== ScoreDeactivateTypeEnum.PRODUCT
            );
        }

        if (
            operationType === OperationTypeEnum.DEACTIVATE ||
            scoreDeactivateType === ScoreDeactivateTypeEnum.HIDE_SCORE
        ) {
            this.constructOptionsForProductAndHideScore(
                message,
                description,
                scoreDeactivateTypeMessages,
                operationType,
                ScoreDeactivateTypeEnum.HIDE_SCORE,
                false
            );
        }

        return showApiScore
            ? {
                  statusTitle: `${this.commonServices.getTranslation('Select reason for the Deactivating')}:`,
                  reasonTitle: 'Choose the reason',
                  primaryBtn: OperationTypeEnum.DEACTIVATE,
                  message: message,
                  description: description,
                  scoreDeactivateTypeMessages: scoreDeactivateTypeMessages
              }
            : {
                  statusTitle: this.getStatusTitle(scoreDeactivateType),
                  reasonTitle: null,
                  primaryBtn: OperationTypeEnum.REACTIVATE,
                  message: message,
                  description: description,
                  scoreDeactivateTypeMessages: scoreDeactivateTypeMessages
              };
    }

    getStatusTitle(scoreDeactivateType: number): string {
        return scoreDeactivateType === ScoreDeactivateTypeEnum.HIDE_SCORE ||
            scoreDeactivateType === ScoreDeactivateTypeEnum.PRODUCT
            ? `${this.commonServices.getTranslation('Reactivating score?')}`
            : `${this.commonServices.getTranslation('Choose which products to reactivate')}:`;
    }

    constructOptionsForBrandAndSupplier(
        message: IdValue[],
        description: IdValue[],
        scoreDeactivateTypeMessages: IdValue[],
        operationType: string,
        scoreDeactivateType: number,
        scoreDeactivateTypeName: string
    ): void {
        message.push({
            id: scoreDeactivateType,
            value: `Are you sure you want to ${operationType} score for this ${scoreDeactivateTypeName}?`
        });
        description.push({
            id: scoreDeactivateType,
            value: `Score will be still visible in this page ${this.getMiddleDescription(
                operationType
            )} to the Application Program Interface for`
        });
        scoreDeactivateTypeMessages.push({
            id: scoreDeactivateType,
            value: `${operationType} score for all the products of this ${scoreDeactivateTypeName}`
        });
    }

    constructOptionsForProductAndHideScore(
        message: IdValue[],
        description: IdValue[],
        scoreDeactivateTypeMessages: IdValue[],
        operationType: string,
        scoreDeactivateType: number,
        productDeactivateTypeMessages: boolean
    ): void {
        message.push({
            id: scoreDeactivateType,
            value: `Are you sure you want to ${operationType} score for this product?`
        });
        description.push({
            id: scoreDeactivateType,
            value: `Score will be still visible in this page ${this.getMiddleDescription(
                operationType
            )} to the Application Program Interface for this product`
        });
        if (productDeactivateTypeMessages) {
            scoreDeactivateTypeMessages.push({
                id: ScoreDeactivateTypeEnum.PRODUCT,
                value: `${operationType} score for this product alone`
            });
        }
    }

    getMiddleDescription(operationType: string): string {
        return operationType === OperationTypeEnum.DEACTIVATE ? 'but will be sent as “not available”' : 'and will also';
    }

    updateShowApiScore(
        productId: string,
        showApiScore: boolean,
        apiScoreDeactivateType: number,
        operationType: string
    ): void {
        this.fullPageSpinner = true;
        this.productService.updateShowApiScore(productId, { showApiScore, apiScoreDeactivateType }).subscribe(
            data => {
                if (data) {
                    this.showApiScore = showApiScore;
                    let successMessage = `The score has been successfully ${operationType}d for`;
                    if (
                        apiScoreDeactivateType === ScoreDeactivateTypeEnum.HIDE_SCORE ||
                        apiScoreDeactivateType === ScoreDeactivateTypeEnum.PRODUCT
                    ) {
                        successMessage = `${successMessage} this product alone`;
                    } else {
                        successMessage =
                            apiScoreDeactivateType === ScoreDeactivateTypeEnum.BRAND
                                ? `${successMessage} all the products of this brand`
                                : `${successMessage} all the products of this supplier`;
                    }
                    this.fullPageSpinner = false;
                    this.toastr.success(successMessage, 'Success');
                } else {
                    this.errorToastrMessage(operationType);
                }
            },
            () => {
                this.errorToastrMessage(operationType);
            }
        );
    }

    errorToastrMessage(operationType): void {
        this.fullPageSpinner = false;
        this.toastr.error(
            `We have an issue with our server due to which we are unable to ${operationType} Scoring at this time. Please try again after some time`,
            'Failed'
        );
    }
}
