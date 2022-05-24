import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { AuthService } from '../../../core/user/auth.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import {
    EntityMicroView,
    FacilitiesAssociated,
    Group,
    IOUResp,
    User,
    UserConfig
} from '../brand-user-management/users/user.model';
import { UsersService } from '../brand-user-management/users/users.service';
import { ADMIN } from '../user-constant.model';
import { AnalyticsService } from './../../../core/analytics/analytics.service';
@Component({
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
    public env = env;
    createUserForm: FormGroup;
    pageLoading = true;
    formProcessing = false;
    get isBrand(): boolean {
        return this.authService.user.subscriptionType === 'BRAND';
    }

    get isRetailer(): boolean {
        return this.authService.user.subscriptionType === 'RETAILER';
    }

    @ViewChild('createUserFormFGD', { static: false }) createUserFormFGD: FormGroupDirective;
    private facilitiesAssociated: FacilitiesAssociated[];
    private groups: Group[];
    private OUAttributeList: IOUResp[] = [];
    user: User;
    config: UserConfig;
    userId: string;
    mode: string;
    enableOuInputs = true;

    constructor(
        private fb: FormBuilder,
        private toastrService: CustomToastrService,
        private router: Router,
        private userService: UsersService,
        private route: ActivatedRoute,
        private analyticsService: AnalyticsService,
        private authService: AuthService
    ) {
        this.config = { facilities: [], groups: [], ouAttribute: [] };
        this.user = {
            firstName: '',
            lastName: '',
            enableEmailNotification: true,
            email: '',
            groups: [],
            division: [],
            loLocation: [],
            facilitiesAssociated: [],
            status: '',
            id: '',
            primaryContact: false,
            ouAttributeData: []
        };
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.pageLoading = true;
            this.userId = params['userId'];
            this.mode = params['mode'];

            if (this.mode === 'edit') {
                forkJoin([this.userService.getUserMgConfig(), this.userService.getUserById(this.userId)]).subscribe(
                    response => {
                        this.config = JSON.parse(JSON.stringify(response[0]));
                        this.user = this.reStructureTheOUDate(JSON.parse(JSON.stringify(response[1])));
                        this.facilitiesAssociated = this.user.facilitiesAssociated;
                        this.groups = this.user.groups;
                        this.enableOuInputs = this.getAdminData()?.name !== ADMIN;
                        this.OUAttributeList = this.user.ouAttributeData ? this.user.ouAttributeData : [];
                        this.createUserForm = this.fb.group({
                            firstName: [this.user.firstName, [Validators.required]],
                            lastName: [this.user.lastName, [Validators.required]],
                            emailId: [this.user.email, [Validators.required, Validators.email]],
                            enableEmailNotification: [this.user.enableEmailNotification, [Validators.required]],
                            primaryContact: new FormControl({
                                value: this.user.primaryContact,
                                disabled: this.user.primaryContact
                            }),
                            groups: this.fb.array([this.user.groups]),
                            facilitiesAssociated: this.fb.array([this.user.facilitiesAssociated]),
                            ouAttributeData: this.fb.array([this.user.ouAttributeData])
                        });

                        this.pageLoading = false;
                    },
                    error => {
                        this.toastrService.error(
                            'Error in fetching data from server. Contact admin if this issue persist',
                            'Server Error'
                        );
                        this.pageLoading = false;
                    }
                );
            } else {
                this.pageLoading = true;
                this.userService.getUserMgConfig().subscribe(
                    resp => {
                        this.config = resp;
                        this.pageLoading = false;
                        if (!(this.isBrand || this.isRetailer)) {
                            // https://trustrace.atlassian.net/browse/FOOD-257
                            this.groups = resp.groups[0] ? [resp.groups[0]] : null;
                        }
                    },
                    () => {
                        this.toastrService.error('error in fetching data from server', 'oops');
                        this.pageLoading = false;
                    }
                );
                this.resetForm();
            }
        });
    }

    resetForm() {
        this.createUserForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            emailId: ['', [Validators.required, Validators.email]],
            enableEmailNotification: [true, [Validators.required]],
            primaryContact: [''],
            groups: this.fb.array([]),
            facilitiesAssociated: this.fb.array([]),
            ouAttributeData: this.fb.array([])
        });
    }

    onSave(): void {
        if (!this.createUserForm.valid || !this.groups || this.groups.length < 1) {
            this.toastrService.error('Please fix the errors on the form', 'Form Validation Error');
            return;
        } else if (!this.getAdminData()?.name && this.checkAllOUSelected() && this.config.ouAttribute.length) {
            this.toastrService.error('Selecting OU value is mandatory while creating a non-admin');
            return;
        }
        this.formProcessing = true;
        const createUserFormData = JSON.parse(JSON.stringify(this.createUserForm.value));
        this.user.firstName = createUserFormData.firstName;
        this.user.lastName = createUserFormData.lastName;
        this.user.email = createUserFormData.emailId;
        this.user.enableEmailNotification = createUserFormData.enableEmailNotification;
        this.user.primaryContact = createUserFormData.primaryContact;
        this.user.facilitiesAssociated = this.facilitiesAssociated;
        this.user.groups = this.groups;
        this.user.ouAttributeData = this.OUAttributeList.map(eachOUData => ({
            ouAttributeId: eachOUData.ouAttributeId,
            ouAttributeValues: eachOUData.ouAttributeValues
        }));
        if (this.mode === 'edit') {
            this.analyticsService.trackEvent(`Update user - ${this.user.email}`, {
                Origin: 'Manage User',
                Action: 'Update user clicked'
            });
            this.userService.updateUser(this.user).subscribe(
                () => {
                    this.formProcessing = false;
                    this.toastrService.success('User edited successfully', 'Success');
                    setTimeout(() => {
                        this.router.navigate(['/user/brand-user-management']);
                    }, 500);
                },
                err => {
                    if (err.error) {
                        this.toastrService.error(err.error.message, 'Oops');
                    } else {
                        this.toastrService.error('Error in fetching saving the data. Try again later', 'Oops');
                    }
                    this.formProcessing = false;
                }
            );
        } else {
            this.analyticsService.trackEvent(`Create user - ${this.user.email}`, {
                Origin: 'Create User',
                Action: 'Create user clicked'
            });
            this.userService.saveUser(this.user).subscribe(
                () => {
                    this.formProcessing = false;

                    this.toastrService.success('User created successfully', 'Success');
                    this.router.navigate(['/user/brand-user-management']);
                },
                err => {
                    if (err.error) {
                        this.toastrService.error(err.error.message, 'Error!');
                    } else {
                        this.toastrService.error('Something went wrong', 'Error!');
                    }
                    this.formProcessing = false;
                }
            );
        }
    }

    onFacilityChange(selectedFacilities: FacilitiesAssociated[]): void {
        this.facilitiesAssociated = selectedFacilities;
    }

    onGroupsChange(selectedGroups: Group[]): void {
        this.groups = selectedGroups;
        this.enableOuInputs = this.getAdminData()?.name !== ADMIN;
        if (!this.enableOuInputs) {
            this.OUAttributeList.length = 0;
        }
    }

    private getAdminData(): Group {
        return this.groups.find(({ name }) => name === ADMIN);
    }

    goBack(): void {
        this.router.navigate(['/user/', 'brand-user-management']);
    }

    formIsInvalid(): boolean {
        return this.createUserForm.invalid || !(this.groups && this.groups.length > 0);
    }

    getCheckedOption(option: EntityMicroView): boolean {
        let flag = false;
        if (this.groups && this.groups.length > 0 && this.groups[0].name === option.name) {
            flag = true;
        }
        return flag;
    }

    onOUSelect(selectedOU: EntityMicroView[], key: string): void {
        const OuValueList = selectedOU.map((selectedOUValue: EntityMicroView) => selectedOUValue?.name);
        const checkOUIdExist = this.OUAttributeList.map((eachOu: IOUResp) => eachOu?.ouAttributeId);
        if (checkOUIdExist.includes(key)) {
            this.OUAttributeList.forEach((eachOU: IOUResp) => {
                if (eachOU.ouAttributeId === key) {
                    eachOU.ouAttributeValues = OuValueList;
                }
            });
        } else {
            this.OUAttributeList.push({
                ouAttributeId: key,
                ouAttributeValues: OuValueList
            });
        }
        this.OUAttributeList = this.OUAttributeList.filter(eachOuData => eachOuData.ouAttributeValues.length);
    }

    getSelectedOUById(ouAttributeId: string): EntityMicroView[] {
        if (!this.user.ouAttributeData || this.user.ouAttributeData.length === 0) {
            return [];
        }
        let selectedOu = this.user.ouAttributeData.find(eachOu => eachOu?.id === ouAttributeId);
        if (!selectedOu) {
            return [];
        }
        return selectedOu.ouAttributeValues.map((ouValue: any) => ({
            id: ouValue,
            name: ouValue
        }));
    }

    private reStructureTheOUDate(user: User): User {
        if (!user.ouAttributeData) {
            user.ouAttributeData = null;
            return user;
        }
        user.ouAttributeData = user.ouAttributeData.map((ouData: IOUResp) => ({
            id: ouData.ouAttributeId,
            ouAttributeId: ouData.ouAttributeId,
            ouAttributeValues: ouData.ouAttributeValues
        }));
        return user;
    }

    private checkAllOUSelected(): boolean {
        const OUList = this.config.ouAttribute
            .map(({ id }) => id)
            .sort()
            .join();
        const selectedOUList = this.OUAttributeList.map(({ ouAttributeId }) => ouAttributeId)
            .sort()
            .join();
        return selectedOUList !== OUList;
    }
}
