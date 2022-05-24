import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
    constructor(private auth: AuthService, private analyticsService: AnalyticsService) {}

    ngOnInit() {
        this.analyticsService.trackEvent('Logout Page', {
            'Action Performed': 'Logout of the platform'
        });
        if (localStorage.getItem('sso_login') === '1') {
            this.auth.attemptSSOLogout();
        } else {
            this.auth.stopRefreshTokenTimer();
            this.auth.attemptLogout();
        }
    }
}
