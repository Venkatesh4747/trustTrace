import { AuthService } from './../../core/user/auth.service';
import { TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { environment as env } from '../../../environments/environment';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { AssessmentsService } from '../assessments-launched/assessments.service';
import { AssessmentTemplateService } from './assessment-template.service';
import {
    IGetSupplierListPayload,
    SupplierListTypes
} from '../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { SuppliersService } from '../suppliers/suppliers.service';
import { Subscription } from 'rxjs';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-questionnaires',
    templateUrl: './assessment-template.component.html',
    styleUrls: ['./assessment-template.component.scss']
})
export class AssessmentTemplateComponent implements OnInit, AfterViewInit {
    public env = env;
    questionnaire_status = {
        standard: 0,
        material: 0,
        valueProcess: 0,
        group: 0,
        level: 0
    };

    searchText = '';
    defaultSrc = '';
    questionnaires = [];
    selectedSupplierTab = true;
    searchSupplierTerm: string;
    searchFacilityTerm: string;
    suppliers = [];
    facilities = [];
    markedSuppliers = [];
    selectedSuppliers = [];
    markedFacilities = [];
    selectedFacilities = [];

    selectedQuestions = 0;
    filterQuestionsHeading = [];
    options = [];

    questionnaireModalReady = false;

    isCreateQuestionnaire = 'create';

    currentQuestionnaire = null;
    currentQuestionnaireId = null;

    selectedFilters = {};
    allSelected = {};

    pageLoading = true;

    response = [];
    modalSavingBusy = false;
    modalLaunchingBusy = false;

    minDate = new Date();
    bsValue: Date = new Date();
    colorTheme = 'theme-blue';
    bsConfig: Partial<BsDatepickerConfig>;

    sideNavigation;

    selectedQuestionsLoading = true;

    createQuestionnaireId: string;

    questionnaire_status_enabled = environment.config.questionnaire_band;

    surveyDataReady = false;
    survey_groups_1: any;
    selectedSurveyGroupTab: number;
    selectedSubGroupTab;
    selectedGroupName;
    selectedTabName;
    survey;
    survey_groups = [];
    survey_sub_groups = [];

    allowDeleteQuestions = false;

    templateLoading = [];

    supplierListIsLoading = false;
    getSuppliersSubscriptions: Subscription;
    keyStrokeTimer: ReturnType<typeof setTimeout>;

    private GET_SUPPLIER_LIST_PAYLOAD: IGetSupplierListPayload = {
        filter: {
            SupplierAssociationStatus: [SupplierListTypes.accepted_supplier, SupplierListTypes.unAccepted_supplier]
        },
        sort: {
            sortBy: 'create_ts',
            sortOrder: 'asc'
        },
        pagination: {
            from: 0,
            size: 1000
        }
    };

    @ViewChild('createQuestionnaireModal', { static: false }) createQuestionnaireModal;
    @ViewChild('launchQuestionnaireModal', { static: false }) launchQuestionnaireModal;
    @ViewChild('templateInfoModal', { static: false }) templateInfoModal;
    @ViewChild('viewQuestionsModal', { static: true }) viewQuestionsModal;
    @ViewChild('surveyQuestionContainer', { static: false }) surveyQuestionContainer;

    filterStep: number;
    scrollPosition = [];
    viewQuestionsLoading = false;
    deletedQuestions = [];
    surveyDeletedQuestions = [];
    surveyMandatoryQuestions = [];
    showQuestionsLoading = false;
    surveySelectedQuestions: Array<any>;
    mandatoryQuestions = [];
    excludedQuestions = [];
    supplierStatusCustomImgStyle = {
        marginTop: '-5px'
    };

    public get getImage() {
        return this.utilService.getGroupImageUrl.bind(this.utilService);
    }

