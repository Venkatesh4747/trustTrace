import { AuthService } from './../../../core/user/auth.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
    getAddSupplierModelDefaultTemplate,
    IAddSupplierModelData,
    IAddSupplierResponse
} from '../../../shared/modals/add-supplier-v2/add-supplier-v2.model';
import { AddSupplierV2ModalComponent } from '../../../shared/modals/add-supplier-v2/add-supplier-v2.component';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { ISupplierListProfileData, ISupplierListEvents, tabNames } from '../supplier.model';
import { SuppliersService } from '../suppliers.service';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { Router } from '@angular/router';
import { amplitude } from '../../../shared/const-values';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { SupplierListTypes } from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { SubscriptionType } from '../../../shared/multi-industry-support/application-menu.model';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { UtilsService } from '../../../shared/utils/utils.service';
@Component({
    selector: 'app-suppliers-list',
    templateUrl: 'suppliers-list.component.html',
    styleUrls: ['suppliers-list.component.scss']
})
export class SuppliersListComponent implements OnInit {
    @Input() suppliers: Array<ISupplierListProfileData> = [];
    @Input() activeTab = '';
    @Input() totalCount = 0;

    tabs = tabNames;

    @Output() events: EventEmitter<ISupplierListEvents> = new EventEmitter();
    env = environment;

    @Input() launchAssessmentModalLoading = [];

    reminderEmailSendingInProgress = false;
    pageLoaded: boolean = false;

    reminderProgressIndividualState = [];
    get isNotFoodIndustry(): boolean {
        return this.multiIndustryService.industry !== 'food';
    }

    get getImage(): (iconName: string) => string {
        return this.utilsService.getcdnImage.bind(this.utilsService);
    }

    get isAdmin(): boolean {
        return this.auth.isAdmin();
    }

    get isBrand(): boolean {
        return (this.auth.user.subscriptionType as SubscriptionType) === 'BRAND';
    }

    get hasAdminGroup(): boolean {
        return this.auth.user.hasAdminGroup;
    }

    terminateButton = {
        text: [],
        values: ['Terminate', 'Terminating...']
    };

    get checkAccess(): (name: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    constructor(
        private toastr: CustomToastrService,
        private dialog: MatDialog,
        private supplierService: SuppliersService,
        private multiIndustryService: MultiIndustryService,
        private router: Router,
        private analyticsService: AnalyticsService,
        private auth: AuthService,
        private commonServices: CommonServices,
        private utilsService: UtilsService
    ) {}

    ngOnInit() {}

    /**
     * @method openAssessmentModel
     * @param supplier
     */
    openLaunchAssessmentModal(supplier: ISupplierListProfileData): void {
        if (this.auth.haveAccess('SUPPLIER_UPDATE')) {
            const event: ISupplierListEvents = {
                eventType: 'openAssessmentModel',
                data: supplier
            };
            this.events.emit(event);
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    /**
     * @method remainToAccept
     * @param supplier
     */
    remainToAccept(supplier: ISupplierListProfileData): void {
        if (this.reminderEmailSendingInProgress) {
            this.toastr.info('Please wait, the previous request is still in progress', 'Action in process');
            return;
        }
        this.analyticsService.trackEvent(amplitude.supplier.supplierInviteRemainderClicked, {
            Origin: amplitude.supplier.title
        });

        const { id } = supplier;
        this.reminderEmailSendingInProgress = true;
        this.reminderProgressIndividualState[id] = true;
        this.supplierService.sendRegistrationAssociationReminderEmail(id).subscribe(
            data => {
                this.reminderEmailSendingInProgress = false;
                this.reminderProgressIndividualState[id] = false;

                if (data.message) {
                    this.toastr.success(data.message, 'Success');
                } else {
                    this.toastr.success('Reminder email sent successfully', 'Success');
                }
            },
            error => {
                this.reminderEmailSendingInProgress = false;
                this.reminderProgressIndividualState[id] = false;

                if (error.error && error.error.message) {
                    this.toastr.error(error.error.message, 'Failed');
                } else {
                    this.toastr.error('Unable to send reminder email please try again later', 'Failed');
                }
            }
        );
    }

    confirmTerminateSupplier(supplier: ISupplierListProfileData, index: number): void {
        const supplierText = supplier.name + (supplier.reference_id ? ' - ' + supplier.reference_id : '');
        const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: '',
                msg: 'Are you sure you want to terminate, ' + `${supplierText}` + '?',
                primaryButton: 'Cancel',
                secondaryButton: 'Yes',
                class: '',
                showClose: false
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response === 'Yes') {
                this.terminateSupplier(supplier, index);
            }
        });
    }

