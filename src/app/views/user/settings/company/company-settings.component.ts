import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { zip } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SideNavigationService } from '../../../../shared/side-navigation/side-navigation.service';
import { AuditService } from './audit.service';
import { CompanySettingsService } from './company-settings.service';
import { AnalyticsService } from '../../../../core/analytics/analytics.service';
import { LocalizationService } from '../../../../shared/utils/localization.service';
import { AuthService } from '../../../../core';
import { filter } from 'rxjs/operators';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { HiggModalComponent } from '../../../../shared/modals/higg-modal/higg-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { HiggService } from '../../../../shared/commonServices/higg.service';
import { IHiggApiKey, IHiggSavedApiKey } from '../../../../shared/models/higg.model';
import { tabNames } from './company-settings.model';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

@Component({
    selector: 'app-settings',
    templateUrl: './company-settings.component.html',
    styleUrls: ['./company-settings.component.scss']
})
export class CompanySettingsComponent implements OnInit {
    sideNavigation;
    pageLoading = false;
    askEditConfirm: Boolean = true;
    askDeleteConfirm: Boolean = true;
    isCardDataStatusExists: Boolean = true;
    tabs = tabNames;
    settingsType = 'style';
    token: String = 'Loading...';
    settingCategories = [
        'Product Category',
        'Color Specifications',
        'Season',
        'Recurring Type',
        'Sustainability Labels'
    ];
    productCategories = [];
    colors = [];
    seasons = [];
    sustainabilityLabels = [];
    recurringTypes = [];
    step = 0;
    nonConformanceCategories = [];
    nonConformanceSubCategories: FormArray;
    nonConformanceCategoryForm: FormGroup;
    isProcessing = {
        nonConformanceCategoryForm: false
    };
    isEditing = {
        nonConformanceCategoryForm: false,
        auditPriorityForm: false,
        oldNonConformanceCategory: {
            id: '',
            value: '',
            status: ''
        },
        oldAuditPriority: {
            categoryId: '',
            status: ''
        }
    };
    env = environment;
    timeUnits = [];
    auditValidity: {
        number: '';
        timeUnit: '';
    };

    ncPriorities = [];

    auditExpirationForm: FormGroup;
    auditPriorityForm: FormGroup;

    sustainabilityLabelCondition = {
        complianceLabel: true
    };
    higgApiKey = new FormControl('', [Validators.required, Validators.minLength(3)]);

    @ViewChild('nonConformanceCategoryNameER', { static: false }) nonConformanceCategoryNameER: ElementRef;
    @ViewChild('priorityCategoryNameER', { static: false }) priorityCategoryNameER: ElementRef;
    @ViewChild('nonConformanceCategoryFGD', { static: false }) nonConformanceCategoryFGD: FormGroupDirective;
    @ViewChild('auditExpirationFormFGD', { static: false }) auditExpirationFormFGD: FormGroupDirective;
    @ViewChild('auditPriorityFormFGD', { static: false }) auditPriorityFormFGD: FormGroupDirective;
    private deletedSubCategories: any;
    private addSubCategories: any;

    constructor(
        private titleService: Title,
        private sideNav: SideNavigationService,
        private settingService: CompanySettingsService,
        private auditService: AuditService,
        private toastrService: CustomToastrService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private analyticsService: AnalyticsService,
        public localizationService: LocalizationService,
        private auth: AuthService,
        private dialog: MatDialog,
        private higgService: HiggService
    ) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Settings');
        this.nonConformanceSubCategories = this.formBuilder.array([]);
        this.nonConformanceCategoryForm = this.formBuilder.group({
            nonConformanceCategoryName: ['', [Validators.required]],
            nonConformanceSubCategories: this.nonConformanceSubCategories
        });

        this.auditExpirationForm = this.formBuilder.group({
            quantity: ['', [Validators.required]],
            unit: ['', [Validators.required]]
        });

        this.auditPriorityForm = this.formBuilder.group({
            priorityCategoryName: ['', [Validators.required]],
            deadlineValue: ['', [Validators.required]],
            deadlineUnit: ['', [Validators.required]],
            reminderValue: ['', [Validators.required]],
            reminderUnit: ['', [Validators.required]]
        });

