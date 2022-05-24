import {
    OnInit,
    Component,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    ViewChild,
    ElementRef,
    OnChanges
} from '@angular/core';
import {
    INonConformitiesTemplate,
    INonConformities,
    IsubCategories,
    IsubNCData,
    IupdateModel,
    IAuditPriority
} from '../non-conformities-list/non-conformities-list.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { AssessmentAuditService } from '../../assessment-audit.service';
import { CommonServices } from '../../../../shared/commonServices/common.service';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-non-conformities-create',
    templateUrl: './non-conformities-create.component.html',
    styleUrls: ['./non-conformities-create.component.scss']
})
export class NonConformitiesCreateComponent implements OnInit, OnDestroy, OnChanges {
    @Input() ncEditEvent: Subject<IupdateModel>; // Edit add view delete state manage
    @Output() nonConformitiesUpdated: EventEmitter<INonConformities[]> = new EventEmitter(); // Updated nonconformities
    @Input() initialState: Array<INonConformities> = [];
    @Input() isEditPage: boolean = false;
    @Input() auditId: string = '';

    @Input() showDivider: boolean = false;
    nonConformitiesTemplate: Array<INonConformitiesTemplate> = []; // Non conformities template data
    nonConformities: Array<INonConformities> = []; // local variable for nonconformities

    editMode = false; // Edit state manage
    editReqData: IupdateModel; // Temp edit required data`s

    editSubscription: Subscription;

    nonConformitiesForm = new FormGroup({
        category: new FormControl(null, Validators.required),
        subCategory: new FormControl(null, Validators.required),
        priority: new FormControl(null, Validators.required),
        nonConformity: new FormControl('')
    });

    auditPriorities: Array<IAuditPriority> = []; // audit priority template data
    btnStatus: boolean = false;

    customStyle = {
        color: '#325992',
        width: '100%'
    };

    @ViewChild('editNC', { static: true }) editNC: ElementRef;

    constructor(
        private tosterService: CustomToastrService,
        private assessmentAuditService: AssessmentAuditService,
        private commonService: CommonServices
    ) {}

    ngOnChanges() {
        this.nonConformities = this.initialState;
    }

    ngOnInit() {
        // Non conformity template data
        this.assessmentAuditService.getNonConformityTemplate().subscribe(
            resp => {
                this.nonConformitiesTemplate = resp.data.non_conformance_categories;
            },
            error => this.tosterService.error('Something went wrong', 'Error')
        );

        // Non conformity List state
        this.editSubscription = this.ncEditEvent.subscribe(data => {
            this.editMode = false;
            this.editReqData = data;
            switch (data.type) {
                case 'delete':
                    this.doDelete(data);
                    break;
                case 'update':
                    this.doEdit(data);
                    break;
                case 'address':
                    this.doAddress(data);
                    break;
                default:
                    break;
            }
        });

        // Non conformity // priority template data
        this.assessmentAuditService.getAuditPriorities().subscribe(
            data => {
                this.auditPriorities = data.nc_priority;
            },
            error => this.tosterService.error('Something went wrong!!!', 'Error')
        );
    }

    customStatusValidation(item: any): boolean {
        return item.status === 'ACTIVE';
    }

    validateCategory(): boolean {
        const subCategories = this.getSubcategories();
        const category = this.nonConformitiesForm.controls.category.value.value;
        if (!category) {
            this.tosterService.info('Please select valid main category');
            return false;
        }
        if (!subCategories.hasOwnProperty('length') || subCategories.length === 0) {
            this.tosterService.info(
                this.commonService.getTranslation('Please add Subcategory to ') +
                    `${this.nonConformitiesForm.controls.category.value.value}` +
                    this.commonService.getTranslation('and continue'),
                this.commonService.getTranslation('No Subcategories for ') +
                    `${this.nonConformitiesForm.controls.category.value.value}.`
            );
            return false;
        } else {
            return true;
        }
    }

    formStatus(): boolean {
        if (this.editMode) {
            return false;
        }
        if (this.nonConformitiesForm.controls['category'].touched) {
            if (this.nonConformitiesForm.controls.category.value !== null) {
                return false;
            }
            return true;
        }
        return true;
    }

    getSubcategories(): Array<any> {
        const category = this.nonConformitiesForm.controls.category.value;
        if (category !== null && category !== undefined && category.hasOwnProperty('id')) {
            const id = category.id;
            let subCategories = [];
            subCategories = this.nonConformitiesTemplate.find(main => main.id === id).subCategories;
            if (subCategories) {
                return subCategories;
            }
        }
        return [];
    }

