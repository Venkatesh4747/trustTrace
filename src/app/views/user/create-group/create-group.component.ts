import { AnalyticsService } from './../../../core/analytics/analytics.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment as env } from '../../../../environments/environment';
import { GroupConfigEntity, UserEntity, UserGroup } from '../brand-user-management/groups/group.model';
import { GroupsService } from '../brand-user-management/groups/groups.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-create-group',
    templateUrl: './create-group.component.html',
    styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit {
    public env = env;
    createGroupForm: FormGroup;
    isEditing = false;
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
    errorMessage: string;
    id: string;
    editMode = true;
    //users: []UserGroup;
    addedUsers: UserEntity[] = [];
    currentUsers: UserEntity[] = [];
    groupForm: FormGroup;
    payload: UserGroup = {
        groupName: '',
        groupDesc: '',
        addedUsers: [],
        default: false,
        moduleData: [],
        id: ''
    };

    @Input() labelKey = 'label';
    @Input() idKey = 'id';
    @Input() options = [];
    @Input() model;
    @ViewChild('tablecont', { static: false }) tablecont: ElementRef;
    @ViewChild('createGroupFormFGD', { static: true }) createGroupFormFGD: FormGroupDirective;

    constructor(
        private toastrService: CustomToastrService,
        private groupService: GroupsService,
        private fb: FormBuilder,
        private router: Router,
        private elementRef: ElementRef,
        private analyticsService: AnalyticsService
    ) {
        /* this.createUserForm = this._formbuilder.group({
            groupName: [this.payload.groupName, Validators.required],
            groupDescription: [this.payload.groupDesc, Validators.required]
        });*/
    }

    ngOnInit() {
        this.analyticsService.trackEvent('Create Group Page', {
            Action: 'Create group page visited'
        });
        this.resetForm();
        const els = this.elementRef.nativeElement.querySelector('#table-cont');
        els.addEventListener('scroll', scrollHandle);

        function scrollHandle(e) {
            const scrollTop = this.scrollTop;
            this.querySelector('thead').style.transform = 'translateY(' + scrollTop + 'px)';
        }

        this.pageLoading = true;
        this.groupService.getGroupConfig().subscribe(
            resp => {
                this.groupConfig = resp;
                this.currentUsers = this.groupConfig.users;
                this.groupConfig.modules.forEach(module => {
                    (this.createGroupForm.get('modules') as FormArray).push(
                        this.fb.control('2', [Validators.required])
                    );
                });
                this.pageLoading = false;
            },
            err => {
                this.toastrService.error(
                    'Error in fetching config. Contact admin if this issue persist',
                    'Server Error'
                );
                this.pageLoading = false;
            }
        );
    }

    resetForm() {
        this.createGroupForm = this.fb.group({
            groupName: ['', [Validators.required]],
            groupDescription: ['', [Validators.required]],
            modules: this.fb.array([]),
            selectedUsers: this.fb.array([])
        });
    }

    onSave() {
        if (!this.createGroupForm.valid) {
            this.toastrService.error('Please fix the errors on the form', 'Form Validation Error');
            return;
        }

        const createGroupForm = JSON.parse(JSON.stringify(this.createGroupForm.value));

        // TODO: validation is pending
        this.pageLoading = true;
        this.payload.addedUsers = JSON.parse(JSON.stringify(this.addedUsers));
        this.payload.moduleData = [];

        this.payload.groupName = createGroupForm.groupName;
        this.payload.groupDesc = createGroupForm.groupDescription;

        let index = 0;
        for (const module of this.groupConfig.modules) {
            this.payload.moduleData.push({
                module: module,
                allowedActions: {
                    fullAccess: createGroupForm.modules[index] === '1',
                    readOnly: createGroupForm.modules[index] === '2',
                    noAccess: createGroupForm.modules[index] === '3'
                },
                default: false
            });
            index++;
        }
        // console.log(this.payload);
        this.groupService.saveGroup(this.payload).subscribe(
            resp => {
                this.pageLoading = false;
                this.toastrService.success('Group saved successfully', 'Success');
                this.analyticsService.trackEvent('Group Created', {
                    Origin: 'Create group page',
                    Action: 'Group created'
                });
                this.router.navigate(['/user/brand-user-management']);
            },
            err => {
                if (err.error) {
                    this.toastrService.error(err.error.message, 'Oops');
                } else {
                    this.toastrService.error('Error in fetching saving the data. Try again later', 'Oops');
                }
                this.pageLoading = false;
            }
        );
    }

    onAddUser(userId) {
        this.addedUsers.push(this.groupConfig.users.find(u => u.id === userId));
        const confIndex = this.groupConfig.users.findIndex(u => u.id === userId);
        const currentUserIndex = this.currentUsers.findIndex(u => u.id === userId);
        this.groupConfig.users.splice(confIndex, 1);
        this.currentUsers.splice(currentUserIndex, 1);
    }
    onRemoveUser(userId: string) {
        const user = this.addedUsers.find(u => u.id === userId);
        this.groupConfig.users.push(user);
        this.currentUsers.push(user);
        const index = this.addedUsers.findIndex(u => u.id === userId);
        this.addedUsers.splice(index, 1);
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

    goBack() {
        this.router.navigate(['/user/', 'brand-user-management']);
    }
}
