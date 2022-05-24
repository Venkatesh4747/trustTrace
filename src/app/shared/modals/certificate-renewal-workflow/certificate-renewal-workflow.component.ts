import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';

const moment = _rollupMoment || _moment;

export interface IComments {
    selectedComments: string[];
    otherComments: string;
    resolutionDate: string;
}
export interface IReasons {
    id: string;
    title: string;
    name: string;
    checked: boolean;
}
export interface IDialogData {
    uploadCallBack: Function;
    submitCallBack: Function;
    options: IReasons[];
    showOtherOption: boolean;
    isDateEnabled: boolean;
    comments: IComments;
    task: any;
    texts: {
        titleL: string;
        subTitleL: string;
        titleR: string;
    };
}

@Component({
    selector: 'app-certificate-renewal-workflow',
    templateUrl: './certificate-renewal-workflow.component.html',
    styleUrls: ['./certificate-renewal-workflow.component.scss']
})
export class CertificateRenewalWorkflowComponent implements OnInit, OnDestroy {
    isUploading = false;
    isSubmitting = false;

    delayReason: string;
    otherComments: string;
    resolutionDate: Date;
    minDate: Date;

    moment = moment;

    constructor(
        private dialogRef: MatDialogRef<CertificateRenewalWorkflowComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IDialogData
    ) {}

    ngOnInit() {
        this.minDate = new Date();
    }

    ngOnDestroy() {
        this.data = {
            uploadCallBack: null,
            submitCallBack: null,
            options: [],
            showOtherOption: false,
            isDateEnabled: false,
            comments: {
                selectedComments: [],
                otherComments: null,
                resolutionDate: null
            },
            task: null,
            texts: {
                subTitleL: null,
                titleL: null,
                titleR: null
            }
        };
    }

    uploadCertificate() {
        if (this.data.uploadCallBack) {
            this.data.uploadCallBack();
        }
        this.closeDialog('Upload');
    }

    handleSubmitClick() {
        if (this.data.submitCallBack) {
            let submitCallBackPayload = {
                resolutionDate: moment(this.resolutionDate).format('YYYY-MM-DD'),
                reasons: []
            };
            if (this.delayReason === 'Other') {
                const optionsArr = this.data.options;
                optionsArr.forEach(reason => {
                    if (reason.title === 'Other') {
                        reason.name = this.otherComments;
                    }
                });
                submitCallBackPayload.reasons = optionsArr;
                this.data.submitCallBack('Other', submitCallBackPayload, this.data.task);
            } else {
                submitCallBackPayload.reasons = this.data.options;
                this.data.submitCallBack('Delay', submitCallBackPayload, this.data.task);
            }
        }
        this.closeDialog('Submit');
    }

    closeDialog(action: string) {
        this.dialogRef.close({ event: action });
    }

    changeDelayReason() {
        const reasonObjArr = this.data.options.filter(reasonObj => reasonObj.checked === true);
        if (reasonObjArr.length <= 0) {
            this.delayReason = null;
            this.otherComments = null;
        } else {
            const reasonArr = reasonObjArr.filter(reason => reason.name === 'Other');
            if (reasonArr.length <= 0) {
                this.delayReason = 'Delay';
                this.otherComments = null;
            } else {
                this.delayReason = 'Other';
            }
        }
    }
}
