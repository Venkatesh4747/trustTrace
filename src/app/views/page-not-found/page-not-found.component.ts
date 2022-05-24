import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment as env } from '../../../environments/environment';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';
import { AuthService } from '../../../app/core';
import { MultiIndustryService } from '../../shared/multi-industry-support/multi-industry.service';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
    sideNavigation;
    public env = env;
    constructor(
        private titleService: Title,
        private sideNav: SideNavigationService,
        private auth: AuthService,
        private multiIndustryService: MultiIndustryService
    ) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Page Not Found');
    }

    ngOnInit() {}

    getDefaultLandingLink(): string {
        return this.multiIndustryService.getMenus(this.auth.user.subscriptionType)
            ? this.multiIndustryService.getMenus(this.auth.user.subscriptionType).default_landing
            : '/';
    }
}
