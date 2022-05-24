import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { ISCReviewComments, ITaskApprovalStatusRequestFacilityCreationPayload } from './../task-manager.model';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import FileSaver from 'file-saver';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { UtilsService } from '../../../shared/utils/utils.service';
import { ISCTaskDetail, ISCTaskExtractedData, ApprovalStatuses } from '../task-manager.model';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { InformationConfirmDialogComponent } from './../../../shared/modals/information-confirm-dialog/information-confirm-dialog.component';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { TaskManagerService } from './../task-manager.service';
import { IFacilityInfo } from '../../scope-certificates/scope-certificates.model';
import { NgForm } from '@angular/forms';
import { ProfileService } from '../../company/profile/profile.service';

export type actions = 'Review' | 'View';

export enum action_types {
    review = 'Review',
    view = 'View'
}

@Component({
    selector: 'app-sc-approval-flow',
    templateUrl: './sc-approval-flow.component.html',
    styleUrls: ['./sc-approval-flow.component.scss']
})
export class ScApprovalFlowComponent implements OnInit, OnDestroy {
    @ViewChild('scopeCertificateForm') scopeCertificateForm: NgForm;
    env = environment;

    uploadedFile: any;

    certificationType: string = 'TC';
    extractionStatus: string = 'Extracted certificate';
    type: string = 'Transaction';
    fileName: string;
    taskId: string;
    certId: string;

    showClose: boolean;
    showActionButtons: boolean;
    isFetchingFile: boolean = true;
    pageLoading: boolean = true;
    modalOpen: boolean = false;

    totalNetWeight: number;
    numberOfProductInfo: number;

    extractedData: ISCTaskExtractedData;
    changedData: ISCTaskExtractedData;
    taskData: ISCTaskDetail;
    approvalStatusPayload: ITaskApprovalStatusRequestFacilityCreationPayload;
    facilityInfo: IFacilityInfo;
    facilityInfos: IFacilityInfo[];
    fromCompanyId: string;
    toCompanyId: string;
    remarks: string = null;
    workflowType: string;
    comments: ISCReviewComments;
    isSCAvailable = true;
    entityId: string;
    actionType: actions;
    task: any;
    resolutionDate: string;

    constructor(
        private dialogRef: MatDialogRef<ScApprovalFlowComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService,
        private dialog: MatDialog,
        private toastr: CustomToastrService,
        private commonServices: CommonServices,
        private taskManagerService: TaskManagerService,
        public localeService: LocalizationService,
        private profileService: ProfileService
    ) {
        dialogRef.disableClose = true;
        this.task = data.task;
        this.taskId = data.task.task_id;
        this.certId = data.task.cert_id;
        this.showClose = data.showClose !== undefined ? data.showClose : true;
        this.showActionButtons = data.showActionButtons !== undefined ? data.showActionButtons : true;
        this.certificationType = data.certificationType;
        this.type = data.type;
        this.fromCompanyId = data.task.from_company.id;
        this.toCompanyId = data.task.to_company.id;
        this.workflowType = data.task.task_type.id;
        // this.comments = data.task.comments ? data.task.comments.split(',') : null;
        this.isSCAvailable = data.isSCAvailable;
        this.entityId = data.task.id;
        this.actionType = data.actionType ? data.actionType : action_types.review;
        this.fileName = data.fileName ? data.fileName : '';
        this.resolutionDate = this.task ? (this.task.resolution_date ? this.task.resolution_date : '') : '';
    }

    ngOnInit() {
        this.resetForm();
        this.modalOpen = true;
        const tasks$ = this.certId
            ? [
                  this.taskManagerService.getTaskDetail(this.taskId),
                  this.commonServices.getCertificate(this.certId),
                  this.commonServices.getAllCertificateNames(this.certId)
              ]
            : [this.taskManagerService.getTaskDetail(this.taskId)];

        forkJoin(tasks$).subscribe(
            response => {
                this.taskData = JSON.parse(JSON.stringify(response[0]));
                this.extractedData = this.taskData.extractedData;
                this.changedData = this.taskData.changedData;
                this.comments = this.taskData.comments;

                // Reset seller of product
                if (this.changedData && this.changedData.sellerOfProduct === null) {
                    this.changedData.sellerOfProduct['value'] = null;
                }

                this.handleProductInfoItems();
                if (this.certId) {
                    this.uploadedFile = response[1];
                    this.fileName = response[2][0];
                }
                this.isFetchingFile = false;
                this.pageLoading = false;
            },
            failResponse => {
                this.resetForm();
                this.toastr.error('Unable to fetch data. Please try after some time.', 'Failed');
                this.isFetchingFile = false;
                this.pageLoading = false;
            }
        );
    }