    constructor(
        private titleService: Title,
        private qs: AssessmentTemplateService,
        private assessmentService: AssessmentsService,
        private toastr: CustomToastrService,
        private titleCase: TitleCasePipe,
        private sideNav: SideNavigationService,
        private analyticsService: AnalyticsService,
        private localizationService: LocalizationService,
        private utilService: UtilsService,
        private supplierService: SuppliersService,
        private auth: AuthService
    ) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Questionnaires');
    }

    ANALYTICS_EVENT_PAGE = 'Assessments-Questionnaire';
    ANALYTICS_ACTION_VIEW_ACTION = 'Assessment-Questionnaire Page viewed';
    isOpenViewQuestionsModal: boolean;

    ngOnInit() {
        let analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_VIEW_ACTION;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_PAGE, analyticsOptions);
        this.filterStep = 0;

        this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
        this.defaultSrc = this.utilService.getGroupImageUrl('gr_social');

        this.qs.getAll().subscribe(
            response => {
                const data = response.data;
                this.questionnaire_status = {
                    standard: 0,
                    material: 0,
                    valueProcess: 0,
                    group: 0,
                    level: 0
                };
                if (data.hasOwnProperty('distinct_classifications_of_company')) {
                    this.questionnaire_status.material = data.distinct_classifications_of_company.material.length;
                    this.questionnaire_status.valueProcess =
                        data.distinct_classifications_of_company.valueProcess.length;
                    this.questionnaire_status.group = data.distinct_classifications_of_company.group.length;
                    this.questionnaire_status.level = data.distinct_classifications_of_company.level.length;
                }

                this.options = data.classifications_metadata;
                this.localizationService.addToMasterData(data.masterData);
                // let j = 0;
                // for (const key in data.classifications_metadata) {
                //   if (data.classifications_metadata.hasOwnProperty(key)) {
                //     if (key === 'MATERIAL') {
                //       // this.filterCounter = j;
                //       // this.materialState = j;
                //     }
                //     // this.filterQuestionsHeading.push({
                //     //   id: key,
                //     //   value: key.replace(/_/g, ' ').toLowerCase()
                //     // });
                //     j++;
                //   }
                // }

                this.filterQuestionsHeading.push({
                    id: 'MATERIAL',
                    value: 'Material',
                    type: 'Material'
                });

                this.filterQuestionsHeading.push({
                    id: 'VALUE_PROCESS',
                    value: 'Value Process',
                    type: 'Value Process'
                });

                this.filterQuestionsHeading.push({
                    id: 'SUB_GROUP',
                    value: 'Sub Group',
                    type: 'Sub Group'
                });

                this.filterQuestionsHeading.push({
                    id: 'LEVEL',
                    value: 'Difficulty Level',
                    type: 'Level'
                });

                this.questionnaires = data.questionnaire;

                for (let i = 0; i < this.questionnaires.length; i++) {
                    this.questionnaires[i]['nameShort'] = this.questionnaires[i].name.substring(0, 25);
                    if (this.questionnaires[i].hasOwnProperty('description')) {
                        this.questionnaires[i]['descriptionShort'] = this.questionnaires[i].description.substring(
                            0,
                            30
                        );
                    }
                }

                this.questionnaireModalReady = true;

                this.pageLoading = false;
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                }
                this.pageLoading = false;
            }
        );

        this.assessmentService.getSuppliersFacilities().subscribe(response => {
            const data = response.data;
            // this.suppliers = data.supplier;
            this.facilities = data.facility;
        });

        this.getSuppliers();

        this.viewQuestionsModal.onHide.subscribe(() => {
            this.isOpenViewQuestionsModal = false;
            this.allowDeleteQuestions = false;
        });
    }

    getSuppliers(searchKey: String = null) {
        const payload = JSON.parse(JSON.stringify(this.GET_SUPPLIER_LIST_PAYLOAD));

        if (searchKey) {
            payload['freeHand'] = searchKey;
        }
        this.suppliers = [];
        this.supplierListIsLoading = true;

        this.getSuppliersSubscriptions = this.supplierService.getAllSuppliers(payload).subscribe(
            (response: any) => {
                this.suppliers = response['data']['searchResponse'];
                this.supplierListIsLoading = false;
            },
            error => {
                this.supplierListIsLoading = false;
                if (error.error.message) {
                    this.toastr.error(error.error.message, 'Error');
                } else {
                    this.toastr.error('Unable to fetch supplier list', 'Internal server error');
                }
            }
        );
    }

    onSupplierSearch(searchValue: string = '') {
        this.getSuppliersSubscriptions.unsubscribe();
        clearTimeout(this.keyStrokeTimer);
        this.supplierListIsLoading = true;

        this.keyStrokeTimer = setTimeout(() => {
            if (searchValue.trim() === '') {
                this.getSuppliers(null);
                return;
            }
            this.getSuppliers(searchValue);
        }, 500);
    }

    public refreshQuestionnaires(launch: boolean = false) {
        this.pageLoading = true;
        this.qs.getAll().subscribe(
            response => {
                const data = response.data;
                this.questionnaires = data.questionnaire;
                this.pageLoading = false;
                if (data.hasOwnProperty('distinct_classifications_of_company')) {
                    this.questionnaire_status.material = data.distinct_classifications_of_company.material.length;
                    this.questionnaire_status.valueProcess =
                        data.distinct_classifications_of_company.valueProcess.length;
                    this.questionnaire_status.group = data.distinct_classifications_of_company.group.length;
                    this.questionnaire_status.level = data.distinct_classifications_of_company.level.length;
                }

                if (launch) {
                    this.openLaunchQuestionnaireModal(this.getQuestionnaireById(this.createQuestionnaireId));
                }

                for (let i = 0; i < this.questionnaires.length; i++) {
                    this.questionnaires[i]['nameShort'] = this.questionnaires[i].name.substring(0, 25);
                    if (this.questionnaires[i].hasOwnProperty('description')) {
                        this.questionnaires[i]['descriptionShort'] = this.questionnaires[i].description.substring(
                            0,
                            30
                        );
                    }
                }
                // this.toastr.success('Questionnaires Updated');
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error('Oops! Could not retrieve questionnaire list');
            }
        );
    }

    public launchQuestionnaire() {
        const selectedFilters =
            this.selectedFilters &&
            this.selectedFilters['valueProcess'] &&
            this.selectedFilters['valueProcess'].length > 0;
        // Validation
        // if (!this.response['questionnaire_name'] || this.response['questionnaire_name'] === ' ') {
        //   this.toastr.error('Please fill questionnaire name');
        //   return;
        // }

        // if (!this.response['assessment_name'] || this.response['assessment_name'] === ' ') {
        //   this.toastr.error('Please fill assessment name');
        //   return;
        // }
        if (this.selectedSuppliers.length === 0 && this.selectedFacilities.length === 0) {
            this.toastr.error('Please select atleast one supplier or facility to launch the assessment to.');
            return;
        }
        if (
            !this.response['target_date'] ||
            this.response['target_date'] === '' ||
            !(Object.prototype.toString.call(this.response['target_date']) === '[object Date]') ||
            isNaN(this.response['target_date'].getTime())
        ) {
            this.toastr.error('Please fill date');
            return;
        }

        let vpToAssess = selectedFilters ? this.selectedFilters['valueProcess'] : this.options['VALUE_PROCESS'];

        if (!vpToAssess) {
            vpToAssess = [];
        }

        const payload = {
            questionnaire: {
                name: this.response['questionnaire_name'],
                description: this.response['questionnaire_description'],
                classificationFilter: this.selectedFilters
            },
            assessment: {
                dueDate: new Date(this.response['target_date']).getTime(),
                name: this.response['assessment_name']
            },
            assessmentToCreate: [
                {
                    supplier: this.selectedSuppliers.map(a => a.supplier_id),
                    facility: this.selectedFacilities.map(a => a.id),
                    vpToAssess: vpToAssess
                }
            ]
        };

        if (this.isCreateQuestionnaire === 'launch' || this.isCreateQuestionnaire === 'edit') {
            payload.questionnaire['id'] = this.currentQuestionnaireId;
        }

        this.modalLaunchingBusy = true;

        this.assessmentService.launchAssessment(payload).subscribe(
            response => {
                if (this.isCreateQuestionnaire === 'create') {
                    this.toastr.success('Questionnaire created & Assessment launched');
                } else {
                    this.toastr.success('Assessment launched');
                    this.launchQuestionnaireModal.hide();
                }
                this.analyticsService.trackEvent('Assessment Launched', { Origin: 'Template - Create and Launch' });
                this.createQuestionnaireModal.hide();
                this.refreshQuestionnaires();
                this.modalLaunchingBusy = false;
            },
            failResponse => {
                this.modalLaunchingBusy = false;
                this.toastr.error('Oops! The requested action failed.');
            }
        );
    }

    ngAfterViewInit() {}

    public filterCount(slideDirection, isCreateQuestionnaire) {
        if (
            (isCreateQuestionnaire === 'create' || isCreateQuestionnaire === 'edit') &&
            (!this.selectedFilters.hasOwnProperty('material') || this.selectedFilters['material'].length <= 0)
        ) {
            this.toastr.error('Please choose one or more materials to proceed');
            return false;
        } else if (!this.selectedFilters.hasOwnProperty('material') || this.selectedFilters['material'].length <= 0) {
            this.toastr.info('No material selected');
            return false;
        }

        if (slideDirection === 'left') {
            this.filterStep--;
            if (this.filterStep < 0) {
                this.filterStep = this.filterQuestionsHeading.length - 1;
            }
        } else if (
            slideDirection === 'right' &&
            Array.isArray(this.selectedFilters['material']) &&
            this.selectedFilters['material'].length > 0
        ) {
            if (this.filterStep === 0) {
                this.qs.getValueProcess(this.selectedFilters['material']).subscribe(response => {
                    const data = response.data;
                    this.options['VALUE_PROCESS'] = data.valueProcess;
                });
            } else if (this.filterStep === 1) {
                if (!this.selectedFilters['valueProcess'] || !Array.isArray(this.selectedFilters['valueProcess'])) {
                    this.selectedFilters['valueProcess'] = [];
                }
                this.qs
                    .getSubGroup(this.selectedFilters['material'], this.selectedFilters['valueProcess'])
                    .subscribe(response => {
                        const data = response.data;
                        this.options['SUB_GROUP'] = data.subGroup;
                    });
            }
            this.filterStep++;
            // if (this.filterCounter > (this.filterQuestionsHeading.length - 1)) {
            //   this.filterCounter = 0;
            // }
        }
    }

    public checkFilter(event, title, option) {
        const filter_title = title;
        title = title.replace('_', ' ');
        title = this.titleCase.transform(title);
        title = title.replace(/\s/g, '');
        title = title[0].toLowerCase() + title.substring(1);

        if (!this.selectedFilters.hasOwnProperty(title)) {
            this.selectedFilters[title] = [];
        }
        if (option) {
            const optionExists = this.selectedFilters[title].indexOf(option);
            if (!event.target.checked) {
                this.selectedFilters[title].splice(optionExists, 1);
                this.allSelected[filter_title] = false;
            } else {
                this.selectedFilters[title].push(option);
                // if (_.isEqual(this.selectedFilters[title], this.options[filter_title])) {
                //   this.allSelected[filter_title] = true;
                // }
            }
        } else {
            if (!event.target.checked) {
                this.selectedFilters[title] = [];
                this.allSelected[filter_title] = false;
                this.options[filter_title].map(_option => (this.response[_option] = false));
            } else {
                this.selectedFilters[title] = this.options[filter_title];
                this.allSelected[filter_title] = true;
                this.options[filter_title].map(_option => (this.response[_option] = true));
            }
        }

        this.selectedQuestionsLoading = true;

        this.qs.getQuestionCount(this.selectedFilters).subscribe(
            response => {
                const data = response.data;
                this.deletedQuestions = [];
                if (!this.mandatoryQuestions) {
                    this.mandatoryQuestions = [];
                }
                this.surveyMandatoryQuestions = [];
                this.surveyDeletedQuestions = [];
                this.selectedQuestions = data.question_count;
                this.selectedQuestionsLoading = false;
            },
            failResponse => {
                console.log(failResponse);
                this.selectedQuestionsLoading = false;
            }
        );
    }

    toCamelCase(str) {
        return str
            .split(' ')
            .map(function(word, index) {
                // If it is the first word make sure to lowercase all the chars.
                if (index === 0) {
                    return word.toLowerCase();
                }
                // If it is not the first word only upper case the first char and lowercase the rest.
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');
    }

    public onSaveQuestionnaire(response, questionnaire_id, launch) {
        if (launch) {
            this.modalLaunchingBusy = true;
        } else {
            this.modalSavingBusy = true;
        }
        // Validation
        if (!this.response['questionnaire_name'] || this.response['questionnaire_name'] === ' ') {
            this.toastr.error('Please fill template name');
            this.modalLaunchingBusy = false;
            this.modalSavingBusy = false;
            return;
        }

        const selectedFiltersMaterial =
            this.selectedFilters && this.selectedFilters['material'] && this.selectedFilters['material'].length > 0;

        if (!selectedFiltersMaterial) {
            this.toastr.error('Please select atleast one material to create the assessment');
            this.modalLaunchingBusy = false;
            this.modalSavingBusy = false;
            return;
        }

        const payload = {
            questionnaire: {
                name: response['questionnaire_name'],
                description: response['questionnaire_description'],
                classificationFilter: this.selectedFilters,
                mandatoryQuestions: this.mandatoryQuestions
            },
            excludedQuestions: this.deletedQuestions
        };

        if (this.deletedQuestions.length === 0 && this.currentQuestionnaireId) {
            payload.excludedQuestions = JSON.parse(JSON.stringify(this.excludedQuestions));
        }

        if (questionnaire_id) {
            payload['id'] = questionnaire_id;
            payload['questionnaire']['id'] = questionnaire_id;
        }

        this.qs.createQuestionnaire(payload).subscribe(
            resp => {
                this.deletedQuestions = [];
                this.mandatoryQuestions = [];
                this.surveyMandatoryQuestions = [];
                this.selectedQuestions = 0;
                this.surveyDeletedQuestions = [];
                const data = resp.data;
                if (launch) {
                    this.modalLaunchingBusy = false;
                } else {
                    this.modalSavingBusy = false;
                }
                this.createQuestionnaireModal.hide();
                if (!questionnaire_id) {
                    this.createQuestionnaireId = data.id;
                    this.toastr.success('Questionnaire created');
                } else {
                    this.createQuestionnaireId = payload['id'];
                    this.toastr.success('Questionnaire updated');
                }
                this.refreshQuestionnaires(launch);
            },
            failResponse => {
                if (launch) {
                    this.modalLaunchingBusy = false;
                } else {
                    this.modalSavingBusy = false;
                }
                this.toastr.error('Oops! Questionnaire could not be created.');
            }
        );
        this.allSelected = {};
    }

    getQuestionnaireById(questionnaire_id) {
        let questionnaire = '';
        this.questionnaires.forEach(value => {
            if (value.id === questionnaire_id) {
                questionnaire = value;
            }
        });

        return questionnaire;
    }

    openTemplateInfoModal(questionnaire) {
        this.currentQuestionnaire = questionnaire;
        this.selectedFilters = [];
        this.selectedQuestions = null;
        for (const key in questionnaire.classificationFilter) {
            if (questionnaire.classificationFilter.hasOwnProperty(key)) {
                questionnaire.classificationFilter[key].forEach(value => {
                    if (!Array.isArray(this.selectedFilters[key])) {
                        this.selectedFilters[key] = [];
                    }
                    this.selectedFilters[key].push(value);
                });
            }
        }

        this.selectedQuestionsLoading = true;
        this.qs.getQuestionCount(this.selectedFilters).subscribe(
            response => {
                const data = response.data;
                this.selectedQuestions = data.question_count;
                this.selectedQuestionsLoading = false;
            },
            failResponse => {
                console.log(failResponse);
                this.selectedQuestionsLoading = false;
            }
        );

        this.templateInfoModal.show();
    }

    openCreateQuestionnaireModel(isCreateQuestionnaire = true, questionnaire = {}) {
        if (this.auth.haveAccess('ASSESSMENT_CREATE')) {
            this.filterStep = 0;
            this.response = [];
            this.allSelected = {};
            this.selectedQuestions = 0;
            this.selectedFilters = {};
            this.deletedQuestions = [];
            this.excludedQuestions = [];
            this.isCreateQuestionnaire = isCreateQuestionnaire ? 'create' : 'edit';
            this.createQuestionnaireModal.show();

            // Update selected questions count
            this.selectedQuestionsLoading = true;

            if (!isCreateQuestionnaire) {
                this.qs.getQuestionnaire(questionnaire['id']).subscribe(questionnaireResponse => {
                    this.currentQuestionnaireId = questionnaireResponse.id;

                    if (questionnaireResponse.hasOwnProperty('excludedQuestions')) {
                        this.excludedQuestions = JSON.parse(JSON.stringify(questionnaireResponse.excludedQuestions));
                        this.deletedQuestions = JSON.parse(JSON.stringify(questionnaireResponse.excludedQuestions));
                    }

                    if (questionnaireResponse.hasOwnProperty('mandatoryQuestions')) {
                        this.mandatoryQuestions = JSON.parse(JSON.stringify(questionnaireResponse.mandatoryQuestions));
                    }

                    this.response['questionnaire_name'] = questionnaireResponse.name;
                    this.response['questionnaire_description'] = questionnaireResponse.description;

                    this.surveySelectedQuestions = questionnaireResponse.question;

                    for (const key in questionnaireResponse.classificationFilter) {
                        if (questionnaireResponse.classificationFilter.hasOwnProperty(key)) {
                            questionnaireResponse.classificationFilter[key].forEach(value => {
                                if (!Array.isArray(this.selectedFilters[key])) {
                                    this.selectedFilters[key] = [];
                                }
                                this.selectedFilters[key].push(value);
                                this.response[value] = true;
                            });
                        }
                    }

                    this.qs.getQuestions(this.selectedFilters).subscribe(response => {
                        const data = response.data['questions'];
                        const question = data['question'];
                    });

                    this.selectedQuestions = questionnaireResponse.totalQuestions;
                    this.selectedQuestionsLoading = false;
                });
            } else {
                this.currentQuestionnaireId = null;

                this.filterStep = 0;
                this.response = [];
                this.allSelected = {};
                this.selectedQuestions = 0;
                this.selectedFilters = {};

                this.qs.getQuestionCount(this.selectedFilters).subscribe(
                    response => {
                        const data = response.data;
                        this.selectedQuestions = data.question_count;
                        this.selectedQuestionsLoading = false;
                    },
                    failResponse => {
                        console.log(failResponse);
                        this.selectedQuestionsLoading = false;
                    }
                );
            }
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    openLaunchQuestionnaireModal(questionnaire) {
        if (this.auth.haveAccess('ASSESSMENT_CREATE')) {
            this.response = [];
            this.filterStep = 0;
            this.selectedQuestions = 0;
            this.selectedFilters = {};
            this.markedSuppliers = [];
            this.selectedSuppliers = [];
            this.markedFacilities = [];
            this.selectedFacilities = [];
            this.currentQuestionnaireId = questionnaire.id;
            this.response['questionnaire_name'] = questionnaire.name;
            this.response['questionnaire_description'] = questionnaire.description;
            for (const key in questionnaire.classificationFilter) {
                if (questionnaire.classificationFilter.hasOwnProperty(key)) {
                    questionnaire.classificationFilter[key].forEach(value => {
                        if (!Array.isArray(this.selectedFilters[key])) {
                            this.selectedFilters[key] = [];
                        }
                        this.selectedFilters[key].push(value);
                        this.response[value] = true;
                    });
                }
            }

            this.selectedQuestionsLoading = true;
            this.qs.getQuestionCount(this.selectedFilters).subscribe(
                response => {
                    const data = response.data;
                    this.selectedQuestions = data.question_count;
                    this.selectedQuestionsLoading = false;
                },
                failResponse => {
                    console.log(failResponse);
                    this.selectedQuestionsLoading = false;
                }
            );

            this.isCreateQuestionnaire = 'launch';
            this.launchQuestionnaireModal.show();
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    openEditQuestionnaireModal(questionnaire) {
        if (this.auth.haveAccess('ASSESSMENT_UPDATE')) {
            if (questionnaire.status !== 'OPEN') {
                this.toastr.error('Launched assessment-template cannot be edited.');
                return;
            }
            this.response = [];
            this.filterStep = 0;
            this.selectedQuestions = 0;
            this.selectedFilters = {};
            this.currentQuestionnaireId = questionnaire.id;
            this.response['questionnaire_name'] = questionnaire.name;
            this.response['questionnaire_description'] = questionnaire.description;
            for (const key in questionnaire.classificationFilter) {
                if (questionnaire.classificationFilter.hasOwnProperty(key)) {
                    questionnaire.classificationFilter[key].forEach(value => {
                        this.response[value] = true;
                        if (!Array.isArray(this.selectedFilters[key])) {
                            this.selectedFilters[key] = [];
                        }
                        this.selectedFilters[key].push(value);
                    });
                }
            }

            this.selectedQuestionsLoading = true;
            this.qs.getQuestionCount(this.selectedFilters).subscribe(
                response => {
                    const data = response.data;
                    this.selectedQuestions = data.question_count;
                    this.selectedQuestionsLoading = false;
                },
                failResponse => {
                    console.log(failResponse);
                    this.selectedQuestionsLoading = false;
                }
            );

            // init questionnaire data
            this.isCreateQuestionnaire = 'edit';
            this.createQuestionnaireModal.show();
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    deleteQuestionnaire(questionnaire) {
        if (this.auth.haveAccess('ASSESSMENT_UPDATE')) {
            if (questionnaire.status !== 'OPEN') {
                this.toastr.error('Launched assessment-template cannot be deleted.');
                return;
            }
            this.qs.deleteQuestionnaire(questionnaire.id).subscribe(
                response => {
                    const data = response.data;
                    this.toastr.success('Questionnaire has been deleted');
                    this.refreshQuestionnaires();
                },
                failResponse => {
                    this.toastr.error('Oops! There was a problem in deleting the questionnaire.');
                }
            );
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    triggerCheckbox(id, i) {
        const el = document.getElementById(id + '-' + i);
        el.click();
    }

    deleteSelectedSupplier(supplierId: string) {
        this.selectedSuppliers = this.selectedSuppliers.filter(item => {
            return item.supplier_id !== supplierId;
        });
        this.markedSuppliers[supplierId] = false;
    }

    onSelectSupplier(element: any, event: any, supplierId: string, thrash: boolean) {
        if (this.selectedSuppliers === undefined) {
            this.selectedSuppliers = [];
        } else {
            const existing_supplier = this.selectedSuppliers.find(o => o.supplier_id === supplierId);
            if (existing_supplier) {
                this.deleteSelectedSupplier(supplierId);
                return;
            }
        }

        if (!thrash) {
            const supplier = this.suppliers.find(o => o.supplier_id === supplierId);
            if (supplier) {
                this.selectedSuppliers.push(supplier);
                this.markedSuppliers[supplierId] = true;
            } else {
                this.deleteSelectedSupplier(supplierId);
            }
        } else {
            this.deleteSelectedSupplier(supplierId);
        }
    }

    deleteSelectedFacility(facilityId: string) {
        this.selectedFacilities = this.selectedFacilities.filter(item => {
            return item.id !== facilityId;
        });
        this.markedFacilities[facilityId] = false;
    }

    onSelectFacility(element: any, event: any, facilityId: string, thrash: boolean) {
        const existing_facility = this.selectedFacilities.find(o => o.id === facilityId);
        if (existing_facility) {
            this.deleteSelectedFacility(facilityId);
            return;
        }

        if (!thrash) {
            const facility = this.facilities.find(o => o.id === facilityId);
            if (facility) {
                this.selectedFacilities.push(facility);
                this.markedFacilities[facilityId] = true;
            } else {
                this.deleteSelectedFacility(facilityId);
            }
        } else {
            this.deleteSelectedFacility(facilityId);
        }
    }

    // viewQuestionsModal related methods

    checkScrollPosition(currentTabIndex, nextTabIndex, currentGroupIndex, nextGroupIndex) {
        if (!Array.isArray(this.scrollPosition[currentGroupIndex])) {
            this.scrollPosition[currentGroupIndex] = [];
        }

        if (this.surveyQuestionContainer) {
            this.scrollPosition[currentGroupIndex][
                currentTabIndex
            ] = this.surveyQuestionContainer.nativeElement.scrollTop;
        }

        if (!Array.isArray(this.scrollPosition[nextGroupIndex])) {
            this.scrollPosition[nextGroupIndex] = [];
        }

        if (!this.scrollPosition[nextGroupIndex][nextTabIndex]) {
            this.scrollPosition[nextGroupIndex][nextTabIndex] = 0;
        }

        if (this.surveyQuestionContainer) {
            setTimeout(() => {
                this.surveyQuestionContainer.nativeElement.scrollTop = this.scrollPosition[nextGroupIndex][
                    nextTabIndex
                ];
            });
        }
    }

    changeSurveyGroupTab(nextGroupIndex: number, groupName: string) {
        const currentGroupIndex = this.selectedSurveyGroupTab;

        this.selectedSurveyGroupTab = nextGroupIndex;
        this.selectedGroupName = groupName;

        if (!Array.isArray(this.selectedSubGroupTab)) {
            this.selectedSubGroupTab = [];
        }

        if (!this.selectedSubGroupTab[this.selectedSurveyGroupTab]) {
            this.selectedSubGroupTab[this.selectedSurveyGroupTab] = 0;
            this.selectedTabName = this.survey_sub_groups[this.selectedSurveyGroupTab][0];
        } else {
            this.selectedTabName = this.survey_sub_groups[this.selectedSurveyGroupTab][
                this.selectedSubGroupTab[this.selectedSurveyGroupTab]
            ];
        }

        const currentTabIndex = this.selectedSubGroupTab[currentGroupIndex];
        const nextTabIndex = this.selectedSubGroupTab[nextGroupIndex];

        this.checkScrollPosition(currentTabIndex, nextTabIndex, currentGroupIndex, nextGroupIndex);

        if (this.surveyQuestionContainer && this.surveyQuestionContainer.nativeElement) {
            this.surveyQuestionContainer.nativeElement.focus();
        }
    }

    changeSubGroupTab(nextTabIndex: number, tabName: string) {
        const currentTabIndex = this.selectedSubGroupTab[this.selectedSurveyGroupTab];

        if (!Array.isArray(this.selectedSubGroupTab)) {
            this.selectedSubGroupTab = [];
        }

        this.selectedSubGroupTab[this.selectedSurveyGroupTab] = nextTabIndex;
        this.selectedTabName = tabName;

        this.checkScrollPosition(
            currentTabIndex,
            nextTabIndex,
            this.selectedSurveyGroupTab,
            this.selectedSurveyGroupTab
        );

        if (this.surveyQuestionContainer && this.surveyQuestionContainer.nativeElement) {
            this.surveyQuestionContainer.nativeElement.focus();
        }
    }

    viewQuestions() {
        this.allowDeleteQuestions = true;
        this.viewQuestionsLoading = true;
        this.surveyDataReady = false;
        this.qs.getQuestions(this.selectedFilters).subscribe(
            response => {
                const data = response.data['questions'];
                const question = data['question'];

                this.localizationService.addToMasterData(response.data.masterData);
                const count = data['count'];

                if (count['total']['question'] === 0) {
                    this.toastr.error('The assessment does not contain any questions');
                    return;
                }

                this.survey = data['question'];
                this.survey_groups = Object.keys(this.survey);
                this.survey_groups_1 = data['count'];

                this.survey_sub_groups = [];

                for (let i = 0; i < this.survey_groups.length; i++) {
                    this.survey_sub_groups.push(Object.keys(this.survey[this.survey_groups[i]]));
                }

                if (this.currentQuestionnaireId) {
                    for (const groupName in question) {
                        if (question.hasOwnProperty(groupName)) {
                            for (const subGroupName in question[groupName]) {
                                if (question[groupName].hasOwnProperty(subGroupName)) {
                                    question[groupName][subGroupName].forEach((_question, index) => {
                                        if (this.mandatoryQuestions.indexOf(_question.id) !== -1) {
                                            this.surveyMandatoryQuestions[_question.id] = true;
                                        }
                                        if (this.excludedQuestions.indexOf(_question.id) !== -1) {
                                            this.selectedGroupName = groupName;
                                            this.selectedTabName = subGroupName;
                                            this.surveyDeletedQuestions[_question.id] = true;
                                            this.onDeleteQuestion({ id: _question.id, status: true });
                                        }
                                    });
                                }
                            }
                        }
                    }
                }

                this.surveyDataReady = true;

                this.changeSurveyGroupTab(0, this.survey_groups[0]);
                this.changeSubGroupTab(0, this.survey_sub_groups[0][0]);

                this.createQuestionnaireModal.hide();
                this.viewQuestionsLoading = false;
                this.isOpenViewQuestionsModal = true;
                this.viewQuestionsModal.show();
            },
            failResponse => {
                this.viewQuestionsLoading = false;
            }
        );
    }

    onDeleteQuestion(question_id) {
        if (!question_id) {
            this.toastr.error('Unable to delete question.');
            return;
        }
        if (question_id.status) {
            this.survey_groups_1[this.selectedGroupName].total.question--;
            this.survey_groups_1[this.selectedGroupName][this.selectedTabName].question--;
            if (this.deletedQuestions.indexOf(question_id.id) === -1) {
                this.deletedQuestions.push(question_id.id);
            }
        } else {
            this.survey_groups_1[this.selectedGroupName].total.question++;
            this.survey_groups_1[this.selectedGroupName][this.selectedTabName].question++;
            if (this.deletedQuestions.indexOf(question_id.id) !== -1) {
                this.deletedQuestions.splice(this.deletedQuestions.indexOf(question_id.id), 1);
            }
        }
    }

    onQuestionMarkedMandatory(question) {
        if (!question) {
            this.toastr.error('Unable to mark question as mandatory.');
            return;
        }
        if (question.status) {
            if (this.mandatoryQuestions.indexOf(question.id) === -1) {
                this.mandatoryQuestions.push(question.id);
            }
        } else {
            if (this.mandatoryQuestions.indexOf(question.id) !== -1) {
                this.mandatoryQuestions.splice(this.mandatoryQuestions.indexOf(question.id), 1);
            }
        }
    }

    openShowQuestionsModal(templateId) {
        this.templateLoading[templateId] = true;
        this.showQuestionsLoading = true;
        this.qs.getTemplateQuestions(templateId).subscribe(
            response => {
                this.templateLoading[templateId] = false;
                const data = response.data['questions'];
                const count = data['count'];

                if (count['total']['question'] === 0) {
                    this.toastr.error('The assessment does not contain any questions');
                    return;
                }

                this.selectedQuestions = count['total']['question'];

                this.survey = data['question'];
                this.survey_groups = Object.keys(this.survey);
                this.survey_groups_1 = data['count'];

                this.survey_sub_groups = [];

                for (let i = 0; i < this.survey_groups.length; i++) {
                    this.survey_sub_groups.push(Object.keys(this.survey[this.survey_groups[i]]));
                }

                this.surveyDataReady = true;

                this.changeSurveyGroupTab(0, this.survey_groups[0]);
                this.changeSubGroupTab(0, this.survey_sub_groups[0][0]);

                this.showQuestionsLoading = false;

                this.isOpenViewQuestionsModal = true;

                this.viewQuestionsModal.show();
            },
            failResponse => {
                this.toastr.error('The template is obsolete or corrupted. Please create a new template');
                this.templateLoading[templateId] = false;
                this.showQuestionsLoading = false;
            }
        );
    }

    resetFilter() {
        this.filterStep = 0;
        this.selectedFilters = {};
        this.response = [];
        this.allSelected = {};
        this.selectedQuestionsLoading = true;

        this.qs.getQuestionCount(this.selectedFilters).subscribe(
            response => {
                const data = response.data;
                this.deletedQuestions = [];
                this.mandatoryQuestions = [];
                this.surveyMandatoryQuestions = [];
                this.surveyDeletedQuestions = [];
                this.selectedQuestions = data.question_count;
                this.selectedQuestionsLoading = false;
            },
            failResponse => {
                console.log(failResponse);
                this.selectedQuestionsLoading = false;
            }
        );
    }
}
