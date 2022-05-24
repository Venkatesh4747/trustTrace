import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { ISCReviewRequestPayload, ISCTaskDetail } from '../task-manager.model';
import { TaskManagerService } from '../task-manager.service';

@Component({
    selector: 'app-sc-approval-modal',
    templateUrl: './sc-approval-modal.component.html',
    styleUrls: ['./sc-approval-modal.component.scss']
})
export class ScApprovalModalComponent implements OnInit {
    task: any;
    taskDetail: ISCTaskDetail;

    certificationType: string;
    remarks: string;

    showClose: boolean;
    pageLoading: boolean = true;

    scReviewRequestPayload: ISCReviewRequestPayload;

    constructor(
        private dialogRef: MatDialogRef<ScApprovalModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService,
        private dialog: MatDialog,
        private toastr: CustomToastrService,
        private commonServices: CommonServices,
        private taskManagerService: TaskManagerService,
        public localeService: LocalizationService
    ) {
        this.task = data.task;
        this.showClose = data.showClose !== undefined ? data.showClose : true;
        this.certificationType = data.certificationType;
        dialogRef.disableClose = true;
    }

    ngOnInit() {
        this.scReviewRequestPayload = {
            id: this.task.task_id,
            certType: 'SC',
            workflowStatus: 'PENDING',
            workflowType: 'REASON_FOR_DELAY',
            fromCompanyId: this.task.to_company.id,
            toCompanyId: this.task.from_company.id,
            certId: this.task.cert_id,
            taskHistory: this.task,
            comments: {
                selectedComments: [],
                otherComments: '',
                resolutionDate: ''
            },
            notifyTT: false
        };
        this.taskManagerService.getTaskDetail(this.task.task_id).subscribe(
            data => {
                this.taskDetail = JSON.parse(JSON.stringify(data));
                this.scReviewRequestPayload.id = data.ttDocumentId;
                this.pageLoading = false;
            },
            failResponse => {
                this.toastr.error('Something went wrong. Please try after sometime!', 'Error');
                this.pageLoading = false;
            }
        );
    }

    handleSubmit(action: string) {
        if (this.remarks) {
            this.scReviewRequestPayload.comments.otherComments = this.remarks;
        }
        this.scReviewRequestPayload.workflowStatus = action === 'Approve' ? 'APPROVED' : 'REJECTED';

        this.taskManagerService.submitSCReview(this.scReviewRequestPayload).subscribe(
            response => {
                this.dialogRef.close();
            },
            failResponse => {
                this.toastr.error('Something went wrong. Please try after sometime!', 'Error');
            }
        );
    }
}