    validateFormData(): boolean {
        if (!this.validateCategory()) {
            return false;
        }

        if (!this.nonConformitiesForm.valid) {
            this.tosterService.info(`
            Please fill all the mandatory fields with valid option and continue`);
            return false;
        }

        if (
            this.nonConformitiesForm.value.category !== null &&
            this.nonConformitiesForm.value.subCategory !== null &&
            this.nonConformitiesForm.value.priority !== null &&
            this.nonConformitiesForm.value.nonConformity !== null &&
            this.nonConformitiesForm.value.nonConformity.trim() !== ''
        ) {
            return true;
        } else {
            this.tosterService.info(`
            Please fill all the mandatory fields and continue`);
        }
        return false;
    }

    onSubmit(): void {
        const nc = this.nonConformitiesForm.value;
        if (!this.validateFormData()) {
            return;
        }
        if (this.editMode) {
            this.onEdit(nc);
            return;
        }
        if (this.isEditPage) {
            this.btnStatus = true;

            const categoryId = nc.category.id;
            const subCategoryId = nc.subCategory.subCategoryId;
            const priorityId = nc.priority.categoryId;
            this.assessmentAuditService
                .createSubCategoryNonConformity(this.auditId, categoryId, subCategoryId, nc.nonConformity, priorityId)
                .subscribe(
                    (resp: any) => {
                        const nc = resp.data.nonConformityList;
                        this.nonConformities = this.mapEditData(nc);
                        this.nonConformitiesUpdated.emit(this.nonConformities);
                        this.tosterService.success('Non conformity added successfully', 'Success');
                        this.nonConformitiesForm.reset();
                        this.btnStatus = false;
                    },
                    error => {
                        this.tosterService.error('something went wrong', 'Error');
                    }
                );
        } else {
            this.doAddNc(nc);
        }
    }

    doAddNc(nc: any): void {
        const mainCategoryIndex = this.categoryIsExists(nc.category.value);
        if (mainCategoryIndex === undefined) {
            const ncFinal: INonConformities = {
                catergoryId: nc.category.id,
                categoryName: nc.category.value,
                subCategories: [
                    {
                        status: nc.subCategory.status,
                        subCategoryId: nc.subCategory.subCategoryId,
                        value: nc.subCategory.value,
                        subNCData: [
                            {
                                addedOn: new Date(),
                                priorityId: nc.priority.categoryId,
                                status: 'ACTIVE',
                                value: nc.nonConformity,
                                priorityValue: nc.priority.categoryName
                            }
                        ]
                    }
                ]
            };

            this.nonConformities.push(ncFinal);
        } else {
            const subCategoryIndex = this.subCategoryIsExists(mainCategoryIndex, nc.subCategory.value);
            if (subCategoryIndex === undefined) {
                const ncSubcategoryFinal: IsubCategories = {
                    status: nc.subCategory.status,
                    subCategoryId: nc.subCategory.subCategoryId,
                    value: nc.subCategory.value,
                    subNCData: [
                        {
                            addedOn: new Date(),
                            priorityId: nc.priority.categoryId,
                            status: 'ACTIVE',
                            value: nc.nonConformity,
                            priorityValue: nc.priority.categoryName
                        }
                    ]
                };
                this.nonConformities[mainCategoryIndex].subCategories.push(ncSubcategoryFinal);
            } else {
                const ncsubNCData: IsubNCData = {
                    addedOn: new Date(),
                    priorityId: nc.priority.categoryId,
                    status: 'ACTIVE',
                    value: nc.nonConformity,
                    priorityValue: nc.priority.categoryName
                };

                this.nonConformities[mainCategoryIndex].subCategories[subCategoryIndex].subNCData.push(ncsubNCData);
            }
        }
        this.nonConformitiesUpdated.emit(this.nonConformities);
        this.nonConformitiesForm.reset();
    }

    categoryIsExists(categoryName: string): number {
        const index = this.nonConformities
            .map((data, i) => (data.categoryName === categoryName ? i : undefined))
            .find(x => x !== undefined);
        return index;
    }

    subCategoryIsExists(mainCategoryIndex: number, subCategoryName: string): number {
        const index = this.nonConformities[mainCategoryIndex].subCategories
            .map((data, i) => (data.value === subCategoryName ? i : undefined))
            .find(x => x !== undefined);
        return index;
    }

    private filterMain(category: string) {
        const DATA = this.nonConformitiesTemplate.find(data => data.id === category);
        if (DATA) {
            return DATA;
        } else {
            return null;
        }
    }

    private filterSubcatecory(category: any, subCategory: string) {
        const DATA = category.subCategories.find(data => data.subCategoryId === subCategory);
        if (DATA) {
            return DATA;
        } else {
            return null;
        }
    }