    resetForm(): void {
        this.uploadedFile = undefined;
        this.totalNetWeight = null;
        this.facilityInfo = {
            nameOfUnit: null,
            processes: null,
            address: null,
            doCreate: null,
            matchedData: {
                key: null,
                value: null,
                code: null
            }
        };
        this.extractedData = {
            certTypeId: null,
            bodyIssuingCertificate: null,
            referenceNumber: null,
            sellerOfProduct: {
                id: null,
                value: null,
                matchedData: {
                    key: null,
                    value: null,
                    code: null
                }
            },
            certStandard: null,
            validUntil: null,
            validFrom: null,
            placeAndDateOfIssue: null,
            facilityInfo: []
        };
        this.changedData = {
            certTypeId: null,
            bodyIssuingCertificate: null,
            referenceNumber: null,
            sellerOfProduct: {
                id: null,
                value: null,
                matchedData: {
                    key: null,
                    value: null,
                    code: null
                }
            },
            certStandard: null,
            validUntil: null,
            validFrom: null,
            placeAndDateOfIssue: null,
            facilityInfo: []
        };
        this.taskData = {
            ttDocumentId: null,
            certType: null,
            certId: null,
            certStandard: null,
            companyId: null,
            creationDate: null,
            extractedData: JSON.parse(JSON.stringify(this.extractedData)),
            changedData: JSON.parse(JSON.stringify(this.changedData)),
            comments: {
                selectedComments: [],
                otherComments: null,
                resolutionDate: null
            },
            status: null
        };
    }

    updateExtractedDataProductInfo(index: number) {
        for (let i = index; i < this.numberOfProductInfo; i++) {
            if (index === 0) {
                this.extractedData.facilityInfo = [];
            }
            this.extractedData.facilityInfo.push(JSON.parse(JSON.stringify(this.facilityInfo)));
        }
    }

    updateChangedDataProductInfo(index: number) {
        for (let i = index; i < this.numberOfProductInfo; i++) {
            if (index === 0) {
                this.changedData.facilityInfo = [];
            }
            this.changedData.facilityInfo.push(JSON.parse(JSON.stringify(this.facilityInfo)));
        }
    }

    handleProductInfoItems(): void {
        // Both extracted data and changed data facilityInfo are null
        if (
            (!this.extractedData && !this.changedData) ||
            (!this.extractedData.facilityInfo && !this.changedData.facilityInfo)
        ) {
            this.numberOfProductInfo = 0;
        } else if (!this.extractedData.facilityInfo && this.changedData.facilityInfo) {
            // extracted data facilityInfo is null
            this.numberOfProductInfo = this.changedData.facilityInfo.length;
            this.updateExtractedDataProductInfo(0);
        } else if (this.extractedData.facilityInfo && !this.changedData.facilityInfo) {
            // changed data facilityInfo is null
            this.numberOfProductInfo = this.extractedData.facilityInfo.length;
            this.updateChangedDataProductInfo(0);
        } else {
            if (this.extractedData.facilityInfo.length === this.changedData.facilityInfo.length) {
                this.numberOfProductInfo = this.changedData.facilityInfo.length;
            } else if (this.extractedData.facilityInfo.length > this.changedData.facilityInfo.length) {
                this.numberOfProductInfo = this.extractedData.facilityInfo.length;
                this.updateChangedDataProductInfo(this.changedData.facilityInfo.length);
            } else if (this.extractedData.facilityInfo.length < this.changedData.facilityInfo.length) {
                this.numberOfProductInfo = this.changedData.facilityInfo.length;
                this.updateExtractedDataProductInfo(this.extractedData.facilityInfo.length);
            }
        }
        this.facilityInfos = [];
        for (let i = 0; i < this.numberOfProductInfo; i++) {
            this.facilityInfos.push(JSON.parse(JSON.stringify(this.facilityInfo)));
        }
    }

