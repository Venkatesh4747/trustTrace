import { CustomToastrService } from './../../../shared/commonServices/custom-toastr.service';
import { ICompanyFacility, IProductInfo } from './../task-manager.model';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import FileSaver from 'file-saver';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { UtilsService } from '../../../shared/utils/utils.service';
import {
    ITaskApprovalStatusRequestPayload,
    ITaskDetail,
    ITaskExtractedData,
    ApprovalStatuses
} from '../task-manager.model';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { InformationConfirmDialogComponent } from './../../../shared/modals/information-confirm-dialog/information-confirm-dialog.component';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { TaskManagerService } from './../task-manager.service';
import { AuthService } from '../../../core';
import { TransactionsService } from '../../transactions/transactions.service';
import { EvidenceService } from '../../evidence/evidence.service';

export type actions = 'Review' | 'View';

export enum action_types {
    review = 'Review',
    view = 'View'
}

@Component({
    selector: 'app-tc-approval-flow',
    templateUrl: './tc-approval-flow.component.html',
    styleUrls: ['./tc-approval-flow.component.scss']
})
export class TcApprovalFlowComponent implements OnInit, OnDestroy {
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

    extractedData: ITaskExtractedData;
    changedData: ITaskExtractedData;
    taskData: ITaskDetail;
    approvalStatusPayload: ITaskApprovalStatusRequestPayload;
    productInfo: IProductInfo;
    productInfos: IProductInfo[];
    fromCompanyId: string;
    toCompanyId: string;
    materialArr: any[];
    materialSearchReq = false;
    certNames: any[];
    facilityList: ICompanyFacility[];
    isFetchingFacilityList = false;
    SELLER_T2_FACILITY_NOT_MATCH = 'Seller does not match with selected T2 facility';
    SELLER_SUPPLIER_FACILITY_UID_NOT_MATCH = 'Seller does not match with selected T2 facility';
    SELECTED_T2_FACILITY_NO_VALID_SC = 'The selected T2 Facility does not have a valid Scope Certificate';
    T2_FACILITY_NO_VALID_SC = 'Supplier Facility UID does not have a valid Scope Certificate';
    actionType: actions;
    fromPage: string;
    task: any;
    taskViewPayload = {};

    constructor(
        private dialogRef: MatDialogRef<TcApprovalFlowComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        private utilService: UtilsService,
        private dialog: MatDialog,
        private toastr: CustomToastrService,
        private commonServices: CommonServices,
        private taskManagerService: TaskManagerService,
        public localeService: LocalizationService,
        private authService: AuthService,
        private transactionsService: TransactionsService,
        private evidenceService: EvidenceService
    ) {
        dialogRef.disableClose = true;
        this.taskId = data.taskId;
        this.certId = data.certId;
        this.showClose = data.showClose !== undefined ? data.showClose : true;
        this.showActionButtons = data.showActionButtons !== undefined ? data.showActionButtons : true;
        this.certificationType = data.certificationType;
        this.type = data.type;
        this.fromCompanyId = data.fromCompanyId;
        this.toCompanyId = data.toCompanyId;
        this.actionType = data.actionType ? data.actionType : action_types.review;
        this.fromPage = data.fromPage ? data.fromPage : '';
        this.task = data.task;
        this.fileName = data.fileName ? data.fileName : '';
    }