    private filterPriority(priority: string) {
        if (!priority) {
            return null;
        }
        const DATA = this.auditPriorities.find(data => data.categoryId === priority);
        if (DATA) {
            return DATA;
        } else {
            return null;
        }
    }

    noCategoryToster(): void {
        this.tosterService.info(
            `This Non-Conformity cannot be edited since the main/sub category has been deleted. Kindly delete and recreate the Non-Conformity`,
            'Info'
        );
        this.editMode = false;
    }

    private doEdit(data: IupdateModel): void {
        const category = this.filterMain(this.nonConformities[data.mainIndex].catergoryId);
        const ncValue = this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex].value;
        if (!category) {
            this.noCategoryToster();
            return;
        }
        const subCategory = this.filterSubcatecory(
            category,
            this.nonConformities[data.mainIndex].subCategories[data.subIndex].subCategoryId
        );
        if (!subCategory) {
            this.noCategoryToster();
            return;
        }

        this.nonConformitiesForm.setValue({
            category: category,
            subCategory: subCategory,
            priority: this.filterPriority(
                this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex].priorityId
            ),
            nonConformity: ncValue ? ncValue : ''
        });

        this.editMode = true;
        setTimeout(() => {
            this.nonConformitiesForm.patchValue({
                subCategory
            }); // initially subcategory list is empty /after category selection it will patch
            this.editNC.nativeElement.focus();
        }, 10);
    }

    private doDelete(data: IupdateModel): void {
        if (this.auditId === '') {
            this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData.splice(data.ncIndex, 1);

            if (this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData.length === 0) {
                this.nonConformities[data.mainIndex].subCategories.splice(data.subIndex, 1);
            }

            if (this.nonConformities[data.mainIndex].subCategories.length === 0) {
                this.nonConformities.splice(data.mainIndex, 1);
            }

            this.nonConformitiesUpdated.emit(this.nonConformities);
        } else {
            this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex].isProgress = true;
            const nccId = this.nonConformities[data.mainIndex].catergoryId;
            const sccId = this.nonConformities[data.mainIndex].subCategories[data.subIndex].subCategoryId;
            const sncId = this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex].id;

            this.assessmentAuditService.deleteNonConformitySubItem(this.auditId, nccId, sccId, sncId).subscribe(
                response => {
                    this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex].status =
                        'DELETED';
                    delete this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex][
                        'isProgress'
                    ];
                    this.tosterService.success('Deleted Successfully', 'Success');
                },
                responseError => {
                    this.tosterService.error('Something went wrong', 'Error');
                    delete this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex][
                        'isProgress'
                    ];
                }
            );
        }
    }

    private onEdit(nc: any): void {
        if (this.auditId === '') {
            this.nonConformities[this.editReqData.mainIndex].subCategories[this.editReqData.subIndex].subNCData[
                this.editReqData.ncIndex
            ].value = nc.nonConformity;

            this.nonConformities[this.editReqData.mainIndex].subCategories[this.editReqData.subIndex].subNCData[
                this.editReqData.ncIndex
            ].priorityValue = nc.priority.categoryName;

            this.nonConformities[this.editReqData.mainIndex].subCategories[this.editReqData.subIndex].subNCData[
                this.editReqData.ncIndex
            ].priorityId = nc.priority.categoryId;

            this.nonConformitiesUpdated.emit(this.nonConformities);
            this.nonConformitiesForm.reset();
            this.editMode = false;
        } else {
            this.nonConformities[this.editReqData.mainIndex].subCategories[this.editReqData.subIndex].subNCData[
                this.editReqData.ncIndex
            ].isProgress = true;
            const nccId = this.nonConformities[this.editReqData.mainIndex].catergoryId;
            const sccId = this.nonConformities[this.editReqData.mainIndex].subCategories[this.editReqData.subIndex]
                .subCategoryId;
            const sncId = this.nonConformities[this.editReqData.mainIndex].subCategories[this.editReqData.subIndex]
                .subNCData[this.editReqData.ncIndex].id;

            this.btnStatus = true;

            this.assessmentAuditService
                .updateNonConformitySubItem(
                    this.auditId,
                    nccId,
                    sccId,
                    sncId,
                    nc.nonConformity,
                    '',
                    false,
                    nc.priority.categoryId
                )
                .subscribe(
                    data => {
                        this.nonConformities[this.editReqData.mainIndex].subCategories[
                            this.editReqData.subIndex
                        ].subNCData[this.editReqData.ncIndex].value = nc.nonConformity;

                        this.nonConformities[this.editReqData.mainIndex].subCategories[
                            this.editReqData.subIndex
                        ].subNCData[this.editReqData.ncIndex].priorityValue = nc.priority.categoryName;

                        this.nonConformities[this.editReqData.mainIndex].subCategories[
                            this.editReqData.subIndex
                        ].subNCData[this.editReqData.ncIndex].priorityId = nc.priority.categoryId;

                        this.nonConformitiesUpdated.emit(this.nonConformities);
                        this.nonConformitiesForm.reset();
                        this.editMode = false;
                        this.btnStatus = false;
                        delete this.nonConformities[this.editReqData.mainIndex].subCategories[this.editReqData.subIndex]
                            .subNCData[this.editReqData.ncIndex]['isProgress'];
                        this.tosterService.success('Updated Successfully', 'Success');
                    },
                    error => {
                        this.tosterService.error('Something went wrong', 'Error');
                        delete this.nonConformities[this.editReqData.mainIndex].subCategories[this.editReqData.subIndex]
                            .subNCData[this.editReqData.ncIndex]['isProgress'];
                        this.btnStatus = false;
                    }
                );
        }
    }

    private doAddress(data: IupdateModel) {
        const initialState = this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex]
            .status;

        this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex].status =
            initialState === 'ACTIVE' ? 'IN_ACTIVE' : 'ACTIVE';

        this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[
            data.ncIndex
        ].updatedOn = new Date();
        this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex].isProgress = true;

        const auditId = this.auditId;

        const nccId = this.nonConformities[data.mainIndex].catergoryId;

        const sccId = this.nonConformities[data.mainIndex].subCategories[data.subIndex].subCategoryId;

        const newValue = '';
        const scId = this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex].id;

        const status = this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex].status;

        const updateStatus = true;
        this.nonConformitiesUpdated.emit(this.nonConformities);

        this.assessmentAuditService
            .updateNonConformitySubItem(auditId, nccId, sccId, scId, newValue, status, updateStatus)
            .subscribe(
                resp => {
                    delete this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex][
                        'isProgress'
                    ];
                    this.nonConformitiesUpdated.emit(this.nonConformities);
                    this.tosterService.success('Updated Successfully', 'Success');
                },
                error => {
                    delete this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[data.ncIndex][
                        'isProgress'
                    ];
                    this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[
                        data.ncIndex
                    ].status = this.nonConformities[data.mainIndex].subCategories[data.subIndex].subNCData[
                        data.ncIndex
                    ].status = initialState;
                    this.nonConformitiesUpdated.emit(this.nonConformities);
                    this.tosterService.error('Something went wrong', 'Error');
                }
            );
    }

    mapEditData(data: any): Array<INonConformities> {
        const finalNC: Array<INonConformities> = [];

        data.forEach(data => {
            let main = {
                categoryName: '',
                catergoryId: '',
                subCategories: []
            };
            main.categoryName = data.categoryName;
            main.catergoryId = data.catergoryId;

            if (data.subCategoryNonConformityViewList) {
                data.subCategoryNonConformityViewList.forEach(sub => {
                    let subcat = {
                        subCategoryId: '',
                        value: '',
                        subNCData: []
                    };
                    subcat.subCategoryId = sub.subCategoryId;
                    subcat.value = sub.subCategoryName;

                    if (sub.subNCData) {
                        sub.subNCData.forEach(nc => {
                            let subnc = {
                                addedOn: new Date(),
                                value: '',
                                updatedOn: '',
                                priorityId: '',
                                priorityValue: '',
                                status: '',
                                id: ''
                            };
                            subnc.addedOn = nc.addedOn;
                            subnc.id = nc.id;
                            subnc.value = nc.value;
                            subnc.updatedOn = nc.updatedOn;
                            subnc.priorityId = nc.priorityId;
                            subnc.priorityValue = this.getPriority(nc.priorityId).categoryName;
                            subnc.status = nc.status;
                            subcat.subNCData.push(subnc);
                        });
                    }
                    main.subCategories.push(subcat);
                });
            }
            finalNC.push(main);
        });
        return finalNC;
    }
    getPriority(id: string): IAuditPriority {
        const resp = {
            categoryId: null,
            categoryName: 'NA',
            ncDeadlineValue: null,
            ncDeadLineUnit: null,
            mailReminderValue: null,
            mailReminderUnit: null,
            status: 'IN_ACTIVE'
        };
        if (id === undefined || id === '' || id === null) {
            return resp;
        }
        const filteredValue = this.auditPriorities.find(data => data.categoryId === id);
        if (filteredValue) {
            return filteredValue;
        } else {
            return resp;
        }
    }

    ngOnDestroy() {
        this.editSubscription.unsubscribe();
    }
}
