import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { MultiIndustryService } from '../../../../../../src/app/shared/multi-industry-support/multi-industry.service';
import { environment as env } from '../../../../../environments/environment';
import { AuthService } from '../../../../core';
import { AnalyticsService } from '../../../../core/analytics/analytics.service';
import { CommonServices } from '../../../../shared/commonServices/common.service';
import { ConfirmationModalComponent } from '../../../../shared/modals/confirmation-modal/confirmation-modal.component';
import { IRenameKeys } from '../../../../shared/utils/utils.model';
import { UtilsService } from '../../../../shared/utils/utils.service';
import { Group, ISearchPayload, ISort, Ou, User } from './user.model';
import { UsersService } from './users.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    public env = env;
    pageLoading = false;
    isDataLoading = false;
    users: User[];
    filteredUsers: User[];
    searchTerm = '';
    authUser: any;

    get isBrand(): boolean {
        return this.auth.user.subscriptionType === 'BRAND';
    }

    get isRetailer(): boolean {
        return this.auth.user.subscriptionType === 'RETAILER';
    }

    /* ============ Not audited field starts  ==============*/
    dropdownList = [];
    ml_name = 'suppliermultiselect';
    name_user = 'Name of the User';
    task_description = 'Task Description';
    associated_groups = 'Associated groups';
    division = 'Division';
    associated_facilities = 'Associated facilities';
    last_edited = 'Last Edited';
    request_type = 'Request Type';
    filter_session = 'um_users';
    optionsParam = { key: 'id', value: 'value' };
    divisionOptionsParam = { key: 'id', value: 'value' };
    sortByFilter: ISort = {
        sortBy: 'status',
        sortOrder: 'asc'
    };
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };
    searchText = '';
    disableInfiniteScroll = false;
    filterOptions: any = {};
    usersFilters: any = {};
    noAuthorizationMessage = env.error_messages.no_authorization;

    @ViewChild('tablecont', { static: false }) tablecont: ElementRef;
    module = 'USER_MANAGEMENT';

    /* ============ Not audited field ends  ==============*/

    get isBrandAssociated(): boolean {
        return !!(this.auth.user.brandsAssociated && this.auth.user.brandsAssociated.length > 0);
    }

    constructor(
        public dialog: MatDialog,
        private usersService: UsersService,
        private toastrService: CustomToastrService,
        private router: Router,
        private auth: AuthService,
        private utilsService: UtilsService,
        private analyticsService: AnalyticsService,
        private commonService: CommonServices,
        private multiIndustryService: MultiIndustryService
    ) {
        this.authUser = this.auth.user;
    }

    get isFoodIndustry(): boolean {
        return this.multiIndustryService.industry === 'food';
    }

    ngOnInit(): void {
        this.isDataLoading = true;
        this.pageLoading = true;

        this.disableInfiniteScroll = true;
        const payload = this.formSearchPayload();
        forkJoin([
            this.usersService.getUsersFilter(),
            this.usersService.getAllUsers(payload, this.isFoodIndustry)
        ]).subscribe(
            ([resUserFilter, resUserList]) => {
                this.usersFilters = JSON.parse(JSON.stringify(resUserFilter));
                this.users = this.renameNameKeys(JSON.parse(JSON.stringify(resUserList)));
                for (const key in this.usersFilters) {
                    if (this.usersFilters.hasOwnProperty(key)) {
                        this.filterOptions[key] = [];
                    }
                }
                this.updateFiltersSelection();
                this.pageLoading = false;
                this.disableInfiniteScroll = false;
                setTimeout(() => {
                    this.isDataLoading = false;
                }, 500);
            },
            error => {
                this.toastrService.error(
                    'Error in fetching data from server. Contact admin if this issue persist',
                    'Server Error'
                );
                this.pageLoading = false;
            }
        );
    }

    private formSearchPayload(): ISearchPayload {
        const payload: ISearchPayload = {
            module: this.module,
            filter: this.getFilteredOptions(),
            sort: this.sortByFilter,
            pagination: this.pagination
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        return payload;
    }

    private fetchUsers(): void {
        this.disableInfiniteScroll = true;
        this.updateFiltersSelection();
        const payload: ISearchPayload = this.formSearchPayload();
        this.isDataLoading = true;
        this.usersService.getAllUsers(payload, this.isFoodIndustry).subscribe(
            resp => {
                const parsedUsers = this.renameNameKeys(JSON.parse(JSON.stringify(resp)));
                if (resp.length > 0) {
                    if (!this.users || this.users.length === 0) {
                        this.users = JSON.parse(JSON.stringify(parsedUsers));
                    } else {
                        this.users.push(...JSON.parse(JSON.stringify(parsedUsers)));
                    }
                }
                this.disableInfiniteScroll = false;
                setTimeout(() => {
                    this.isDataLoading = false;
                }, 500);
            },
            errResp => {
                this.toastrService.error(
                    'Error in fetching data from server. Contact admin if this issue persist',
                    'Server Error'
                );
                this.pageLoading = false;
            }
        );
    }

    onScroll(): void {
        this.pagination.from = this.pagination.from + env.FETCH_SIZE;
        if (!this.disableInfiniteScroll) {
            this.fetchUsers();
        }
    }

    resetPagination(): void {
        this.users = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }

    searchUsers(event: KeyboardEvent): void {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.analyticsService.trackEvent('Search', {
                Origin: 'Users expansion panel',
                Action: `Search user with ${this.searchText}`
            });
            this.resetPagination();
            this.fetchUsers();
        }
    }

    updateFiltersSelection(): void {
        this.filterOptions = this.utilsService.getSessionStorageValue(this.filter_session) || {};
    }

    handleFilterSelection(type: string): void {
        this.analyticsService.trackEvent(`Filter - ${type}`, {
            Origin: 'Users expansion panel',
            Action: 'Filter Used'
        });
        this.utilsService.setSessionStorageValue(this.filter_session, this.filterOptions);
        this.resetPagination();
        this.fetchUsers();
    }

    getFilteredOptions(): { [key in string]: any } {
        const tempFilterOptions = {};
        const options = this.utilsService.getSessionStorageValue(this.filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return tempFilterOptions;
    }

    getFullName(user: User): string {
        return user.firstName + ' ' + user.lastName;
    }

    isActiveUser(user: User): boolean {
        return user.status === 'ACTIVE';
    }

    openActivateConfirmationPopup(id: string, fullName: string): void {
        this.analyticsService.trackEvent(`Activate user - ${fullName}`, {
            Origin: 'Users list',
            Action: 'Activate user clicked'
        });
        if (this.auth.haveAccess('UM_UPDATE')) {
            const dialogRef = this.dialog.open(ConfirmationModalComponent, {
                width: '375px',
                data: {
                    groupId: id,
                    title: `${this.commonService.getTranslation('Activate')} ${fullName} ?`,
                    description: 'Activation leads the user to gain all his privileges.',
                    buttonName: 'Activate User'
                }
            });
            dialogRef.componentInstance.handleDelete.pipe(take(1)).subscribe((data: any) => {
                this.pageLoading = true;
                this.usersService.activateUser(data.id).subscribe(
                    resp => {
                        this.users.forEach(user => {
                            if (user.id === id) {
                                user.status = 'ACTIVE';
                            }
                        });
                        this.toastrService.success('User activated successfully', 'Success');
                        this.pageLoading = false;
                        dialogRef.close();
                    },
                    err => {
                        this.toastrService.error('Error in activating the user', 'Server Error');
                        this.pageLoading = false;
                        dialogRef.close();
                    }
                );
            });
        } else {
            this.toastrService.info(this.noAuthorizationMessage, 'Insufficient permission');
        }
    }

    openDeactivateConfirmationPopup(id: string, fullName: string): void {
        this.analyticsService.trackEvent(`Deactivate user - ${fullName}`, {
            Origin: 'Users list',
            Action: 'Deactivate user clicked'
        });

        if (this.auth.haveAccess('UM_UPDATE')) {
            const dialogRef = this.dialog.open(ConfirmationModalComponent, {
                width: '375px',
                data: {
                    groupId: id,
                    title: `${this.commonService.getTranslation('Deactivate')} ${fullName} ?`,
                    description: 'Deactivation leads the user to loose all his privileges.',
                    buttonName: 'Deactivate User'
                }
            });
            dialogRef.componentInstance.handleDelete.subscribe((data: any) => {
                this.pageLoading = true;
                this.usersService
                    .deActivateUser(data.id)
                    .pipe(take(1))
                    .subscribe(
                        resp => {
                            this.toastrService.success('User deactivated successfully', 'Success');
                            // this.fetchUsers();
                            this.users.forEach(user => {
                                if (user.id === id) {
                                    user.status = 'INACTIVE';
                                }
                            });
                            this.pageLoading = false;
                            dialogRef.close();
                        },
                        err => {
                            if (err.error.status === 'FAILURE') {
                                this.toastrService.error(err.error.message);
                            } else {
                                this.toastrService.error('Error in deactivating the user', 'Oops');
                            }
                            this.pageLoading = false;
                            dialogRef.close();
                        }
                    );
            });
        } else {
            this.toastrService.info(this.noAuthorizationMessage, 'Insufficient permission');
        }
    }
    navigateToCreateUser(): void {
        this.analyticsService.trackEvent('Create New User clicked', {
            Origin: 'Users list',
            Action: 'Create New User clicked'
        });
        this.router.navigate(['/user/create-user']);
    }

    getToolTipContent(user: any, type = 'Status'): string {
        switch (type) {
            case 'Manage':
                if (this.isActiveUser(user)) {
                    return 'Manage User';
                } else {
                    return 'Cannot edit inactive user';
                }
            case 'Status':
                if (user.email === this.authUser.email) {
                    return `Self deactivation is not applicable`;
                } else if (this.isActiveUser(user)) {
                    return 'Deactivate User';
                } else {
                    return 'Activate User';
                }
            default:
                break;
        }
    }

    navigateToManageUser(id: string, email: string): void {
        this.analyticsService.trackEvent(`Manage User - ${email}`, {
            Origin: 'Users list',
            Action: 'Manage User clicked'
        });
        this.router.navigate(['/user/create-user', id, 'edit']);
    }

    renameNameKeys(data: any[]): any[] {
        const renameKeys: IRenameKeys[] = [
            {
                from: 'first_name',
                to: 'firstName'
            },
            {
                from: 'last_name',
                to: 'lastName'
            },
            {
                from: 'primary_contact',
                to: 'primaryContact'
            },
            ,
            {
                from: 'lo_location',
                to: 'loLocation'
            }
        ];
        return this.utilsService.renameKeys(data, renameKeys);
    }

    isSameUser(user: any): boolean {
        return this.auth.user.email === user.email;
    }

    displayDivision(division: any): string {
        return division ? division.join(', ') : null;
    }
}
