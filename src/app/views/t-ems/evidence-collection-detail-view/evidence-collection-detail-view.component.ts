import { ContextService } from './../../../shared/context.service';
import { ConfirmationModalComponent } from './../evidence-collection/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from './../../../../environments/environment';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { TEmsService } from '../t-ems.service';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { SubscriptionType } from '../../../shared/multi-industry-support/application-menu.model';
@Component({
    selector: 'app-evidence-collection-detail-view',
    templateUrl: './evidence-collection-detail-view.component.html',
    styleUrls: ['./evidence-collection-detail-view.component.scss']
})
export class EvidenceCollectionDetailViewComponent implements OnInit, AfterViewInit {
    public env = environment;

    trId: string;
    evidenceCollectionData: any;
    evidenceInfo: any;

    pageLoading: boolean = true;

    height = 200;

    selectedArticleName;

    get isBrand(): boolean {
        return (this.auth.user.subscriptionType as SubscriptionType) === 'BRAND';
    }

    constructor(
        private trs: TEmsService,
        private route: ActivatedRoute,
        public commonService: CommonServices,
        public localeService: LocalizationService,
        private toastr: CustomToastrService,
        private appContext: ContextService,
        public dialog: MatDialog,
        private router: Router,
        private auth: AuthService,
        private analyticsService: AnalyticsService
    ) {}

    @HostListener('window:resize', ['$event'])
    onResize() {
        setTimeout(() => {
            this.height =
                document.getElementById('evidence-collection-view-header').offsetHeight +
                document.getElementById('evidence-collection-view-table-title').offsetHeight;
        }, 0);
    }

    ngOnInit() {}

    ngAfterViewInit() {
        this.pageLoading = true;
        this.onPageLoad();
    }

    onPageLoad(): void {
        this.route.params.subscribe(params => {
            this.trId = params['trId'];
            this.getEvidenceCollectionViewData();
        });
    }

    lockOrUnlockEditRequest(id: string, isLock: boolean): void {
        let apiRequest = isLock ? this.trs.lockTr(id) : this.trs.unlockTr(id);
        this.pageLoading = true;

        apiRequest.subscribe(
            () => {
                this.onPageLoad();
                setTimeout(() => {
                    this.appContext.cardViewRefresh.next(true);
                    this.pageLoading = false;
                    let message = isLock
                        ? 'The T-EMS request locked successfully'
                        : 'The T-EMS request unlocked successfully';
                    this.toastr.success(message, 'Success');
                }, 1000);
            },
            error => {
                this.pageLoading = false;
                this.toastr.error('Error in processing the request. Please try again after sometime.', 'Error');
            }
        );
    }

    getEvidenceCollectionViewData(): void {
        this.trs.getEvidenceCollectionViewData(this.trId).subscribe(
            response => {
                const data = response['data'];
                this.localeService.addToMasterData(data['masterData']);
                this.evidenceCollectionData = data['evidenceCollection'];
                this.evidenceInfo = data['evidenceInfo'];
                this.pageLoading = false;
                this.onResize();
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.pageLoading = false;
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                    this.pageLoading = false;
                }
                this.onResize();
            }
        );
    }

    redirectToEdit() {
        this.router.navigate(['/', 't-ems', 'product', 'evidencecollection', this.trId, 'edit']);
    }

    onEdit() {
        if (this.evidenceInfo.dataProvider !== this.auth.companyId) {
            const dialogRef = this.dialog.open(ConfirmationModalComponent, {
                width: '372px',
                height: '262px',
                data: {
                    title: 'Edit Information?',
                    description: `${this.commonService.getTranslation(
                        'Information entered by the supplier'
                    )}  <br /> ${this.commonService.getTranslation('will not be updated once you edit')}.`,
                    primaryButton: 'Cancel',
                    secondaryButton: 'Proceed',
                    showClose: false
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                switch (result) {
                    case 'Proceed':
                        this.redirectToEdit();
                        break;
                    case 'Cancel':
                        break;
                    default:
                        break;
                }
            });
        } else {
            this.redirectToEdit();
        }
    }

    ANALYTICS_EVENT_T_EMS_DETAILED_VIEW_PAGE = 'T-EMS Detailed-View';
    analyticsEditClicked() {
        let analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_EMS_DETAILED_VIEW_PAGE + ' Edit#Clicked',
            analyticsOptions
        );
    }

    analyticsBackButtonClicked() {
        let analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_EMS_DETAILED_VIEW_PAGE + ' Back#Clicked',
            analyticsOptions
        );
    }
}
