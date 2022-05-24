import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core';
import { TEmsService } from '../t-ems.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { filter } from 'rxjs/operators';
import { ContextService } from '../../../shared/context.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-evidence-collection',
    templateUrl: './evidence-collection.component.html',
    styleUrls: ['./evidence-collection.component.scss']
})
export class EvidenceCollectionComponent implements OnInit, AfterViewInit {
    pageLoading = true;
    isExistsUploadedFiles = false;
    evidenceCollectionData: any;
    evidenceCollectionJsonData: any;
    evidenceCollectionArray: [];

    trId: string;

    height = 200;

    queryParams = {};

    ANALYTICS_EVENT_T_EMS__EDIT_PAGE = 'T-EMS Edit-Page';

    constructor(
        private route: ActivatedRoute,
        public commonServices: CommonServices,
        private toastr: CustomToastrService,
        private router: Router,
        private trs: TEmsService,
        private appContext: ContextService,
        private localizationService: LocalizationService,
        public authService: AuthService,
        public dialog: MatDialog,
        private analyticsService: AnalyticsService
    ) {}

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.height =
            document.getElementById('evidence-collection-header').offsetHeight +
            document.getElementById('evidence-collection-table-title').offsetHeight;
    }

    ngOnInit() {
        this.analyticsEditPageLoaded();
    }

    ngAfterViewInit() {
        if (this.authService.user.companyId !== '') {
            this.init();
        } else {
            this.authService.initializeUser().then(() => {
                this.init();
            });
        }
    }

    init() {
        this.route.params.subscribe(params => {
            this.trId = params['trId'];
            this.getEvidenceCollectionData();
        });
    }

    getEvidenceCollectionData(): void {
        this.trs.getEvidenceCollectionData(this.trId).subscribe(
            response => {
                const evidenceData = response['data'];
                this.localizationService.addToMasterData(evidenceData['masterData']);
                this.evidenceCollectionJsonData = JSON.parse(JSON.stringify(evidenceData['evidenceCollection']));
                if (
                    this.evidenceCollectionJsonData.dataProvider === this.evidenceCollectionJsonData.supplierId &&
                    this.evidenceCollectionJsonData.supplierId === this.authService.user.companyId
                ) {
                    this.evidenceCollectionData = new Array(this.evidenceCollectionJsonData);
                } else {
                    this.evidenceCollectionData = this.evidenceCollectionJsonData.productEvidencesView;
                }
                this.pageLoading = false;
                this.onResize();
            },
            error => {
                this.pageLoading = false;
                this.toastr.error(error.error.message, 'Error');
                this.router.navigate(['/', 't-ems']);
            }
        );
    }

    checkEntityRequired(ecItem: { dataProvider: string; supplierId: string }): boolean {
        if (ecItem.dataProvider !== ecItem.supplierId) {
            return false;
        }
        return true;
    }

    checkIfUploadedFilesExist(dataCollection, searchKey) {
        let result = null;
        if (dataCollection instanceof Array) {
            for (let i = 0; i < dataCollection.length; i++) {
                result = this.checkIfUploadedFilesExist(dataCollection[i], searchKey);
                if (result) {
                    break;
                }
            }
        } else {
            for (let prop in dataCollection) {
                if (prop == 'evidencesView') {
                    for (let i = 0; i < dataCollection[prop].length; i++) {
                        for (let key in dataCollection[prop][i]) {
                            if (key === 'ttCertificate') {
                                if (
                                    dataCollection[prop][i][key][searchKey] &&
                                    dataCollection[prop][i][key][searchKey].length > 0
                                ) {
                                    return dataCollection;
                                }
                            }
                        }
                    }
                }
                if (dataCollection[prop] instanceof Object || dataCollection[prop] instanceof Array) {
                    result = this.checkIfUploadedFilesExist(dataCollection[prop], searchKey);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    }

    updateEvidence(action: string) {
        // Check for Agent Node payload
        this.pageLoading = true;
        this.trs.persistEvidenceCollection(this.evidenceCollectionJsonData, action, this.trId).subscribe(
            response => {
                this.toastr.success('Product Evidences updated', 'Success');
                setTimeout(() => {
                    this.pageLoading = false;
                    this.appContext.cardViewRefresh.next(true);
                    setTimeout(() => {
                        this.authService.getUser().subscribe(response => {
                            this.authService.setUser(response);
                            if (
                                this.authService.user.subscriptionType === 'SUPPLIER' &&
                                this.authService.previousUrl === '/supplier-dashboard'
                            ) {
                                this.router.navigate(['/', 'supplier-dashboard']);
                            } else {
                                this.router.navigate(['/', 't-ems']);
                            }
                        });
                    }, 300);
                }, 1000);
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error(failResponse.error.message, 'Failed');
            }
        );
    }

    persistEvidenceCollection(action: string) {
        this.isExistsUploadedFiles = this.checkIfUploadedFilesExist(this.evidenceCollectionData, 'uploadedFiles');
        if (action === 'SUBMIT') {
            if (this.isExistsUploadedFiles) {
                this.updateEvidence(action);
            } else {
                const dialogRef = this.dialog.open(ConfirmationModalComponent, {
                    width: '372px',
                    height: '262px',
                    data: {
                        title: 'No Certificates Uploaded!',
                        description: `${this.commonServices.getTranslation(
                            "You haven't uploaded any certificates"
                        )}. <br /> ${this.commonServices.getTranslation('Cancel to go back and upload certificates')}.`,
                        primaryButton: 'Cancel',
                        secondaryButton: 'Submit',
                        showClose: true
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    switch (result) {
                        case 'Submit':
                            this.updateEvidence(action);
                            break;
                        case 'Cancel':
                            break;
                        default:
                            break;
                    }
                });
            }
        } else {
            this.updateEvidence(action);
        }
    }

    analyticsEditPageLoaded() {
        const analyticsOptions = {};

        let utm_medium = '';
        this.route.queryParams.pipe(filter(params => params.utm_medium)).subscribe(params => {
            utm_medium = params.utm_medium;
        });
        if (utm_medium) {
            analyticsOptions[this.analyticsService.PROPERTY_SOURCE_MEDIUM] = utm_medium;
        }
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_EMS__EDIT_PAGE + '#Loaded', analyticsOptions);
    }

    analyticsBackButtonClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_EMS__EDIT_PAGE + ' Back#Clicked', analyticsOptions);
    }

    analyticsSaveButtonClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_EMS__EDIT_PAGE + ' Save#Clicked', analyticsOptions);
    }

    analyticsSubmitButtonClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_T_EMS__EDIT_PAGE + ' Submit#Clicked', analyticsOptions);
    }
}
