import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment as env } from '../../../../environments/environment';
import { User, UserConfig } from '../../../views/user/brand-user-management/users/user.model';
import { UsersService } from '../../../views/user/brand-user-management/users/users.service';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

@Component({
    selector: 'app-create-user-modal',
    templateUrl: './create-user-modal.component.html',
    styleUrls: ['./create-user-modal.component.scss']
})
export class CreateUserModalComponent implements OnInit {
    public env = env;
    createUserForm: FormGroup;
    formProcessing = false;
    config: UserConfig;
    user: User;
    pageLoading = true;

    userId: string;
    mode: string;

    @ViewChild('createUserFormFGD', { static: false }) createUserFormFGD: FormGroupDirective;
    constructor(
        private fb: FormBuilder,
        private toastrService: CustomToastrService,
        private userService: UsersService,
        private route: ActivatedRoute,

        public dialogRef: MatDialogRef<CreateUserModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.config = { facilities: [], groups: [], ouAttribute: null };
        this.user = {
            firstName: '',
            lastName: '',
            enableEmailNotification: false,
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
                forkJoin(this.userService.getUserMgConfig(), this.userService.getUserById(this.userId)).subscribe(
                    ([res1, res2]) => {
                        this.config = JSON.parse(JSON.stringify(res1));
                        this.user = JSON.parse(JSON.stringify(res2));
                        this.pageLoading = false;

                        this.createUserForm = this.fb.group({
                            firstName: [this.user.firstName, [Validators.required]],
                            lastName: [this.user.lastName, [Validators.required]],
                            emailId: [this.user.email, [Validators.required, Validators.email]],
                            enableEmailNotification: [this.user.enableEmailNotification, [Validators.required]],
                            primaryContact: [this.user.primaryContact],
                            groups: this.fb.array([]),
                            facilitiesAssociated: this.fb.array([])
                        });
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
            enableEmailNotification: ['', [Validators.required]],
            primaryContact: [''],
            groups: this.fb.array([]),
            facilitiesAssociated: this.fb.array([])
        });
    }
    onCancel(): void {
        this.dialogRef.close();
    }
}

export interface DialogData {
    groupId: string;
    entityName: string;
    title: string;
    description: string;
    buttonName: string;
}

export interface EmitPayload {
    id: string;
}
