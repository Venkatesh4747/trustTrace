import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextService } from '../../../shared/context.service';
import { MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, forkJoin, Subscription } from 'rxjs';
// Add the observable and combineLatest
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { IAdditionalInfo } from '../../../shared/components/tt-radio-group/tt-radio-group.component';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { TraceabilityRequestService } from '../traceability-request.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { INextTierProviderData, IPayLoadSupplyChain, ISupplyChainArticle } from '../traceability.model';
import { ConfirmDialogTableComponent } from '../../../shared/modals/confirm-dialog-table/confirm-dialog-table.component';
import { TRACEABILITY_CONSTANTS } from '../traceability-constants.model';
@Component({
    selector: 'app-edit-tr-supply-chain',
    templateUrl: './edit-tr-supply-chain.component.html',
    styleUrls: ['./edit-tr-supply-chain.component.scss']
})
export class EditTrSupplyChainComponent implements OnInit, OnDestroy {
    ANALYTICS_EVENT_T_TRACE_EDIT_PAGE = 'T-Trace Edit-Page';
    isNavigateCheck = false;
    editSupplyChainForm: FormGroup;
    nextTierArrayData: INextTierProviderData[] = [];

    supplyChainData: any;
    rawPayload: any;
    trId: string;
    isAgentNode: boolean;
    showTraderInfo = false;
    isSaveDisabled: boolean;
    focusInputSubscription: Subscription;
    nextTeriSubscription: Subscription;
    productSupplyChainListDataCopy = '';
    checkTrader = false;
    checkNewProductName = false;
    productName = {
        label: '',
        tradeName: ''
    };

    pageLoading = false;
    isConstructingPayload = false;
    toCollectFromSupplier = false;
    toShowLaunchButton = true;
    toReuse = false;
    showFacilityColumn = false;

    selectedArticleName;
    entities = [
        {
            key: 'enter',
            value: 'Add it by yourself'
        },
        {
            key: 'launch',
            value: 'Collect from  manufacturer'
        }
    ];

    optionalParams = {
        key: 'id',
        value: 'name',
        selectedKey: 'id'
    };

    initialProductSupplyChainList = {
        dataProvider: '',
        se: {
            articleTypeId: '',
            internalArticleName: '',
            supplierId: '',
            supplierName: ''
        }
    };

    modelData = {
        supplier: {
            id: '',
            name: '',
            verificationStatus: {
                id: 0,
                value: ''
            },
            supplierAssociationStatus: {
                id: 0,
                value: ''
            },
            supplierOtherInfo: {}
        },
        facility: {
            id: '',
            name: ''
        },
        entity: {}
    };

    additionalInfo = null;

    additionalInfoInput: IAdditionalInfo = {
        key: 'launch',
        filed: {
            type: 'text',
            label: 'Enter new name for $product if any?',
            value: null
        }
    };

    openAddSupplierModal() {}

