import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { GuardsCheckEnd, NavigationEnd, Router } from '@angular/router';
import { Auth } from '@aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
import * as decode from 'jwt-decode';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { getBaseUrl } from '../environments/common/endpoints';
import { environment } from '../environments/environment';
import { AuthService } from './core';
import { AnalyticsService } from './core/analytics/analytics.service';
import { SupportChatService } from './core/support-chat/support-chat.service';
import { CustomToastrService } from './shared/commonServices/custom-toastr.service';
import { ConfirmDialogComponent } from './shared/modals/confirm-dialog/confirm-dialog.component';
import { MultiIndustryService } from './shared/multi-industry-support/multi-industry.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'TrusTrace';
    previousUrl: any;
    nextUrl = '';
    isLoggedIn$: Observable<boolean>;
    urls = ['/logout', '/forgot-password'];
    pageReady = false;
    env = environment;

    chatSupport: boolean;
    private subdomain: string;

    get getSubdomain(): string {
        return window.location.hostname.split('.')[0];
    }

    constructor(
        public auth: AuthService,
        public analyticsService: AnalyticsService,
        private router: Router,
        private toastr: CustomToastrService,
        private titleService: Title,
        public dialog: MatDialog,
        private supportChatService: SupportChatService,
        private multiIndustryService: MultiIndustryService
    ) {
        analyticsService.initalizeAmplitude();

        Hub.listen('auth', ({ payload: { event, data } }) => {
            switch (event) {
                case 'cognitoHostedUI':
                    this.getSSOUser().then(userData => {
                        localStorage.setItem(
                            `tt_token`,
                            `Bearer ${userData['signInUserSession']['accessToken']['jwtToken']}`
                        );
                        localStorage.setItem(
                            `tt_oauth_id_token`,
                            `Bearer ${userData['signInUserSession']['idToken']['jwtToken']}`
                        );
                        localStorage.setItem('sso_login', '1');

                        setTimeout(() => {
                            if (localStorage.getItem('tt_token') !== null) {
                                this.pageReady = false;
                                this.auth.getUser().subscribe(response => {
                                    this.auth.setUser(response);
                                    this.checkAndRedirectUser();
                                    this.pageReady = true;
                                });
                            }
                        }, 1);
                        analyticsService.trackEvent('SSO Login - #login_success', {});
                    });
                    break;
                case 'cognitoHostedUI_failure':
                    this.toastr.error('There seems to be error connecting to the server. Please try again', 'Error');
                    break;
            }
        });

        router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(e => {
            this.showHideChatSupport(e['url']); // temp fix

            let route = this.router.routerState.root.firstChild;
            while (route.firstChild) {
                route = route.firstChild;
            }

            if (this.multiIndustryService.industry !== 'food') {
                this.supportChatService
                    .checkInit()
                    .pipe(take(1))
                    .subscribe(data => {
                        if (data) {
                            supportChatService.setFaqTags(route.snapshot.data.freshChatTags);
                        }
                    });
            }

            if (!this.urls.includes(e['url'])) {
                this.nextUrl = e['url'];
            }
            if (this.nextUrl) {
                if (this.nextUrl === '/') {
                    const menus = this.multiIndustryService.getMenus(this.auth.user.subscriptionType);
                    this.nextUrl = menus && menus.default_landing ? menus.default_landing : '/dashboard';
                }
                this.auth.previousUrl = this.nextUrl;
            }
        });
        router.events.pipe(filter(event => event instanceof GuardsCheckEnd)).subscribe(e => {
            if (!e['shouldActivate'] && this.router.url === '/') {
                const menus = this.multiIndustryService.getMenus(this.auth.user.subscriptionType);
                this.nextUrl = menus && menus.default_landing ? menus.default_landing : '/dashboard';
                this.router.navigate([this.nextUrl]);
            }
        });

        this.titleService.setTitle('TrusTrace | Know Your Product');

        this.multiIndustryService.setIndustry();
        this.multiIndustryService.getIndustryLabels();
        this.multiIndustryService.getApplicationMenus();

        if (this.multiIndustryService.industry !== 'food') {
            supportChatService.init();
        } else {
            this.chatSupport = false;
        }

        setTimeout(() => {
            this.auth.getUser().subscribe(
                data => {
                    this.auth.setUser(data);
                    this.checkAndRedirectUser();
                    this.pageReady = true;
                },
                () => {
                    // This array should be replaced with a ban-list from the server.
                    if (
                        !['app', 'food', 'apptemp', 'faqs', 'm', 'id', 'food.uat', 'adidas', 'adidastemp'].includes(
                            this.subdomain.toLowerCase()
                        )
                    ) {
                        setTimeout(() => {
                            if (localStorage.getItem('tt_token') === null) {
                                this.router.navigate(['/', 'sso', 'login']);
                            }
                        }, 1);
                    }
                    this.pageReady = true;
                    if (
                        window.location.pathname.indexOf('sso/callback') === -1 &&
                        window.location.pathname.indexOf('sso/login') === -1 &&
                        window.location.pathname.indexOf('forgot-password') === -1 &&
                        window.location.pathname.indexOf('reset-password') === -1 &&
                        !this.auth.loggedIn.value &&
                        window.location.pathname.indexOf('signup') === -1
                    ) {
                        this.router.navigate(['/']).then();
                    } else if (
                        window.location.pathname.indexOf('forgot-password') >= 0 ||
                        window.location.pathname.indexOf('reset-password') >= 0
                    ) {
                        if (this.auth.isLoggedIn) {
                            this.auth.getUser().subscribe(data => {
                                this.auth.setUser(data);
                            });
                        }
                    } else if (
                        window.location.pathname.indexOf('signup') === -1 &&
                        window.location.pathname.indexOf('sso/login') === -1 &&
                        window.location.pathname.indexOf('sso/callback') === -1 &&
                        this.subdomain === 'app'
                    ) {
                        this.auth.getUser().subscribe(
                            data => {
                                this.auth.setUser(data);
                                this.auth.checkIfPasswordExpired();
                            },
                            () => {
                                this.toastr.info('Your session has timed out. Please login');
                                this.router.navigate(['/logout']);
                            }
                        );
                    }
                }
            );
        }, 1);

        this.auth.sessionInvalidEvent.subscribe(() => {
            if (
                this.router.url &&
                this.router.url !== '/' &&
                this.router.url.indexOf('login') < 0 &&
                this.router.url.indexOf('sso/login') < 0 &&
                this.router.url.indexOf('sso/callback') < 0 &&
                this.router.url.indexOf('reset-password') < 0 &&
                this.router.url.indexOf('forgot-password') < 0 &&
                this.router.url.indexOf('signup') < 0
            ) {
                this.auth.sessionExpiredPopUp = this.dialog.open(ConfirmDialogComponent, {
                    width: '375px',
                    data: {
                        title: 'Attention!!!',
                        msg: 'Your session has expired. Please login',
                        primaryButton: 'Login',
                        showClose: false
                    },
                    disableClose: true
                });
                this.auth.sessionExpiredPopUp.afterClosed().subscribe(response => {
                    if (response != null) {
                        if (response === 'Login') {
                            dialog.closeAll();
                            this.router.navigate(['/logout']);
                        }
                    }
                });
            }
        });
    }

    ngOnInit() {
        this.isLoggedIn$ = this.auth.isLoggedIn;

        if (location.hostname.indexOf('trustrace.com') === -1) {
            if (
                environment.url.indexOf(getBaseUrl('FASHION_PROD')) !== -1 ||
                environment.url.indexOf(getBaseUrl('FOOD_PROD')) !== -1 ||
                environment.url.indexOf(getBaseUrl('ADIDAS_PROD')) !== -1 ||
                environment.url.indexOf(getBaseUrl('ADIDAS_INTEGRATION')) !== -1
            ) {
                alert(
                    'You seem to be using the production api on a non-production environment. \n You have been warned!'
                );
            }
        }

        this.subdomain = this.getSubdomain;
    }

    /**
     * todo
     * temp fix chat support [signup page]
     * Solution: Add new icon with toggle option [Need assert]
     */
    showHideChatSupport(url: string): void {
        const urls = ['/signup', 'forgot-password', '/reset-password'];
        this.chatSupport = !urls.some(item => url.includes(item));
        if (url === '/' || this.multiIndustryService.industry === 'food') {
            this.chatSupport = false;
        }
    }

    checkAndRedirectUser() {
        if (localStorage.getItem('tt_token') !== null) {
            const tokenPayload = decode(this.auth.getSessionToken());
            // TODO: check role ?
            if (!tokenPayload) {
                this.toastr.info('Your session has timed out. Please login');
                this.router.navigate(['/logout']);
            } else {
                if (this.auth.isLoggedIn) {
                    if (
                        this.auth.user.subscriptionType === 'SUPPLIER' ||
                        this.auth.user.subscriptionType === 'FASHION_BRAND_SUPP'
                    ) {
                        if (this.auth.previousUrl) {
                            this.router.navigateByUrl(this.auth.previousUrl);
                        } else if (this.nextUrl) {
                            if (
                                this.nextUrl.indexOf('dashboard') >= 0 ||
                                this.nextUrl === '/' ||
                                this.nextUrl.indexOf('forgot-password') >= 0 ||
                                this.nextUrl.indexOf('reset-password') >= 0
                            ) {
                                this.nextUrl = '/supplier-dashboard';
                            }
                            this.router.navigateByUrl(this.nextUrl);
                        } else {
                            this.router.navigate(['/', 'supplier-dashboard']);
                        }
                    } else if (
                        this.auth.user.subscriptionType === 'BRAND_SUPP' ||
                        this.auth.user.subscriptionType === 'FOOD_SUPPLIER'
                    ) {
                        this.router.navigate(['/', 'products', 'tasks']);
                    } else if (this.auth.user.subscriptionType === 'RETAILER') {
                        this.router.navigate(['/', 'products', 'finished']);
                    } else {
                        if (this.auth.previousUrl && this.auth.previousUrl.indexOf('supplier-dashboard') < 0) {
                            this.router.navigateByUrl(this.auth.previousUrl);
                        } else if (this.nextUrl) {
                            if (
                                this.nextUrl.indexOf('dashboard') >= 0 ||
                                this.nextUrl === '/' ||
                                this.nextUrl.indexOf('forgot-password') >= 0 ||
                                this.nextUrl.indexOf('reset-password') >= 0 ||
                                this.nextUrl.indexOf('signup') >= 0
                            ) {
                                this.nextUrl = '/dashboard';
                            }
                            this.router.navigateByUrl(this.nextUrl);
                        } else {
                            // this.router.navigate(['/', 'dashboard']);
                        }
                    }
                }
                this.auth.loggedIn.next(true);
            }
        }
    }

    getSSOUser() {
        return Auth.currentAuthenticatedUser()
            .then(user => user)
            .catch(() => console.log('Not Signed In'));
    }

    /**
     * Only for food environment
     */
    getFaqUrl(): string {
        const lang = this.auth.user.language;
        return environment.foodFaq[lang];
    }
}
