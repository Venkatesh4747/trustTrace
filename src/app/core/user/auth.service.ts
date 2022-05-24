import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Amplify, { Auth } from '@aws-amplify/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UtilsService } from '../../shared/utils/utils.service';
import { map, tap, take } from 'rxjs/operators';
import { environment as env } from '../../../environments/environment';
import { MultiIndustryService } from '../../shared/multi-industry-support/multi-industry.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { SupportChatService } from '../support-chat/support-chat.service';
import { RefreshTokenResponse } from '../../../app/views/auth/jwt-refreshtoken-model/jwt-RefreshToken';
import { IUserProps } from '../../views/user/brand-user-management/users/user.model';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';

@Injectable()
export class AuthService {
    public user = {
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        status: '',
        profileImage: '',
        companyId: '',
        role: [],
        language: '',
        authToken: '',
        subscriptionType: '',
        passwordExpired: false,
        brandsAssociated: [],
        tiersAssociated: [],
        filterList: [],
        filterViewPageList: [],
        hasAdminGroup: false
    };

    public userCompanyDetails: any;

    public previousUrl = '';

    public associateCode = null;

    public companyId = '';

    public loggedIn = new BehaviorSubject<boolean>(false);

    public sessionInvalidEvent = new EventEmitter();

    private refreshTokenTimeout;

    public sessionExpiredPopUp;

    constructor(
        private http: HttpClient,
        private toastr: CustomToastrService,
        private analyticsService: AnalyticsService,
        private router: Router,
        private supportChatService: SupportChatService,
        private multiIndustryService: MultiIndustryService,
        private utilsService: UtilsService
    ) {
        this.user.profileImage = env.IMG_URL + 'images/dummyProfile-male.jpg';
        this.user.firstName = 'Hello!';
    }

    resetUser() {
        this.user = {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            status: '',
            profileImage: '',
            companyId: '',
            role: [],
            language: '',
            authToken: '',
            subscriptionType: '',
            passwordExpired: false,
            brandsAssociated: [],
            tiersAssociated: [],
            filterList: [],
            filterViewPageList: [],
            hasAdminGroup: false
        };
    }
    get userName() {
        return this.user.username;
    }
    public setUser(userData: any) {
        if (!userData) {
            this.user = {
                username: '',
                email: '',
                firstName: '',
                lastName: '',
                status: '',
                profileImage: '',
                companyId: '',
                role: [],
                language: '',
                authToken: '',
                subscriptionType: '',
                passwordExpired: false,
                brandsAssociated: [],
                tiersAssociated: [],
                filterList: [],
                filterViewPageList: [],
                hasAdminGroup: false
            };

            return;
        }

        this.user.username = userData.username;
        this.user.email = userData.email;
        this.user.firstName = userData.firstName;
        this.user.lastName = userData.lastName;
        this.user.status = userData.status;
        this.user.profileImage = userData.photoUrl;
        this.user.companyId = userData.companyId;
        this.user.role = userData.authorities;
        this.companyId = userData.companyId;
        this.user.language = userData.language || 'en';
        this.user.authToken = userData.authToken;
        this.user.subscriptionType = userData.subscriptionType;
        this.user.passwordExpired = userData.passwordExpired;
        this.user.brandsAssociated = userData.brandsAssociated;
        this.user.tiersAssociated = userData.tiersAssociated;
        this.user.filterList = userData.filterList;
        this.user.filterViewPageList = userData.filterViewPageList;
        this.user.hasAdminGroup = userData.hasAdminGroup;
        this.analyticsService.identifyUser(this.user.email);
        this.analyticsService.setUserProperties(this.getUserProperties(userData));
        this.userCompanyDetails = userData.companyProfileView;

        this.supportChatService.setUserData(userData);

        this.multiIndustryService.getApplicationMenus();
    }

    getUserProperties(userData: any): IUserProps {
        const { companyType, name: companyName } = userData.companyProfileView;

        return {
            companyId: userData.companyId,
            email: userData.email,
            status: userData.status,
            subscriptionType: userData.subscriptionType,
            companyName,
            companyType
        };
    }

