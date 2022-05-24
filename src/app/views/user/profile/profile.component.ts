import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core';
import { SideNavigationService } from '../../../shared/side-navigation/side-navigation.service';
import { environment as env } from '../../../../environments/environment';
import { ProfileService } from './profile.service';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { filter } from 'rxjs/operators';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { USER_PROFILE_TAB_NAME, EmailFrequencyData } from './profile.const';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { amplitude } from '../../../shared/const-values';
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    sideNavigation;
    pageLoading = false;

    passwordGood = false;
    userForm: FormGroup;
    passwordUpdateForm: FormGroup;
    emailPreferences: string;
    settingsType = 'user-profile-tab';
    public env = env;
    message: string;
    passwordPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    tabName: string;
    tabSectionName = USER_PROFILE_TAB_NAME;
    emailFrequencyValueConstant = EmailFrequencyData;

    get userSubscription(): any {
        return this.authService.user.subscriptionType;
    }

    constructor(
        private sideNav: SideNavigationService,
        private authService: AuthService,
        private toastr: CustomToastrService,
        private translate: TranslateService,
        private userProfileService: ProfileService,
        private route: ActivatedRoute,
        private analyticsService: AnalyticsService,
        private router: Router,
        public dialog: MatDialog,
        private formBuilder: FormBuilder,
        private multiIndustryService: MultiIndustryService
    ) {
        this.sideNavigation = sideNav;
        this.route.queryParams.pipe(filter(params => params.tab)).subscribe(params => {
            if (params.tab === this.tabSectionName.PASSWORD_UPDATE_TAB) {
                this.settingsType = this.tabSectionName.PASSWORD_UPDATE_TAB;
            } else if (params.tab === this.tabSectionName.USER_PROFILE_TAB) {
                this.settingsType = this.tabSectionName.USER_PROFILE_TAB;
            } else if (
                params.tab === this.tabSectionName.EMAIL_NOTIFICATIONS_TAB &&
                this.userSubscription === 'SUPPLIER'
            ) {
                this.settingsType = this.tabSectionName.EMAIL_NOTIFICATIONS_TAB;
            }
            if (
                params.tab !== this.tabSectionName.PASSWORD_UPDATE_TAB &&
                params.tab !== this.tabSectionName.USER_PROFILE_TAB &&
                params.tab !== this.tabSectionName.EMAIL_NOTIFICATIONS_TAB
            ) {
                this.toastr.info('The specified tab does not exist!', 'Invalid tab name');
            }
        });
    }

    languages = [
        {
            code: '',
            languageName: ''
        }
    ];

    preferredLanguage: any;

    ANALYTICS_USER_PROFILE_EVENT = 'User Profile';
    ANALYTICS_TOP_NAVIGATION_ORIGIN = 'Top Navigation';
    ANALYTICS_ACTION_USER_PROFILE_VIEW = 'USER_PROFILE_VIEW';

    updateEmailPreferences($event: any) {
        this.userProfileService.emailTimeFrameUpdate($event.value).subscribe(
            data => {
                this.toastr.success('Your email preference is updated successfully.', 'Success');
                if (data.data === this.emailFrequencyValueConstant.WEEKLYNOTIFY) {
                    this.analyticsService.trackEvent(amplitude.supplier.weeklyNotifyEmailPreferenceClicked, {
                        Action: amplitude.supplier.weeklyNotifyEmailPreferenceClicked
                    });
                } else if (data.data === this.emailFrequencyValueConstant.INSTANTNOTIFY) {
                    this.analyticsService.trackEvent(amplitude.supplier.instantNotifyEmailPreferenceClicked, {
                        Action: amplitude.supplier.instantNotifyEmailPreferenceClicked
                    });
                }
            },
            () => {
                this.toastr.error('Something went wrong. Please try again later.', 'Failed');
            }
        );
    }

    pageLoad(pageName: string) {
        this.settingsType = pageName;
        if (this.settingsType === this.tabSectionName.USER_PROFILE_TAB) {
            this.tabName = 'General Setting';
        } else if (this.settingsType === this.tabSectionName.PASSWORD_UPDATE_TAB) {
            this.tabName = 'Password Setting';
        } else if (
            this.settingsType === this.tabSectionName.EMAIL_NOTIFICATIONS_TAB &&
            this.userSubscription === 'SUPPLIER'
        ) {
            this.tabName = 'Email Setting';
            this.userProfileService.getEmailPreference().subscribe(
                data => {
                    this.emailPreferences = data.data.emailFrequency;
                },
                () => this.toastr.error('Failed to fetch email preference settings.', 'Failed')
            );
        }
        const analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_USER_PROFILE_VIEW;
        this.analyticsService.trackEvent(this.ANALYTICS_USER_PROFILE_EVENT + this.tabName, analyticsOptions);
        this.router.navigate(['/user/profile'], { queryParams: { tab: this.settingsType } });
        this.initForms();
    }

    ngOnInit() {
        this.pageLoading = true;
        this.pageLoad(this.settingsType);

        if (this.multiIndustryService.industry === 'default') {
            this.userProfileService.getSupportedLanguages().subscribe(resp => {
                const data = resp['data'];
                this.languages = data;
            });
        } else {
            this.languages = [
                {
                    code: 'en',
                    languageName: 'English'
                },
                {
                    code: 'sv',
                    languageName: 'Swedish'
                }
            ];
        }

        this.authService.getUser().subscribe(data => {
            this.authService.setUser(data);
            this.preferredLanguage = data.language;
            this.pageLoading = false;
        });
        this.initForms();
        let analyticsOptions = {};
        analyticsOptions[this.analyticsService.PROPERTY_ORIGIN] = this.ANALYTICS_TOP_NAVIGATION_ORIGIN;
        analyticsOptions[this.analyticsService.PROPERTY_ACTION_PERFORMED] = this.ANALYTICS_ACTION_USER_PROFILE_VIEW;
        this.analyticsService.trackEvent(this.ANALYTICS_USER_PROFILE_EVENT, analyticsOptions);
    }

    initForms() {
        this.userForm = this.formBuilder.group({
            firstName: new FormControl(this.authService.user.firstName, Validators.required),
            lastName: new FormControl(this.authService.user.lastName, Validators.required),
            language: new FormControl(this.authService.user.language),
            emailId: new FormControl({ value: this.authService.user.email, disabled: true })
        });
        this.passwordUpdateForm = this.formBuilder.group(
            {
                currentPW: new FormControl(null),
                newPW: new FormControl(null),
                confirmPW: new FormControl(null)
            },
            {
                validator: this.checkPasswords
            }
        );
    }
    checkPasswords(group: FormGroup) {
        let pass = group.controls.newPW;
        let confirmPass = group.controls.confirmPW;
        if (pass.value !== confirmPass.value) {
            confirmPass.setErrors({
                notSame: true
            });
        }
        //return pass === confirmPass ? null : { notSame: true };
    }

    languageChange(selectedLanguage) {
        if (selectedLanguage !== '' || selectedLanguage !== undefined) {
            this.userProfileService.updateLanguage(selectedLanguage).subscribe(
                () => {
                    this.toastr.success('Language selected successfully', 'Success');
                    this.authService.getUser().subscribe(
                        data => {
                            this.authService.setUser(data);
                        },
                        failResponse => {
                            if (failResponse.error && failResponse.error.message) {
                                this.toastr.error(failResponse.error.message, 'Failed');
                            } else {
                                this.toastr.error('Unable to load user data', 'Failed');
                            }
                        }
                    );
                },
                failResponse => {
                    if (failResponse.error && failResponse.error.message) {
                        this.toastr.error(failResponse.error.message, 'Failed');
                    } else {
                        this.toastr.error('Unable to Update Language', 'Failed');
                    }
                }
            );
        }
        this.translate.use(selectedLanguage);
    }
    onSubmit() {
        const analyticsOptions = {};
        analyticsOptions['updatedUserProfile'] = this.userForm.value;
        this.analyticsService.trackEvent(
            this.ANALYTICS_USER_PROFILE_EVENT + 'Save clicked in General Setting',
            analyticsOptions
        );
        if (this.userForm.valid) {
            this.userProfileService.updateUserProfile(this.userForm.value).subscribe(
                () => {
                    this.toastr.success('UserProfile updated successfully', 'Success');
                    this.translate.use(this.userForm.value.language);
                    this.authService.getUser().subscribe(
                        data => {
                            this.authService.setUser(data);
                        },
                        failResponse => {
                            if (failResponse.error && failResponse.error.message) {
                                this.toastr.error(failResponse.error.message, 'Failed');
                            } else {
                                this.toastr.error('Unable to load user data', 'Failed');
                            }
                        }
                    );
                },
                failResponse => {
                    if (failResponse.error && failResponse.error.message) {
                        this.toastr.error(failResponse.error.message, 'Failed');
                    } else {
                        this.toastr.error('Unable to update User data', 'Failed');
                    }
                    this.pageLoading = false;
                }
            );
        } else {
            this.toastr.error('Please fix the errors on the form', 'Form Validation Error');
        }
    }
    onSave() {
        if (this.passwordUpdateForm.valid && this.passwordGood) {
            this.userProfileService
                .updatePassword(
                    btoa(this.passwordUpdateForm.value.currentPW),
                    btoa(this.passwordUpdateForm.value.newPW)
                )
                .subscribe(
                    resp => {
                        this.authService.setSessionTokenUserModule(resp);
                        this.toastr.success('Password updated successfully', 'Success');
                        this.authService.getUser().subscribe(
                            data => {
                                this.authService.setUser(data);
                            },
                            failResponse => {
                                if (failResponse.error && failResponse.error.message) {
                                    this.toastr.error(failResponse.error.message, 'Failed');
                                } else {
                                    this.toastr.error('Unable to load user data', 'Failed');
                                }
                            }
                        );
                        this.discardPasswordForm();
                    },
                    failResponse => {
                        if (failResponse.error && failResponse.error.message) {
                            this.toastr.error(failResponse.error.message, 'Failed');
                        } else {
                            this.toastr.error('Unable to update Password', 'Failed');
                        }
                        this.pageLoading = false;
                    }
                );
        } else {
            this.toastr.error('Please fix the errors on the form', 'Form Validation Error');
        }
    }
    focused() {
        let password = this.passwordUpdateForm.get('currentPW').value;
        if (password !== '') {
            Object.keys(this.passwordUpdateForm.controls).forEach(value => {
                if (value == 'currentPW') {
                    this.passwordUpdateForm.get(value).setValidators([Validators.required]);
                    this.passwordUpdateForm.get(value).updateValueAndValidity();
                } else {
                    this.passwordUpdateForm
                        .get(value)
                        .setValidators([Validators.required, Validators.pattern(this.passwordPattern)]);
                    this.passwordUpdateForm.get(value).updateValueAndValidity();
                }
            });
        } else {
            Object.keys(this.passwordUpdateForm.controls).forEach(value => {
                this.passwordUpdateForm.get(value).clearValidators();
                this.passwordUpdateForm.get(value).updateValueAndValidity();
            });
        }
    }
    discard() {
        this.userForm.reset({ emailId: this.userForm.get('emailId').value });
    }
    discardPasswordForm() {
        this.passwordUpdateForm.reset();
    }
    userFormHasError(controlName: string, errorName: string) {
        return (
            this.userForm.touched && this.userForm.invalid && this.userForm.controls[controlName].hasError(errorName)
        );
    }
    passwordUpdateFormHasError(controlName: string, errorName: string) {
        return (
            this.passwordUpdateForm.touched &&
            this.passwordUpdateForm.invalid &&
            this.passwordUpdateForm.controls[controlName].hasError(errorName)
        );
    }
    validatePassword(isValid: boolean): void {
        this.passwordGood = isValid;
    }

    onValidateCurrentPassword() {
        this.analyticsService.trackEvent(this.ANALYTICS_USER_PROFILE_EVENT + 'Save clicked in Password Setting');
        if (this.passwordUpdateForm.valid && this.passwordGood) {
            this.userProfileService.validateCurrentPW(btoa(this.passwordUpdateForm.value.currentPW)).subscribe(
                () => {
                    const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
                        width: '460px',
                        data: {
                            title: 'Information',
                            msg: 'All other active sessions will be logged out once the password is changed',
                            primaryButton: 'Cancel',
                            secondaryButton: 'Proceed',
                            showClose: true
                        }
                    });
                    confirmationDialog.afterClosed().subscribe(response => {
                        if (response != null) {
                            if (response === 'Proceed') {
                                this.onSave();
                            }
                        }
                    });
                },
                failResponse => {
                    if (failResponse.error && failResponse.error.message) {
                        this.toastr.error(failResponse.error.message, 'Failed');
                    } else {
                        this.toastr.error('Unable to update Password', 'Failed');
                    }
                    this.pageLoading = false;
                }
            );
        } else {
            this.toastr.error('Please fix the errors on the form', 'Form Validation Error');
        }
    }
}
