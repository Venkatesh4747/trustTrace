import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    passwordHide = true;
    confirmPasswordHide = true;
    password = '';
    confirmPassword = '';

    resetPasswordForm: FormGroup;
    verification_code: string;

    processing = false;
    passwordGood = false;

    ANALYTICS_EVENT_RESET_PASSWORD_PAGE = 'Reset-Password';

    environment = environment;

    currentYear: number;

    private passwordValidation: Subject<string> = new Subject();

    isExpired = false;
    isLoading = true;

    // returnUrl: string;

    env = environment;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private toastr: CustomToastrService,
        private authService: AuthService,
        private titleService: Title,
        private analyticsService: AnalyticsService,
        private multiIndustryService: MultiIndustryService
    ) {
        this.titleService.setTitle('TrusTrace | Reset Password');
        this.createResetPasswordForm();

        this.route.queryParams.subscribe(params => {
            if (params.token) {
                this.verification_code = params.token;
            } else {
                this.verification_code = this.authService.user.authToken;
            }
        });
    }

    createResetPasswordForm() {
        this.resetPasswordForm = this.fb.group({
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(15),
                    Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
                ]
            ],
            confirm_password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(15),
                    Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
                ]
            ]
        });
    }

    ngOnInit() {
        // this.returnUrl = '/dashboard';
        this.analyticsPageLoaded();

        this.authService.validateToken(this.verification_code).subscribe(
            resp => {
                if (resp.data.isValidToken) {
                    this.isLoading = false;
                    this.isExpired = false;
                } else {
                    this.isLoading = false;
                    this.isExpired = true;
                }
            },
            error => {
                this.toastr.error('Some thing went wrong', 'Error');
            }
        );

        this.currentYear = new Date().getFullYear();
    }

    onResetPassword() {
        this.processing = true;

        if (!this.passwordGood) {
            this.processing = false;
            this.toastr.error('Password not meeting requirements', 'Validation Error');
            return false;
        }

        const password = this.resetPasswordForm.value.password;
        const confirm_password = this.resetPasswordForm.value.confirm_password;

        if (password !== confirm_password) {
            this.processing = false;
            this.toastr.error('Your password and confirm password do not match.', 'Validation Error');
            return;
        }

        this.authService.attemptResetPassword(this.verification_code, btoa(password)).subscribe(
            response => {
                this.toastr.success(
                    'Password has been reset. You will be redirected to dashboard in a few seconds.',
                    'Success'
                );
                this.processing = false;
                this.autoLoginAfterPasswordReset(response);
            },
            () => {
                this.toastr.error('', 'Invalid verification code');
                this.processing = false;
            }
        );
    }

    autoLoginAfterPasswordReset(data: any) {
        this.authService.setSession(data);
        this.authService.startRefreshTokenTimer();
        this.authService.getUser().subscribe(
            response => {
                this.authService.setUser(response);
                if (!this.authService.user.passwordExpired) {
                    this.authService.loggedIn.next(true);
                    this.toastr.success('Login successful');
                    this.redirect();
                } else {
                    this.authService.checkIfPasswordExpired();
                }
            },
            failData => {}
        );
    }

    redirect(): void {
        const menus = this.multiIndustryService.getMenus(this.authService.user.subscriptionType);
        if (menus && menus.default_landing) {
            this.router.navigate([menus.default_landing]);
        } else {
            this.router.navigate(['/']);
        }
    }
    analyticsResetPasswordClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_RESET_PASSWORD_PAGE + ' Reset-Password#Clicked',
            analyticsOptions
        );
    }

    analyticsPageLoaded() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_RESET_PASSWORD_PAGE + '#Loaded', analyticsOptions);
    }

    validatePassword(isValid: boolean): void {
        this.passwordGood = isValid;
    }

    onNavigate(): void {
        this.router.navigate(['/forgot-password']);
    }
}
