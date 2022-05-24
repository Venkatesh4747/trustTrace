import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { MaterialLibraryService } from './../material-library.service';
import {
    ISupplierListFormOptions,
    SupplierListTypes
} from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { ContextService } from '../../../shared/context.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { IMaterial } from './create-material.model';

@Component({
    selector: 'app-create-materials',
    templateUrl: './create-materials.component.html',
    styleUrls: ['./create-materials.component.scss']
})
export class CreateMaterialsComponent implements OnInit {
    outOfRangeErrorMsg = 'Please set the value within range';
    isRequired = true;
    optional = {
        key: 'key',
        value: 'value',
        selectedKey: 'id'
    };
    optionalParams = {
        key: 'id',
        value: 'value',
        selectedKey: 'id'
    };
    optionalParamsUnit = {
        id: 'id',
        value: 'value',
        status: 'status',
        key: 'key',
        selectedKey: 'id'
    };
    createPayload: IMaterial = {
        id: '',
        materialUniqueCode: '',
        articleTypeId: '',
        season: '',
        year: '',
        internalArticleNumber: '',
        internalArticleName: '',
        supplierId: '',
        supplierArticleNumber: '',
        supplierArticleName: '',
        materialsComposition: [
            {
                id: '',
                value: null
            }
        ],
        width: {
            value: null,
            unit: ''
        },
        density: {
            value: null,
            unit: ''
        },
        tags: '',
        traceable: '',
        supplier: {
            key: '',
            value: ''
        },
        certifications: [],
        colors: [],
        materialColors: []
    };

    materialComposition = {
        id: '',
        value: null
    };

    configs;

    supplierListOptions: ISupplierListFormOptions = {
        controlType: 'single-select',
        listOnlyThisSuppliers: [
            SupplierListTypes.not_invited_supplier,
            SupplierListTypes.accepted_supplier,
            SupplierListTypes.unAccepted_supplier
        ],
        acceptOnlyListedValues: true,
        floatLabel: 'never',
        isRequired: true,
        requiredSymbolRemove: true,
        placeholder: 'E.g. ABC Suppliers',
        valueChangesFire: 'both',
        fullWidth: true
    };

    pageLoading = false;

    locationBack = false;
    mode: string;
    materialId: string;
    editMode = false;
    certificationAutoCompleteList = [];
    selectedCertifications = [];
    colorsAutoCompleteList = [];
    selectedColors = [];
    referenceId = '';

    constructor(
        private materialService: MaterialLibraryService,
        private toastr: CustomToastrService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private appContext: ContextService,
        private localeService: LocalizationService,
        private confirmDialog: MatDialog,
        private utils: UtilsService
    ) {
        this.route.queryParams.subscribe(params => {
            this.locationBack = params.back;
        });
    }

    ngOnInit() {
        this.pageLoading = true;
        this.materialService.getConfigs().subscribe(
            response => {
                this.configs = response['data'];
                if (this.configs.master_data.CERTIFICATION) {
                    for (let i = 0; i < this.configs.master_data.CERTIFICATION.length; i++) {
                        this.certificationAutoCompleteList.push({
                            id: this.configs.master_data.CERTIFICATION[i].key,
                            value: this.configs.master_data.CERTIFICATION[i].value
                        });
                    }
                }
                if (this.configs.colors) {
                    for (let i = 0; i < this.configs.colors.length; i++) {
                        this.colorsAutoCompleteList.push({
                            id: this.configs.colors[i].id,
                            value: this.configs.colors[i].name
                        });
                    }
                }
                this.pageLoading = false;
            },
            failresponse => {
                this.toastr.error('Error while fetching material configuration');
            }
        );

        this.route.params.subscribe(params => {
            this.materialId = params['materialId'];
            this.mode = params['mode'];
            if (this.mode === 'edit') {
                this.editMode = true;
                this.pageLoading = true;
                this.materialService.getMaterialDetail(this.materialId).subscribe(
                    response => {
                        this.referenceId = response['data']['material_library']['referenceId'];
                        const data = response['data'];
                        this.createPayload = JSON.parse(JSON.stringify(data['material_library']));
                        this.supplierListOptions.selectedItem = { id: this.createPayload.supplier.key };
                        this.localeService.addToMasterData(data['masterData']);
                        this.setSelectedMLCertificatesRequired();
                        this.setSelectedMLColors();
                        this.pageLoading = false;

                        this.setEmptyPropsForPayload();
                    },
                    failresponse => {
                        this.toastr.error('Error while fetching Material Library');
                    }
                );
            }

            if (this.mode === 'clone') {
                this.getMaterialUniqueCodeForClone();
            }
        });
    }

