import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
    hide = true;
    env = environment;

    loginForm: FormGroup;
    processing = false;
    returnUrl: string;
    currentYear: number;

    ANALYTICS_EVENT_LOGIN_PAGE = 'Login';

    get industry(): string {
        return this.multiIndustryService.industry;
    }
    constructor(
        private fb: FormBuilder,
        private router: Router,
        private toastr: CustomToastrService,
        private auth: AuthService,
        private titleService: Title,
        private analyticsService: AnalyticsService,
        private multiIndustryService: MultiIndustryService
    ) {
        this.titleService.setTitle('TrusTrace | Know Your Product');
        this.createLoginForm();
    }

    createLoginForm(): void {
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    ngOnInit() {
        if (this.auth.sessionExpiredPopUp) {
            this.auth.sessionExpiredPopUp.close();
            this.auth.sessionExpiredPopUp = null;
        }
        this.currentYear = new Date().getFullYear();

        const menus = this.multiIndustryService.getMenus(this.auth.user.subscriptionType);

        this.returnUrl = menus && menus.default_landing ? menus.default_landing : '/dashboard';
        this.analyticsLoginPageLoaded();
    }

    ngAfterViewInit() {
        if (this.auth.associateCode !== null) {
            this.toastr.info('Please log in to Associate');
        }
    }

    analyticsForgotPasswordClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_LOGIN_PAGE + ' Forgot-Password#Clicked',
            analyticsOptions
        );
    }

    analyticsLoginPageLoaded() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_LOGIN_PAGE + ' #Loaded', analyticsOptions);
    }

    onLogin(): void {
        this.processing = true;

        const { username, password } = this.loginForm.value;

        this.auth.attemptAuth(username, btoa(password)).subscribe(
            data => {
                this.processing = false;
                this.auth.setSession(data);
                this.auth.startRefreshTokenTimer();
                this.auth.getUser().subscribe(
                    response => {
                        this.auth.setUser(response);
                        const menus = this.multiIndustryService.getMenus(this.auth.user.subscriptionType);

                        this.returnUrl = menus && menus.default_landing ? menus.default_landing : '/dashboard';
                        if (!this.auth.user.passwordExpired) {
                            this.auth.loggedIn.next(true);
                            this.toastr.success('Login successful');
                            if (this.auth.associateCode) {
                                this.router
                                    .navigate(['company/associate'], { queryParams: { code: this.auth.associateCode } })
                                    .then(() => (this.auth.associateCode = null));
                                return;
                            }
                            if (
                                this.auth.previousUrl &&
                                this.auth.previousUrl !== '/' &&
                                this.auth.previousUrl.indexOf('signup') < 0 &&
                                this.auth.previousUrl.indexOf('dashboard') < 0
                            ) {
                                this.returnUrl = this.auth.previousUrl;
                            }
                            if (
                                this.auth.user.subscriptionType === 'SUPPLIER' ||
                                this.auth.user.subscriptionType === 'FASHION_BRAND_SUPP'
                            ) {
                                if (this.returnUrl && this.returnUrl !== '/dashboard') {
                                    this.router.navigateByUrl(this.returnUrl).then();
                                } else {
                                    this.router.navigate(['supplier-dashboard']);
                                }
                            } else {
                                if (
                                    this.returnUrl &&
                                    this.returnUrl !== '/supplier-dashboard' &&
                                    this.returnUrl !== '/'
                                ) {
                                    this.router.navigateByUrl(this.returnUrl).then();
                                } else {
                                    this.router.navigate(['dashboard']);
                                }
                            }
                        } else {
                            this.auth.checkIfPasswordExpired();
                        }
                    },
                    failData => {}
                );
            },
            failData => {
                this.processing = false;
                const defaultErrorMessage =
                    'Oops! something went wrong. Please retry your request after sometime. Please contact our support if the problem persists.';
                const errorMessage =
                    failData.hasOwnProperty('error') && failData.error.hasOwnProperty('message')
                        ? failData.error.message
                        : defaultErrorMessage;
                if (failData.status === 401) {
                    this.toastr.error(errorMessage, 'Error!');
                } else if (failData.status === 403) {
                    this.toastr.error('You are not authorised to perform this action.', 'Unauthorized!');
                } else {
                    this.toastr.error(defaultErrorMessage, 'Error!');
                }
            }
        );
    }
}
