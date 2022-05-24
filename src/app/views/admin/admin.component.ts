import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Title } from '@angular/platform-browser';
import FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';
import { AdminService } from './admin.service';
import * as _moment from 'moment';
import { IReleaseUpdate } from '../../core/notifications/release-update/release-update.model';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { MultiIndustryService } from '../../shared/multi-industry-support/multi-industry.service';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';

export const MAT_FORMATS = {
    parse: {
        dateInput: 'LL'
    },
    display: {
        dateInput: 'YYYY-MM-DD',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY'
    }
};

function extensionShouldBe(assert: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        if (control.value) {
            const value = (control.value as string).match(/\.[0-9a-z]+$/i);
            if (value && value.length > 0) {
                return assert.includes(value[0]) ? null : { validExtension: false };
            }
        }
        return { validExtension: false };
    };
}

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_FORMATS }
    ]
})
export class AdminComponent implements OnInit {
    sideNavigation: any;
    fileToUpload: File = null;
    validated = false;
    validationResponse = '';
    demoUserEmail = '';
    user = {
        emailId: '',
        password: ''
    };
    bluePrintS3Url = '';

    emailLinkGenerateForm = new FormGroup({
        emailId: new FormControl('', [Validators.required, Validators.email])
    });

    emailLinkGenerated: string;
    bucketKey: string;
    blueprintFileToUpload: any;
    uploadingBluePrint: boolean;
    settingsType: string;
    selectedTabs: string[];
    conflictTypesList: any;
    exportingConflictData = false;
    releaseUpdateForm: FormGroup;
    minDate: Date;
    releaseUpdateInProgress = false;

    releaseUpdates: IReleaseUpdate[];
    moment = _moment;

    isStyleComplianceTriggered = false;

    buckets$: Observable<string[]>;
    calculationForm: FormGroup;
    calculationDataFile: File;
    calculationSubmitInProgress = false;
    isGenerateApiKeyExpanded = false;

    batchTrigger = {
        timeStamp: null,
        triggerInprogress: false,
        count: 0,
        fetchingData: false
    };

    get triggerBtnState(): boolean {
        return (
            this.batchTrigger.triggerInprogress ||
            _moment(this.batchTrigger.timeStamp).isAfter(_moment().subtract(1, 'hours'))
        );
    }
    get isFoodIndustry() {
        return this.multiIndustryService.industry === 'food';
    }

