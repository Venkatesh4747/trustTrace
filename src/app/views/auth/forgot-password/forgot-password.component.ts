import { environment } from './../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
    forgotPasswordForm: FormGroup;
    processing = false;
    env = environment;
    currentYear: number;

    constructor(
        private fb: FormBuilder,
        private toastr: CustomToastrService,
        private authService: AuthService,
        private titleService: Title,
        private analyticsService: AnalyticsService
    ) {
        this.titleService.setTitle('TrusTrace | Forgot Password');
        this.createForgotPasswordForm();
    }

    createForgotPasswordForm() {
        this.forgotPasswordForm = this.fb.group({
            emailId: ['', [Validators.email, Validators.required]]
        });
    }

    ngOnInit() {
        this.currentYear = new Date().getFullYear();
        this.analyticsPageLoaded();
    }

    ANALYTICS_EVENT_FORGOT_PASSWORD_PAGE = 'Forgot-Password';
    analyticsSendAnEmailClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_FORGOT_PASSWORD_PAGE + ' SEND-AN-EMAIL#Clicked',
            analyticsOptions
        );
    }

    analyticsPageLoaded() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_FORGOT_PASSWORD_PAGE + '#Loaded', analyticsOptions);
    }

    onForgotPassword(): void {
        this.processing = true;

        const email = this.forgotPasswordForm.value.emailId;

        this.authService.attemptForgotPassword(email).subscribe(
            () => {
                this.toastr.success('Reset Password link sent to your registered email ID');
                this.processing = false;
            },
            (err: any) => {
                this.toastr.error(err.error.message, 'Error');
                this.processing = false;
            }
        );
    }
}
