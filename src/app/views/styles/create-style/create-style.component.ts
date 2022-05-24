import { Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { environment as env } from '../../../../environments/environment';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { ProductColorComponent } from '../product-color/product-color.component';
import { StyleBomComponent } from '../style-bom/style-bom.component';
import { BomView, Style } from '../style.model';
import { CreateStyleService } from './create-style.service';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { ContextService } from '../../../shared/context.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { SuppliersService } from '../../suppliers/suppliers.service';

@Component({
    selector: 'app-create-style',
    templateUrl: './create-style.component.html',
    styleUrls: ['./create-style.component.scss'],
    providers: [CreateStyleService]
})
export class CreateStyleComponent implements OnInit {
    @Input('styleId') styleId;
    @ViewChild(ProductColorComponent, { static: false }) private productColor: ProductColorComponent;
    @ViewChild(StyleBomComponent, { static: false }) private bomComponent: StyleBomComponent;
    public env = env;
    pageLoading = true;
    editMode = false;
    mode = 'create';
    step = 0;
    bomPanelIndex = 7;
    isAllowMLDialog = true;
    isStyleSessionExists = false;
    stylesSession = 'styles-details';
    mandatoryMessage = 'Mandatory Data:';
    suppliers = [];

    settings = {
        materials: [],
        style: {
            styleSettings: {
                productCategories: [],
                colors: [],
                seasons: [],
                sustainabilityLabels: [],
                recurringTypes: []
            }
        },
        productTypes: [],
        units: [],
        certifications: []
    };

    style: Style = {
        name: '',
        productUniqueCode: '',
        code: '',
        year: '',
        season: '',
        productType: '',
        quanity:'',
        certifications: [],
        sustainabilityLabels: [],
        materialComp: [],
        productCategories: [],
        variants: [],
        bom: [],
        supplyChain: [],
        imagesId: '',
        styleImageNames: [],
        billOfMaterials: []
    };

    styleCategories = [
        'Style Specifications',
        'Main Fabric Composition',
        'Product Color, Size, Fit and Length',
        'Certifications Required',
        'Sustainability Labels',
        'Upload Product Images',
        'Manufacturer Information',
        'Bill Of Materials'
    ];

    constructor(
        private createStyleService: CreateStyleService,
        private toastrService: CustomToastrService,
        private localeService: LocalizationService,
        private route: ActivatedRoute,
        private router: Router,
        private confirmDialog: MatDialog,
        private appContext: ContextService,
        private utils: UtilsService,
        private multiIndustryService: MultiIndustryService,
        private location: Location,
        private supplierService: SuppliersService
    ) {
        this.styleCategories[0] = this.multiIndustryService.getLabel(this.styleCategories[0]);
        this.styleCategories[1] = this.multiIndustryService.getLabel(this.styleCategories[1]);
    }

    ngOnInit() {
        if (this.utils.getSessionStorageValue(this.stylesSession)) {
            this.isStyleSessionExists = true;
        }
        this.route.params.subscribe(params => {
            this.styleId = params['styleId'];
            this.mode = params['mode'] || this.mode;
            if (this.mode === 'clone') {
                this.cloneStyles();
            } else {
                this.getStyleConfigs();
            }
        });
        this.styleCategories.splice(5, 1);
    }

    checkIfCompanySettingsExists(settings) {
        const styleSettings = settings.style.styleSettings;

        if (!styleSettings || Object.keys(styleSettings).length === 0) {
            this.toastrService.info('Please ensure Company Settings is configured.');
        }
    }

    cloneStyles(): void {
        const productUniqueCodeInputDialog = this.confirmDialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Style UID',
                msg: 'Enter the Style UID',
                primaryButton: 'Cancel',
                secondaryButton: 'Clone Style',
                class: 'style-clone-modal-dialog-block',
                showClose: false,
                isProvisionToAddInput: true
            }
        });

        productUniqueCodeInputDialog
            .afterClosed()
            .pipe(take(1))
            .subscribe(response => {
                if (!response) {
                    this.location.back();
                    return;
                }
                const [action, productUniqueCode]: string = response.split(',');
                if (action === 'Clone Style') {
                    if (this.utils.validateProductUniqueCode(productUniqueCode)) {
                        this.handleCloneStyle(productUniqueCode);
                    } else {
                        this.toastrService.error('Style UID validation failed', 'Error');
                        this.cloneStyles();
                    }
                } else {
                    this.location.back();
                }
            });
    }

    private getStyleConfigs(): void {
        this.createStyleService.getStyleConfigs().subscribe(
            response => {
                this.localeService.addToMasterData(response['data']['masterData']);
                const settings = response['data']['settings'];
                this.checkIfCompanySettingsExists(settings);
                this.settings = this.initializeObject(response['data']['settings'], this.settings);
                if (this.isStyleSessionExists) {
                    this.style = this.initializeObject(
                        this.utils.getSessionStorageValue(this.stylesSession),
                        this.style
                    );
                    this.utils.removeSessionStorageValue(this.stylesSession);
                    this.setStep(this.bomPanelIndex);
                    this.pageLoading = false;
                } else {
                    if (!this.styleId) {
                        this.pageLoading = false;
                        return;
                    }
                    this.editMode = true;
                    const payload = {
                        sort: { sortBy: 'create_ts', sortOrder: 'desc' },
                        pagination: { from: 0, size: 1000 }
                    };
                    forkJoin([
                        this.createStyleService.getStyle(this.styleId),
                        this.supplierService.getAllSuppliers(payload)
                    ]).subscribe(
                        ([styleResponse, supplierResponse]) => {
                            this.style = this.initializeObject(styleResponse['data']['style'], this.style);
                            this.suppliers = supplierResponse['data']['searchResponse'];
                            this.style.supplyChain.forEach(productDetails => {
                                productDetails.suppliers.forEach((supplierId, index) => {
                                    const supplierAvailable = this.suppliers.find(
                                        supplierDetail => supplierDetail.supplier_id === supplierId.id
                                    );
                                    if (!supplierAvailable) {
                                        productDetails.suppliers.splice(index, 1);
                                    }
                                });
                            });
                            this.pageLoading = false;
                        },
                        () => {
                            this.toastrService.error('error fetching style data to edit');
                        }
                    );
                }
            },
            () => {
                this.toastrService.error('error fetching style settings');
            }
        );
    }

    private handleCloneStyle(productUniqueCode: string): void {
        const payload = {
            id: this.styleId,
            productUniqueCode: productUniqueCode
        };
        this.createStyleService.cloneStyles(payload).subscribe(
            response => {
                const cloneResponse = response['data']['style'];
                this.router.navigate(['/', 'styles', cloneResponse.id, 'edit']);
            },
            (error: HttpErrorResponse) => {
                if (error?.error?.message === 'The style uid already exists, please retry with UID') {
                    this.toastrService.error(error?.error?.message);
                    this.cloneStyles();
                } else {
                    this.toastrService.error('error cloning style');
                    this.goBack();
                }
            }
        );
    }

    initializeObject(sourceObj, sampleObj) {
        if (!sampleObj) {
            return sourceObj;
        }
        for (const key in sourceObj) {
            if (sourceObj.hasOwnProperty(key)) {
                const tempSampleObj = sampleObj[key];
                const tempSourceObj = sourceObj[key];
                if (Array.isArray(tempSampleObj)) {
                    if (Array.isArray(tempSourceObj)) {
                        if (typeof tempSourceObj[0] === 'object') {
                            sampleObj[key] = [];
                            for (let i = 0; i < tempSourceObj.length; i++) {
                                sampleObj[key].push(this.initializeObject(tempSourceObj[i], tempSampleObj[i]));
                            }
                        } else {
                            sampleObj[key] = tempSourceObj;
                        }
                    }
                } else if (typeof tempSampleObj === 'object') {
                    this.initializeObject(sourceObj[key], sampleObj[key]);
                } else {
                    sampleObj[key] = sourceObj[key];
                }
            }
        }
        return sampleObj;
    }

    private validate(): boolean {
        if (
            !this.style.name ||
            !this.style.season ||
            !this.style.productType ||
            !this.style.year ||
            !this.style.productUniqueCode
        ) {
            this.toastrService.error(
                this.mandatoryMessage + ' (Style Name, Style UID, Year, Season, Product Type) is empty.'
            );
            return false;
        }

        if (
            !this.validateYear() ||
            !this.validateMaterialComposition() ||
            !this.validateVariants() ||
            !this.validateSupplyChainInformation() ||
            !this.validateBillofMaterials()
        ) {
            return false;
        }

        if (!this.utils.validateProductUniqueCode(this.style.productUniqueCode)) {
            this.toastrService.error('Style UID validation failed', 'Error');
            return false;
        }
        return true;
    }

    private validateYear(): boolean {
        const year = Number(this.style.year);
        if (isNaN(year) || year < 1970 || year > 2100) {
            this.toastrService.error('please enter year between 1970-2100.');
            return false;
        } else {
            return true;
        }
    }

    private validateMaterialComposition(): boolean {
        let totalComposition = 0;
        let isMaterialCompositionValid = true;
        this.style.materialComp.forEach(element => {
            if (!element.id || !element.value) {
                this.toastrService.error('Incomplete entries in Material Composition, Please check.');
                isMaterialCompositionValid = false;
            }
            totalComposition += element.value;
        });
        if (totalComposition > 100.0) {
            this.toastrService.error('Total Material Composition exceeds 100%');
            isMaterialCompositionValid = false;
        }
        return isMaterialCompositionValid;
    }

    private validateSupplyChainInformation(): boolean {
        if (
            !this.style.supplyChain ||
            this.style.supplyChain.length === 0 ||
            this.style.supplyChain[0].suppliers.length === 0
        ) {
            this.toastrService.error(this.mandatoryMessage + ' Supply chain information - Manufacturer is empty.');
            return false;
        }
        return true;
    }

    private validateVariants(): boolean {
        let isVariantValid = true;
        for (const variant of this.style.variants) {
            if (!variant.color) {
                this.toastrService.error(this.mandatoryMessage + ' (Color) is empty.');
                isVariantValid = false;
                break;
            }
            if (!variant.sizes || variant.sizes.length === 0) {
                this.toastrService.error(this.mandatoryMessage + ' (Size) is empty.');
                isVariantValid = false;
                break;
            } else {
                for (const size of variant.sizes) {
                    if (!size.size) {
                        this.toastrService.error(this.mandatoryMessage + ' (Size) is empty.');
                        isVariantValid = false;
                        break;
                    }
                }
            }
        }
        return isVariantValid;
    }

    private validateBillofMaterials(): boolean {
        let isBillofMaterialsValid = true;
        this.style.billOfMaterials = [];
        for (const item of this.style.bom) {
            if (!item.article) {
                this.toastrService.error(this.mandatoryMessage + 'Bill of Materials: Article is empty.');
                isBillofMaterialsValid = false;
            }
            if (!item.article['id_type']) {
                this.openMLDialog();
                isBillofMaterialsValid = false;
            }
        }
        return isBillofMaterialsValid;
    }

    openMLDialog(): void {
        if (this.isAllowMLDialog) {
            this.isAllowMLDialog = false;
            const requiredMLDialog = this.confirmDialog.open(ConfirmDialogComponent, {
                width: '460px',
                data: {
                    msg: 'The article you have entered does not exist in the Material Library.Click below to add.',
                    primaryButton: 'Material Library',
                    showClose: false
                }
            });
            requiredMLDialog.afterClosed().subscribe(response => {
                this.isAllowMLDialog = true;
                if (response) {
                    const responseArr = response.split(',');
                    if (responseArr[0] === 'Material Library') {
                        this.style.billOfMaterials = [];
                        for (let i = 0; i < this.style.bom.length; i++) {
                            const bomview = new BomView();
                            const artArray = new Array();
                            artArray.push(this.style.bom[i].article);
                            bomview.article = artArray;
                            this.style.billOfMaterials.push(bomview);

                            if (!this.style.bom[i].article['id_type']) {
                                this.style.bom[i].article = '';
                                const artArray = new Array();
                                artArray.push(this.style.bom[i].article);
                                this.style.billOfMaterials[i].article = artArray;
                            }
                        }
                        this.utils.setSessionStorageValue(this.stylesSession, this.style);
                        this.router.navigate(['/', 'material-library', 'create'], {
                            queryParams: {
                                back: true
                            }
                        });
                    }
                }
            });
        }
    }

    onSave(createStylesForm: NgForm) {
        console.log('datassss',createStylesForm);

        const style = JSON.parse(JSON.stringify(this.style)); //clone
        if (this.validate()) {
            style.bom = style.bom.filter(
                bom => !(bom.qty.unit.trim() === '' && typeof bom.article === 'string' && bom.usedIn.length === 0)
            );
            style.bom.forEach(bom => {
                if (
                    typeof bom.article === 'object' &&
                    bom.article &&
                    bom.article.hasOwnProperty('id_type') &&
                    bom.article['id_type']
                ) {
                    bom.article = bom.article['id_type'].split('-')[0];
                }
            });

            if (style.hasOwnProperty('id')) {
                this.createStyleService.updateStyles(style).subscribe(
                    response => {
                        this.toastrService.success('Style updated successfully');
                        this.router.navigate(['/', 'styles', this.styleId]);
                        setTimeout(() => {
                            this.appContext.cardViewRefresh.next(true);
                        }, 3000);
                    },
                    (error: HttpErrorResponse) => {
                        this.toastrService.error(error?.error?.message || 'unable to update style', 'Error');
                    }
                );
            } else {
                this.createStyle(style);
            }
        }
    }

    private createStyle(style: Style): void {
        this.createStyleService.createStyles(style).subscribe(
            response => {
                const createdStyle = response['data']['style'][0];
                this.toastrService.success('Style created successfully');
                setTimeout(() => {
                    this.router.navigate(['/', 'styles', createdStyle.id]);
                    this.appContext.cardViewRefresh.next(true);
                }, 1000);
            },
            (error: HttpErrorResponse) => {
                this.toastrService.error(error?.error?.message || 'unable to create style', 'Error');
            }
        );
    }

    goBack(): void {
        this.router.navigate(['/', 'styles']);
    }
    setStep(index: number): void {
        this.step = index;
    }
}