    terminateSupplier(supplier: ISupplierListProfileData, index: number): void {
        this.terminateButton.text[index] = this.terminateButton.values[1];
        if (supplier.company_id && supplier.id) {
            this.supplierService.terminateSupplier(supplier.company_id, supplier.id).subscribe(
                () => {
                    this.totalCount = this.totalCount - 1;
                    this.suppliers = this.suppliers.filter(sup => sup.id !== supplier.id);
                    this.terminateButton.text[index] = this.terminateButton.values[0];
                    const event: ISupplierListEvents = {
                        eventType: 'totalCountEvent',
                        data: this.totalCount
                    };
                    this.events.emit(event);
                },
                () => {
                    this.terminateButton.text[index] = this.terminateButton.values[0];
                    this.toastr.error('Unable to terminate Supplier please try again later');
                }
            );
        } else {
            this.terminateButton.text[index] = this.terminateButton.values[0];
            this.toastr.error('Unable to terminate Supplier please try again later');
        }
    }

    /**
     * @method inviteSupplier
     * @param supplier
     */
    inviteSupplier(supplier: ISupplierListProfileData): void {
        if (this.auth.haveAccess('STYLE_UPDATE')) {
            const DIALOG_DATA: IAddSupplierModelData = getAddSupplierModelDefaultTemplate();
            DIALOG_DATA.actionType = 'INVITE';
            DIALOG_DATA.formControlConfig.doNotInvite.notCheckable = true;
            DIALOG_DATA.formControlConfig.values = supplier;
            DIALOG_DATA.templateConfig = {
                title: `Invite supplier`,
                btnLabel: {
                    cancel: 'Cancel',
                    submit: 'Send Invite'
                }
            };

            this.analyticsService.trackEvent(amplitude.supplier.inviteUninvitedSupplierClicked, {
                Origin: amplitude.supplier.title,
                Action: amplitude.supplier.inviteUninvitedSupplierClicked
            });

            const dialogRef = this.dialog.open(AddSupplierV2ModalComponent, {
                data: DIALOG_DATA
            });

            dialogRef
                .afterClosed()
                .pipe(take(1))
                .subscribe((result: IAddSupplierResponse) => {
                    if (result) {
                        if (result.status === 'SUCCESS') {
                            // success
                            this.toastr.success(
                                'An email invitation has been sent to this supplier and is awaiting acceptance.',
                                'Success'
                            );
                        } else {
                            // error
                        }
                    }
                });
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    /**
     * @method navigateToSupplierProfile
     * @param { id }
     * navigate to supplier profile page
     */
    navigateToSupplierProfile({ supplier_id, company_id, is_sub_supplier }: ISupplierListProfileData): void {
        console.log('event',supplier_id,company_id,is_sub_supplier);
      

        if (this.multiIndustryService.industry !== 'food' && supplier_id && !is_sub_supplier) {
            this.router.navigate(['/', 'suppliers', supplier_id]);
        } else if (this.multiIndustryService.industry !== 'food' && supplier_id && company_id && is_sub_supplier) {
            this.router.navigate(['/', 'suppliers', supplier_id, company_id]);
        }
    }

    /**
     * @method displayLocation
     * @param { supplier }
     */
    displayLocation(supplier: ISupplierListProfileData): string | boolean {
        if (!(supplier.supplier_city || supplier.supplier_state || supplier.supplier_country)) {
            return false;
        }

        return `${supplier.supplier_city ? supplier.supplier_city + ', ' : ''}
        ${supplier.supplier_state ? supplier.supplier_state + ', ' : ''}
        ${supplier.supplier_country ? supplier.supplier_country : ''}`;
    }

    /**
     * @method editSupplierInvite
     * @param { supplier }
     * when BRAND wants to edit their unaccepted suppliers invite link
     */

    editSupplierInvite(supplier: ISupplierListProfileData, index: number): void {
        if (this.auth.haveAccess('SUPPLIER_UPDATE')) {
            const DIALOG_DATA: IAddSupplierModelData = getAddSupplierModelDefaultTemplate();
            DIALOG_DATA.actionType = 'UPDATE';
            DIALOG_DATA.formControlConfig.doNotInvite.notCheckable = true;
            DIALOG_DATA.formControlConfig.supplierUid.isNotEditable = true;
            DIALOG_DATA.formControlConfig.companyName.isNotEditable = true;
            DIALOG_DATA.formControlConfig.location.isNotEditable = true;
            DIALOG_DATA.formControlConfig.values = supplier;
            DIALOG_DATA.templateConfig = {
                title: `Edit supplier invite`,
                btnLabel: {
                    cancel: 'Cancel',
                    submit: 'Send Invite'
                }
            };

            this.analyticsService.trackEvent(amplitude.supplier.editSupplierInviteClicked, {
                Origin: amplitude.supplier.title,
                Action: amplitude.supplier.editSupplierInviteClicked
            });

            const dialogRef = this.dialog.open(AddSupplierV2ModalComponent, {
                data: DIALOG_DATA
            });

            dialogRef
                .afterClosed()
                .pipe(take(1))
                .subscribe((result: IAddSupplierResponse) => {
                    if (result) {
                        if (result.status === 'SUCCESS') {
                            this.suppliers[index].contact_email = result.data.newEmailId;
                        } else {
                            // error
                        }
                    }
                });
        } else {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient permission');
        }
    }

    copySupplierInviteUrlToClipBoard(inputElement, index) {
        this.supplierService.getSupplierInviteLink(this.suppliers[index].id).subscribe(
            data => {
                inputElement.value = data.data;
                inputElement.select();
                document.execCommand('copy');
                this.toastr.success('Supplier invite link copied', 'Success');
            },
            error => {
                this.toastr.error('Unable to get supplier invite link please try again later', 'Failed');
            }
        );
    }

    private archiveSupplierById(supplierId: string): void {
        this.supplierService.archiveSupplier(supplierId).subscribe(
            data => {
                if (data?.status === 'Success') {
                    this.toastr.success('Supplier Archived Successfully', 'Successful');
                }
                setTimeout(() => {
                    this.events.emit();
                }, 1000);
            },
            error => {
                if (error) {
                    this.toastr.error(error?.error?.message, 'Failed');
                }
            }
        );
    }

    showTerminateButton(id: number): boolean {
        return id === SupplierListTypes.unAccepted_supplier || id === SupplierListTypes.accepted_supplier;
    }

    archiveSupplier(supplierId: string, supplierName: string): void {
        const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '540px',
            data: {
                title: `${this.commonServices.getTranslation('Are you sure you want to archive')} "${supplierName}"?`,
                msg: `Archiving the supplier will remove their details from your company account. You will no longer be able to send any new requests to the supplier.`,
                primaryButton: 'Cancel',
                secondaryButton: 'Archive Supplier',
                class: 'supplier-archive-modal-dialog-block supplier-archive-modal-dialog',
                showClose: true
            }
        });
        confirmDialog.afterClosed().subscribe(response => {
            if (response === 'Archive Supplier') {
                this.archiveSupplierById(supplierId);
            }
        });
    }
}
