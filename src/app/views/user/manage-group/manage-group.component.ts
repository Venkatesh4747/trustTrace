import { AnalyticsService } from './../../../core/analytics/analytics.service';
import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { GroupConfigEntity, UserEntity, UserGroup } from '../brand-user-management/groups/group.model';
import { GroupsService } from '../brand-user-management/groups/groups.service';
import { MatRadioChange } from '@angular/material/radio';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-manage-group',
    templateUrl: './manage-group.component.html',
    styleUrls: ['./manage-group.component.scss']
})
export class ManageGroupComponent implements OnInit {
    public env = env;
    selectedCreateUserGroupName = '';
    pageLoading = false;

    // default placeholder data to avoid undefined erro during data load
    groupConfig: GroupConfigEntity = {
        privileges: ['Full Access', 'Read Only', 'No Access'],
        modules: [],
        users: [
            {
                id: '',
                username: '',
                firstName: '',
                lastName: '',
                email: ''
            }
        ]
    };
    // users: []UserGroup;
    addedUsers: UserEntity[] = [];
    currentUsers: UserEntity[] = [];
    currentGroup: UserGroup = {
        groupName: '',
        groupDesc: '',
        addedUsers: [],
        default: false,
        moduleData: [],
        id: ''
    };

    privileges = ['fullAccess', 'readOnly', 'noAccess'];

    private groupId: string;

    constructor(
        private toastrService: CustomToastrService,
        private groupService: GroupsService,
        private router: Router,
        private elementRef: ElementRef,
        private route: ActivatedRoute,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {
        this.analyticsService.trackEvent('Manage Group Page', {
            Action: 'Manage group page visited'
        });
        const els = this.elementRef.nativeElement.querySelector('#table-cont');
        els.addEventListener('scroll', scrollHandle);

        function scrollHandle(e) {
            const scrollTop = this.scrollTop;
            this.querySelector('thead').style.transform = 'translateY(' + scrollTop + 'px)';
        }

        this.pageLoading = true;
        this.route.params.subscribe(params => {
            this.pageLoading = true;
            this.groupId = params['groupId'];

            forkJoin(this.groupService.getGroupConfig(), this.groupService.getGroup(this.groupId)).subscribe(
                ([res1, res2]) => {
                    this.groupConfig = JSON.parse(JSON.stringify(res1));
                    this.currentGroup = JSON.parse(JSON.stringify(res2));
                    this.pageLoading = false;
                    this.addedUsers = this.currentGroup.addedUsers;

                    // eslint-disable-next-line guard-for-in
                    for (const arr in this.groupConfig.users) {
                        for (const filter in this.addedUsers) {
                            if (this.groupConfig.users[arr].id === this.addedUsers[filter].id) {
                                this.groupConfig.users.splice(Number(arr), 1);
                            }
                        }
                    }
                    this.currentUsers = this.groupConfig.users;
                },
                error => {
                    this.toastrService.error(
                        'Error in fetching data from server. Contact admin if this issue persist',
                        'Server Error'
                    );
                    this.pageLoading = false;
                }
            );
        });
    }

    onSave() {
        this.pageLoading = true;
        this.currentGroup.addedUsers = this.addedUsers;
        this.groupService.updateGroup(this.currentGroup).subscribe(resp => {
            this.pageLoading = false;
            this.toastrService.success('Group saved successfully', 'Success');
            this.analyticsService.trackEvent(`Update Group - ${this.currentGroup.groupName}`, {
                Origin: 'Manage group page',
                Action: 'Group updated'
            });
            this.router.navigate(['/user/brand-user-management']);
        });
    }

    onAddUser(userId) {
        this.addedUsers.push(this.groupConfig.users.find(u => u.id === userId));
        const confIndex = this.groupConfig.users.findIndex(u => u.id === userId);
        const currentUserIndex = this.currentUsers.findIndex(u => u.id === userId);
        this.groupConfig.users.splice(confIndex, 1);
        this.currentUsers.splice(currentUserIndex, 1);
    }

    onRemoveUser(userId: string) {
        if (this.addedUsers.length > 1) {
            const user = this.addedUsers.find(u => u.id === userId);
            this.groupConfig.users.push(user);
            const index = this.addedUsers.findIndex(u => u.id === userId);
            this.addedUsers.splice(index, 1);
        }
    }

    getToolTipContent() {
        return this.addedUsers.length === 1 ? 'At least one user should be present' : 'Delete User';
    }

    filterCurrentUsers(search: string) {
        if (search) {
            this.currentUsers = this.groupConfig.users.filter(
                u => u.firstName.includes(search) || u.lastName.includes(search) || u.email.includes(search)
            );
        } else {
            this.currentUsers = this.groupConfig.users;
        }
    }

    onChange(index: number, mrChange: MatRadioChange) {
        switch (mrChange.value) {
            case '1':
                this.currentGroup.moduleData[index].allowedActions['fullAccess'] = true;
                this.currentGroup.moduleData[index].allowedActions['readOnly'] = false;
                this.currentGroup.moduleData[index].allowedActions['noAccess'] = false;
                break;
            case '2':
                this.currentGroup.moduleData[index].allowedActions['fullAccess'] = false;
                this.currentGroup.moduleData[index].allowedActions['readOnly'] = true;
                this.currentGroup.moduleData[index].allowedActions['noAccess'] = false;
                break;
            case '3':
                this.currentGroup.moduleData[index].allowedActions['fullAccess'] = false;
                this.currentGroup.moduleData[index].allowedActions['readOnly'] = false;
                this.currentGroup.moduleData[index].allowedActions['noAccess'] = true;
                break;
        }
    }

    disablePrivileges(moduleName: string) {
        return moduleName === 'User Management' ? true : false;
    }

    goBack() {
        this.router.navigate(['/user/', 'brand-user-management']);
    }
}
