import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment as env } from '../../../environments/environment';
import { AuthService } from '../../core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { ProfileService } from '../../views/user/profile/profile.service';
import { SideNavigationService } from '../side-navigation/side-navigation.service';
import { UtilsService } from '../utils/utils.service';
import { MultiIndustryService } from '../multi-industry-support/multi-industry.service';
import { ApplicationMenuSubscription, INavigation } from '../multi-industry-support/application-menu.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-top-navigation',
    templateUrl: './top-navigation.component.html',
    styleUrls: ['./top-navigation.component.scss']
})
export class TopNavigationComponent implements OnInit, AfterViewInit, OnDestroy {
    sideNavigation;
    isSaving = false;
    public env = env;
    currentPageTitle = '';
    @ViewChild('userConsentModal', { static: true }) public userConsentModal: ModalDirective;

    menus: INavigation[] = null;
    destroy$: Subject<boolean> = new Subject<boolean>();

    get isAdmin(): boolean {
        return this.auth.isAdmin();
    }

    get getcdnImage(): any {
        return this.utilService.getcdnImage.bind(this.utilService);
    }

    get user(): any {
        return this.auth.user;
    }

    get userCompanyDetails(): any {
        return this.auth.userCompanyDetails;
    }

    constructor(
        private auth: AuthService,
        private utilService: UtilsService,
        private sideNav: SideNavigationService,
        private userProfileService: ProfileService,
        private analyticsService: AnalyticsService,
        private translate: TranslateService,
        private titleService: Title,
        private multiIndustryService: MultiIndustryService
    ) {
        this.sideNavigation = sideNav;

        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');

        // the lang to use, if the lang isn't available, it will use the current loader to get them

        this.auth.getUser().subscribe(response => {
            this.auth.setUser(response);
        });

        this.multiIndustryService.menus
            .pipe(takeUntil(this.destroy$))
            .subscribe((applicationMenus: ApplicationMenuSubscription) => {
                if (
                    applicationMenus &&
                    this.auth.user &&
                    this.auth.user.subscriptionType &&
                    applicationMenus[this.auth.user.subscriptionType]
                ) {
                    this.menus = applicationMenus[this.auth.user.subscriptionType]['topNavigationMenus'];
                }
            });
    }

    ngOnInit() {
        if (this.titleService.getTitle().indexOf('|') > 0) {
            this.currentPageTitle = this.titleService
                .getTitle()
                .split(/\|(.+)/)[1]
                .trim();
        } else {
            this.currentPageTitle = this.titleService.getTitle();
        }
    }

    ngAfterViewInit() {
        this.auth.getUser().subscribe(resp => {
            if (!resp.consentSaved) {
                this.userConsentModal.show();
            }
            this.translate.use(resp.language);
        });
    }

    onMenuClick(menuItemClicked) {
        this.analyticsService.trackEvent(menuItemClicked + ' clicked', {
            Origin: this.currentPageTitle,
            'Action Performed': menuItemClicked + ' menu clicked'
        });
    }

    saveConsent() {
        this.isSaving = true;
        this.userProfileService.saveConsent().subscribe(response => {
            this.userConsentModal.hide();
            this.analyticsService.trackEvent('User Consent Saved');
        });
    }

    getDefaultLandingLink(): string {
        return this.multiIndustryService.getMenus(this.auth.user.subscriptionType)
            ? this.multiIndustryService.getMenus(this.auth.user.subscriptionType).default_landing
            : '/';
    }

    checkAuthority(authorities: string[]): boolean {
        if (authorities && authorities.length > 0) {
            return this.auth.haveAccesses(authorities);
        } else {
            return true;
        }
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}
