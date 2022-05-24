import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilsService } from '../../utils/utils.service';
import { environment } from '../../../../environments/environment';
import { FormBuilder, Validators, FormArray, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { AssessmentAuditService } from '../../../views/assessment-audit/assessment-audit.service';
import * as FileSaver from 'file-saver';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { CommonServices } from '../../commonServices/common.service';
import { Document, parameterScore, IngredientScore, scoreTableDetail } from './score-table.modal';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { ProductsService } from '../../../views/products/products.service';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
@Component({
    selector: 'app-score-table',
    templateUrl: './score-table.component.html',
    styleUrls: ['./score-table.component.scss']
})
export class ScoreTableComponent implements OnInit {
    private readonly _matDialogRef: MatDialogRef<ScoreTableComponent>;
    env = environment;
    scoreTableData: scoreTableDetail;
    showClose: boolean;
    isRetailer: boolean;
    modifiedHeaders: any = [];
    values: any = [];
    justification: string = '';
    uploadedDocument = { fileId: '', fileName: [] };
    updatedTime = '';
    searchControl = new FormControl('');
    showSelectedData: string = '';
    justificationDocument = {};
    scoreHistoryVersions = [];
    tooltip: string = '';
    lastUpdatedBy: string = '';
    lastVersionId: string = '';
    public get getImage() {
        return this.utilService.getcdnImage.bind(this.utilService);
    }

    public get getDisplayText() {
        return this.localeService.getDisplayText.bind(this.localeService);
    }

    constructor(
        private dialogRef: MatDialogRef<ScoreTableComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData,
        private utilService: UtilsService,
        private productService: ProductsService,
        private formBuilder: FormBuilder,
        private assessmentAuditService: AssessmentAuditService,
        private toastrService: CustomToastrService,
        private commonService: CommonServices,
        private localeService: LocalizationService,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {
        this.showClose = this.dialogData.showClose !== undefined ? this.dialogData.showClose : true;
        this.isRetailer = this.dialogData.isRetailer;
        if (this.dialogData.title === 'Score History') {
            this.scoreHistoryVersions = this.changeTimeStamp(this.dialogData.data.values);
            this.dialogData.data = this.dialogData.data.latest_document;

            this.searchControl.setValue(this.scoreHistoryVersions[0]);

            this.showSelectedData = this.getSelectedDataName(this.searchControl.value);

            this.lastUpdatedBy = `${this.scoreHistoryVersions[0].updatedBy} ${this.commonService.getTranslation(
                'on'
            )} ${this.scoreHistoryVersions[0].shortDate}, ${this.scoreHistoryVersions[0].time}`;
        }
        this.constructTableFormGroup();
    }

    onSave(): void {
        if (!this.values.valid) {
            this.values.get('justification').markAsTouched();
            this.toastrService.error(
                'Please insert only values between 1 to 5 and ensure justification is mentioned. If a value is left blank, it will be considered as N/A'
            );
        } else {
            this.analyticsService.trackEvent('Score table save button clicked', {
                'Action Performed': 'Save score'
            });
            const documentDetails = this.getUploadedDocumentDetails(this.uploadedDocument);
            let documentArray = [];
            documentArray.push(documentDetails);
            const justificationDocument = {
                type: 'FILE',
                value: documentArray
            };
            const requestPayload = {
                productId: this.dialogData.productId,
                values: this.constructUpdatedScorePayload(this.values),
                justification: this.values.get('justification').value,
                document: justificationDocument,
                lastVersionId: this.lastVersionId
            };
            this.dialogRef.close({ data: requestPayload });
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    closeDialog(): void {
        this.analyticsService.trackEvent('Score table close button clicked', {
            'Action Performed': 'Dialog closed'
        });
        this.dialogRef.close();
    }

    downloadFile(fileId: string, fileName: string): void {
        this.analyticsService.trackEvent('Score table download button clicked', {
            'Action Performed': 'Score table justification document download'
        });
        this.toastrService.info('Requesting file. Please wait');
        this.assessmentAuditService.getFile(fileId, fileName).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
            },
            failData => {
                this.toastrService.error('Failed to download file. Error:' + `${failData.error.error}`);
            }
        );
    }

    InvokeFileUpload(): void {
        this.analyticsService.trackEvent('Score table upload button clicked', {
            'Action Performed': 'Score table justification document upload'
        });
        const element = document.getElementById('file_upload');
        element.click();
    }

    uploadFile(files: FileList): void {
        const fileNames = this.getFileNames();
        if (fileNames.length > 0) {
            this.toastrService.info(
                'Document already uploaded. Kindly delete existing one to replace with a new document',
                'Info'
            );
            return;
        }
        const documentId = this.uploadedDocument.fileId;
        const fileToUpload: File = files.item(0);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);

        if (
            !fileExtension ||
            fileExtension === '' ||
            environment.config.allowedExtensions.foodEditScoreJustificationDocuments.indexOf(
                fileExtension.toLowerCase()
            ) === -1
        ) {
            this.toastrService.error(
                'Please upload a supported File format: Excel, Word, PDF and Image',
                'Unsupported File Extension'
            );
            return;
        }
        this.assessmentAuditService.uploadFile(fileToUpload, documentId).subscribe(
            response => {
                this.toastrService.success('File uploaded', 'Success');
                this.uploadedDocument = {
                    fileId: response['data'].id,
                    fileName: response['data'].fileName
                };
            },
            () => {
                this.toastrService.error('The file could not be uploaded.', 'Error Uploading File!');
            }
        );
    }

    constructFormGroup(scoreData: any, parameters: any, modifiedHeaders: any): void {
        this.values = this.formBuilder.group({
            justification: this.formBuilder.control('', Validators.required),
            parameterScores: this.formBuilder.array([])
        });
        const value = <FormArray>this.values.controls.parameterScores;
        parameters.forEach((label, index) => {
            let i = 1;
            let group = this.formBuilder.group({});
            group.addControl('label', this.formBuilder.control(label));
            const data = scoreData[index];
            data['data'].forEach(calcScore => {
                if (i > 0 && i < modifiedHeaders.length - 1) {
                    let updatedScoreValue = calcScore['updatedScore'] < 1 ? null : calcScore['updatedScore'];
                    group.addControl(
                        modifiedHeaders[i++],
                        this.formBuilder.control(updatedScoreValue, [this.scoreValueValidator.bind(this)])
                    );
                }
            });
            value.push(group);
        });
    }

    parameterScores(): FormArray {
        return this.values.get('parameterScores') as FormArray;
    }

    constructUpdatedScorePayload(values: any): parameterScore[] {
        let scoreValues = [];
        Object.keys(values.controls).forEach(value => {
            if (value !== 'justification') {
                const parameters = values.get(value);
                Object.keys(parameters.controls).forEach(parameter => {
                    const parameterDetails = parameters.get(parameter);
                    scoreValues.push(this.payloadForOneParam(parameterDetails));
                });
            }
        });
        return scoreValues;
    }

    payloadForOneParam(parameterDetails: any): parameterScore {
        let label = parameterDetails.get('label').value;
        let updatedProductScore = +parameterDetails.get('Overall Score').value;
        let updatedIngredientsScores = [];
        for (let i = 0; i < this.scoreTableData.headers.length; i++) {
            if (i != 0 && i != 1 && i != this.scoreTableData.headers.length - 1) {
                let header = this.scoreTableData.headers[i];
                updatedIngredientsScores.push(
                    this.constructIngredientPayloadOneParam(header, parameterDetails.get(this.modifiedHeaders[i]).value)
                );
            }
        }
        let valuePayload = {
            label: label,
            updatedProductScore: updatedProductScore,
            ingredientScore: updatedIngredientsScores
        };
        return valuePayload;
    }

    constructIngredientPayloadOneParam(ingredientName: string, ingredientScore: number): IngredientScore {
        let ingredientScorePayload = {
            updatedScore: +ingredientScore,
            ingredientId: ingredientName
        };
        return ingredientScorePayload;
    }

    getUploadedDocumentDetails(documentDetails: any): Document {
        if (documentDetails.fileName.length <= 0) {
            documentDetails = {
                fileId: '',
                fileName: []
            };
        }
        return documentDetails;
    }

    getFileNames(): string[] {
        return this.uploadedDocument.fileName;
    }

    removeFile(fileName: string): void {
        const documentId = this.uploadedDocument.fileId;
        this.assessmentAuditService.removeFile(documentId, fileName).subscribe(
            response => {
                this.toastrService.success('File removed', 'Success');
                const indexOfFileName = this.uploadedDocument.fileName.indexOf(fileName);
                this.uploadedDocument.fileName.splice(indexOfFileName, 1);
            },
            failData => {
                this.toastrService.error('Failed to remove file. Error:' + `${failData.error.error}`);
            }
        );
    }

    private scoreValueValidator(control: AbstractControl): ValidationErrors {
        if (control.value === null || (control.value >= 1 && control.value <= 5)) {
            return null;
        }
        return { notValid: true };
    }

    getModifiedHeaders(headers: string[]): string[] {
        let modifiedHeaders = [...headers];
        headers.forEach((header, index) => {
            if (index > 1 && index < headers.length - 1) {
                modifiedHeaders[index] = 'Ingredient' + (index - 1) + header;
            }
        });
        return modifiedHeaders;
    }

    getHistoryByDateTime(): void {
        this.showSelectedData = this.getSelectedDataName(this.searchControl.value);
        if (this.isRetailer) {
            this.productService.getScoreHistory(this.searchControl.value._id, false).subscribe(
                data => {
                    this.dialogData.data = data;
                    this.constructTableFormGroup();
                },
                failResponse => {
                    this.toastrService.error('Unable to get history for selected version', 'Server Error');
                }
            );
        } else {
            this.productService.getScoreHistorySupplier(this.searchControl.value._id, false).subscribe(
                data => {
                    this.dialogData.data = data;
                    this.constructTableFormGroup();
                },
                failResponse => {
                    this.toastrService.error('Unable to get history for selected version', 'Server Error');
                }
            );
        }
    }

    getSelectedDataName(obj: any): string {
        return `${obj.date}, ${obj.updatedBy}, ${obj.time}`;
    }

    changeTimeStamp(scoreVersions: any[]): any[] {
        return scoreVersions.map(value => ({
            _id: value._id,
            updatedBy: value.updatedBy,
            date: this.getDate(value.timestamp, 'long'),
            shortDate: this.getDate(value.timestamp, 'short'),
            time: this.getTime(value.timestamp)
        }));
    }

    constructTableFormGroup(): void {
        if (this.dialogData.title === 'Edit Scores') {
            this.lastVersionId = this.dialogData.data.id;
        }
        this.scoreTableData = {
            headers: this.dialogData.data.header.label,
            subheaders: this.dialogData.data.subHeader.label,
            parameters: this.dialogData.data.parameters,
            scoredata: this.dialogData.data.scoreData,
            updatedBy: this.dialogData.data.updatedBy
        };
        this.modifiedHeaders = this.getModifiedHeaders(this.scoreTableData.headers);
        if (this.dialogData.data.document === undefined) {
            this.justificationDocument = {
                type: 'FILE',
                value: [{ fileId: '', fileName: [] }]
            };
        } else {
            this.justificationDocument = this.dialogData.data.document;
        }
        if (!this.dialogData.data.justification) {
            this.justification = this.commonService.getTranslation(
                'Score change occurred due to Product Re-Submission by Supplier'
            );
        } else {
            this.justification = this.dialogData.data.justification;
        }
        this.updatedTime = `${this.getDate(this.dialogData.data.updateTs, 'short')}, ${this.getTime(
            this.dialogData.data.updateTs
        )}`;
        this.tooltip = `${this.commonService.getTranslation('Updated by')} ${
            this.scoreTableData.updatedBy
        } ${this.commonService.getTranslation('on')} ${this.updatedTime}`;
        this.constructFormGroup(this.scoreTableData.scoredata, this.scoreTableData.parameters, this.modifiedHeaders);
    }

    getDate(timestamp: string, size: any): string {
        const d = new Date(timestamp);
        return d.toLocaleString('default', { day: 'numeric', month: size, year: 'numeric' });
    }

    getTime(timestamp: string): string {
        const d = new Date(timestamp);
        return d.toTimeString().split(' ')[0];
    }
}
