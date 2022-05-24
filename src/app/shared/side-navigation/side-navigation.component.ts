import { filter, takeUntil } from 'rxjs/operators';
import { MultiIndustryService } from './../multi-industry-support/multi-industry.service';

import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';

import { environment as env } from '../../../environments/environment';
import { AuthService } from '../../core';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { SideNavigationService } from './side-navigation.service';
import * as _ from 'lodash';
import { ISideNavigation, ApplicationMenuSubscription } from '../multi-industry-support/application-menu.model';

import { Subject } from 'rxjs';
import { ContextService } from '../context.service';

@Component({
    selector: 'app-side-navigation',
    templateUrl: './side-navigation.component.html',
    styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnInit, OnDestroy {
    public sideNavigation;
    public env = env;
    actualRoleArray: Array<String>;
    private currentPageTitle: string;

    @ViewChild('sidenavElement', { static: true }) sidenavElement: ElementRef;
    destroy$: Subject<boolean> = new Subject<boolean>();

    subscriptionType: string;
    menus: ISideNavigation[] = null;
    url;

    constructor(
        private router: Router,
        private sideNav: SideNavigationService,
        private analyticsService: AnalyticsService,
        public authService: AuthService,
        private titleService: Title,
        private multiIndustryService: MultiIndustryService,
        private appContext: ContextService
    ) {
        this.sideNavigation = sideNav;
        this.router.onSameUrlNavigation = 'reload';

        this.authService.getUser().subscribe(response => {
            this.authService.setUser(response);
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

        this.multiIndustryService.menus
            .pipe(takeUntil(this.destroy$))
            .subscribe((applicationMenus: ApplicationMenuSubscription) => {
                if (
                    applicationMenus &&
                    this.authService.user &&
                    this.authService.user.subscriptionType &&
                    applicationMenus[this.authService.user.subscriptionType]
                ) {
                    this.menus = applicationMenus[this.authService.user.subscriptionType]['sideNavigationMenus'];
                }
            });

        this.url = window.location.pathname;

        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(e => {
            // @ts-ignore
            this.url = e.url;
        });
        this.appContext.showHideSidenavSubject
            .pipe(takeUntil(this.destroy$))
            .subscribe(this.showHideNavigation.bind(this));
    }

    getActiveMenu(childUrls: any) {
        if (childUrls) {
            let doesExist = childUrls.includes(this.url);
            if (!doesExist) {
                doesExist = childUrls.some((url: string) => this.url.includes(url));
                return doesExist;
            }
            return doesExist;
        }
        return false;
    }

    checkAuthority(authorities: string[]) {
        if (authorities && authorities.length > 0) {
            return this.authService.haveAccesses(authorities);
        } else {
            return true;
        }
    }

    onMenuClick(menuItemClicked) {
        this.analyticsService.trackEvent(menuItemClicked + ' clicked', {
            Origin: this.currentPageTitle,
            'Action Performed': menuItemClicked + ' menu clicked'
        });
    }

    showHideNavigation(flag: boolean): void {
        this.sidenavElement.nativeElement.style.display = flag ? 'block' : 'none';
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    removeSideNavMenuItemSpace(menu_item) {
        return 'side-menu-' + menu_item.replace(/ /g, '-');
    }
}
