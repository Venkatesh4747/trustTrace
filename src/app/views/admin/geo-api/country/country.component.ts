import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CountryDetailsComponent } from './country-details/country-details.component';
import { GeoService } from '../geoService.service';
import { CountryService } from './country.service';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-country',
    template: `
        <div (click)="openCountryDetailsModal(params.data['countryObjId'])">
            {{ params.data.country.name | titlecase }} &nbsp;{{ params.data.country.emoji }}
        </div>
    `
})
export class CountryComponent {
    dataFromTable: any;
    params: any;

    constructor(
        public dialog: MatDialog,
        private countryService: CountryService,
        private geoService: GeoService,
        private toast: CustomToastrService
    ) {}

    agInit(params): void {
        this.params = params;
    }

    openCountryDetailsModal(id: number): void {
        this.geoService.pageLoading.next(true);

        this.countryService.getCountryBasedOnId(id).subscribe(
            country => {
                this.geoService.pageLoading.next(false);
                this.dialog.open(CountryDetailsComponent, {
                    width: '40%',
                    data: { viewMode: true, countryDetails: country }
                });
            },
            error => {
                this.geoService.pageLoading.next(false);
                this.toast.error('Error', 'Something went wrong!!');
            }
        );
    }
}
