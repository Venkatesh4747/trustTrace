import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import * as FileSaver from 'file-saver';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../../environments/environment';
import { AssessmentsService } from '../assessments.service';

@Component({
    selector: 'app-survey-questions',
    templateUrl: './survey-questions.component.html',
    styleUrls: ['./survey-questions.component.scss']
})
export class SurveyQuestionsComponent implements OnInit, OnChanges {
    @Input('questions') questions;
    @Input('groupName') groupName;
    @Input('subGroupName') subGroupName;
    @Input('isSubQuestion') isSubQuestion;
    @Input('parentQuestionId') parentQuestionId;
    @Input('subQuestionForOption') subQuestionForOption;
    @Input('optionIndex') optionIndex;
    @Input('answered') answered;
    @Input('responses') responses;
    @Input('facilityId') facilityId;
    @Input('assessmentId') assessmentId;
    @Input('deletedQuestions') deletedQuestions;
    @Input('mandatoryQuestions') mandatoryQuestions;
    @Input('allowDeleteQuestions') allowDeleteQuestions;
    @Input('mandatoryQuestionsList') mandatoryQuestionsList;

    @Output() saved = new EventEmitter();
    @Output() questionDeleted = new EventEmitter();
    @Output() questionMarkedMandatory = new EventEmitter();

    checkbox_response: Array<Array<string>>;

    evidenceFiles: any;

    evidenceUploading = [];

    constructor(private assessmentService: AssessmentsService, private toastr: CustomToastrService) {}

    ngOnChanges() {}

    ngOnInit() {
        this.mandatoryQuestionsList.forEach(question_id => {
            this.mandatoryQuestions[question_id] = true;
        });
        if (!(this.deletedQuestions instanceof Array)) {
            this.deletedQuestions = [];
        }

        if (!(this.mandatoryQuestions instanceof Array)) {
            this.mandatoryQuestions = [];
        }

        if (!Array.isArray(this.checkbox_response)) {
            this.checkbox_response = [];
        }

        if (!this.isSubQuestion) {
            this.InitResponses();
        } else {
            this.InitSubQuestionResponses();
        }
    }

    deleteQuestion(question_id) {
        if (this.mandatoryQuestions[question_id]) {
            this.toastr.info('Cannot delete a question that is marked mandatory', 'Mandatory Question');
            return;
        }
        this.deletedQuestions[question_id] = !this.deletedQuestions[question_id];
        this.questionDeleted.emit({ id: question_id, status: this.deletedQuestions[question_id] });
    }

    mandatoryQuestion(question_id) {
        if (this.deletedQuestions[question_id]) {
            this.mandatoryQuestions[question_id] = false;
            this.toastr.info('Cannot mark a deleted question as mandatory', 'Deleted Question');
            return;
        }
        this.mandatoryQuestions[question_id] = !this.mandatoryQuestions[question_id];
        this.questionMarkedMandatory.emit({ id: question_id, status: this.mandatoryQuestions[question_id] });
    }

    getAnswered(question_id) {
        if (
            this.answered &&
            this.answered[question_id] &&
            this.answered[question_id].value &&
            this.answered[question_id].value.length > 0
        ) {
            if (this.answered[question_id].value.length === 1) {
                return this.answered[question_id].value[0];
            } else if (this.answered[question_id].value.length > 1) {
                return this.answered[question_id].value;
            } else {
                return null;
            }
        }
        return null;
    }

