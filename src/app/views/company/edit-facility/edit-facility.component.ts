import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { AuthService } from '../../../core';
import { ProfileService } from '../profile/profile.service';

@Component({
    selector: 'app-edit-facility',
    templateUrl: './edit-facility.component.html',
    styleUrls: ['./edit-facility.component.scss']
})
export class EditFacilityComponent implements OnInit {
    facilityId: string;
    facility: any;
    isDataReady: boolean;

    constructor(
        private activatedRoute: ActivatedRoute,
        private profileService: ProfileService,
        private authService: AuthService,
        private toastrService: CustomToastrService
    ) {
        this.isDataReady = false;

        // Get facility id from url param
        this.facilityId = this.activatedRoute.snapshot.params.id;

        this.authService.getUser().subscribe(response => {
            this.getCompanyProfile(response.companyId);
        });
    }

    ngOnInit() {}

    getCompanyProfile(companyId) {
        // Get facility details
        this.profileService.getCompanyProfile(companyId).subscribe(
            companyResponse => {
                this.facility = companyResponse['data']['companyDetails']['facility'].filter(
                    facility => facility.id === this.facilityId
                )[0];
                setTimeout(() => {
                    this.isDataReady = true;
                });
            },
            () => {
                this.toastrService.error(
                    'Something went wrong. Please try again or contact support if the problem persists.',
                    'Oops!'
                );
                this.isDataReady = true;
            }
        );
    }
}
