import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core';
import { SideNavigationService } from '../../../shared/side-navigation/side-navigation.service';
import { AssociateService } from './associate.service';
import { filter } from 'rxjs/operators';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { amplitude } from '../../../shared/const-values';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-associate',
    templateUrl: './associate.component.html',
    styleUrls: ['./associate.component.scss']
})
export class AssociateComponent implements OnInit {
    sideNavigation;
    verificationCode: string;

    constructor(
        private router: Router,
        private sideNav: SideNavigationService,
        private route: ActivatedRoute,
        private auth: AuthService,
        private toastr: CustomToastrService,
        private associateService: AssociateService,
        private analyticsService: AnalyticsService
    ) {
        this.sideNavigation = sideNav;

        if (!this.auth.loggedIn.value) {
            this.router.navigate(['/']).then(() => {
                this.toastr.info('Please login to accept the invitation', 'Login Required');
            });
            return;
        }
        this.route.queryParams.pipe(filter(params => params.code)).subscribe(params => {
            this.verificationCode = params.code;
        });
    }

    ngOnInit() {
        this.associateService.associate({ code: this.verificationCode }).subscribe(
            response => {
                setTimeout(() => {
                    this.router.navigate(['/company/profile']).then(() => {
                        this.toastr.success('Association has been accepted successfully', 'Success');
                    });
                }, 5000);
                this.analyticsService.trackEvent(amplitude.supplier.addSupplierAssociationSucceed);
            },
            failResponse => {
                this.router.navigate(['/company/profile']).then(() => {
                    this.analyticsService.trackEvent(amplitude.supplier.addSupplierAssociationFailed);
                    this.toastr.error(
                        'The invitation code seems to have expired or is invalid. Please request a new invite.',
                        'Error!'
                    );
                });
            }
        );
    }
}