    InitSubQuestionResponses() {
        this.questions.forEach((question, index) => {
            const answered = this.getAnswered(question.id);
            if (question.type === 'SINGLE_SELECT') {
                this.responses[question.id] = answered;
            } else if (question.type === 'MULTI_SELECT') {
                const optionsList = Object.keys(this.questions[index].options);
                const optionsLength = optionsList.length;
                for (let i = 0; i < optionsLength; i++) {
                    if (answered && answered.length > 0 && answered.indexOf(optionsList[i]) !== -1) {
                        if (!Array.isArray(this.checkbox_response[question.id])) {
                            this.checkbox_response[question.id] = [];
                        }
                        this.checkbox_response[question.id].push(optionsList[i]);
                    }
                    if (!Array.isArray(this.responses[question.id])) {
                        this.responses[question.id] = [];
                    }
                    this.responses[question.id][i] =
                        answered && answered.length > 0 && answered.indexOf(optionsList[i]) !== -1;
                }
            } else if (question.type === 'TEXT') {
                this.responses[question.id] = answered;
            }

            if (
                question.evidenceRequired &&
                Array.isArray(question.evidenceRequired) &&
                question.evidenceRequired.length > 0
            ) {
                for (let i = 0; i < question.evidenceRequired.length; i++) {
                    const evidence = question.evidenceRequired[i];
                    if (
                        this.answered[question.id] &&
                        this.answered[question.id].hasOwnProperty('evidenceAttached') &&
                        this.answered[question.id].evidenceAttached.hasOwnProperty(evidence.id)
                    ) {
                        if (!Array.isArray(this.evidenceFiles)) {
                            this.evidenceFiles = [];
                        }
                        if (!Array.isArray(this.evidenceFiles[question.id])) {
                            this.evidenceFiles[question.id] = [];
                        }

                        if (!this.evidenceFiles[question.id][evidence.id]) {
                            this.evidenceFiles[question.id][evidence.id] = {};
                        }

                        const evidenceAttached = this.answered[question.id]['evidenceAttached'][evidence.id];

                        if (evidenceAttached) {
                            this.evidenceFiles[question.id][evidence.id]['evidenceId'] = evidenceAttached.id;

                            if (!Array.isArray(this.evidenceFiles[question.id][evidence.id]['files'])) {
                                this.evidenceFiles[question.id][evidence.id]['files'] = [];
                            }

                            if (
                                this.answered[question.id] &&
                                this.answered[question.id]['evidenceAttached'] &&
                                this.answered[question.id]['evidenceAttached'][evidence.id] &&
                                this.answered[question.id]['evidenceAttached'][evidence.id].urls
                            ) {
                                for (const key in this.answered[question.id]['evidenceAttached'][evidence.id].urls) {
                                    this.evidenceFiles[question.id][evidence.id]['files'].push(
                                        this.answered[question.id]['evidenceAttached'][evidence.id].urls[key].name
                                    );
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    InitResponses() {
        for (const groupName in this.questions) {
            if (this.questions.hasOwnProperty(groupName)) {
                for (const subGroupName in this.questions[groupName]) {
                    if (this.questions[groupName].hasOwnProperty(subGroupName)) {
                        this.questions[groupName][subGroupName].forEach((question, index) => {
                            const answered = this.getAnswered(question.id);
                            if (question.type === 'SINGLE_SELECT') {
                                this.responses[question.id] = answered;
                            } else if (question.type === 'MULTI_SELECT') {
                                const optionsLength = this.questions[groupName][subGroupName][index]['options'].length;
                                this.responses[question.id] = [];
                                for (let i = 0; i < optionsLength; i++) {
                                    if (
                                        answered &&
                                        answered.length > 0 &&
                                        answered.indexOf(
                                            this.questions[groupName][subGroupName][index]['options'][i]
                                        ) !== -1
                                    ) {
                                        if (!Array.isArray(this.checkbox_response[question.id])) {
                                            this.checkbox_response[question.id] = [];
                                        }
                                        this.checkbox_response[question.id].push(
                                            this.questions[groupName][subGroupName][index]['options'][i]
                                        );
                                    }
                                    if (!Array.isArray(this.responses[question.id])) {
                                        this.responses[question.id] = [];
                                    }
                                    this.responses[question.id][i] = !!(
                                        answered &&
                                        answered.length > 0 &&
                                        answered.indexOf(
                                            this.questions[groupName][subGroupName][index]['options'][i]
                                        ) !== -1
                                    );
                                }
                            } else if (question.type === 'TEXT') {
                                this.responses[question.id] = answered;
                            }

                            if (
                                question.evidenceRequired &&
                                Array.isArray(question.evidenceRequired) &&
                                question.evidenceRequired.length > 0
                            ) {
                                for (let i = 0; i < question.evidenceRequired.length; i++) {
                                    const evidence = question.evidenceRequired[i];
                                    if (
                                        this.answered[question.id] &&
                                        this.answered[question.id].hasOwnProperty('evidenceAttached') &&
                                        this.answered[question.id].evidenceAttached.hasOwnProperty(evidence.id)
                                    ) {
                                        if (!Array.isArray(this.evidenceFiles)) {
                                            this.evidenceFiles = [];
                                        }
                                        if (!Array.isArray(this.evidenceFiles[question.id])) {
                                            this.evidenceFiles[question.id] = [];
                                        }

                                        if (!this.evidenceFiles[question.id][evidence.id]) {
                                            this.evidenceFiles[question.id][evidence.id] = {};
                                        }

                                        const evidenceAttached = this.answered[question.id]['evidenceAttached'][
                                            evidence.id
                                        ];

                                        if (evidenceAttached) {
                                            this.evidenceFiles[question.id][evidence.id]['evidenceId'] =
                                                evidenceAttached.id;

                                            if (!Array.isArray(this.evidenceFiles[question.id][evidence.id]['files'])) {
                                                this.evidenceFiles[question.id][evidence.id]['files'] = [];
                                            }

                                            if (
                                                this.answered[question.id] &&
                                                this.answered[question.id]['evidenceAttached'] &&
                                                this.answered[question.id]['evidenceAttached'][evidence.id] &&
                                                this.answered[question.id]['evidenceAttached'][evidence.id].urls
                                            ) {
                                                for (const key in this.answered[question.id]['evidenceAttached'][
                                                    evidence.id
                                                ].urls) {
                                                    this.evidenceFiles[question.id][evidence.id]['files'].push(
                                                        this.answered[question.id]['evidenceAttached'][evidence.id]
                                                            .urls[key].name
                                                    );
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    }

    saveCheckbox(event, question_id, option) {
        if (!Array.isArray(this.checkbox_response)) {
            this.checkbox_response = [];
        }
        if (!Array.isArray(this.checkbox_response[question_id])) {
            this.checkbox_response[question_id] = [];
        }

        if (this.checkbox_response[question_id].indexOf(option) !== -1 || !event.target.checked) {
            this.checkbox_response[question_id].splice(this.checkbox_response[question_id].indexOf(option), 1);
        } else {
            this.checkbox_response[question_id].push(option);
        }
    }

    saveSingleInput(question_id, question_type) {
        let values = [];
        if (question_type === 'MULTI_SELECT') {
            values = this.checkbox_response[question_id];
        } else {
            values.push(this.responses[question_id]);
        }

        this.assessmentService.saveResponse(this.facilityId, this.assessmentId, question_id, values).subscribe(
            () => {
                this.saved.emit();
                this.saved.emit();
            },
            () => {}
        );
    }

    uploadEvidence(files: FileList, questionId: string, evidenceTemplateId: string) {
        if (files.length === 0) {
            return;
        }
        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (
            !fileExtension ||
            fileExtension === '' ||
            environment.config.allowedFileExtensions.indexOf(fileExtension.toLowerCase()) === -1
        ) {
            this.toastr.error('This file format is not supported');
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            this.toastr.info(
                'File size should be within ' +
                    environment.config.maximumFileUploadSize +
                    'MB. Chosen file is ' +
                    fileSizeString +
                    'MB'
            );
            return;
        }
        let evidenceId = null;
        if (
            this.evidenceFiles &&
            this.evidenceFiles[questionId] &&
            this.evidenceFiles[questionId][evidenceTemplateId] &&
            this.evidenceFiles[questionId][evidenceTemplateId].hasOwnProperty('evidenceId')
        ) {
            evidenceId = this.evidenceFiles[questionId][evidenceTemplateId].evidenceId;
        }
        this.evidenceUploading[questionId + evidenceTemplateId] = true;
        this.assessmentService
            .uploadEvidence(
                fileToUpload,
                questionId,
                this.assessmentId,
                evidenceTemplateId,
                this.isSubQuestion,
                evidenceId
            )
            .subscribe(
                response => {
                    const data = response.data;
                    if (!Array.isArray(this.evidenceFiles)) {
                        this.evidenceFiles = [];
                    }
                    if (!Array.isArray(this.evidenceFiles[questionId])) {
                        this.evidenceFiles[questionId] = [];
                    }

                    if (!this.evidenceFiles[questionId][evidenceTemplateId]) {
                        this.evidenceFiles[questionId][evidenceTemplateId] = {};
                    }

                    if (!this.evidenceFiles[questionId][evidenceTemplateId].hasOwnProperty('evidenceId')) {
                        this.evidenceFiles[questionId][evidenceTemplateId].evidenceId = data.id;
                    } else {
                        this.evidenceFiles[questionId][evidenceTemplateId]['evidenceId'] = data.id;
                    }

                    if (!Array.isArray(this.evidenceFiles[questionId][evidenceTemplateId]['files'])) {
                        this.evidenceFiles[questionId][evidenceTemplateId]['files'] = [];
                    }

                    this.evidenceFiles[questionId][evidenceTemplateId]['files'] = data.fileName;

                    this.evidenceUploading[questionId + evidenceTemplateId] = false;

                    this.toastr.success('Your file has been successfully uploaded to the server');
                },
                failData => {
                    this.evidenceUploading[questionId + evidenceTemplateId] = false;
                    this.toastr.error('Failed to upload file: ' + failData);
                }
            );
    }

    invokeEvidenceUpload(id, qid, eid) {
        const uploadInput = document.getElementById(id);
        if (
            this.evidenceFiles &&
            Array.isArray(this.evidenceFiles) &&
            this.evidenceFiles[qid] &&
            this.evidenceFiles[qid][eid] &&
            this.evidenceFiles[qid][eid]['files'].length >= 5
        ) {
            this.toastr.info('You can upload only up to 5 documents.');
            return;
        }
        uploadInput.click();
    }

    public getEvidenceFile(evidenceId, fileName) {
        this.toastr.info('Requesting file. Please wait');
        this.assessmentService.getFile(evidenceId, fileName).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
            },
            failData => {
                this.toastr.error(`Failed to download file. Error: ${failData.error.error}`);
            }
        );
    }

    removeFile(evidenceId, fileName, questionId, evidenceTemplateId) {
        this.assessmentService.removeFile(evidenceId, fileName).subscribe(
            () => {
                this.evidenceFiles[questionId][evidenceTemplateId]['files'].splice(
                    this.evidenceFiles[questionId][evidenceTemplateId]['files'].indexOf(fileName),
                    1
                );
                this.toastr.success('File ' + fileName + ' has been removed');
            },
            () => {
                this.toastr.error('File ' + fileName + ' could not be removed');
            }
        );
    }
}
