import { Router } from '@angular/router';
import { AnalyticsService } from './../../../../core/analytics/analytics.service';
import { TooltipModalComponent } from './../../../../shared/modals/tooltip-modal/tooltip-modal.component';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment as env } from '../../../../../environments/environment';
import { ConfirmationModalComponent } from '../../../../shared/modals/confirmation-modal/confirmation-modal.component';
import { UserGroupData } from './group.model';
import { GroupsService } from './groups.service';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-groups',
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
    public env = env;

    groups: UserGroupData[];
    pageLoading = true;
    isDataLoading = false;
    acceptedStringLength = env.TRUNCATE_STRING_LENGTH;
    sortByFilter = {
        sortBy: 'status',
        sortOrder: 'asc'
    };
    pagination = {
        from: 0,
        size: env.FETCH_SIZE
    };
    searchText = '';
    disableInfiniteScroll = false;

    @ViewChild('tablecont', { static: false }) tablecont: ElementRef;

    constructor(
        private toastrService: CustomToastrService,
        private groupsService: GroupsService,
        public dialog: MatDialog,
        private analyticsService: AnalyticsService,
        private router: Router
    ) {}

    ngOnInit() {
        this.fetchGroups();
    }

    private formSearchPaylod() {
        const payload = {
            filter: {},
            sort: this.sortByFilter,
            pagination: this.pagination
        };
        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }
        return payload;
    }

    private fetchGroups() {
        this.isDataLoading = true;
        const payload = this.formSearchPaylod();
        this.disableInfiniteScroll = true;
        this.groupsService.getAllGroups(payload).subscribe(
            resp => {
                if (resp.length > 0) {
                    if (!this.groups || this.groups.length === 0) {
                        this.groups = JSON.parse(JSON.stringify(resp));
                    } else {
                        this.groups.push(JSON.parse(JSON.stringify(resp)));
                    }
                }
                this.disableInfiniteScroll = false;
                this.pageLoading = false;
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

    onScroll() {
        this.pagination.from = this.pagination.from + env.FETCH_SIZE;
        if (!this.disableInfiniteScroll) {
            this.fetchGroups();
        }
    }

    resetPagination() {
        this.groups = [];
        this.pagination = {
            from: 0,
            size: env.FETCH_SIZE
        };
    }

    searchGroups(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.isDataLoading = true;
            this.analyticsService.trackEvent('Search', {
                Origin: 'Groups expansion panel',
                Action: `Search group with ${this.searchText}`
            });
            this.resetPagination();
            this.fetchGroups();
        }
    }

    getAllDisplayText(payloadObj: any, truncate = true) {
        if (payloadObj) {
            let result = payloadObj.map(obj => obj.name);
            result = result.join(',');
            return result;
        }
    }

    getToolTipContent(value: boolean, type = 'Status') {
        switch (type) {
            case 'Manage':
                return 'Edit Group';
            case 'Status':
                return value ? `Can't delete default admin group` : 'Delete group';
            default:
                break;
        }
    }

    openTooltipModal(event: MouseEvent, inputs: any) {
        const target = new ElementRef(event.currentTarget);
        const dialogRef = this.dialog.open(TooltipModalComponent, {
            width: '350px',
            id: 'group-names',
            data: { inputs: inputs }
        });
    }

    onCreateGroup() {
        this.analyticsService.trackEvent('Create group clicked', {
            Origin: 'Groups list',
            Action: 'Create group clicked'
        });
        this.router.navigate(['/user/create-group']);
    }

    openConfirmationDialog(id, groupName): void {
        this.analyticsService.trackEvent(`Delete Group - ${name}`, {
            Origin: 'Groups list',
            Action: 'Delete Group clicked'
        });
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
            width: '375px',
            data: {
                groupId: id,
                title: 'Delete ' + groupName + ' ?',
                description: 'Deleting a group clears all the privileges to the users associated with it.',
                buttonName: 'Delete Group'
            }
        });
        const sub = dialogRef.componentInstance.handleDelete.subscribe(data => {
            this.pageLoading = true;
            this.groupsService.deleteGroup(data.id).subscribe(
                resp => {
                    const index = this.groups.findIndex(group => group.id === data.id);
                    if (index > -1) {
                        this.groups.splice(index, 1);
                    }
                    this.toastrService.success('Group Removed Successfully', 'Success');
                    this.pageLoading = false;
                    dialogRef.close();
                },
                err => {
                    this.toastrService.error('Error in deleting the group', 'Oops');
                    this.pageLoading = false;
                    dialogRef.close();
                }
            );
        });
        dialogRef.afterClosed().subscribe(result => {
            sub.unsubscribe();
            console.log('The dialog was closed');
        });
    }

    navigateToManageGroup(id: string, name: string) {
        this.analyticsService.trackEvent(`Manage Group - ${name}`, {
            Origin: 'Groups list',
            Action: 'Manage Group clicked'
        });
        this.router.navigate(['/user/manage-group', id]);
    }
}