    constructor(
        private trs: TraceabilityRequestService,
        private route: ActivatedRoute,
        public commonServices: CommonServices,
        private toastr: CustomToastrService,
        private router: Router,
        private dialog: MatDialog,
        public localizationService: LocalizationService,
        private auth: AuthService,
        private appContext: ContextService,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit(): void {
        this.analyticsEditPageLoaded();
        this.commonServices.emitInputChildEvent(false);
        this.focusInputSubscription = this.commonServices.childInputEventListener().subscribe(isInput => {
            setTimeout(() => {
                this.isSaveDisabled = isInput
                    ? this.productSupplyChainListDataCopy ===
                      JSON.stringify(this.supplyChainData?.productSupplyChainList)
                    : true;
                this.isNavigateCheck = isInput;
            });
        });
        this.modelData = {
            supplier: {
                id: '',
                name: '',
                verificationStatus: {
                    id: 0,
                    value: ''
                },
                supplierAssociationStatus: {
                    id: 0,
                    value: ''
                },
                supplierOtherInfo: {}
            },
            facility: {
                id: '',
                name: ''
            },
            entity: this.entities[0]
        };
        this.pageLoading = true;
        // Combine them both into a single observable
        const urlParams = combineLatest([this.route.params, this.route.queryParams]).pipe(
            map(([params, queryParams]) => ({ ...params, ...queryParams }))
        );

        // Subscribe to the single observable, giving us both
        urlParams.subscribe(routeParams => {
            this.trId = routeParams['trId'];
            this.selectedArticleName = routeParams['articleName'];
            forkJoin([this.trs.getTrUIMetadata(this.trId), this.trs.getSupplyChainData(this.trId)]).subscribe(
                ([trUiMetadata, supplyChainData]) => {
                    if (
                        supplyChainData[TRACEABILITY_CONSTANTS.DATA][TRACEABILITY_CONSTANTS.SUPPLY_CHAIN][
                            'archiveStatus'
                        ] !== 'IN_ACTIVE'
                    ) {
                        this.showFacilityColumn = trUiMetadata['showFacilityColumn'];
                        this.processGetSupplyChainData(supplyChainData);
                    } else {
                        const message = `This Traceability Request is no longer available as it has been deleted by ${
                            supplyChainData[TRACEABILITY_CONSTANTS.DATA].supplyChain.launchedByName
                        }`;
                        const confirmationComponent = this.dialog.open(ConfirmDialogComponent, {
                            width: '460px',
                            data: {
                                title: 'Attention!!!',
                                msg: message,
                                primaryButton: 'Ok',
                                showClose: false
                            },
                            disableClose: true
                        });
                        confirmationComponent
                            .afterClosed()
                            .pipe(take(1))
                            .subscribe(_response => {
                                if (_response === 'Ok') {
                                    this.dialog.closeAll();
                                    if (this.auth.user.subscriptionType === 'SUPPLIER') {
                                        this.router.navigate(['/', 'supplier-dashboard']);
                                    } else {
                                        this.router.navigate(['/t-trace']);
                                    }
                                }
                            });
                    }
                }
            );
        });
        this.appContext.showEditLaunchButton.subscribe(show => {
            // Show / Hide Launch & Proceed button
            this.toShowLaunchButton = show;
        });
    }

    canDeactivate(): boolean {
        return this.isNavigateCheck;
    }

    processGetSupplyChainData(response: any): void {
        this.isConstructingPayload = true;
        const data = response[TRACEABILITY_CONSTANTS.DATA];
        this.localizationService.addToMasterData(data['masterData']);
        this.supplyChainData = JSON.parse(JSON.stringify(data[TRACEABILITY_CONSTANTS.SUPPLY_CHAIN]));
        this.productSupplyChainListDataCopy = JSON.stringify(this.supplyChainData.productSupplyChainList);
        this.rawPayload = JSON.parse(JSON.stringify(data[TRACEABILITY_CONSTANTS.SUPPLY_CHAIN]));
        this.isAgentNode = this.supplyChainData.metaData && this.supplyChainData.metaData.isAgentNode;
        if (this.rawPayload.launchedBy) {
            this.showTraderInfo = this.rawPayload.launchedBy !== this.auth.companyId;

            // Enable trader if exist
            if (this.getExisitingDataForSupplierSearch(this.supplyChainData)) {
                this.checkTrader = true;
            }
        }
        if (this.isAgentNode) {
            this.modelData.supplier = {
                id: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.supplierId,
                name: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.supplierName,
                verificationStatus: this.supplyChainData.productSupplyChainList[0].supplyChainArticle
                    .supplierVerificationStatus,
                supplierAssociationStatus: this.supplyChainData.productSupplyChainList[0].supplyChainArticle
                    .supplierAssociationStatus,
                supplierOtherInfo: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.supplierOtherInfo
            };
            this.modelData.facility = {
                id: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.facilityId || '',
                name: this.supplyChainData.productSupplyChainList[0].supplyChainArticle.facilityName || ''
            };
            if (this.supplyChainData.productSupplyChainList[0].dataProvider !== this.auth.companyId) {
                this.modelData.entity = this.entities[1];
                this.toCollectFromSupplier = true;
            }
        } else {
            this.modelData.supplier = {
                id: this.supplyChainData.supplyChainArticle.supplierId,
                name: this.supplyChainData.supplyChainArticle.supplierName,
                verificationStatus: this.supplyChainData.supplyChainArticle.supplierVerificationStatus,
                supplierAssociationStatus: this.supplyChainData.supplyChainArticle.supplierAssociationStatus,
                supplierOtherInfo: this.supplyChainData.supplyChainArticle.supplierOtherInfo
            };
            this.modelData.facility = {
                id: this.supplyChainData.supplyChainArticle.facilityId || '',
                name: this.supplyChainData.supplyChainArticle.facilityName || ''
            };
            if (this.supplyChainData.dataProvider !== this.auth.companyId) {
                this.modelData.entity = this.entities[1];
                this.toCollectFromSupplier = true;
            }
        }
        if (this.supplyChainData.status === 40) {
            this.toShowLaunchButton = false;
        }
        this.isConstructingPayload = false;
        this.pageLoading = false;

        const product = this.getProductName();
        this.productName = JSON.parse(JSON.stringify(product));
        this.additionalInfoInput.filed.label = this.additionalInfoInput.filed.label.replace('$product', product.label);
        this.additionalInfoInput.filed.value = product.tradeName;
    }

    getSupplyChainBOMData(): void {
        this.trs.getSupplyChainBOMData(this.trId).subscribe(response => {
            this.isConstructingPayload = true;
            const data = response[TRACEABILITY_CONSTANTS.DATA];
            delete this.supplyChainData['metaData'];
            this.isAgentNode = this.supplyChainData.metaData && this.supplyChainData.metaData.isAgentNode;
            this.supplyChainData[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST] = JSON.parse(JSON.stringify(data));
            this.isConstructingPayload = false;
            this.toCollectFromSupplier = false;
            this.pageLoading = false;
        });
    }

    getSupplyChainDataWithReuse(): void {
        this.toReuse = true;
        this.trs.getSupplyChainData(this.trId, true).subscribe(response => {
            this.toCollectFromSupplier = false;
            this.processGetSupplyChainData(response);
        });
    }
    validate(data: any, scMap: Map<string, number>): boolean {
        if (this.isSupplierEmpty(data.supplyChainArticle)) {
            this.toastr.error('Supplier is missing', TRACEABILITY_CONSTANTS.REQUIRED_FIELD);
            return false;
        }

        if (!data.supplyChainArticle.internalArticleName) {
            this.toastr.error('Article Name is missing', TRACEABILITY_CONSTANTS.REQUIRED_FIELD);
            return false;
        }

        if (data?.productSupplyChainList?.length) {
            for (let sc of data.productSupplyChainList) {
                if (this.isArticleNameNotEmpty(sc)) {
                    const articleName = sc.supplyChainArticle.internalArticleName;
                    if (!scMap.get(articleName)) {
                        scMap.set(articleName, 1);
                    } else if (scMap.get(articleName) === 1 && !this.isAgentNode) {
                        this.toastr.info(
                            `Article name is same for article type ${this.localizationService.getDisplayText(
                                sc.supplyChainArticle.articleTypeId
                            )},
                         ${TRACEABILITY_CONSTANTS.PLEASE_UPDATE_THE_ARTICLE_NAME}`
                        );
                        return false;
                    }
                }
            }
            const childValidationStatus = data.productSupplyChainList.every(childData =>
                this.validate(childData, scMap)
            );
            if (!childValidationStatus) {
                return false;
            }
        }

        return true;
    }

    isArticleNameNotEmpty(sc: any): boolean {
        if (sc.supplyChainArticle.internalArticleName) {
            return true;
        }
        return false;
    }

    isSupplierEmpty(supplyChainArticle: ISupplyChainArticle): boolean {
        if (!supplyChainArticle.supplierId || !supplyChainArticle.supplierName) {
            return true;
        }
        return false;
    }
    invokeSaveTr(savePayload: any): void {
        this.trs.saveSupplyChain(savePayload, this.trId).subscribe(
            response => {
                this.toastr.success('Supply chain updated', TRACEABILITY_CONSTANTS.SUCCESS);
                this.commonServices.emitInputChildEvent(false);
                setTimeout(() => {
                    this.appContext.cardViewRefresh.next(true);
                    this.pageLoading = false;
                    this.auth.getUser().subscribe(_response => {
                        this.auth.setUser(_response);
                        if (
                            this.auth.user.subscriptionType === 'SUPPLIER' &&
                            this.auth.previousUrl === '/supplier-dashboard'
                        ) {
                            this.router.navigate(['/', 'supplier-dashboard']);
                        } else {
                            this.router.navigate(['/', 't-trace']);
                        }
                    });
                }, 3000);
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error(failResponse.error.message, TRACEABILITY_CONSTANTS.FAILED);
            }
        );
    }

    saveTr(): void {
        let savePayload = this.supplyChainData;

        // Check for Agent Node payload
        if (this.isAgentNode) {
            savePayload.productSupplyChainList[0].supplyChainArticle.supplierId = this.modelData.supplier.id;
            savePayload.productSupplyChainList[0].supplyChainArticle.supplierName = this.modelData.supplier.name;
            savePayload.productSupplyChainList[0].supplyChainArticle.supplierOtherInfo = this.modelData.supplier.supplierOtherInfo;

            savePayload.productSupplyChainList[0].supplyChainArticle.facilityId = this.modelData.facility.id;
            savePayload.productSupplyChainList[0].supplyChainArticle.facilityName = this.modelData.facility.name;
        } else {
            savePayload.supplyChainArticle.supplierId = this.modelData.supplier.id;
            savePayload.supplyChainArticle.supplierName = this.modelData.supplier.name;
            savePayload.supplyChainArticle.supplierOtherInfo = this.modelData.supplier.supplierOtherInfo;

            savePayload.supplyChainArticle.facilityId = this.modelData.facility.id;
            savePayload.supplyChainArticle.facilityName = this.modelData.facility.name;
        }

        this.pageLoading = true;
        if (this.toReuse && this.isAgentNode) {
            savePayload = savePayload[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST][0];
        }
        this.invokeSaveTr(savePayload);
    }

    invokeLaunchAndProceedTr(launchPayload: any) {
        this.trs.launchAndProceedSupplyChain(launchPayload, this.trId).subscribe(
            response => {
                this.toastr.success(
                    TRACEABILITY_CONSTANTS.REQUEST_SUBMITTED_SUCCESSFULLY,
                    TRACEABILITY_CONSTANTS.SUCCESS
                );
                this.commonServices.emitInputChildEvent(false);
                setTimeout(() => {
                    this.pageLoading = false;
                    this.appContext.cardViewRefresh.next(true);
                    setTimeout(() => {
                        this.pageLoading = false;
                        this.auth.getUser().subscribe(_response => {
                            this.auth.setUser(_response);
                            if (
                                this.auth.user.subscriptionType === 'SUPPLIER' &&
                                this.auth.previousUrl === '/supplier-dashboard'
                            ) {
                                this.router.navigate(['/', 'supplier-dashboard']);
                            } else {
                                this.router.navigate(['/', 't-trace']);
                            }
                        });
                    }, 300);
                }, 1000);
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error(failResponse.error.message, TRACEABILITY_CONSTANTS.FAILED);
            }
        );
    }

    launchAndProceed(): void {
        let launchPayload = this.supplyChainData;
        let scMap = new Map<string, number>();
        let productOtherInfo: {};

        if (this.checkNewProductName) {
            productOtherInfo = {
                tradeName: this.productName.tradeName
            };
        } else {
            productOtherInfo = {
                tradeName: this.additionalInfo
            };
        }

        launchPayload = this.getTheLaunchPayLoadData(launchPayload, productOtherInfo);
        if (!this.validate(launchPayload, scMap)) {
            return;
        }
        this.pageLoading = true;
        if (this.toReuse && this.isAgentNode) {
            launchPayload = launchPayload[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST][0];
        }
        launchPayload = this.updateTheDataProvider(launchPayload);
        if (launchPayload[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST]) {
            this.getNextTierSuppliersData(launchPayload[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST]);
        }
        if (this.nextTierArrayData.length) {
            this.nextTeriSubscription = this.confirmationDialog()
                .afterClosed()
                .subscribe((data: MatDialogClose) => {
                    const { event = null }: any = data;
                    if (event === TRACEABILITY_CONSTANTS.SUBMIT) {
                        this.invokeLaunchAndProceedTr(launchPayload);
                    } else if (event === TRACEABILITY_CONSTANTS.PROVIDE_MYSELF) {
                        this.pageLoading = false;
                        launchPayload = null;
                    }
                });
        } else {
            this.invokeLaunchAndProceedTr(launchPayload);
        }
    }

    // This function is used to retrieve the next-tier supplier's name and article name.
    private getNextTierSuppliersData(supplyChainArray: any): void {
        supplyChainArray.forEach((eachSupplyChainData: IPayLoadSupplyChain) => {
            let articleNameAndSupplier: INextTierProviderData = {
                Article: '',
                Supplier: ''
            };
            if (
                eachSupplyChainData.dataProvider === eachSupplyChainData.supplyChainArticle.supplierId &&
                eachSupplyChainData.supplyChainArticle.traceable === 'yes' &&
                !eachSupplyChainData.provideMyself &&
                eachSupplyChainData.supplyChainArticle.supplierName !==
                    TRACEABILITY_CONSTANTS.I_DO_NOT_WISH_TO_PROVIDE &&
                eachSupplyChainData.supplyChainArticle.supplierAssociationStatus.value !==
                    TRACEABILITY_CONSTANTS.UN_INVITED
            ) {
                articleNameAndSupplier.Article = this.localizationService.getDisplayText(
                    eachSupplyChainData.supplyChainArticle.articleTypeId
                );
                articleNameAndSupplier.Supplier = eachSupplyChainData.supplyChainArticle.supplierName;
                if (!eachSupplyChainData.metaData?.isAgentNode) {
                    this.nextTierArrayData.push(articleNameAndSupplier);
                }
            }
            if (eachSupplyChainData[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST]) {
                this.getNextTierSuppliersData(eachSupplyChainData[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST]);
            }
        });
    }
    private getTheLaunchPayLoadData(launchPayload: any, productOtherInfo: any): any {
        // Check for Agent Node payload
        if (this.isAgentNode) {
            launchPayload.productSupplyChainList[0].supplyChainArticle.supplierId = this.modelData.supplier.id;
            launchPayload.productSupplyChainList[0].supplyChainArticle.supplierName = this.modelData.supplier.name;
            launchPayload.productSupplyChainList[0].supplyChainArticle.supplierOtherInfo = this.modelData.supplier.supplierOtherInfo;
            if (this.additionalInfo || this.toCollectFromSupplier || this.checkNewProductName) {
                launchPayload.productSupplyChainList[0].supplyChainArticle.productOtherInfo = productOtherInfo;
            }
        } else {
            launchPayload.supplyChainArticle.supplierId = this.modelData.supplier.id;
            launchPayload.supplyChainArticle.supplierName = this.modelData.supplier.name;
            launchPayload.supplyChainArticle.supplierOtherInfo = this.modelData.supplier.supplierOtherInfo;
            if (this.additionalInfo || this.toCollectFromSupplier || this.checkNewProductName) {
                launchPayload.supplyChainArticle.productOtherInfo = productOtherInfo;
            }
        }
        this.nextTierArrayData = [];
        return launchPayload;
    }

    // This function will invoke the MatDialog box
    private confirmationDialog(): MatDialogRef<ConfirmDialogTableComponent> {
        return this.dialog.open(ConfirmDialogTableComponent, {
            data: {
                title: TRACEABILITY_CONSTANTS.CONFIRM_SUBMITTING,
                description:
                    'Confirm submitting this request by launching the T-Trace request to the following suppliers for their materials',
                tableHeader: [TRACEABILITY_CONSTANTS.ARTICLE, TRACEABILITY_CONSTANTS.SUPPLIER],
                tableValue: this.nextTierArrayData,
                secondaryButtonText: TRACEABILITY_CONSTANTS.PROVIDE_MYSELF,
                primaryButtonText: TRACEABILITY_CONSTANTS.SUBMIT
            },
            disableClose: true
        });
    }

    checkAgentNodeAndAssignDataProvider(dataProvider: string): void {
        // Check for Agent Node payload
        if (this.isAgentNode) {
            this.supplyChainData.productSupplyChainList[0].dataProvider = dataProvider;
        } else {
            this.supplyChainData.dataProvider = dataProvider;
        }
    }

    handleOptionChange({ item, additionalInfo }): void {
        this.handleEntityChange(item);
        this.additionalInfo = additionalInfo;
    }
    handleEntityChange(item: any): void {
        this.modelData.entity = item;
        let dataProvider;
        if (item.key === 'launch') {
            this.toCollectFromSupplier = true;
            dataProvider = this.modelData.supplier.id;
            this.checkAgentNodeAndAssignDataProvider(dataProvider);
            this.isConstructingPayload = false;
        } else {
            this.toCollectFromSupplier = false;
            dataProvider = this.auth.user.companyId;
            this.supplyChainData.dataProvider = dataProvider;
            this.isConstructingPayload = true;
            // this.getSupplyChainBOMData();
            this.getSupplyChainDataWithReuse();
        }
    }

    handleManufacturerChange(item: any): void {
        if (item) {
            this.modelData.supplier = {
                id: item.supplier_id,
                name: item.supplier_name,
                verificationStatus: item.supplier_verification_status,
                supplierAssociationStatus: item.supplier_association_status,
                supplierOtherInfo: item.supplier_other_info
            };
            let dataProvider: string;
            if (this.toCollectFromSupplier) {
                dataProvider = this.modelData.supplier.id;
            } else {
                dataProvider = this.auth.user.companyId;
            }
            this.checkAgentNodeAndAssignDataProvider(dataProvider);
        }
    }

    launchToSupplier(): void {
        // Check for Agent Node payload
        if (this.isAgentNode) {
            delete this.supplyChainData.productSupplyChainList[0][TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST];
        } else {
            delete this.supplyChainData[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST];
        }
        this.launchAndProceed();
    }

    getExisitingDataForSupplierSearch(item) {
        if (item) {
            let supplierData: {};
            if (this.isAgentNode) {
                supplierData = {
                    supplier_name: item.productSupplyChainList[0].supplyChainArticle.supplierName,
                    supplier_id: item.productSupplyChainList[0].supplyChainArticle.supplierId
                };
                if (item.supplierVerificationStatus) {
                    supplierData[TRACEABILITY_CONSTANTS.SUPPLIER_VERIFICATION_STATUS] = {
                        id: item.productSupplyChainList[0].supplyChainArticle.supplierVerificationStatus.id,
                        value: item.productSupplyChainList[0].supplyChainArticle.supplierVerificationStatus.value
                    };
                }

                if (item.supplierAssociationStatus) {
                    supplierData[TRACEABILITY_CONSTANTS.SUPPLIER_ASSOCIATION_STATUS_KEY] = {
                        id: item.productSupplyChainList[0].supplyChainArticle.supplierAssociationStatus.id,
                        value: item.productSupplyChainList[0].supplyChainArticle.supplierAssociationStatus.value
                    };
                }
            } else {
                supplierData = {
                    supplier_name: item.supplyChainArticle.supplierName,
                    supplier_id: item.supplyChainArticle.supplierId
                };
                if (item.supplierVerificationStatus) {
                    supplierData[TRACEABILITY_CONSTANTS.SUPPLIER_VERIFICATION_STATUS] = {
                        id: item.supplyChainArticle.supplierVerificationStatus.id,
                        value: item.supplyChainArticle.supplierVerificationStatus.value
                    };
                }
                if (item.supplierAssociationStatus) {
                    supplierData[TRACEABILITY_CONSTANTS.SUPPLIER_ASSOCIATION_STATUS_KEY] = {
                        id: item.supplyChainArticle.supplierAssociationStatus.id,
                        value: item.supplyChainArticle.supplierAssociationStatus.value
                    };
                }
            }

            if (supplierData['supplier_id'] !== this.auth.companyId) {
                return supplierData;
            }
        }
    }

    shouldDisableManufacturerToggle(): boolean {
        if (
            this.modelData.supplier['id'] === this.auth.companyId ||
            (this.modelData.supplier[TRACEABILITY_CONSTANTS.SUPPLIER_ASSOCIATION_STATUS] &&
                [0, 10].includes(this.modelData.supplier[TRACEABILITY_CONSTANTS.SUPPLIER_ASSOCIATION_STATUS].id)) ||
            !this.modelData.supplier.verificationStatus ||
            +this.modelData.supplier.verificationStatus.id === 10
        ) {
            if (this.modelData.entity === this.entities[1]) {
                this.handleEntityChange(this.entities[0]);
            }
            return true;
        }
        return false;
    }

    analyticsEditPageLoaded(): void {
        const analyticsOptions = {};

        let utm_medium = '';
        this.route.queryParams.pipe(filter(params => params.utm_medium)).subscribe(params => {
            utm_medium = params.utm_medium;
        });
        if (utm_medium) {
            analyticsOptions[this.analyticsService.PROPERTY_SOURCE_MEDIUM] = utm_medium;
        }
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_TRACE_EDIT_PAGE + '#Loaded', analyticsOptions);
    }