    setSelectedMLCertificatesRequired() {
        if (this.createPayload.certifications) {
            this.createPayload.certifications.forEach(element => {
                this.selectedCertifications.push({
                    id: element.id,
                    value: this.localeService.getDisplayText(element.id)
                });
            });
        }
    }

    setSelectedMLColors() {
        if (this.createPayload.materialColors) {
            this.createPayload.materialColors.forEach(element => {
                this.selectedColors.push({
                    id: element.key,
                    value: element.value
                });
            });
        }
    }

    updateCertifications(chipItems) {
        if (chipItems) {
            const certificationList = [];
            for (let i = 0; i < chipItems.length; i++) {
                certificationList.push({
                    id: chipItems[i].id,
                    mandatory: true
                });
            }
            this.createPayload.certifications = certificationList;
        }
    }

    updateColors(chipItems) {
        if (chipItems) {
            const colorsList = [];
            for (let i = 0; i < chipItems.length; i++) {
                colorsList.push(chipItems[i].id);
            }
            this.createPayload.colors = colorsList;
        }
    }

    getMaterialUniqueCodeForClone(): void {
        const confirmDialog = this.confirmDialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Article UID',
                msg: 'Enter the Article UID',
                primaryButton: 'Cancel',
                secondaryButton: 'Clone Material',
                class: 'material-clone-modal-dialog-block',
                showClose: false,
                isProvisionToAddInput: true
            }
        });

        confirmDialog
            .afterClosed()
            .pipe(take(1))
            .subscribe(response => {
                if (!response) {
                    this.goBack();
                    return;
                }

                const [action, productUniqueCode]: string = response.split(',');
                if (action === 'Clone Material') {
                    if (this.utils.validateProductUniqueCode(productUniqueCode)) {
                        this.cloneMaterial(productUniqueCode);
                    } else {
                        this.toastr.error('Article UID validation failed', 'Error');
                        this.getMaterialUniqueCodeForClone();
                    }
                } else {
                    this.goBack();
                }
            });
    }

    cloneMaterial(productUniqueCode: string): void {
        const payload = {
            id: this.materialId,
            materialUniqueCode: productUniqueCode
        };
        this.pageLoading = true;
        this.materialService.cloneMaterial(payload).subscribe(
            response => {
                const cloneResponse = response['data']['ml'];
                this.pageLoading = false;
                this.router.navigate(['/', 'material-library', cloneResponse.id, 'edit']);
            },
            fail_response => {
                const error = fail_response.error;
                this.pageLoading = false;
                this.toastr.error(`Error: ${error.message ? error.message : 'unable to create material'} `);
                this.goBack();
            }
        );
    }

    goToLocationBack() {
        this.location.back();
    }

    goBack() {
        if (this.locationBack) {
            this.goToLocationBack();
        } else {
            this.router.navigate(['/', 'material-library']);
        }
    }

    goBackElseMLLandingPage(id) {
        if (this.locationBack) {
            this.goToLocationBack();
        } else {
            this.router.navigate(['/', 'material-library', id]);
        }
    }

    addMaterialComposition() {
        this.createPayload.materialsComposition.push(JSON.parse(JSON.stringify(this.materialComposition)));
    }

    checkMaterialCompEntered(event, index) {
        let materialComp = 0;
        if (this.createPayload.materialsComposition.length > 0) {
            this.createPayload.materialsComposition.forEach(material => {
                if (material.value) {
                    materialComp = materialComp + material.value;
                }
            });
        }
        if (materialComp < 0 || materialComp > 100) {
            this.toastr.error(
                'Composition should be within the range between 0 and 100',
                'Kindly enter valid composition!'
            );
            this.createPayload.materialsComposition[index].value = undefined;
        }
    }

    getConvertedUnit(unit: string) {
        const str = unit.replace('^', '&sup');
        return str;
    }

    removeComposition(index: number) {
        this.createPayload.materialsComposition.splice(index, 1);
        if (this.createPayload.materialsComposition.length === 0) {
            this.createPayload.materialsComposition.push(
                Object.assign({}, JSON.parse(JSON.stringify(this.materialComposition)))
            );
        }
    }

    validateMLYear() {
        const yearMessage = 'please enter year between 1970-2100.';
        const year = Number(this.createPayload.year);
        if (year < 1970 || year > 2100) {
            this.toastr.error(yearMessage);
            this.createPayload.year = '';
            return false;
        }
        return true;
    }

    formCreatePayload() {
        let payload: Partial<IMaterial>;
        const createPayload: IMaterial = this.createPayload;

        payload = this.constructPayloadDynamically(createPayload);

        if (typeof createPayload.tags === 'string') {
            if (createPayload.tags) {
                payload['tags'] = createPayload.tags.split(',');
            } else {
                payload['tags'] = [];
            }
        } else if (Array.isArray(createPayload.tags)) {
            payload['tags'] = createPayload.tags;
        }
        payload['materialsComposition'] = [];
        if (createPayload.materialsComposition.length > 0) {
            createPayload.materialsComposition = createPayload.materialsComposition.filter(
                materialComposition => materialComposition.id !== '' && materialComposition.id !== null
            );
            createPayload.materialsComposition.forEach((materialComp, index) => {
                if (materialComp.id !== '') {
                    payload['materialsComposition'].push(JSON.parse(JSON.stringify(this.materialComposition)));
                    payload['materialsComposition'][index]['id'] = materialComp.id;
                    payload['materialsComposition'][index]['value'] = +materialComp.value;
                }
            });
        }
        if (createPayload.width.unit !== '') {
            payload['width'] = { value: 0, unit: '' };
            payload['width']['value'] = +createPayload.width.value;
            payload['width']['unit'] = createPayload.width.unit;
        } else {
            payload['width'] = { value: 0, unit: '' };
        }
        if (createPayload.density.unit !== '') {
            payload['density'] = { value: 0, unit: '' };
            payload['density']['value'] = +createPayload.density.value;
            payload['density']['unit'] = createPayload.density.unit;
        } else {
            payload['density'] = { value: 0, unit: '' };
        }
        return payload;
    }

    validateML(): boolean {
        let matcomp = false;

        if (!this.materialMandatoryValiation()) return false;

        if (this.createPayload.materialsComposition.length > 0) {
            this.createPayload.materialsComposition.forEach(material => {
                if (
                    ((material.id === '' || material.id === null) && material.value) ||
                    (material.id && !material.value)
                ) {
                    this.toastr.error('Enter a valid Material Composition', 'Error');
                    matcomp = true;
                }
            });
            if (matcomp) {
                return false;
            }
        }

        return true;
    }

    onCreate() {
        if (this.validateMLYear() && this.validateML()) {
            this.pageLoading = true;
            const payload = this.formCreatePayload();
            if (this.createPayload.id !== '' && this.editMode) {
                payload['id'] = this.createPayload.id;
                payload['referenceId'] = this.referenceId;
                this.materialService.updateMaterialLibrary(payload).subscribe(
                    response => {
                        this.pageLoading = false;
                        this.toastr.success('Raw material updated successfully');
                        this.router.navigate(['/', 'material-library', this.createPayload.id]);
                        setTimeout(() => {
                            this.appContext.cardViewRefresh.next(true);
                        }, 3000);
                    },
                    failed => {
                        this.pageLoading = false;
                        const error = failed.error;
                        this.toastr.error(`Error: ${error.message ? error.message : 'unable to create material'} `);
                    }
                );
            } else {
                this.materialService.createLibrary(payload).subscribe(
                    response => {
                        const data = response['data'];
                        this.toastr.success('Raw material created successfully');
                        setTimeout(() => {
                            this.goBackElseMLLandingPage(data.id);
                            this.appContext.cardViewRefresh.next(true);
                        }, 2000);
                    },
                    failResponse => {
                        this.pageLoading = false;
                        const error = failResponse.error;
                        this.toastr.error(`Error: ${error.message ? error.message : 'unable to create material'} `);
                    }
                );
            }
        }
    }

    checkAndAssignVal(valueToBeChecked: string | any[]): string | any[] {
        if (Array.isArray(valueToBeChecked)) {
            return valueToBeChecked.length ? valueToBeChecked : [];
        } else {
            return valueToBeChecked ? valueToBeChecked : '';
        }
    }

    constructPayloadDynamically(createPayload: IMaterial): Partial<IMaterial> {
        let payload: Partial<IMaterial> = {};
        const mandatoryForCreate = [
            'internalArticleNumber',
            'year',
            'materialUniqueCode',
            'season',
            'articleTypeId',
            'internalArticleName',
            'supplierId'
        ];
        const payloadPropsCollection = [
            'internalArticleNumber',
            'year',
            'materialUniqueCode',
            'season',
            'articleTypeId',
            'internalArticleName',
            'supplierId',
            'supplierArticleName',
            'supplierArticleNumber',
            'traceable',
            'certifications',
            'colors'
        ];
        for (const payloadProp in createPayload) {
            const constructedVal = this.checkAndAssignVal(createPayload[payloadProp]);
            if (payloadPropsCollection.includes(payloadProp)) {
                if (mandatoryForCreate.includes(payloadProp) && constructedVal)
                    //mandatory props cannot hold falsy val
                    payload[payloadProp] = constructedVal;

                if (!mandatoryForCreate.includes(payloadProp))
                    //non-mandatory props value declaration
                    payload[payloadProp] = constructedVal;
            }
        }

        return payload;
    }

    materialMandatoryValiation(): boolean {
        if (!this.createPayload.articleTypeId || this.createPayload.articleTypeId.trim() === '') {
            this.toastr.error('Article type is required', 'Error');
            return false;
        }

        if (!this.createPayload.materialUniqueCode || this.createPayload.materialUniqueCode.trim() === '') {
            this.toastr.error('Article UID is required', 'Error');
            return false;
        }

        if (!this.utils.validateProductUniqueCode(this.createPayload.materialUniqueCode)) {
            this.toastr.error('Article UID validation failed', 'Error');
            return false;
        }

        if (!this.createPayload.internalArticleNumber || this.createPayload.internalArticleNumber.trim() === '') {
            this.toastr.error('Internal article number is required', 'Error');
            return false;
        }

        if (!this.createPayload.internalArticleName || this.createPayload.internalArticleName.trim() === '') {
            this.toastr.error('Internal article name is required', 'Error');
            return false;
        }

        if (!this.createPayload.season || this.createPayload.season.trim() === '') {
            this.toastr.error('Season is required', 'Error');
            return false;
        }

        if (!this.createPayload.traceable || this.createPayload.traceable.trim() === '') {
            this.toastr.error('Should be traced is required', 'Error');
            return false;
        }

        if (!this.createPayload.supplierId || this.createPayload.supplierId.trim() === '') {
            this.toastr.error('Supplier name is required', 'Error');
            return false;
        }

        return true;
    }

    setEmptyPropsForPayload(): void {
        if (!this.createPayload.hasOwnProperty('width')) {
            this.createPayload.width = {
                value: null,
                unit: ''
            };
        }

        if (!this.createPayload.hasOwnProperty('density')) {
            this.createPayload.density = {
                value: null,
                unit: ''
            };
        }

        if (this.createPayload.materialsComposition && this.createPayload.materialsComposition.length === 0) {
            this.createPayload.materialsComposition = [
                {
                    id: '',
                    value: undefined
                }
            ];
        }
    }
}
