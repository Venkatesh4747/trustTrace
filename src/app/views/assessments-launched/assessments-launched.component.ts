import { TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { environment as env } from '../../../environments/environment';
import { AuthService } from '../../core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { ResponseManagementService } from '../response-management/response-management.service';
import { AssessmentsService } from './assessments.service';
import * as FileSaver from 'file-saver';
import { SuppliersService } from '../suppliers/suppliers.service';
import {
    IGetSupplierListPayload,
    SupplierListTypes
} from '../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { Subscription } from 'rxjs';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { CommonServices } from './../../shared/commonServices/common.service';
import { ContextService } from './../../shared/context.service';
import { ISearchPayload } from '../assessments/assessments.model';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-assessments',
    templateUrl: './assessments-launched.component.html',
    styleUrls: ['./assessments-launched.component.scss']
})
export class AssessmentsLaunchedComponent implements OnInit, AfterViewInit {
    public env = env;

    searchText = '';

    answered = [];

    survey = '';

    value = '';

    defaultSrc = '';

    survey_groups = [];

    survey_sub_groups = [];

    survey_groups_1: any;

    survey_group_index = {};

    survey_sub_group_index = {};

    suppliers = [];
    facilities = [];

    selectedSuppliers = [];
    selectedFacilities = [];

    markedSuppliers = [];
    markedFacilities = [];

    searchSupplierTerm: string;
    searchFacilityTerm: string;

    assessment_status = {
        all: 0,
        unaccepted: 0,
        unopened: 0,
        inProgress: 0,
        inReview: 0,
        closed: 0
    };
    assessments = [];
    assessment = {
        id: '',
        name: '',
        status: '',
        totalQuestion: 0,
        totalAnswered: 0,
        companyName: '',
        facilityName: '',
        facilityId: '',
        responsesCount: 0,
        noOfResponses: '00',
        launchDate: '',
        dueDate: '',
        yourScore: 0,
        maxScore: 0,
        statusPercent: 0,
        vp: [],
        companyId: '',
        fromCompanyId: '',
        supplierAssociationStatus: 0
    };

    assessmentType = 'to';

    activeQuestionId;

    selectedVP = '';
    selectedSupplierTab = true;

    user = {};

    selectedSupplierFacility: any = {
        supplier: [],
        facility: [],
        vpToAssess: []
    };

    selectedSuppliersFacilities: Array<any> = [];

    pageLoading = true;
    processingLaunchAssessment = false;
    supplierFacilityModalReady = false;

    processingSurvey = false;

    // Survey Variables
    selectedSurveyGroupTab: number;
    selectedSubGroupTab;

    surveyDataReady = false;

    currentAssessmentId: string;
    currentFacilityId: string;
    currentSubQuestions = [];
    // Survey Variables

    selectedGroupName: string;
    selectedTabName: string;

    previewDataReady = true;
    previewDataLoading = [];

    previewResponses: any;

    currentAssessment: any;

    assessments_response: any;

    Math: any;

    previewLoading = false;

    assessmentResuming = [];
    assessmentStarting = [];
    assessmentAccepting = [];

    responses = [];

    sendingReminder = [];