    analyticsSaveClicked(): void {
        const user = this.auth.user;
        const analyticsOptions = {
            CompanyId: user.companyId,
            FirstName: user.firstName,
            LastName: user.lastName,
            Email: user.email
        };
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_TRACE_EDIT_PAGE + ' Save#Clicked', analyticsOptions);
    }

    analyticsLaunchAndProceedClicked(): void {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_TRACE_EDIT_PAGE + ' Launch&Proceed#Clicked',
            analyticsOptions
        );
    }
    getProductName(): { label: string; tradeName: string } {
        let label = this.supplyChainData.supplyChainArticle.internalArticleName;
        let tradeName: null;
        let labelName: null;

        labelName = this.supplyChainData.supplyChainArticle.productOtherInfo
            ? this.supplyChainData.supplyChainArticle.productOtherInfo.tradeName
            : '';

        tradeName = labelName;
        if (this.isAgentNode) {
            tradeName = this.supplyChainData.productSupplyChainList[0].supplyChainArticle.productOtherInfo
                ? this.supplyChainData.productSupplyChainList[0].supplyChainArticle.productOtherInfo.tradeName
                : '';
        }

        if (
            labelName &&
            (this.supplyChainData.dataProvider === this.auth.companyId ||
                this.supplyChainData.launchedBy === this.auth.companyId)
        ) {
            label = `${label} / ${labelName}`;
        }
        return { label, tradeName: tradeName ? tradeName : null };
    }

    analyticsCheckTraderChanged(): void {
        const analyticsOptions = {};
        let eventName = this.ANALYTICS_EVENT_T_TRACE_EDIT_PAGE + ' Check-Trader';
        eventName = this.checkTrader ? `${eventName}#checked` : `${eventName}#Unchecked`;
        this.analyticsService.trackEvent(eventName, analyticsOptions);
    }

    // update the Data Provider
    private updateTheDataProvider(payLoadData: IPayLoadSupplyChain): any {
        const tempPayLoadData = JSON.parse(JSON.stringify(payLoadData));
        if (tempPayLoadData[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST]) {
            this.setDataProviderDetails(tempPayLoadData[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST]);
        }
        return tempPayLoadData;
    }

    // set the data provider as supplier details
    private setDataProviderDetails(supplyChainData: any): void {
        supplyChainData.forEach((eachSupplyChainArticle: IPayLoadSupplyChain) => {
            if (!eachSupplyChainArticle.provideMyself) {
                eachSupplyChainArticle.dataProvider = eachSupplyChainArticle.supplyChainArticle.supplierId;
                if (
                    eachSupplyChainArticle.supplyChainArticle.supplierId === TRACEABILITY_CONSTANTS.SNA_CANNOT_DISCLOSE
                ) {
                    eachSupplyChainArticle.dataProvider = this.auth.user.companyId;
                }
                eachSupplyChainArticle.dataProviderName = eachSupplyChainArticle.supplyChainArticle.supplierName;
            }
            if (eachSupplyChainArticle.productSupplyChainList) {
                this.setDataProviderDetails(eachSupplyChainArticle[TRACEABILITY_CONSTANTS.PRODUCT_SUPPLY_CHAIN_LIST]);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.focusInputSubscription) {
            this.focusInputSubscription.unsubscribe();
        } else if (this.nextTeriSubscription) {
            this.nextTeriSubscription.unsubscribe();
        }
    }
}