    handleRejectClick(task: ISCTaskDetail) {
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
            if (response != null) {
                this.approvalStatusPayload = {
                    id:
                        'REASON_FOR_DELAY' === this.workflowType ||
                        'SCOPE_CERTIFICATE_NOT_AVAILABLE' === this.workflowType
                            ? this.entityId
                            : task.ttDocumentId,
                    certType: this.certificationType,
                    workflowStatus: ApprovalStatuses.REJECTED,
                    workflowType: this.workflowType,
                    fromCompanyId: this.toCompanyId,
                    toCompanyId: this.fromCompanyId,
                    certId: task.certId,
                    taskHistory: this.task,
                    comments: {
                        selectedComments: [],
                        otherComments: '',
                        resolutionDate: this.resolutionDate
                    },
                    facilityInfo: this.changedData ? this.changedData.facilityInfo : null
                };
                const responseArr = response.split(',');
                if (responseArr.length > 1) {
                    this.approvalStatusPayload.comments.otherComments = responseArr[1];
                }
                this.submitApprovalStatus();
            }
        });
    }

    /*  handleRejectClick(task: ISCTaskDetail) {
        const submissionDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '460px',
            data: {
                title: '',
                msg: 'Are you sure that you want to Reject the request?',
                primaryButton: 'Cancel',
                secondaryButton: 'Yes',
                class: '',
                showClose: false
            }
        });
        submissionDialog.afterClosed().subscribe(response => {
            if (response === 'Yes') {
                this.approvalStatusPayload = {
                    id: 'REASON_FOR_DELAY' === this.workflowType ? this.entityId : task.ttDocumentId,
                    certType: this.certificationType,
                    workflowStatus: ApprovalStatuses.REJECTED,
                    workflowType: this.workflowType,
                    fromCompanyId: this.toCompanyId,
                    toCompanyId: this.fromCompanyId,
                    certId: task.certId,
                    comments: {
                        selectedComments: [],
                        otherComments: this.remarks
                    },
                    facilityInfo: this.changedData ? this.changedData.facilityInfo : null
                };
                this.submitApprovalStatus();
            }
        });
    } */

    handleApproveClick(task: ISCTaskDetail) {
        this.pageLoading = true;
        let approveFlag = true;
        if (task && task.changedData) {
            const referenceIds = task.changedData.facilityInfo
                .map(fac => {
                    if (fac.doCreate && fac.matchedData.value === 'Create new') {
                        return fac.matchedData.code.toUpperCase();
                    } else {
                        return null;
                    }
                })
                .filter(val => val !== null);
            const payload = { referenceIds: referenceIds };

            let duplicateReferenceIds;
            this.profileService.isDuplicateReferenceIds(payload).subscribe(response => {
                duplicateReferenceIds = response['data'];

                if (duplicateReferenceIds.length !== 0) {
                    approveFlag = false;
                    this.pageLoading = false;
                    this.toastr.error(`Duplicate Facility Code(s) ${duplicateReferenceIds}`, 'Error');
                }

                if (approveFlag) {
                    this.approvalStatusPayload = {
                        id:
                            'REASON_FOR_DELAY' === this.workflowType ||
                            'SCOPE_CERTIFICATE_NOT_AVAILABLE' === this.workflowType
                                ? this.entityId
                                : task.ttDocumentId,
                        certType: this.certificationType,
                        workflowStatus: ApprovalStatuses.APPROVED,
                        workflowType: this.workflowType,
                        fromCompanyId: this.toCompanyId,
                        toCompanyId: this.fromCompanyId,
                        certId: task.certId,
                        taskHistory: this.task,
                        comments: {
                            selectedComments: [],
                            otherComments: this.remarks ? this.remarks : '',
                            resolutionDate: this.resolutionDate
                        },
                        facilityInfo: this.changedData.facilityInfo
                    };
                    this.submitApprovalStatus();
                }
            });
        } else {
            this.approvalStatusPayload = {
                id: this.entityId,
                certType: this.certificationType,
                workflowStatus: ApprovalStatuses.APPROVED,
                workflowType: this.workflowType,
                fromCompanyId: this.toCompanyId,
                toCompanyId: this.fromCompanyId,
                certId: task.certId,
                taskHistory: this.task,
                comments: {
                    selectedComments: [],
                    otherComments: this.remarks ? this.remarks : '',
                    resolutionDate: this.resolutionDate
                },
                facilityInfo: null
            };
            this.submitApprovalStatus();
        }
    }

    submitApprovalStatus() {
        this.pageLoading = true;
        this.taskManagerService.updateTaskStatus(this.approvalStatusPayload).subscribe(
            response => {
                this.resetForm();
                this.pageLoading = false;
                this.dialogRef.close();
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error('Unable to approve or reject. Please try after some time.', 'Failed');
            }
        );
    }

    removeDocument() {
        if (this.uploadedFile) {
            this.commonServices.removeDocument(this.taskId).subscribe();
        }
    }

    downloadEvidence(certId: string, fileName: string) {
        const file_name = fileName ? fileName : 'Certificate_Information.pdf';

        this.toastr.info('Requesting file. Please wait');
        this.commonServices.downloadCertificate(certId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, file_name);
            },
            failResponse => {
                this.toastr.error('File could not be downloaded. Please try after some time.', 'Failed');
            }
        );
    }

    getFileNameFromUrl(url: string) {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        return fileName.substring(fileName.indexOf('_') + 1);
    }

    openConfirmationDialog(data: any): void {
        const confirmationDialog = this.dialog.open(InformationConfirmDialogComponent, {
            width: '474px',
            panelClass: 'tc-upload-confirmation-dialog',
            data: {
                dialogData: data,
                buttonText: 'Ok',
                showClose: false,
                isMultiple: true
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response === 'Ok') {
                this.resetForm();
            }
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    ngOnDestroy() {
        this.modalOpen = false;
    }

    changeUpperCase(textToUpper: string, index: number) {
        if (textToUpper !== 'Not Available') {
            this.changedData.facilityInfo[index].matchedData.code = textToUpper.toUpperCase();
        }
    }
}