    scrollPosition = [];
    sortby_session = 'assessment_launched_sort';
    filter_session = 'assessment_launched_filters';
    totalCountFlag = false;
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };
    closeSortByFilter = false;
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };
    totalCount = 0;
    disableInfiniteScroll = false;
    assessmentFilter = {};
    optionsParam = { key: 'id', value: 'value' };

    @ViewChild('supplierFacilityModal', { static: true }) supplierFacilityModal;
    @ViewChild('surveyModal', { static: true }) surveyModal;
    @ViewChild('previewModal', { static: true }) previewModal;
    @ViewChildren(TooltipDirective) tooltips: QueryList<TooltipDirective>;
    @ViewChild('surveyQuestionContainer', { static: false }) surveyQuestionContainer;
    @ViewChild('previewQuestionContainer', { static: false }) previewQuestionContainer;
    @ViewChild('subAssessmentsModal', { static: true }) subAssessmentsModal;
    @ViewChild('notificationsModal', { static: true }) notificationsModal;

    previewDataStats;
    previewQuestions;
    processingReminder;

    sideNavigation;
    SubAssessmentModalLoading = [];
    subAssessmentsModalDataReady = false;
    currentSubAssessments;
    notificationsModalDataReady: boolean;
    currentNotificationAssessmentId: string;
    notificationModalLoading = [];

    isCommentWindowValid = false;

    isAssessmentLauncher = false;
    filterByStatus = 'all';
    previewCompletionStat: any;
    height = 200;

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

    supplierListIsLoading = false;
    getSuppliersSubscriptions: Subscription;
    keyStrokeTimer: ReturnType<typeof setTimeout>;
    supplierStatusCustomImgStyle = {
        marginTop: '-5px'
    };

    public get getImage() {
        return this.utilService.getGroupImageUrl.bind(this.utilService);
    }
    constructor(
        private router: Router,
        private auth: AuthService,
        public assessmentService: AssessmentsService,
        private toastr: CustomToastrService,
        private utils: UtilsService,
        private titleService: Title,
        private titleCase: TitleCasePipe,
        private sideNav: SideNavigationService,
        private appContext: ContextService,
        public rmService: ResponseManagementService,
        private _scrollToService: ScrollToService,
        private analyticsService: AnalyticsService,
        private localeService: LocalizationService,
        private utilService: UtilsService,
        private supplierService: SuppliersService,
        private commonService: CommonServices
    ) {
        this.sideNavigation = this.sideNav;
        this.titleService.setTitle('TrusTrace | Assessments');
        if (!this.auth.loggedIn.value) {
            this.Math = Math;
            this.router.navigate(['/']);
        }
        this.user = auth.user;
    }

    static convertToDate(dateString: number): any {
        const d = new Date(dateString);

        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    }
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 75;
    }

    ANALYTICS_EVENT_PAGE = 'Assessments-Sent';
    ANALYTICS_ACTION_VIEW_ACTION = 'Assessment-Sent Page viewed';
    ngOnInit() {
        let analyticsOptions = {};
        if (this.utils.getSessionStorageValue(this.sortby_session)) {
            this.sortByFilter = this.commonService.getSortbyFilteredOptions(this.sortby_session);
        } else {
            this.setSortByFilter();
        }
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_VIEW_ACTION;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_PAGE, analyticsOptions);

        this.getSuppliersFacilities();
        this.getSuppliers();
        this.fetchFilters(this.getSearchPayload());
        this.changeAssessmentType('by');

        this.defaultSrc = this.utilService.getGroupImageUrl('gr_social');

        // Refresh assessment list on assessment modal close
        this.surveyModal.onHide.subscribe(() => {
            this.changeAssessmentType(this.assessmentType);
        });

        this.surveyModal.onShown.subscribe(() => {
            setTimeout(() => {
                this.surveyQuestionContainer.nativeElement.focus();
            });

            this.surveyQuestionContainer.nativeElement.blur(() => {
                setTimeout(() => {
                    this.surveyQuestionContainer.nativeElement.focus();
                });
            });
        });

        this.previewModal.onShown.subscribe(() => {
            setTimeout(() => {
                this.previewQuestionContainer.nativeElement.focus();
            });
        });
    }

    ngAfterViewInit() {
        // this.currentAssessmentId = 'b2090dc6-1a80-4bbb-8b0c-dc2296997f67';
        // this.openPreviewModal();
    }

    updateStatus(): void {
        this.assessmentService.getSurveyStatus(this.currentAssessmentId).subscribe(response => {
            this.survey_groups_1 = response.data.count;
        });
    }
    private getSearchPayload(): ISearchPayload {
        const payload: ISearchPayload = {
            filter: this.getFilteredOptions(),
            sort: this.commonService.getSortbyFilteredOptions(this.sortby_session),
            pagination: this.pagination
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        return payload;
    }

    getFilteredOptions(): { [key in string]: any } {
        const tempFilterOptions = {};
        const options = this.utils.getSessionStorageValue(this.filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }

        return tempFilterOptions;
    }

    openPreviewModal(assessment_id, assessment) {
        this.isCommentWindowValid =
            this.user['companyId'] === assessment.companyId || this.user['companyId'] === assessment.fromCompanyId;
        this.isAssessmentLauncher = this.user['companyId'] === assessment.fromCompanyId;
        this.currentAssessmentId = assessment_id;
        this.currentAssessment = assessment;
        this.previewDataReady = false;
        this.previewDataLoading[assessment_id] = true;

        this.tooltips.forEach(tooltip => {
            tooltip.hide();
        });

        this.assessmentService.fetchPreview(this.currentAssessmentId).subscribe(
            response => {
                const data = response.data;
                this.localeService.addToMasterData(data.masterData);
                if (data.question.length <= 0 || data.count.total.question === 0) {
                    this.toastr.error('The assessment does not contain questions', 'No Questions');
                    this.previewDataReady = true;
                    this.previewDataLoading[assessment_id] = false;
                    this.pageLoading = false;
                    return;
                } else {
                    this.previewCompletionStat = data.count;
                    this.previewDataStats = data.score;
                    this.previewQuestions = data.question;
                    this.previewResponses = data.response;
                    this.previewDataReady = true;
                    this.pageLoading = false;
                    this.previewDataLoading[assessment_id] = false;
                    this.notificationsModal.hide();
                    this.previewModal.show();
                }
            },
            failData => {
                this.previewDataLoading[assessment_id] = false;
                this.toastr.error('Something is wrong.', 'Oops!');
            }
        );
    }

    openAssessmentModal(status, index, assessmentId, assessment) {
        this.currentAssessment = assessment;
        this.currentAssessmentId = assessmentId;
        if (status === 'REQUEST') {
            this.openSupplierFacilityModal(index);
        } else if (status === 'OPEN' || status === 'IN_PROGRESS') {
            this.openSurveyModal(assessmentId, assessment);
        } else if (status === 'PREVIEW') {
            this.openPreviewModal(assessmentId, assessment);
        } else {
            this.toastr.error(
                'Please contact support to resolve the issue',
                'Assessment status is ' + assessment.status
            );
        }
    }

    computePercentage(a, b): any {
        if (b === 0) {
            return 'NA';
        }
        return Math.round((a / b) * 100) === 0 ? 'NA' : Math.round((a / b) * 100);
    }

    openSurveyModal(assessment_id: string, assessment) {
        this.isCommentWindowValid =
            this.user['companyId'] === assessment.companyId || this.user['companyId'] === assessment.fromCompanyId;
        this.scrollPosition = [];
        this.selectedSubGroupTab = [];

        if (assessment.status === 'IN_PROGRESS') {
            this.assessmentResuming[assessment_id] = true;
        } else if (assessment.status === 'OPEN') {
            this.assessmentStarting[assessment_id] = true;
        } else if (assessment.status === 'ACCEPT') {
            this.assessmentAccepting[assessment_id] = true;
        }
        this.currentAssessment = assessment;
        this.surveyDataReady = false;
        if (!assessment_id) {
            if (assessment.status === 'IN_PROGRESS') {
                this.assessmentResuming[assessment_id] = false;
            } else if (assessment.status === 'OPEN') {
                this.assessmentStarting[assessment_id] = false;
            } else if (assessment.status === 'ACCEPT') {
                this.assessmentAccepting[assessment_id] = false;
            }
            this.toastr.error('Something has gone wrong. Please try again after some time.', 'Oops!');
            return;
        }
        this.assessmentService.getSurveyQuestions(assessment_id).subscribe(
            response => {
                const data = response.data;
                this.localeService.addToMasterData(data.masterData);
                const count = data.count;

                if (count.total.question === 0) {
                    if (assessment.status === 'IN_PROGRESS') {
                        this.assessmentResuming[assessment_id] = false;
                    } else if (assessment.status === 'UNACCEPTED') {
                        this.assessmentAccepting[assessment_id] = false;
                    }
                    this.toastr.error('The assessment does not contain any questions', 'No Questions');
                    return;
                }
                this.survey = data.question;
                this.survey_groups = Object.keys(this.survey);
                this.survey_groups_1 = data.count;

                if (data.hasOwnProperty('response')) {
                    this.answered = data.response;
                }

                this.survey_sub_groups = [];
                this.survey_group_index = {};
                this.survey_sub_group_index = {};

                for (let i = 0; i < this.survey_groups.length; i++) {
                    this.survey_sub_groups.push(Object.keys(this.survey[this.survey_groups[i]]));

                    this.survey_group_index[this.survey_groups[i]] = i;
                    this.survey_sub_group_index[this.survey_groups[i]] = {};
                    for (let j = 0; j < this.survey_sub_groups[i].length; j++) {
                        this.survey_sub_group_index[this.survey_groups[i]][this.survey_sub_groups[i][j]] = j;
                    }
                }

                this.currentAssessmentId = assessment_id;
                this.currentFacilityId = assessment.facilityId;
                this.surveyDataReady = true;
                this.changeSurveyGroupTab(0, this.survey_groups[0]);
                this.changeSubGroupTab(0, this.survey_sub_groups[0][0]);
                if (assessment.status === 'IN_PROGRESS') {
                    this.assessmentResuming[assessment_id] = false;
                } else if (assessment.status === 'OPEN') {
                    this.assessmentStarting[assessment_id] = false;
                } else if (assessment.status === 'ACCEPT') {
                    this.assessmentAccepting[assessment_id] = false;
                }
                this.notificationsModal.hide();
                this.surveyModal.show();
            },
            () => {
                if (assessment.status === 'IN_PROGRESS') {
                    this.assessmentResuming[assessment_id] = false;
                } else if (assessment.status === 'OPEN') {
                    this.assessmentStarting[assessment_id] = false;
                } else if (assessment.status === 'ACCEPT') {
                    this.assessmentAccepting[assessment_id] = false;
                }
            }
        );
    }

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

    getCurrentTabSurveyQuestions() {
        return this.survey[this.survey_groups[this.selectedSurveyGroupTab]][
            this.survey_sub_groups[this.selectedSurveyGroupTab][this.selectedSubGroupTab]
        ];
    }

    updateCurrentSubQuestions(option: string, questionIndex: number) {
        const question = this.survey[this.survey_groups[this.selectedSurveyGroupTab]][
            this.survey_sub_groups[this.selectedSurveyGroupTab][this.selectedSubGroupTab]
        ][questionIndex];

        const questionHasSubQuestion =
            question.hasOwnProperty('subQuestion') && question['subQuestion'].hasOwnProperty(option);

        if (!questionHasSubQuestion) {
            return false;
        }

        if (!Array.isArray(this.currentSubQuestions[this.selectedSurveyGroupTab])) {
            this.currentSubQuestions[this.selectedSurveyGroupTab] = [];
        }

        if (!Array.isArray(this.currentSubQuestions[this.selectedSurveyGroupTab][this.selectedSubGroupTab])) {
            this.currentSubQuestions[this.selectedSurveyGroupTab][this.selectedSubGroupTab] = [];
        }

        this.currentSubQuestions[this.selectedSurveyGroupTab][this.selectedSubGroupTab][questionIndex] = [];

        for (let i = 0; i < question['subQuestion'][option].length; i++) {
            this.currentSubQuestions[this.selectedSurveyGroupTab][this.selectedSubGroupTab][questionIndex].push(
                question['subQuestion'][option][i]
            );
        }
    }

    hasSubQuestions(option: string, questionIndex: number) {
        const question = this.survey[this.survey_groups[this.selectedSurveyGroupTab]][
            this.survey_sub_groups[this.selectedSurveyGroupTab][this.selectedSubGroupTab]
        ][questionIndex];

        const questionHasSubQuestion =
            question.hasOwnProperty('subQuestion') && question['subQuestion'].hasOwnProperty(option);

        if (questionHasSubQuestion) {
            this.updateCurrentSubQuestions(option, questionIndex);
        }

        return questionHasSubQuestion;
    }

    remindAssessment(assessment: any) {
        if (+assessment.supplierAssociationStatus !== 20) {
            this.toastr.info('Reminders can be sent only after the supplier has accepted');
            return;
        }
        const assessmentId = assessment.id;
        this.sendingReminder[assessmentId] = true;
        this.processingReminder = true;
        this.assessmentService.remindAssessment(assessmentId).subscribe(
            response => {
                this.processingReminder = false;
                this.sendingReminder[assessmentId] = false;
                this.toastr.success('A reminder email has been dispatched', 'Email Dispatched');
            },
            failResponse => {
                this.processingReminder = false;
                this.sendingReminder[assessmentId] = false;
                this.toastr.error('We could not send the reminder email. Something has gone wrong', 'Oops!');
            }
        );
    }

    onSubmitSurvey() {
        if (this.auth.haveAccess('ASSESSMENT_CREATE')) {
            this.processingSurvey = true;
            this.assessmentService.submitAssessment(this.currentAssessmentId).subscribe(
                response => {
                    this.processingSurvey = false;
                    this.toastr.success('You are now safe, to close the assessment.', 'Brand Notified.');
                    this.analyticsService.trackEvent('Assessment Submitted');
                },
                failResponse => {
                    this.processingSurvey = false;
                    this.toastr.error('We could not submit your assessment. Please try after some time', 'Oops!');
                }
            );
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    onApproveSurvey() {
        this.processingSurvey = true;
        this.assessmentService.approveAssessment(this.currentAssessmentId).subscribe(
            response => {
                this.processingSurvey = false;
                this.toastr.success('You are now safe, to close the assessment.', 'Brand Notified.');
                this.openSubAssessmentsModal(this.currentAssessmentId);
            },

            failResponse => {
                this.processingSurvey = false;
                this.toastr.error('We could not approve your assessment. Please try after some time', 'Oops!');
            }
        );
    }

    onReopenSurvey() {
        this.processingSurvey = true;
        this.assessmentService.reopenAssessment(this.currentAssessmentId).subscribe(
            response => {
                this.processingSurvey = false;
                this.toastr.success('This assessment is reopened and the company has been notified.');
            },
            failResponse => {
                this.processingSurvey = false;
                this.toastr.error('We could not reopen your assessment. Please try after some time', 'Oops!');
            }
        );
    }

    getSuppliersFacilities() {
        this.assessmentService.getSuppliersFacilities().subscribe(
            response => {
                const data = response.data;
                // this.suppliers = data.supplier;
                this.facilities = data.facility;
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                }
                this.pageLoading = false;
            }
        );
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
                if (error.error.message === 'Access is denied') {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                } else if (error.error.message) {
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

    openSupplierFacilityModal(index: number) {
        this.supplierFacilityModalReady = false;
        this.assessment = this.assessments[index];
        this.selectedVP = this.assessment.vp[0];
        this.selectedSuppliers = [];
        this.selectedFacilities = [];
        this.markedSuppliers = [];
        this.markedFacilities = [];

        for (let j = 0; j < this.assessment.vp.length; j++) {
            this.markedSuppliers[this.assessment.vp[j]] = [];
            this.markedFacilities[this.assessment.vp[j]] = [];
            for (let i = 0; i < this.suppliers.length; i++) {
                this.markedSuppliers[this.assessment.vp[j]][this.suppliers[i].supplier_id] = false;
            }

            for (let i = 0; i < this.facilities.length; i++) {
                this.markedFacilities[this.assessment.vp[j]][this.facilities[i].id] = false;
            }
        }

        this.supplierFacilityModalReady = true;
        this.supplierFacilityModal.show();
    }

    filterAssessments(filterBy: string) {
        this.filterByStatus = filterBy;
        const status = [];
        status['unopened'] = 'UNOPENED';
        status['unaccepted'] = 'UNACCEPTED';
        status['inprogress'] = 'IN_PROGRESS';
        status['closed'] = 'CLOSED';
        status['inreview'] = 'IN_REVIEW';

        this.processRawAssessmentData();

        if (filterBy === 'all') {
            this.processRawAssessmentData();
        } else if (
            filterBy === 'unopened' ||
            filterBy === 'unaccepted' ||
            filterBy === 'inprogress' ||
            filterBy === 'closed' ||
            filterBy === 'inreview'
        ) {
            this.assessments = this.assessments.filter(o => o.status === status[filterBy]);
        } else {
            this.toastr.error("You are trying out options we don't support yet!", 'Not Supported');
        }
    }

    pad(num: number, size: number): string {
        let s = num + '';
        while (s.length < size) {
            s = '0' + s;
        }
        return s;
    }

    processRawAssessmentData(): void {
        this.assessments = [];
        this.assessments_response.forEach(key => {
            this.assessments.push({
                id: key.id,
                name: key.name,
                nameShort: key.name.substring(0, 25),
                status: key.status_by_me,
                totalQuestion: key.total_questions,
                totalAnswered: key.total_answered,
                companyName: key.launched_to['name'],
                facilityName: key.facility['name'],
                facilityId: key.facility['id'],
                responsesCount: key.sub_assessments_by_me,
                noOfResponses: this.pad(key.sub_assessments_by_me, 2),
                dueDate: AssessmentsLaunchedComponent.convertToDate(key.due_date),
                launchDate: AssessmentsLaunchedComponent.convertToDate(key.create_ts),
                yourScore: 0,
                maxScore: key.max,
                statusText: this.titleCase.transform(key.status_by_me.replace('_', '')),
                companyId: key.launched_to['id'],
                fromCompanyId: key.launched_by['id'],
                statusPercent: key.total_question !== 0 ? (key.total_answered / key.total_question) * 100.0 : 0,
                statusPercentActual: key.total_question !== 0 ? (key.total_answered / key.total_question) * 100.0 : 0,
                vp: key.value_process,
                notificationCount: key.notificationCount,
                supplierAssociationStatus: key.supplier_status
            });
        });
    }

    triggerCheckbox(id, i) {
        const el = document.getElementById(id + '-' + i);
        el.click();
    }

    private fetchFilters(payload: ISearchPayload): void {
        this.pageLoading = true;
        this.assessmentService.getAssessmentLaunchedFilter(payload).subscribe(
            response => {
                this.assessmentFilter = response['data'];
                setTimeout(() => {
                    this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 75;
                }, 0);
                this.pageLoading = false;
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error(
                    'We could not fetch filter data. Please try again after sometime or contact support if the issue persists.',
                    'Oops!'
                );
            }
        );
    }

    handleFilterSelection(): void {
        this.resetPagination();
        this.totalCountFlag = true;
        this.changeAssessmentType('by');
    }
    resetAllFilters(): void {
        this.utils.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    changeAssessmentType(assessmentLaunchType: string): void {
        this.pageLoading = true;
        this.disableInfiniteScroll = true;
        this.assessmentType = assessmentLaunchType;
        const payload = this.getSearchPayload();
        payload.filter['Launched By'] = [this.user['companyId']];
        payload.filter['Raw Status'] = ['ACCEPTED', 'REQUEST'];
        this.assessmentService.getAll(payload).subscribe(response => {
            const data = response['data'];
            // Set the assessments
            this.assessments = [];
            this.assessments_response = data['searchResponse'];
            this.processRawAssessmentData();
            this.disableInfiniteScroll = false;
            this.totalCount = data.totalCount;
            this.pageLoading = false;
            if (Object.keys(this.updateFiltersSelection()).length > 0) {
                setTimeout(() => {
                    this.height = document.getElementById('filter-bar-wrapper').offsetHeight + 75;
                });
            }

            // Set the statistics info
            if (data.hasOwnProperty('status_count')) {
                this.assessment_status.unaccepted = data.status_count.UNACCEPTED || 0;
                this.assessment_status.inProgress = data.status_count.IN_PROGRESS || 0;
                this.assessment_status.inReview = data.status_count.IN_REVIEW || 0;
                this.assessment_status.closed = data.status_count.CLOSED || 0;
                this.assessment_status.all =
                    this.assessment_status.unaccepted +
                    this.assessment_status.inProgress +
                    this.assessment_status.inReview +
                    this.assessment_status.closed;
            }
            this.pageLoading = false;
        });
    }
    updateFiltersSelection(): any {
        return this.utils.getSessionStorageValue(this.filter_session) || {};
    }
    onSelectVP(event: any, vp: string) {
        this.selectedVP = vp;
    }

    deleteSelectedSupplier(supplierId: string) {
        this.selectedSuppliers[this.selectedVP] = this.selectedSuppliers[this.selectedVP].filter(item => {
            return item.supplier_id !== supplierId;
        });
        this.markedSuppliers[this.selectedVP][supplierId] = false;
    }

    onSelectSupplier(element: any, event: any, supplierId: string, thrash: boolean) {
        if (this.selectedSuppliers[this.selectedVP] === undefined) {
            this.selectedSuppliers[this.selectedVP] = [];
        } else {
            const existing_supplier = this.selectedSuppliers[this.selectedVP].find(o => o.supplier_id === supplierId);
            if (existing_supplier) {
                this.deleteSelectedSupplier(supplierId);
                return;
            }
        }

        if (!thrash) {
            const supplier = this.suppliers.find(o => o.supplier_id === supplierId);
            if (supplier) {
                this.selectedSuppliers[this.selectedVP].push(supplier);
                this.markedSuppliers[this.selectedVP][supplierId] = true;
            } else {
                this.deleteSelectedSupplier(supplierId);
            }
        } else {
            this.deleteSelectedSupplier(supplierId);
        }
    }

    deleteSelectedFacility(facilityId: string) {
        this.selectedFacilities[this.selectedVP] = this.selectedFacilities[this.selectedVP].filter(item => {
            return item.id !== facilityId;
        });
        this.markedFacilities[this.selectedVP][facilityId] = false;
    }

    onSelectFacility(element: any, event: any, facilityId: string, thrash: boolean) {
        if (this.selectedFacilities[this.selectedVP] === undefined) {
            this.selectedFacilities[this.selectedVP] = [];
        } else {
            const existing_facility = this.selectedFacilities[this.selectedVP].find(o => o.id === facilityId);
            if (existing_facility) {
                this.deleteSelectedFacility(facilityId);
                return;
            }
        }

        if (!thrash) {
            const facility = this.facilities.find(o => o.id === facilityId);
            if (facility) {
                this.selectedFacilities[this.selectedVP].push(facility);
                this.markedFacilities[this.selectedVP][facilityId] = true;
            } else {
                this.deleteSelectedFacility(facilityId);
            }
        } else {
            this.deleteSelectedFacility(facilityId);
        }
    }

    onLaunchAssessment() {
        this.selectedSuppliersFacilities = [];
        this.processingLaunchAssessment = true;
        for (let j = 0; j < this.assessment.vp.length; j++) {
            this.selectedSuppliersFacilities.push(JSON.parse(JSON.stringify(this.selectedSupplierFacility)));

            if (!!this.selectedSuppliers[this.assessment.vp[j]]) {
                for (let i = 0; i < this.selectedSuppliers[this.assessment.vp[j]].length; i++) {
                    this.selectedSuppliersFacilities[j].supplier.push(
                        this.selectedSuppliers[this.assessment.vp[j]][i].supplier_id
                    );
                }
            }

            if (!!this.selectedFacilities[this.assessment.vp[j]]) {
                for (let i = 0; i < this.selectedFacilities[this.assessment.vp[j]].length; i++) {
                    this.selectedSuppliersFacilities[j].facility.push(
                        this.selectedFacilities[this.assessment.vp[j]][i].id
                    );
                }
            }

            if (
                !Array.isArray(this.selectedSuppliersFacilities[j].facility) &&
                !Array.isArray(this.selectedSupplierFacility[j].supplier)
            ) {
                this.toastr.error(`Please associate ${this.assessment.vp[j]} with a supplier or facility`);
                this.processingLaunchAssessment = false;
                return false;
            } else if (
                this.selectedSuppliersFacilities[j].supplier.length === 0 &&
                this.selectedSuppliersFacilities[j].facility.length === 0
            ) {
                this.toastr.error(`Please associate ${this.assessment.vp[j]} with a supplier or facility`);
                this.processingLaunchAssessment = false;
                return false;
            }

            this.selectedSuppliersFacilities[j].vpToAssess.push(this.assessment.vp[j]);
        }

        this.assessmentService
            .launchAssessment({
                assessment: {
                    id: this.assessment.id
                },
                assessmentToCreate: JSON.parse(JSON.stringify(this.selectedSuppliersFacilities))
            })
            .subscribe(
                data => {
                    this.processingLaunchAssessment = false;
                    this.supplierFacilityModal.hide();
                    this.changeAssessmentType(this.assessmentType);
                    this.toastr.success('Assessment launched successfully', 'Success');
                    this.analyticsService.trackEvent('Assessment Launched', { Origin: 'Assessment - Launched' });
                },
                failData => {
                    setTimeout(() => {
                        this.processingLaunchAssessment = false;
                    }, 1000);
                    this.toastr.error('We could not process your request', 'Oops!');
                }
            );
    }

    openSubAssessmentModal(assessmentId, assessment) {
        if (assessment.status === 'UNACCEPTED') {
            this.toastr.info(
                'Once accepted by supplier, it will be available for viewing',
                'Assessment yet to be accepted.'
            );
        } else if (assessment.status === 'UNOPENED' || assessment.status === 'IN_PROGRESS') {
            this.openSurveyModal(assessmentId, assessment);
        } else if (assessment.status === 'IN_REVIEW' || assessment.status === 'CLOSED') {
            this.openPreviewModal(assessmentId, assessment);
        } else {
            this.toastr.error(
                'Please contact support to resolve the issue',
                'Assessment status is ' + assessment.status
            );
        }
    }

    public openSubAssessmentsModal(assessment) {
        if (!assessment) {
            return;
        }
        this.currentAssessment = assessment;
        if (this.currentAssessment.responsesCount === 0) {
            this.toastr.info(
                'Once accepted by supplier, it will be available for viewing',
                'Assessment yet to be accepted.'
            );
            return;
        }
        this.subAssessmentsModalDataReady = false;
        this.SubAssessmentModalLoading[this.currentAssessmentId] = true;
        this.assessmentService.getSubAssessments(`${this.currentAssessmentId}`, 'by').subscribe(
            response => {
                const data = response['data'];
                this.localeService.addToMasterData(response['data']['masterData']);
                this.currentSubAssessments = JSON.parse(JSON.stringify(data.assessment));

                for (let i = 0; i < this.currentSubAssessments.length; i++) {
                    this.currentSubAssessments[i]['nameShort'] = this.currentSubAssessments[i].name.substring(0, 25);
                    let vpText = '';
                    if (this.currentSubAssessments[i].valueProcess) {
                        for (const index in this.currentSubAssessments[i].valueProcess) {
                            vpText +=
                                this.localeService.getDisplayText(this.currentSubAssessments[i].valueProcess[index]) +
                                ',';
                        }
                        vpText = vpText.slice(0, -1);
                    } else {
                        vpText = '-';
                    }

                    this.currentSubAssessments[i]['valueProcessText'] = vpText.slice(0, 20);
                    if (vpText.length > 20) {
                        this.currentSubAssessments[i]['valueProcessText'] += '...';
                    }
                    this.currentSubAssessments[i]['statusText'] = this.titleCase.transform(
                        this.currentSubAssessments[i].status.replace('_', ' ')
                    );

                    this.currentSubAssessments[i]['valueProcessFullText'] = vpText;
                    this.currentSubAssessments[i]['statusPercent'] =
                        this.currentSubAssessments[i].totalQuestion !== 0
                            ? (this.currentSubAssessments[i].totalAnswered /
                                  this.currentSubAssessments[i].totalQuestion) *
                              100.0
                            : 0;
                    this.currentSubAssessments[i]['statusPercentActual'] =
                        this.currentSubAssessments[i].totalQuestion !== 0
                            ? (this.currentSubAssessments[i].totalAnswered /
                                  this.currentSubAssessments[i].totalQuestion) *
                              100.0
                            : 0;
                }

                this.subAssessmentsModalDataReady = true;
                this.SubAssessmentModalLoading[this.currentAssessmentId] = false;
                this.notificationsModal.hide();
                this.subAssessmentsModal.show();
            },
            failResponse => {
                this.SubAssessmentModalLoading[this.currentAssessmentId] = false;
            }
        );
    }

    openNotificationsModal(assessmentIndex) {
        this.currentAssessment = this.assessments[assessmentIndex];
        this.notificationsModalDataReady = false;
        this.notificationModalLoading[this.currentNotificationAssessmentId] = true;
        this.assessmentService.getSubAssessments(`${this.currentNotificationAssessmentId}`, 'to').subscribe(
            response => {
                const data = response['data'];

                this.currentSubAssessments = JSON.parse(JSON.stringify(data.assessment));

                for (let i = 0; i < this.currentSubAssessments.length; i++) {
                    if (this.currentSubAssessments[i].notificationCount === 0) {
                        this.currentSubAssessments.splice(i, 1);
                    }
                }

                for (let i = 0; i < this.currentSubAssessments.length; i++) {
                    this.currentSubAssessments[i]['nameShort'] = this.currentSubAssessments[i].name.substring(0, 25);
                    this.currentSubAssessments[i]['valueProcessText'] = this.currentSubAssessments[i].valueProcess
                        .join(', ')
                        .slice(0, 20);
                    if (this.currentSubAssessments[i].valueProcess.join(', ').length > 20) {
                        this.currentSubAssessments[i]['valueProcessText'] += '...';
                    }
                    this.currentSubAssessments[i]['valueProcessFullText'] = this.currentSubAssessments[
                        i
                    ].valueProcess.join(', ');
                    this.currentSubAssessments[i]['statusPercent'] =
                        this.currentSubAssessments[i].totalQuestion !== 0
                            ? (this.currentSubAssessments[i].totalAnswered /
                                  this.currentSubAssessments[i].totalQuestion) *
                              100.0
                            : 0;
                    this.currentSubAssessments[i]['statusPercentActual'] =
                        this.currentSubAssessments[i].totalQuestion !== 0
                            ? (this.currentSubAssessments[i].totalAnswered /
                                  this.currentSubAssessments[i].totalQuestion) *
                              100.0
                            : 0;
                }

                this.notificationsModalDataReady = true;
                this.notificationModalLoading[this.currentNotificationAssessmentId] = false;
                this.notificationsModal.show();
            },
            failResponse => {
                this.SubAssessmentModalLoading[this.currentNotificationAssessmentId] = false;
            }
        );
    }

    setActiveQuestionInPreview(questionInfo) {
        this.activeQuestionId = questionInfo.id;
        setTimeout(() => {
            const config: ScrollToConfigOptions = {
                target: 'preview-' + this.activeQuestionId
            };

            this._scrollToService.scrollTo(config);
        }, 10);
    }

    setActiveQuestionInRM(questionInfo) {
        this.activeQuestionId = questionInfo.id;
        this.changeSurveyGroupTab(this.survey_group_index[questionInfo.group], questionInfo.group);
        this.changeSubGroupTab(
            this.survey_sub_group_index[questionInfo.group][questionInfo.subGroup],
            questionInfo.subGroup
        );
        setTimeout(() => {
            const config: ScrollToConfigOptions = {
                target: this.activeQuestionId
            };

            this._scrollToService.scrollTo(config);
        }, 10);
    }

    onScroll(state: string): void {
        switch (state) {
            case 'back':
                if (this.pagination.from >= env.FETCH_SIZE) {
                    this.pagination.from = this.pagination.from - env.FETCH_SIZE;
                }
                break;
            case 'next':
                this.pagination.from = this.pagination.from + env.FETCH_SIZE;
                break;
            default:
                break;
        }
        this.changeAssessmentType('by');
    }

    scrollToGroup(groupName) {
        setTimeout(() => {
            const config: ScrollToConfigOptions = {
                target: groupName
            };

            this._scrollToService.scrollTo(config);
        }, 10);
    }

    // Patch: avoid autoClose when clicking within the dropdown (to enable selection of multiple values)
    preventClose(event: MouseEvent) {
        event.stopImmediatePropagation();
    }

    downloadAssessmentDataAsExcel(assessmentId, assessmentName) {
        this.assessmentService.exportAssessmentDataAsExcel(assessmentId).subscribe(
            (response: any) => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                let fileName = assessmentName + '.xlsx';
                FileSaver.saveAs(blob, fileName);
            },
            error => {
                this.onDownloadErrorHandle(error);
            }
        );
    }

    private onDownloadErrorHandle(data: any): void {
        if (data.hasOwnProperty('error') && data.error.hasOwnProperty('error')) {
            this.toastr.error(`Failed to download file. Error: ${data.error.error}`);
        } else {
            this.toastr.error(`Failed to download file. Please try again later.`);
        }
    }
    resetPagination(): void {
        this.assessments = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }

    removeSpace(key: any): string {
        return 'assessment-' + key.replace(/ /g, '-');
    }

    refreshFilter(): void {
        this.fetchFilters(this.getSearchPayload());
    }

    handleSortBy(): void {
        this.setSortByFilter();
        this.closeSortByFilter = false;
        this.resetPagination();
        this.changeAssessmentType('by');
    }
    setSortByFilter(): void {
        if (this.sortByFilter.sortBy === 'name') {
            this.sortByFilter.sortOrder = 'asc';
        } else if (this.sortByFilter.sortBy === 'create_ts') {
            this.sortByFilter.sortOrder = 'desc';
        }
        this.utils.setSessionStorageValue(this.sortby_session, this.sortByFilter);
    }
    searchAssessment(event: KeyboardEvent): void {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.resetPagination();
            this.totalCountFlag = true;
            this.changeAssessmentType('by');
        }
    }
}
