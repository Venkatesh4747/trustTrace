import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { GeoService } from '../geoService.service';
import { StateDetailsComponent } from './state-details/state-details.component';
import { StateService } from './state.service';
@Component({
    selector: 'app-state',
    template: `
        <div (click)="openStateDetailsModal(params.data['stateObjId'])">
            {{ params.data.state.name | titlecase }}
        </div>
    `
})
export class StateComponent {
    dataFromTable: any;
    params: any;
    constructor(
        public dialog: MatDialog,
        private stateService: StateService,
        private geoService: GeoService,
        private toast: CustomToastrService
    ) {}

    agInit(params): void {
        this.params = params;
    }

    openStateDetailsModal(id: string): void {
        this.geoService.pageLoading.next(true);

        this.stateService.getStateBasedOnId(id).subscribe(
            result => {
                this.geoService.pageLoading.next(false);
                this.dialog.open(StateDetailsComponent, {
                    width: '40%',
                    data: { viewMode: true, stateDetails: result }
                });
            },
            err => {
                this.geoService.pageLoading.next(false);
                this.toast.error('Error', err);
            }
        );
    }
}