    constructor(
        private titleService: Title,
        private sideNav: SideNavigationService,
        private adminService: AdminService,
        private toastrService: CustomToastrService,
        private auth: AuthService,
        private multiIndustryService: MultiIndustryService
    ) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Admin');
        this.buckets$ = this.adminService.getDataSetBuckets();
        this.selectedTabs = ['general-settings', 'geoapi'];
        this.settingsType = this.selectedTabs[0];
    }

    ngOnInit(): void {
        this.getConflictTypes();
        this.minDate = new Date();
        this.releaseUpdateForm = new FormGroup({
            key: new FormControl('', Validators.required),
            date: new FormControl('', [Validators.required]),
            time: new FormControl('', Validators.required),
            message: new FormControl('', Validators.required)
        });

        this.calculationForm = new FormGroup({
            bucketName: new FormControl('', Validators.required),
            bucketKey: new FormControl('', [
                Validators.required,
                extensionShouldBe(environment.config.allowedExtensions.adminS3FileImportExtensions)
            ]),
            file: new FormControl()
        });

        this.adminService.getAllReleaseUpdate().subscribe(data => {
            this.releaseUpdates = data;
        });
        if (this.isFoodIndustry) {
            this.getLatestCalculationTriggerData();
        }
    }

    handleFileInput(files: FileList): void {
        this.fileToUpload = files.item(0);
        this.validated = false;
    }

    validateDataFile(): void {
        this.validationResponse = 'inprogress...';
        this.adminService.validateData(this.fileToUpload).subscribe(
            response => {
                this.validationResponse = 'validation successful';
                this.validated = true;
            },
            failResponse => {
                this.validationResponse = failResponse.error.message;
            }
        );
    }

    getConflictTypes(): void {
        this.adminService.getConflictTypes().subscribe(
            response => {
                this.conflictTypesList = response['data']['conflictTypesList'];
            },
            failResponse => {
                this.validationResponse = failResponse.error.message;
            }
        );
    }

    exportConflictData(type: any): void {
        this.exportingConflictData = true;
        this.adminService.exportConflictsData(type).subscribe(
            (response: any) => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                const fileName = 'COMPANY_CONFLICTS' + '.xlsx';
                this.exportingConflictData = false;
                FileSaver.saveAs(blob, fileName);
            },
            failResponse => {
                this.exportingConflictData = false;
                this.toastrService.error('Something went wrong');
            }
        );
    }

    resetPassword(): void {
        if (this.user.emailId === this.auth.user.email) {
            this.toastrService.info('you can now reset your password under your user profile');
            return;
        }
        this.adminService.resetPassword(this.user.emailId, btoa(this.user.password)).subscribe(
            response => {
                this.toastrService.success('Password reset successfully', 'Success');
                this.user = { emailId: '', password: '' };
            },
            failResponse => {
                this.toastrService.error('failed to update' + failResponse.error.message, 'Error');
            }
        );
    }

    sendEmailRequest(): void {
        this.adminService.sendEmailRequest(this.emailLinkGenerateForm.value.emailId).subscribe(
            response => {
                this.toastrService.success('Password reset link generated successfully', 'Success');
                this.emailLinkGenerated = response.data;
            },
            failResponse => {
                this.toastrService.error('failed to update' + failResponse.error.message, 'Error');
            }
        );
    }

    clearEmailField(): void {
        this.emailLinkGenerateForm.reset();
        this.emailLinkGenerated = null;
    }

    clearData(): void {
        this.user = { emailId: '', password: '' };
    }

    importData(): void {
        this.validationResponse = 'inprogress...';
        this.adminService.importData(this.fileToUpload).subscribe(
            response => {
                this.validationResponse = 'import successful';
                const sheetsToExport = response['data']['sheetsToExport'];

                if (sheetsToExport) {
                    sheetsToExport.forEach(conflictType => {
                        this.exportConflictData(conflictType);
                    });
                }
            },
            failResponse => {
                this.validationResponse = failResponse.error.message;
            }
        );
    }

    storeBlueprintFile(blueprintFile: any): void {
        this.blueprintFileToUpload = blueprintFile.item(0);
    }

    uploadBlueprint(): void {
        this.uploadingBluePrint = true;
        this.adminService.uploadBlueprint(this.blueprintFileToUpload, this.bucketKey).subscribe(
            response => {
                this.uploadingBluePrint = false;
                this.bluePrintS3Url = response.data;
            },
            errorResponse => {
                this.bluePrintS3Url = '';
                this.toastrService.error('failed to upload', 'Error');
                this.uploadingBluePrint = false;
            }
        );
    }

    copyUrl(inputElement: HTMLInputElement): void {
        inputElement.select();
        document.execCommand('copy');
        inputElement.setSelectionRange(0, 0);
        this.toastrService.success('Clipboard updated', 'Success');
    }

    onUpdateRelease(): void {
        const { date, time, message, key } = this.releaseUpdateForm.value;
        const timeAndDate = this.moment(date.format('YYYY MM DD') + ' ' + time);
        const payload: IReleaseUpdate = {
            message,
            expiryTs: timeAndDate,
            key
        };
        this.releaseUpdateInProgress = true;
        this.adminService.createReleaseUpdate(payload).subscribe(
            data => {
                const responseBody = data.body;
                if (data.status === 201) {
                    this.releaseUpdates.push(responseBody['data']);
                    this.toastrService.success('Release notification created successfully');
                    this.releaseUpdateForm.reset();
                }
                this.releaseUpdateInProgress = false;
            },
            error => {
                this.releaseUpdateInProgress = false;
                if (error.status === 403 || error.status === 409) {
                    this.toastrService.error(error.error.message);
                } else {
                    this.toastrService.error('Internal server error');
                }
            }
        );
    }

    deleteReleaseData(index: number): void {
        const { id } = this.releaseUpdates[index];
        this.adminService.deleteReleaseUpdate(id).subscribe(data => {
            this.toastrService.success(data.message);
            this.releaseUpdates.splice(index, 1);
        }, this.errorhandler);
    }

    triggerCompliance(): void {
        this.isStyleComplianceTriggered = true;
        this.adminService.triggerCompliance().subscribe(data => {
            this.isStyleComplianceTriggered = false;
        });
    }

    onSubmitCalculationDataSet(): void {
        const { bucketKey, bucketName } = this.calculationForm.value;

        if (this.calculationForm.invalid) {
            this.toastrService.error(`Please add valid data`, `Error`);
            return;
        }

        if (
            !this.calculationDataFile ||
            !this.calculationDataFile['name'] ||
            extensionShouldBe(environment.config.allowedExtensions.adminS3FileImportExtensions)(
                new FormControl(this.calculationDataFile['name'])
            ) !== null
        ) {
            this.toastrService.error(`Please select valid file`, `Error`);
            return;
        }

        const form = new FormData();
        form.append('file', this.calculationDataFile);
        form.append('bucketKey', bucketKey);
        form.append('bucketName', bucketName);
        this.calculationSubmitInProgress = true;
        this.adminService
            .uploadCalculationDatasets(form)
            .pipe(take(1))
            .subscribe(
                () => {
                    this.toastrService.success(`Uploaded successfully`, `Success`);
                    this.calculationForm.reset();
                    this.calculationSubmitInProgress = false;
                },
                error => {
                    this.calculationSubmitInProgress = false;
                    this.errorhandler(error, `Something went wrong please try again`);
                }
            );
    }

    bulkCalculationTrigger(): void {
        if (this.triggerBtnState) {
            return;
        }
        this.batchTrigger.triggerInprogress = true;
        this.adminService.triggerBatchOperation().subscribe(
            () => {
                this.batchTrigger.triggerInprogress = false;
                this.batchTrigger.timeStamp = _moment();
                this.batchTrigger.count = 0;
                this.toastrService.success('Calculation batch trigger success');
            },
            error => {
                this.batchTrigger.triggerInprogress = false;
                this.errorhandler(error);
            }
        );
    }

    getLatestCalculationTriggerData(): void {
        this.batchTrigger.fetchingData = true;

        this.adminService.batchOperationStatus().subscribe(
            responce => {
                this.batchTrigger.count = responce.executed_count;
                this.batchTrigger.timeStamp = responce.trigger_timestamp;
                this.batchTrigger.fetchingData = false;
            },
            error => {
                this.errorhandler(error);
                this.batchTrigger.fetchingData = false;
            }
        );
    }

    errorhandler(error: any, customErrorMessage: string = 'Something went wrong!'): void {
        this.toastrService.error(error?.error?.message || customErrorMessage, 'Error');
    }
}
