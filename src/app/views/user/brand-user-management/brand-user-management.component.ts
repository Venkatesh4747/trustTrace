import { AnalyticsService } from './../../../core/analytics/analytics.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core';
import { SideNavigationService } from '../../../shared/side-navigation/side-navigation.service';
import { TourService } from 'ngx-tour-md-menu';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CommonServices } from '../../../shared/commonServices/common.service';

@Component({
    selector: 'app-brand-user-management',
    templateUrl: './brand-user-management.component.html',
    styleUrls: ['./brand-user-management.component.scss']
})
export class BrandUserManagementComponent implements OnInit, OnDestroy {
    sideNavigation;
    pageLoading = false;
    tourSubscription: Subscription;

    get isBrand(): boolean {
        return this.authService.user.subscriptionType === 'BRAND';
    }

    constructor(
        private sideNav: SideNavigationService,
        public authService: AuthService,
        private analyticsService: AnalyticsService,
        private tourService: TourService,
        private commonService: CommonServices
    ) {}

    ngOnInit() {
        this.analyticsService.trackEvent('Brand User Management Page', {
            Action: 'Brand User Management page visited'
        });
        this.pageLoading = true;
        this.authService.getUser().subscribe(data => {
            this.pageLoading = false;
        });

        this.tourService.initialize([
            {
                anchorId: 'createUser',
                content: this.commonService.getTranslation('Click this Button to create new users'),
                title: this.commonService.getTranslation('Create new users'),
                enableBackdrop: true
            },
            {
                anchorId: 'updateUser_0',
                content: this.commonService.getTranslation(
                    'Click here to update the name, email, associated facility of the user'
                ),
                title: this.commonService.getTranslation('Manage User'),
                enableBackdrop: true
            },
            {
                anchorId: 'search',
                content: this.commonService.getTranslation(
                    'Search users based on name, email and associated facility name'
                ),
                title: this.commonService.getTranslation('Search User'),
                enableBackdrop: true
            },
            {
                anchorId: 'userStatus_0',
                content: this.commonService.getTranslation(
                    'Click here to enable/disable user’s access to the platform'
                ),
                title: this.commonService.getTranslation('Activate/Deactivate User'),
                enableBackdrop: true
            }
        ]);

        this.tourSubscription = this.tourService.end$.pipe(take(1)).subscribe(data => {
            localStorage.setItem('userManagementTour', 'true');
        });
    }

    onMenuClick(menuItemClicked) {
        this.analyticsService.trackEvent(menuItemClicked + ' menu clicked', {
            Origin: 'Brand User Management Page',
            Action: menuItemClicked + ' panel clicked'
        });

        setTimeout(() => {
            const tourStatus = localStorage.getItem('userManagementTour');
            if ((!tourStatus || tourStatus !== 'true') && this.isBrand) {
                this.tourService.start();
            }
        }, 2000);
    }

    ngOnDestroy() {
        this.tourSubscription.unsubscribe();
    }
}
