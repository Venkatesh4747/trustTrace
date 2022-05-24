import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { AuthService } from '../../core';
import { ResponseManagementService } from './response-management.service';

@Component({
    selector: 'app-response-management',
    templateUrl: './response-management.component.html',
    styleUrls: ['./response-management.component.scss']
})
export class ResponseManagementComponent implements OnInit {
    COMMENT_DATE_FORMAT = 'd MMM y, h:mm a';

    comments = {};
    public env = env;
    public isCommentWindowOpen = false;
    public questionMap = {};
    public initializingCommentWindow = false;

    newComment = '';

    questionWithComments;

    @Input('questions') questions;
    @Input('assessmentId') assessmentId;
    @Input('launcheeCompanyId') launcheeCompanyId;
    @Input('launcherCompanyId') launcherCompanyId;
    activeQuestionId = 'default';
    user = {};

    private targetThreadCommentBox: ElementRef;
    private commentTextBox: ElementRef;

    @Output() activeQuestion = new EventEmitter();

    @ViewChild('commentTextBox', { static: false }) set commentTextBoxContent(content: ElementRef) {
        this.commentTextBox = content;
        if (content) {
            content.nativeElement.focus();
        }
    }

    @ViewChild('targetThreadCommentBox', { static: false }) set content(content: ElementRef) {
        this.targetThreadCommentBox = content;
        if (content) {
            content.nativeElement.scrollIntoView({ behavior: 'smooth' });
            4;
            content.nativeElement.focus();
        }
    }

    constructor(public responseManagementService: ResponseManagementService, public auth: AuthService) {
        this.user = auth.user;
    }

    ngOnInit() {
        this.responseManagementService.constructQuestionMap(this.questions);
        this.responseManagementService.setAssessmentId(this.assessmentId);
        this.responseManagementService.reset();
    }

    saveComment() {
        this.responseManagementService
            .saveComment(this.assessmentId, this.activeQuestionId, null, this.newComment)
            .subscribe(response => {});
        this.newComment = '';
    }

    getThreadIdsOfQuestion(questionId: string) {
        return Array.from(this.comments[questionId].keys());
    }

    activeQuestionIdChanged() {
        if (this.responseManagementService.activeQuestionId !== 'default') {
            const questionId = this.responseManagementService.activeQuestionId;
            const classification = this.responseManagementService.questionMap[questionId]['classification'];
            this.activeQuestion.emit({
                id: questionId,
                group: classification.group,
                subGroup: classification.subGroup
            });
        }
    }
}