        // Open tab by query parameter. (https://url?tab=audit|style)
        this.route.queryParams.pipe(filter(params => params.tab)).subscribe(params => {
            switch (params.tab) {
                case this.tabs.styleSettings:
                    this.settingsType = 'style';
                    break;
                case this.tabs.auditSettings:
                    this.settingsType = 'audit';
                    break;
                case this.tabs.apiSettings:
                    this.settingsType = 'api';
                    break;
                case this.tabs.integrationSettings:
                    this.settingsType = 'integration';
                    break;
                default:
                    this.toastrService.info('The specified tab does not exist!', 'Invalid tab name');
                    break;
            }
        });
    }

    get authServiceHaveAccess(): (accessType: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    addSubCategoryInputField(id = '', status = 'ACTIVE', value = '') {
        this.nonConformanceSubCategories.push(
            this.formBuilder.group({
                subCategoryId: this.formBuilder.control(id),
                value: this.formBuilder.control(value),
                status: this.formBuilder.control(status)
            })
        );
    }

    removeSubCategoryInputField(index) {
        if (this.isEditing.nonConformanceCategoryForm) {
            const subCategoryId = this.nonConformanceSubCategories.at(index).value.subCategoryId;
            this.deletedSubCategories.push(
                this.auditService.deleteNonConformanceSubCategory(
                    this.isEditing.oldNonConformanceCategory.id,
                    subCategoryId
                )
            );
        }
        this.nonConformanceSubCategories.removeAt(index);
    }

    sort(data: any, sortOrder: SortOrder = SortOrder.ASC) {
        if (sortOrder === 'ASC') {
            // sorts in ascending
            return data.sort((a, b) => (a.value > b.value ? 1 : -1));
        } else {
            // sorts in descending
            return data.sort((a, b) => (a.value > b.value ? -1 : 1));
        }
    }

    ngOnInit() {
        this.pageLoading = true;
        this.pageLoad(this.settingsType);
    }

    initStyleSettingsPage() {
        this.settingService.getStyleSettings().subscribe(resp => {
            if (resp.data.data && resp.data.data.styleSettings) {
                this.productCategories = resp.data.data.styleSettings.productCategories;
                if (this.productCategories == null) {
                    this.productCategories = [];
                }
                this.colors = resp.data.data.styleSettings.colors;
                if (this.colors == null) {
                    this.colors = [];
                }
                this.seasons = resp.data.data.styleSettings.seasons;
                if (this.seasons == null) {
                    this.seasons = [];
                }
                this.sustainabilityLabels = resp.data.data.styleSettings.sustainabilityLabels;
                if (this.sustainabilityLabels == null) {
                    this.sustainabilityLabels = [];
                }
                this.recurringTypes = resp.data.data.styleSettings.recurringTypes;
                if (this.recurringTypes == null) {
                    this.recurringTypes = [];
                }
            }
            this.pageLoading = false;
        });
    }

    initAuditPage() {
        this.getHiggApiKey();

        this.auditService.getAuditSettings().subscribe(
            auditSettingsResponse => {
                this.nonConformanceCategories = this.sort(
                    JSON.parse(JSON.stringify(auditSettingsResponse)),
                    SortOrder.ASC
                );
                this.pageLoading = false;
            },
            auditSettingsErrorResponse => {
                this.toastrService.error(
                    'There was an error fetching data from the server. Please try refreshing the page.',
                    'Error fetching data'
                );
                this.pageLoading = false;
            }
        );

        this.settingService.getAuditValidityAndConfig().subscribe(
            auditValidityResponse => {
                const data = auditValidityResponse['data'];
                this.localizationService.addToMasterData(data['masterData']);
                this.timeUnits = data['time_unit'];
                this.auditValidity = data['expiring_soon'];
                this.auditExpirationForm = this.formBuilder.group({
                    quantity: this.formBuilder.control(this.auditValidity.number),
                    unit: this.formBuilder.control(this.auditValidity.timeUnit)
                });
                this.pageLoading = false;
            },
            auditValidityErrorResponse => {
                this.toastrService.error(
                    'There is an error for fetching data from the server. Please try refreshing the page.',
                    'Error fetching data'
                );
                this.pageLoading = false;
            }
        );

        this.settingService.getAuditPriorities().subscribe(
            auditPriorityResponse => {
                const data = auditPriorityResponse['data'];
                // this.localizationService.addToMasterData(data['masterData']);
                // this.timeUnits = data['time_unit'];
                this.ncPriorities = data['nc_priority'];
                this.pageLoading = false;
            },
            auditPriorityErrorResponse => {
                this.toastrService.error(
                    'There is an error for fetching data from the server. Please try refreshing the page.',
                    'Error fetching data'
                );
                this.pageLoading = false;
            }
        );
    }

    setStep(index: number) {
        this.step = index;
    }

    isDuplicatesInSubCategories(subCategories): boolean {
        const subCategoriesArray = subCategories.map(data => data.value);
        let isDuplicatePresent = false;
        subCategoriesArray.forEach(subCategory => {
            if (subCategoriesArray.filter(data => data === subCategory).length > 1) {
                isDuplicatePresent = true;
                return;
            }
        });
        return isDuplicatePresent;
    }

    createCategory() {
        // If form is not valid, return with notification to user to fix validation errors displayed in the respective fields
        if (!this.nonConformanceCategoryForm.valid) {
            this.toastrService.error('Please correct the errors in the form to proceed.', 'Error');
            return;
        }

        const newNonConformanceCategoryName = this.nonConformanceCategoryForm.value.nonConformanceCategoryName;
        const newNonConformanceSubCategories = this.nonConformanceCategoryForm.value.nonConformanceSubCategories;

        if (this.isDuplicatesInSubCategories(newNonConformanceSubCategories)) {
            this.toastrService.error(
                'A non-conformance sub category with the same name exists.',
                'Error: Duplicate Entry'
            );
            return;
        }

        // If edit request then direct to respective handler functiond
        if (this.isEditing.nonConformanceCategoryForm) {
            this.editNonConformanceCategoryName(newNonConformanceCategoryName, newNonConformanceSubCategories);
            return;
        }

        // Check for duplicate entries and return with error notification to user
        const isDuplicate = this.nonConformanceCategories.find(
            ncc => ncc.value.toLowerCase() === newNonConformanceCategoryName.toLowerCase()
        );

        if (!!isDuplicate) {
            this.toastrService.error('A non-conformance category with the same name exists.', 'Error: Duplicate Entry');
            return;
        }

        const subCategories = [];

        newNonConformanceSubCategories.forEach(subCategory => {
            subCategories.push({
                value: subCategory.value
            });
        });

        const payload = {
            value: newNonConformanceCategoryName,
            subCategories: subCategories
        };

        this.isProcessing.nonConformanceCategoryForm = true;

        // Final move: call the api to create the new category.
        this.auditService.createAuditNonConformanceCategory(payload).subscribe(
            createNonConformanceCategoryResponse => {
                this.isProcessing.nonConformanceCategoryForm = false;

                this.nonConformanceCategories = this.sort(
                    JSON.parse(JSON.stringify(createNonConformanceCategoryResponse)),
                    SortOrder.ASC
                );
                this.resetNonConformanceCategoryForm(false);
                this.toastrService.success(
                    'Non-conformance category ' + newNonConformanceCategoryName + ' has been created.',
                    'Success'
                );
            },
            createNonConformanceCategoryErrorResponse => {
                this.toastrService.error(
                    'The non-conformance category ' +
                        newNonConformanceCategoryName +
                        ' could not be created. Please try again after some time or contact us if the problem persists.',
                    'Error'
                );
                this.isProcessing.nonConformanceCategoryForm = false;
            }
        );
    }

    ANALYTICS_EVENT_COMPANY_SETTINGS = 'Company Settings - ';
    ANALYTICS_ACTION_COMPANY_SETTINGS_VIEWED = 'Company Settings Viewed';
    pageLoad(pageName: string) {
        this.settingsType = pageName;

        const analyticsOptions = {};
        analyticsOptions[
            this.analyticsService.PROPERTY_ACTION_PERFORMED
        ] = this.ANALYTICS_ACTION_COMPANY_SETTINGS_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_COMPANY_SETTINGS + this.settingsType, analyticsOptions);
        if (pageName === 'audit') {
            this.initAuditPage();
        } else if (pageName === 'api') {
            this.initAPISettingPage();
        } else if (pageName === 'style') {
            this.initStyleSettingsPage();
        } else {
            this.pageLoading = false;
        }
    }

    hasError(controlName: string, errorName: string) {
        return this.nonConformanceCategoryForm.controls[controlName].hasError(errorName);
    }

    resetNonConformanceCategoryForm(showToastr = true) {
        this.nonConformanceCategoryFGD.resetForm();
        this.nonConformanceCategoryForm.reset();
        this.deletedSubCategories = [];
        this.nonConformanceSubCategories = this.formBuilder.array([]);
        this.nonConformanceCategoryForm = this.formBuilder.group({
            nonConformanceCategoryName: ['', [Validators.required]],
            nonConformanceSubCategories: this.nonConformanceSubCategories
        });
        if (showToastr) {
            this.toastrService.success('The form has been cleared and reset.', 'Form Reset');
        }
        this.isEditing.nonConformanceCategoryForm = false;
    }

    editNonConformanceCategoryName(nonConformanceCategoryName, nonConformanceSubCategories) {
        if (!this.isEditing.nonConformanceCategoryForm) {
            return;
        }

        if (this.isDuplicatesInSubCategories(nonConformanceSubCategories)) {
            this.toastrService.error(
                'A non-conformance sub category with the same name exists.',
                'Error: Duplicate Entry'
            );
            return;
        }

        this.isProcessing.nonConformanceCategoryForm = true;

        if (this.nonConformanceCategoryForm.pristine && this.deletedSubCategories.length <= 0) {
            this.toastrService.info('Nothing to update', 'No changes');
            this.isProcessing.nonConformanceCategoryForm = false;
            return;
        }

        const newSubCategories = nonConformanceSubCategories.filter(data => data.subCategoryId === '');
        const subCategoriesHttp = [];

        this.isEditing.oldNonConformanceCategory['subCategories'].forEach(subCategory => {
            nonConformanceSubCategories.forEach(sc => {
                if (sc.subCategoryId === subCategory.subCategoryId && sc.value !== subCategory.value) {
                    subCategoriesHttp.push(
                        this.auditService.updateAuditNonConformanceSubCategory(
                            this.isEditing.oldNonConformanceCategory.id,
                            sc.subCategoryId,
                            sc.value
                        )
                    );
                }
            });
        });

        if (this.deletedSubCategories.length > 0) {
            this.deletedSubCategories.forEach(deleteSubCategory => {
                subCategoriesHttp.push(deleteSubCategory);
            });
        }

        if (newSubCategories.length > 0) {
            const newSubCategoriesPayload = [];
            newSubCategories
                .map(data => data.value)
                .forEach(subCategory => {
                    newSubCategoriesPayload.push({ value: subCategory });
                });

            subCategoriesHttp.push(
                this.auditService.createAuditNonConformanceSubCategory(
                    this.isEditing.oldNonConformanceCategory.id,
                    newSubCategoriesPayload
                )
            );
        }

        if (this.isEditing.oldNonConformanceCategory.value !== nonConformanceCategoryName) {
            subCategoriesHttp.push(
                this.auditService.updateAuditNonConformanceCategory(
                    this.isEditing.oldNonConformanceCategory.id,
                    nonConformanceCategoryName
                )
            );
        }

        zip(...subCategoriesHttp).subscribe(
            response => {
                this.toastrService.success('Non-conformance category has been updated', 'Success');
                this.resetNonConformanceCategoryForm(false);
                this.isProcessing.nonConformanceCategoryForm = false;
                this.initAuditPage();
            },
            errorResponse => {
                this.isProcessing.nonConformanceCategoryForm = false;
                this.resetNonConformanceCategoryForm(false);
                this.toastrService.success('Non-conformance category has been updated', 'Success');
                this.toastrService.info('Duplicate sub categories were discarded', 'Duplicates Discarded');
                this.initAuditPage();
            }
        );
    }

    updateCategoryName(nonConformanceCategoryName) {
        this.auditService
            .updateAuditNonConformanceCategory(this.isEditing.oldNonConformanceCategory.id, nonConformanceCategoryName)
            .subscribe(
                response => {
                    this.toastrService.success('Non-conformance category has been updated', 'Success');
                    this.resetNonConformanceCategoryForm(false);
                    this.isProcessing.nonConformanceCategoryForm = false;
                    this.initAuditPage();
                },
                errorResponse => {
                    if (errorResponse.status === 409) {
                        this.toastrService.error(
                            'A non conformance category with the same name exists.',
                            'Duplicate entry'
                        );
                    } else {
                        this.toastrService.error(
                            'There seems to be a problem. Please contact support if the problem persists',
                            'Oops!'
                        );
                    }
                    this.isProcessing.nonConformanceCategoryForm = false;
                }
            );
    }

    enableEditNonConformanceCategoryName(nonConformanceCategory: any) {
        this.resetNonConformanceCategoryForm(false);
        this.isProcessing.nonConformanceCategoryForm = false;
        if (!nonConformanceCategory.hasOwnProperty('subCategories')) {
            nonConformanceCategory['subCategories'] = [];
        }
        this.isEditing.oldNonConformanceCategory = JSON.parse(JSON.stringify(nonConformanceCategory));
        this.isEditing.nonConformanceCategoryForm = true;
        this.nonConformanceCategoryForm.patchValue({
            nonConformanceCategoryName: nonConformanceCategory.value
        });
        if (nonConformanceCategory.hasOwnProperty('subCategories') && nonConformanceCategory.subCategories.length > 0) {
            nonConformanceCategory.subCategories.forEach(subCategory => {
                this.addSubCategoryInputField(subCategory.subCategoryId, subCategory.status, subCategory.value);
            });
        }
        this.nonConformanceCategoryNameER.nativeElement.focus();
    }

    enableEditNCPriority(ncPriority: any) {
        this.isEditing.auditPriorityForm = true;
        this.isEditing.oldAuditPriority.categoryId = ncPriority.categoryId;
        this.isEditing.oldAuditPriority.status = ncPriority.status;
        this.auditPriorityForm.patchValue({
            priorityCategoryName: ncPriority.categoryName,
            deadlineValue: ncPriority.ncDeadlineValue,
            deadlineUnit: ncPriority.ncDeadLineUnit,
            reminderValue: ncPriority.mailReminderValue,
            reminderUnit: ncPriority.mailReminderUnit
        });
        this.priorityCategoryNameER.nativeElement.focus();
    }

    deleteNonConformanceCategoryName(nonConformanceCategory: any) {
        this.auditService.deleteAuditNonConformanceCategory(nonConformanceCategory.id).subscribe(
            deleteNonConformanceCategoryResponse => {
                this.toastrService.success(
                    'Non-conformance category ' + nonConformanceCategory.value + ' has been removed',
                    'Success'
                );
                this.nonConformanceCategories = this.sort(
                    JSON.parse(JSON.stringify(deleteNonConformanceCategoryResponse)),
                    SortOrder.ASC
                );
            },
            deleteNonConformanceCategoryErrorResponse => {
                this.toastrService.error(
                    'The non-conformance category ' +
                        +' could not be deleted. Please try after some time or contact us.',
                    'Error'
                );
            }
        );
    }

    saveAuditExpiration() {
        const auditExpiryData = this.auditExpirationForm.value;
        const payload = {
            number: auditExpiryData.quantity,
            timeUnit: auditExpiryData.unit
        };
        this.settingService.saveAuditValidity(payload).subscribe(
            response => {
                this.auditValidity = response['data']['expiring_soon'];
                this.toastrService.success('Audit validity has been updated', 'Success');
            },
            errorResponse => {
                this.toastrService.error('There seems to be problem ,Please contact support if problem persists');
            }
        );
    }

    saveAuditPriority() {
        const auditPriorityData = this.auditPriorityForm.value;
        const payload = {
            categoryName: auditPriorityData.priorityCategoryName,
            ncDeadlineValue: auditPriorityData.deadlineValue,
            ncDeadLineUnit: auditPriorityData.deadlineUnit,
            mailReminderValue: auditPriorityData.reminderValue,
            mailReminderUnit: auditPriorityData.reminderUnit
        };
        if (this.isEditing.auditPriorityForm) {
            this.editNCPriority(payload);
            return;
        }
        this.settingService.saveAuditPriority(payload).subscribe(
            response => {
                this.ncPriorities = response['data']['nc_priority'];
                this.toastrService.success('Non Conformity Priority has been updated', 'Success');
                this.resetAuditPriorityForm();
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.toastrService.error('A priority category with the same name exists.', 'Duplicate entry');
                } else {
                    this.toastrService.error('There seems to be problem ,Please contact support if problem persists');
                }
            }
        );
    }

    editNCPriority(ncPriority: any) {
        ncPriority.categoryId = this.isEditing.oldAuditPriority.categoryId;
        ncPriority.status = this.isEditing.oldAuditPriority.status;
        this.settingService.updateAuditPriority(ncPriority, this.isEditing.oldAuditPriority.categoryId).subscribe(
            response => {
                this.toastrService.success('Non-conformance priority category has been updated', 'Success');
                this.isEditing.auditPriorityForm = false;
                this.initAuditPage();
                this.resetAuditPriorityForm();
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.toastrService.error('A priority category with the same name exists.', 'Duplicate entry');
                } else {
                    this.toastrService.error('There seems to be problem ,Please contact support if problem persists');
                }
            }
        );
    }

    deleteNCPriority(ncPriority: any) {
        this.settingService.deleteAuditPriority(ncPriority.categoryId).subscribe(
            response => {
                this.toastrService.success('Non-conformance priority category has been deleted', 'Success');
                this.initAuditPage();
            },
            errorResponse => {
                this.toastrService.error(
                    'There seems to be a problem. Please contact support if the problem persists',
                    'Oops!'
                );
            }
        );
    }

    checkPriorityError(controlName: string, errorName: string) {
        return this.auditPriorityForm.controls[controlName].hasError(errorName);
    }

    resetAuditExpirationForm() {
        this.auditExpirationFormFGD.resetForm();
        this.auditExpirationForm.reset();
    }

    resetAuditPriorityForm() {
        this.isEditing.auditPriorityForm = false;
        this.auditPriorityFormFGD.resetForm();
        this.auditPriorityForm.reset();
    }

    initAPISettingPage() {
        this.auth.getAuthToken().subscribe(
            resp => {
                this.token = resp.data;
                this.pageLoading = false;
            },
            errorResponse => {
                this.toastrService.error(
                    'There was an error fetching data from the server. Please try refreshing the page.',
                    'Error fetching data'
                );
                this.pageLoading = false;
            }
        );
    }
    /**
     * @method copyUrl
     * @param inputElement
     */
    copyUrl(inputElement: any): void {
        inputElement.select();
        document.execCommand('copy');
        inputElement.setSelectionRange(0, 0);
        this.toastrService.success('Clipboard updated');
    }

    /**
     * @desc - Link TT platform with higg using higg api key
     */
    higgLinkAccount(): void {
        this.pageLoading = true;
        this.higgService.saveApiKey(this.higgApiKey.value).subscribe(
            (higgSaveApiResponse: IHiggSavedApiKey) => {
                if (higgSaveApiResponse.higgApiStatusCode === 200) {
                    this.pageLoading = false;
                    this.toastrService.success('Please wait', higgSaveApiResponse.message);
                    setTimeout(() => {
                        this.router.navigate(['/assessment-audit']);
                    }, 100);
                } else {
                    this.pageLoading = false;
                    this.toastrService.error(higgSaveApiResponse.message, 'Error fetching data');
                }
            },
            errorResponse => {
                this.toastrService.error('There was an error saving higg data.', 'Error fetching data');
            }
        );
    }

    /**
     * @desc - Show higg modal for user info steps
     */
    showHiggStepsModal(): void {
        this.dialog.open(HiggModalComponent, {
            width: '650px',
            height: '800px',
            data: {
                type: 'showSteps'
            }
        });
    }

    /**
     * @desc - Get Higg Api key
     */
    getHiggApiKey(): void {
        if (this.authServiceHaveAccess('HIGG_CREATE')) {
            this.higgService.getApiKey().subscribe(
                (higgGetApiResponse: IHiggApiKey) => {
                    this.higgApiKey.setValue(higgGetApiResponse?.apiKey || null);
                },
                errorResponse => {
                    this.toastrService.error(
                        'There was an error fetching data from the server.',
                        'Error fetching data'
                    );
                }
            );
        }
    }
}
