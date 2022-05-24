import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ResponseManagementService {
    constructor(private http: HttpClient, private toastr: CustomToastrService) {}

    public comments = {};
    public isCommentWindowOpen = false;
    public questionMap = {};
    public initializing = true;
    public activeQuestionId = 'default';
    questionWithComments = [];
    assessmentId;
    newComment = '';
    commentsToShow;
    navigateIndex = 0;

    activeThreadId;
    newCommentList = [];
    textBoxOpen = false;

    launcheeCompanyId;
    launcherCompanyId;

    public setLauncheeCompanyId(launcheeCompanyId) {
        this.launcheeCompanyId = launcheeCompanyId;
    }

    public setLauncherCompanyId(launcherCompanyId) {
        this.launcherCompanyId = launcherCompanyId;
    }

    public setAssessmentId(assessmentId) {
        if (this.assessmentId !== assessmentId) {
            this.assessmentId = assessmentId;
            this.reset();
        }
    }

    reset() {
        this.activeQuestionId = 'default';
        this.commentsToShow = {};
        this.navigateIndex = 0;
        this.isCommentWindowOpen = false;
        this.initialize();
    }

    public getQuestionWithComment(assessmentId): Observable<any> {
        const url = environment.api.assessment.getQuestionWithComment.replace('$1', assessmentId);
        return this.http.get(url);
    }

    public getCommentForAssessment(assessmentId): Observable<any> {
        const url = environment.api.assessment.getCommentForAssessment.replace('$1', assessmentId);
        return this.http.get(url);
    }

    public resolveQuestion(assessmentId, questionId): Observable<any> {
        const payload = {
            assessmentId: assessmentId,
            questionId: questionId
        };
        return this.http.post(environment.api.assessment.resolveQuestion, payload);
    }

    public openTextBox(threadId) {
        this.textBoxOpen = true;
    }

    public toggleTextBox(threadId) {
        if (this.activeThreadId !== threadId) {
            this.activeThreadId = threadId;
            this.textBoxOpen = true;
        } else {
            this.textBoxOpen = !this.textBoxOpen;
        }
    }

    public nextComment() {
        if (this.navigateIndex === this.questionWithComments.length) {
            this.navigateIndex = 1;
        } else {
            this.navigateIndex++;
        }
        this.activeQuestionId = this.questionWithComments[this.navigateIndex - 1];
        this.fetchCommentsByQuestion();
    }

    public previousComment() {
        if (this.navigateIndex === 1) {
            this.navigateIndex = this.questionWithComments.length;
        } else {
            this.navigateIndex--;
        }
        this.activeQuestionId = this.questionWithComments[this.navigateIndex - 1];
        this.fetchCommentsByQuestion();
    }

    public setNavigateIndex() {
        this.navigateIndex = this.questionWithComments.indexOf(this.activeQuestionId) + 1;
    }

    public resolveQuestionById() {
        this.resolveQuestion(this.assessmentId, this.activeQuestionId).subscribe(
            response => {
                this.toastr.success('The question has been resolved successfully', 'Success');
            },
            failResponse => {
                this.toastr.error('Error resolving question', 'Error!');
            }
        );
    }

    addCommentToThread() {
        this.saveComment(
            this.assessmentId,
            this.activeQuestionId,
            this.activeThreadId,
            this.newCommentList[this.activeThreadId]
        ).subscribe(response => {
            this.initialize();
        });
        this.newCommentList[this.activeThreadId] = '';
    }

    addComment() {
        this.saveComment(this.assessmentId, this.activeQuestionId, null, this.newComment).subscribe(response => {
            this.initialize();
        });
        this.newComment = '';
    }

    public saveComment(assessmentId, questionId, parentId, comment): Observable<any> {
        if (comment.trim().length !== 0) {
            const payload = {
                assessmentId: assessmentId,
                questionId: questionId,
                parentId: parentId,
                comment: comment
            };
            return this.http.post(environment.api.assessment.saveComment, payload);
        }
    }

    public getCommentByQuestion(assessmentId, questionId): Observable<any> {
        let url = environment.api.assessment.getCommentByQuestion.replace('$1', assessmentId);
        url = url.replace('$2', questionId);
        return this.http.get(url);
    }

    fetchQuestionWithComment() {
        this.getQuestionWithComment(this.assessmentId).subscribe(response => {
            const data = response.data.questionWithComment;
            this.questionWithComments = data;
            if (
                this.activeQuestionId !== 'default' &&
                this.questionWithComments.indexOf(this.activeQuestionId) === -1
            ) {
                this.questionWithComments.push(this.activeQuestionId);
                this.navigateIndex = this.questionWithComments.length;
            } else if (
                this.questionWithComments.length > 0 &&
                this.questionWithComments.indexOf(this.activeQuestionId) === -1
            ) {
                this.navigateIndex = 1;
                this.activeQuestionId = this.questionWithComments[this.navigateIndex - 1];
            }
            this.initializing = false;
        });
    }

    fetchCommentsByQuestion() {
        if (this.activeQuestionId !== 'default') {
            this.getCommentByQuestion(this.assessmentId, this.activeQuestionId).subscribe(response => {
                const data = response.data;
                this.commentsToShow = data;
            });
        }
    }

    fetchComments() {
        this.getCommentForAssessment(this.assessmentId).subscribe(response => {
            const data = response.data;
            this.comments = data;
            if (this.activeQuestionId !== 'default' && !(this.activeQuestionId in this.comments)) {
                this.comments[this.activeQuestionId] = {};
                this.fetchCommentsByQuestion();
            }
        });
    }

    private initialize() {
        if (this.assessmentId !== undefined) {
            this.initializing = true;
            this.newCommentList = [];
            this.activeThreadId = null;
            this.fetchQuestionWithComment();
            this.fetchCommentsByQuestion();
        }
    }

    public toggleCommentWindow() {
        this.isCommentWindowOpen = !this.isCommentWindowOpen;
        if (this.isCommentWindowOpen) {
            this.initialize();
        }
    }

    public openCommentWindow(questionId) {
        this.activeQuestionId = questionId;
        this.initialize();
        this.isCommentWindowOpen = true;
    }

    getQuestionTextForId(questionId) {
        return this.questionMap[questionId].question;
    }

    getSlicedQuestionTextForId(questionId) {
        const defaultLength = 50;
        let questionText = this.questionMap[questionId].question;
        if (questionText.length < defaultLength) {
            return questionText;
        }
        questionText = questionText.substring(0, defaultLength) + '...';
        return questionText;
    }

    public constructQuestionMap(survey) {
        for (const group in survey) {
            if (survey.hasOwnProperty(group)) {
                for (const subGroup in survey[group]) {
                    if (survey[group].hasOwnProperty(subGroup)) {
                        for (let i = 0; i < survey[group][subGroup].length; i++) {
                            this.questionMap[survey[group][subGroup][i]['id']] = survey[group][subGroup][i];
                            this.constructQuestionMapforSubQuestions(survey[group][subGroup][i]);
                        }
                    }
                }
            }
        }
    }

    private constructQuestionMapforSubQuestions(question) {
        for (const subOption in question['subQuestion']) {
            if (question['subQuestion'].hasOwnProperty(subOption)) {
                for (let i = 0; i < question['subQuestion'][subOption].length; i++) {
                    this.questionMap[question['subQuestion'][subOption][i]['id']] =
                        question['subQuestion'][subOption][i];
                    this.constructQuestionMapforSubQuestions(question['subQuestion'][subOption][i]);
                }
            }
        }
    }
}
