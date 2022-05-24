import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { City } from '../geoapi.models';
import { GeoService } from '../geoService.service';
import { CityDetailsComponent } from './city-details/city-details.component';
import { CityService } from './city.service';
@Component({
    selector: 'app-city',
    template: `
        <div (click)="openCityDetailsModal(params.data['id'])">
            {{ dataFromTable | titlecase }}
        </div>
    `
})
export class CityComponent {
    dataFromTable: any;
    params: any;
    constructor(
        private dialog: MatDialog,
        private cityService: CityService,
        private geoService: GeoService,
        private toast: CustomToastrService
    ) {}

    agInit(params): void {
        this.params = params;
        this.dataFromTable = params.value;
    }

    openCityDetailsModal(id: string): void {
        this.geoService.pageLoading.next(true);

        this.cityService.getCityBasedOnId(id).subscribe(
            (result: City) => {
                this.geoService.pageLoading.next(false);

                this.dialog.open(CityDetailsComponent, {
                    width: '40%',
                    data: {
                        viewMode: true,
                        cityDetails: result
                    }
                });
            },
            err => {
                this.geoService.pageLoading.next(false);
                this.toast.error('Error', 'Something Went Wrong!');
            }
        );
    }
}