    ngOnInit() {
        this.resetForm();
        this.modalOpen = true;

        if (this.actionType === 'View') {
            switch (this.fromPage) {
                case 'Transaction Certificate':
                case 'Task Manager':
                    this.taskViewPayload = {
                        tt_document_transformed_id: this.taskId,
                        tt_document_id: ''
                    };
                    break;
                case 'Transaction Tree':
                    this.taskViewPayload = {
                        tt_document_transformed_id: '',
                        tt_document_id: this.taskId
                    };
                    break;
                default:
                    break;
            }
        }

        const fetchTask =
            this.actionType === 'Review'
                ? [
                      this.taskManagerService.getTaskDetail(this.taskId),
                      this.commonServices.getCertificate(this.certId),
                      this.commonServices.getAllCertificateNames(this.certId),
                      this.localeService.getMasterData()
                  ]
                : [
                      this.taskManagerService.getTaskViewDetail(this.taskViewPayload),
                      this.commonServices.getCertificate(this.certId),
                      this.commonServices.getAllCertificateNames(this.certId),
                      this.localeService.getMasterData()
                  ];

        forkJoin(fetchTask).subscribe(
            response => {
                this.taskData = JSON.parse(JSON.stringify(response[0]));
                this.extractedData = this.taskData.extractedData;
                this.changedData = this.taskData.changedData;

                // Reset seller of product
                if (this.changedData.sellerOfProduct === null) {
                    this.changedData.sellerOfProduct['value'] = null;
                }
                // Reset consignee of product
                if (this.changedData.consigneeOfProduct === null) {
                    this.changedData.consigneeOfProduct['value'] = null;
                }
                // Reset buyer of product
                if (this.changedData.buyerOfProduct === null) {
                    this.changedData.buyerOfProduct['value'] = null;
                }

                this.handleProductInfoItems();
                this.uploadedFile = response[1];
                this.certNames = response[2];
                this.localeService.addToMasterData(response[3]['data']);

                if (!this.fileName) {
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
        this.productInfo = {
            productName: null,
            tradeName: null,
            lotNumbers: null,
            grossWeight: null,
            netWeight: null,
            labelGrade: null,
            packedIn: null,
            productItem: { key: null, value: null },
            productItemMaterialComposition: null,
            supplierForTraderTC: null,
            yarnCOO: { country: [] },
            cottonLintCOO: { country: [] }
        };
        this.extractedData = {
            bodyIssuingCertificate: null,
            licenseCode: null,
            referenceNumber: null,
            sellerOfProduct: null,
            facility: { key: null, value: null },
            inspectionBody: null,
            lastProcessorOfProducts: null,
            countryOfDispatch: null,
            buyerOfProduct: null,
            consigneeOfProduct: null,
            countryOfConsignee: null,
            productAndShipmentInformation: null,
            grossWeight: null,
            netWeight: null,
            commercialWeight: null,
            placeAndDateOfIssue: null,
            certTypeId: null,
            productInfo: null,
            isTrader: false,
            scExpired: false
        };
        this.changedData = {
            bodyIssuingCertificate: null,
            licenseCode: null,
            referenceNumber: null,
            sellerOfProduct: null,
            facility: { key: null, value: null },
            inspectionBody: null,
            lastProcessorOfProducts: null,
            countryOfDispatch: null,
            buyerOfProduct: null,
            consigneeOfProduct: null,
            countryOfConsignee: null,
            productAndShipmentInformation: null,
            grossWeight: null,
            netWeight: null,
            commercialWeight: null,
            placeAndDateOfIssue: null,
            certTypeId: null,
            productInfo: null,
            isTrader: false,
            scExpired: false
        };
        this.taskData = {
            ttDocumentId: null,
            certType: null,
            certId: null,
            companyId: null,
            recordingFacility: null,
            creationDate: null,
            extractedData: JSON.parse(JSON.stringify(this.extractedData)),
            changedData: JSON.parse(JSON.stringify(this.changedData)),
            status: null,
            systemMessages: []
        };
        this.facilityList = [];
        this.isFetchingFacilityList = false;
    }

    updateExtractedDataProductInfo(index: number) {
        for (let i = index; i < this.numberOfProductInfo; i++) {
            if (index === 0) {
                this.extractedData.productInfo = [];
            }
            this.extractedData.productInfo.push(JSON.parse(JSON.stringify(this.productInfo)));
        }
    }

    updateChangedDataProductInfo(index: number) {
        for (let i = index; i < this.numberOfProductInfo; i++) {
            if (index === 0) {
                this.changedData.productInfo = [];
            }
            this.changedData.productInfo.push(JSON.parse(JSON.stringify(this.productInfo)));
        }
    }

    handleProductInfoItems(): void {
        // Both extracted data and changed data productInfo are null
        if (!this.extractedData.productInfo && !this.changedData.productInfo) {
            this.numberOfProductInfo = 0;
        } else if (!this.extractedData.productInfo && this.changedData.productInfo) {
            // extracted data productInfo is null
            this.numberOfProductInfo = this.changedData.productInfo.length;
            this.updateExtractedDataProductInfo(0);
        } else if (this.extractedData.productInfo && !this.changedData.productInfo) {
            // changed data productInfo is null
            this.numberOfProductInfo = this.extractedData.productInfo.length;
            this.updateChangedDataProductInfo(0);
        } else {
            if (this.extractedData.productInfo.length === this.changedData.productInfo.length) {
                this.numberOfProductInfo = this.changedData.productInfo.length;
            } else if (this.extractedData.productInfo.length > this.changedData.productInfo.length) {
                this.numberOfProductInfo = this.extractedData.productInfo.length;
                this.updateChangedDataProductInfo(this.changedData.productInfo.length);
            } else if (this.extractedData.productInfo.length < this.changedData.productInfo.length) {
                this.numberOfProductInfo = this.changedData.productInfo.length;
                this.updateExtractedDataProductInfo(this.extractedData.productInfo.length);
            }
        }
        this.productInfos = [];
        for (let i = 0; i < this.numberOfProductInfo; i++) {
            this.productInfos.push(JSON.parse(JSON.stringify(this.productInfo)));
        }
    }

    handleRejectClick(task: ITaskDetail) {
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
                    id: task.ttDocumentId,
                    certType: this.certificationType,
                    workflowStatus: ApprovalStatuses.REJECTED,
                    workflowType: 'TC_CERTIFICATE_APPROVAL',
                    fromCompanyId: this.toCompanyId,
                    toCompanyId: this.fromCompanyId,
                    certId: task.certId,
                    taskHistory: this.task,
                    comments: {
                        selectedComments: [],
                        otherComments: ''
                    }
                };
                const responseArr = response.split(',');
                if (responseArr.length > 1) {
                    this.approvalStatusPayload.comments.otherComments = responseArr[1];
                }
                this.submitApprovalStatus();
            }
        });
    }

    handleApproveClick(task: ITaskDetail) {
        this.approvalStatusPayload = {
            id: task.ttDocumentId,
            certType: this.certificationType,
            workflowStatus: ApprovalStatuses.APPROVED,
            workflowType: 'TC_CERTIFICATE_APPROVAL',
            fromCompanyId: this.toCompanyId,
            toCompanyId: this.fromCompanyId,
            certId: task.certId,
            taskHistory: this.task,
            comments: {
                selectedComments: [],
                otherComments: ''
            }
        };
        this.submitApprovalStatus();
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

    downloadAdditionalEvidence(certId: string, fileName: string) {
        this.toastr.info('Requesting file. Please wait');
        this.commonServices.downloadAdditionalCertificate(certId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
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
        this.materialArr = [];
    }

    getMaterialComposition(materialId, index) {
        let materialComposition = '';
        if (materialId) {
            const material = {
                id: materialId,
                value: ''
            };
            const searchPayload = {
                brandContextId: '',
                filter: {}
            };

            if (!this.materialArr) {
                this.materialArr = [];
            }
            const filteredArr = this.materialArr.filter(mat => mat.id === materialId);
            if (filteredArr.length <= 0) {
                searchPayload['brandContextId'] =
                    this.authService.user.brandsAssociated.length > 0
                        ? this.authService.user.brandsAssociated[0]
                        : this.authService.user.companyId;

                searchPayload['filter']['Material Unique Code'] = [];
                searchPayload['filter']['Material Unique Code'].push(materialId);
                if (!this.materialSearchReq) {
                    this.materialSearchReq = true;
                    this.changedData.productInfo[index].productItemMaterialComposition = 'Loading...';
                    this.transactionsService.searchFreeHandMaterial(searchPayload).subscribe(
                        response => {
                            const productItem: any = response['data']['searchResponse'][0];
                            if (typeof productItem === 'object') {
                                const mcList = productItem
                                    ? productItem.material_composition
                                        ? productItem.material_composition
                                        : []
                                    : [];
                                mcList.forEach(mc => {
                                    materialComposition += mc.composition + '% ' + mc.value + ',';
                                });
                            }
                            material.value =
                                materialComposition !== '' ? materialComposition.slice(0, -1) : 'Not Available';
                            this.materialArr.push(material);
                            this.materialSearchReq = false;
                            this.changedData.productInfo[index].productItemMaterialComposition = material.value;
                        },
                        () => {
                            this.changedData.productInfo[index].productItemMaterialComposition = 'Not Available';
                            this.materialSearchReq = false;
                        }
                    );
                }
            } else {
                this.changedData.productInfo[index].productItemMaterialComposition = filteredArr[0].value;
            }
        }
    }

    getFacilityListForCompany(): void {
        this.isFetchingFacilityList = true;
        this.facilityList = [];
        let payload = {
            companyId: this.taskData.companyId
        };
        this.evidenceService.getFacilityListForCompany(payload).subscribe(response => {
            this.isFetchingFacilityList = false;
            this.facilityList = response;
        });
    }

    convertArrayToString(strArr: string[]): string {
        return strArr.toString();
    }

    getT2FacilityErrorTooltip(taskData: ITaskDetail): string {
        let msg = this.SELLER_SUPPLIER_FACILITY_UID_NOT_MATCH;
        if (
            taskData &&
            taskData.systemMessages &&
            taskData.systemMessages.includes(this.SELECTED_T2_FACILITY_NO_VALID_SC)
        ) {
            msg = this.T2_FACILITY_NO_VALID_SC;
        }
        return msg;
    }

    showT2FacilityError(taskData: ITaskDetail): boolean {
        let showFlag = false;
        if (
            taskData &&
            taskData.systemMessages &&
            (taskData.systemMessages.includes(this.SELECTED_T2_FACILITY_NO_VALID_SC) ||
                taskData.systemMessages.includes(this.SELLER_T2_FACILITY_NOT_MATCH))
        ) {
            showFlag = true;
        }
        return showFlag;
    }

    getImage(imageName: string): string {
        return this.utilService.getcdnImage(imageName);
    }
}