    initializeUser() {
        return new Promise((resolve, reject) => {
            this.getUser().subscribe(response => {
                this.setUser(response);
                resolve(true);
            });
        });
    }

    attemptAuth(username: string, password: string): Observable<any> {
        const credentials = { username: username.toLowerCase(), password };

        return this.http.post(env.api.auth.login, credentials, { observe: 'response', withCredentials: true });
    }

    attemptForgotPassword(userEmail: string): Observable<any> {
        const payload = { email: userEmail };
        return this.http.post(env.api.auth.forgotPassword, payload);
    }

    attemptForgotPasswordWithOutUserEmailFlow(userEmail: string): Observable<any> {
        const payload = { email: userEmail };
        return this.http.post(env.api.auth.forgotPasswordWithOutuserEmailflow, payload);
    }

    logout(): Observable<any> {
        return this.http.post(env.api.auth.logout, {}, { withCredentials: true });
    }
    attemptResetPassword(token: string, password: string): Observable<any> {
        const payload = {
            authToken: token,
            newPassword: password
        };

        return this.http.post(env.api.auth.resetPassword, payload, { observe: 'response', withCredentials: true });
    }

    async attemptSSOLogout() {
        localStorage.removeItem('sso_login');
        localStorage.removeItem('tt_token');
        localStorage.removeItem('cR');
        localStorage.removeItem('cPId');
        localStorage.removeItem('cACId');
        localStorage.removeItem('cD');
        localStorage.removeItem('tt_oauth_id_token');
        await Auth.signOut();
    }

    attemptLogout() {
        this.logout().subscribe(
            resp => {
                return this.doPostLogoutActions();
            },
            err => {
                this.toastr.error('Oops, something went wrong.Contact support', 'System error');
            }
        );
    }

    doPostLogoutActions(): boolean {
        this.resetUser();
        localStorage.removeItem('tt_token');
        this.utilsService.clearSessionStorage();
        this.supportChatService.clearUser();
        this.loggedIn.next(false);
        this.router.navigate(['/']);
        return !!localStorage.getItem('tt_token');
    }

    validateToken(token: string): Observable<any> {
        let url = env.api.auth.forgetPasswordTokenValidate;
        url = url.replace('$token', token);
        return this.http.get(url);
    }

    getUser(): Observable<any> {
        return this.http.get(env.api.auth.getUser);
    }

    getUserAuthorities() {
        return this.http.get(env.api.auth.getUser).pipe(map(response => response['authorities']));
    }

    get isLoggedIn() {
        return this.loggedIn.asObservable();
    }

    get canEnableOptions(): boolean {
        return !!env['demoAccounts']?.includes(this.user.username);
    }

    checkIfPasswordExpired() {
        if (this.user.passwordExpired) {
            const userEmail = this.user.email;
            this.doPostLogoutActions();
            this.attemptForgotPasswordWithOutUserEmailFlow(userEmail).subscribe(
                resp => {
                    this.router.navigate(['/reset-password']);
                },
                err => {
                    this.toastr.error('Oops, something went wrong.Contact support', 'System error');
                }
            );
        }
    }

    // isLoggedIn(): boolean {
    //   if (localStorage.getItem('tt_token') !== null) {
    //     this.isUserLoggedIn = true;
    //   } else {
    //     this.isUserLoggedIn = false;
    //   }
    //   return localStorage.getItem('tt_token') !== null;
    // }

    private getTokenFromHeader(data: any): string {
        return data.headers.get('X-Token');
    }

    getSessionToken(): string {
        return localStorage.getItem('tt_token');
    }

    getOAuthIdToken(): string {
        return localStorage.getItem('tt_oauth_id_token');
    }

    setSessionTokenUserModule(data: any): void {
        localStorage.removeItem('tt_token');
        localStorage.setItem('tt_token', this.getTokenFromHeader(data));
    }

