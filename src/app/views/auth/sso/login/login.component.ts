import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Auth } from '@aws-amplify/auth';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core';
import { AnalyticsService } from '../../../../core/analytics/analytics.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    hide = true;
    env = environment;

    loginForm: FormGroup;
    processing = false;

    currentYear: number;

    ANALYTICS_EVENT_LOGIN_PAGE = 'SSO Login';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private toastr: CustomToastrService,
        private auth: AuthService,
        private titleService: Title,
        private analyticsService: AnalyticsService
    ) {
        this.titleService.setTitle('TrusTrace | Know Your Product');
        this.createLoginForm();
    }

    ngOnInit() {
        this.currentYear = new Date().getFullYear();
        this.analyticsLoginPageLoaded();

        if (localStorage.getItem('tt_token')) {
            this.router.navigate(['/dashboard']).then(() => {
                this.toastr.info('You are logged in!');
            });
        }
    }

    analyticsLoginPageLoaded(): void {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_LOGIN_PAGE + ' #Loaded', analyticsOptions);
    }

    createLoginForm(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    launchCognitoSSOSignIn(): void {
        Auth.federatedSignIn();
    }

    checkSSOOptions(): void {
        this.auth.getSSOOptionsByEmail(this.loginForm.value.email).subscribe(
            response => {
                this.auth.configureAmplify(response['data']).subscribe(
                    () => {
                        this.launchCognitoSSOSignIn();
                    },
                    () => {
                        this.toastr.error('You have entered an invalid email.', 'Error');
                        this.analyticsService.trackEvent(
                            this.ANALYTICS_EVENT_LOGIN_PAGE + `#invalidEmail ${this.loginForm.value.email}`,
                            {}
                        );
                    }
                );
            },
            e => {
                const defaultErrorMessage =
                    'Oops! something went wrong. Please retry your request after sometime. Please contact our support if the problem persists.';
                const errorMessage =
                    e.hasOwnProperty('error') && e.error.hasOwnProperty('message')
                        ? e.error.message
                        : defaultErrorMessage;
                this.toastr.error(errorMessage, 'Error');
            }
        );
    }
}
