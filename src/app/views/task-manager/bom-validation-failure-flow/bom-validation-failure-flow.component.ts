import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { environment } from '../../../../environments/environment';
import { TaskManagerService } from '../task-manager.service';
import { ApprovalStatuses, IWaitingForApprovalRequestPayload } from '../task-manager.model';
import { ConfirmDialogComponent } from './../../../shared/modals/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-bom-validation-failure-flow',
    templateUrl: './bom-validation-failure-flow.component.html',
    styleUrls: ['./bom-validation-failure-flow.component.scss']
})
export class BomValidationFailureFlowComponent implements OnInit, OnDestroy {
    env = environment;

    showClose: boolean;
    showCloseButton: boolean;
    showActionButtons: boolean;
    pageLoading: boolean = true;
    modalOpen: boolean = false;

    task: any;
    taskHistory: any;
    taskRequestPayload: any;
    approvalStatusPayload: IWaitingForApprovalRequestPayload;

    taskId: string;
    type: string;
    actionType: string;
    tier: string;
    comments: string;
    title: string;

    tiers = ['tr_tier1', 'tr_tier2'];

    constructor(
        private dialogRef: MatDialogRef<BomValidationFailureFlowComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService,
        private dialog: MatDialog,
        private toastr: CustomToastrService,
        private taskManagerService: TaskManagerService,
        public commonServices: CommonServices
    ) {
        dialogRef.disableClose = true;
        this.task = data.task;
        this.taskHistory = data.taskHistory;
        this.taskRequestPayload = data.taskRequestPayload;
        this.showClose = data.showClose !== undefined ? data.showClose : true;
        this.showCloseButton = data.showCloseButton !== undefined ? data.showCloseButton : true;
        this.showActionButtons = data.showActionButtons !== undefined ? data.showActionButtons : true;
        this.type = data.type;
        this.actionType = data.actionType ? data.actionType : 'Review';
        this.tier = data.task.tierId;
        this.title = data.task.title;
    }

    ngOnInit() {
        this.modalOpen = true;
    }

    closeDialog() {
        this.dialogRef.close();
    }

    getImage(imageName: string): string {
        return this.utilService.getcdnImage(imageName);
    }

    handleRejectClick() {
        this.approvalStatusPayload = {
            taskObject: this.taskRequestPayload,
            taskHistory: this.taskHistory
        };
        this.approvalStatusPayload.taskObject.status = ApprovalStatuses.REJECTED;

        const submissionDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '460px',
            data: {
                title: 'Add comments',
                class: 'tc-approval-reject-dialog',
                msg: 'Describe your comments on the modified data',
                primaryButton: 'Reject',
                showClose: false,
                isProvisionToAddInput: true,
                sendInputText: true,
                placeholder: 'Enter your comments',
                toBeDisabled: true
            }
        });

        submissionDialog.afterClosed().subscribe(response => {
            if (response && response !== null) {
                const responseArr = response.split(',');
                this.approvalStatusPayload.taskObject.comments = responseArr[1];
            }
            this.submitApprovalStatus();
        });
    }

    handleApproveClick() {
        this.approvalStatusPayload = {
            taskObject: this.taskRequestPayload,
            taskHistory: this.taskHistory
        };
        this.approvalStatusPayload.taskObject.status = ApprovalStatuses.APPROVED;
        this.approvalStatusPayload.taskObject.comments = this.comments ? this.comments : '';
        this.submitApprovalStatus();
    }

    submitApprovalStatus() {
        this.pageLoading = true;
        this.taskManagerService.updateWaitingForApprovalTaskStatus(this.approvalStatusPayload).subscribe(
            response => {
                this.pageLoading = false;
                this.dialogRef.close();
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error('Unable to approve or reject. Please try after some time.', 'Failed');
            }
        );
    }

    ngOnDestroy() {
        this.modalOpen = false;
    }
}