    setSession(data: any): void {
        if (localStorage.getItem('tt_token') !== null) {
            // TODO: need to get confirmation that logout has been done.
            // if (!this.attemptLogout()) {
            //     this.toastr.error('Oops! You seem to be already logged in.');
            //     return;
            // }
            //this.attemptLogout();
        }
        localStorage.setItem('tt_token', this.getTokenFromHeader(data));
    }

    isAdmin() {
        const role = this.user.role.filter(roleVal => {
            return roleVal.authority === 'ADMIN_UPDATE';
        });
        return role.length !== 0;
    }

    allowTransactions() {
        const role = this.user.role.filter(roleVal => {
            return roleVal.authority === 'TRANSACTION_READ';
        });
        return role.length !== 0;
    }

    allowTransactionsLite() {
        const role = this.user.role.filter(roleVal => {
            return roleVal.authority === 'ADIDAS_DEMO_READ';
        });
        return role.length !== 0;
    }

    getSubscription() {
        return this.user.subscriptionType;
    }
    onHandleError(data: { reason: any; status: number }) {
        if (data.status === 401) {
            this.sessionInvalidEvent.emit(data);
        }
    }

    haveAccess(name: string): boolean {
        const role = this.user.role.filter(roleVal => {

            return roleVal.authority === name;
        });
        return role.length !== 0;
    }
    public getAuthToken(): Observable<any> {
        return this.http.get(env.api.auth.getAuthToken);
    }

    public RequestAPI(apiURL) {
        return this.http.get<Observable<any>>(apiURL, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=utf-8'
            })
        });
    }

    haveAccesses(authorities: string[]): boolean {
        const userRoles = this.user.role.map(roleVal => roleVal.authority);
        return authorities.every((authority: string) => userRoles.includes(authority));
    }

    public getSSOOptionsByEmail(email: any) {
        return this.http.get(env.api.sso.getSSOOptionsEmail.replace('$email', encodeURIComponent(email)));
    }

    public getSSOOptionsByDomain(subdomain: any) {
        return this.http.get(env.api.sso.getSSOOptionsDomain.replace('$domain', subdomain));
    }

    public configureAmplify(data) {
        localStorage.setItem('cR', data.cognito_region);
        localStorage.setItem('cPId', data.cognito_user_pool_id);
        localStorage.setItem('cACId', data.cognito_app_client_id);
        localStorage.setItem('cD', data.cognito_host_url);
        Amplify.configure({
            Auth: {
                region: data.cognito_region,
                userPoolId: data.cognito_user_pool_id,
                userPoolWebClientId: data.cognito_app_client_id,
                mandatorySignIn: false,
                oauth: {
                    domain: data.cognito_host_url,
                    scope: ['email', 'openid'],
                    redirectSignIn: window.location.origin + env.cognito.callback_url,
                    redirectSignOut: window.location.origin + env.cognito.signout,
                    responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
                }
            }
        });
        return of(true);
    }

    isSSOLogin() {
        return localStorage.getItem('sso_login');
    }

    refreshToken(): Observable<RefreshTokenResponse> {
        this.stopRefreshTokenTimer();
        return this.http
            .get<RefreshTokenResponse>(env.api.auth.getNewAuthToken, { withCredentials: true })
            .pipe(
                tap((response: RefreshTokenResponse) => {
                    localStorage.removeItem('tt_token');
                    localStorage.setItem('tt_token', response?.accessToken);
                    if (response?.accessToken == undefined) {
                        this.attemptLogout();
                        return;
                    }
                    this.startRefreshTokenTimer();
                })
            );
    }

    startRefreshTokenTimer(): void {
        this.stopRefreshTokenTimer();
        const jwtToken = this.utilsService.parseJwtToken(this.getSessionToken());
        const expires = this.utilsService.getExpireTime(jwtToken);
        const timeout = expires.getTime() - Date.now() - 120 * 1000; // expire time minus 2mins
        this.refreshTokenTimeout = setTimeout(
            () =>
                this.refreshToken()
                    .pipe(take(1))
                    .subscribe(),
            timeout
        );
    }

    stopRefreshTokenTimer(): void {
        clearTimeout(this.refreshTokenTimeout);
    }
}
