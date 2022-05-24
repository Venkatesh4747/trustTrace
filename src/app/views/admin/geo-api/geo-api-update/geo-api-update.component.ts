import { Component } from '@angular/core';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { AuthService } from '../../../../core/user/auth.service';
import { GeoService } from '../geoService.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../../../../shared/modals/confirmation-modal/confirmation-modal.component';
import { take } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-geo-api-update',
    template: `
        <app-full-page-loader *ngIf="pageLoading"></app-full-page-loader>
        <div class="row">
            <div class="col-sm-3 col-sm-offset-9">
                <button class="btn btn-blue" (click)="onSync()">
                    Sync
                </button>
            </div>
        </div>
    `,
    styleUrls: ['./geo-api-update.component.scss']
})
export class GeoApiUpdateComponent {
    pageLoading = false;
    constructor(
        private geoService: GeoService,
        private toastr: CustomToastrService,
        public dialog: MatDialog,
        private authService: AuthService
    ) {}

    onSync(): void {
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
            width: '372px',
            data: {
                title: 'Sync GEO Data',
                description: 'Are you sure you want to sync geo data?',
                buttonName: 'Sync Data',
                isEnable: true,
                showClose: true
            }
        });

        dialogRef.componentInstance.handleDelete.pipe(take(1)).subscribe(
            () => {
                dialogRef.close();
                this.pageLoading = true;
                this.geoService.getImportDetail().subscribe(response => {
                    if (response.length > 0 && Object.keys(response[0]).length > 0) {
                        this.toastr.error(response[0].message);
                        this.pageLoading = false;
                    } else {
                        this.toastr.success('Sync Initiated Successfully!!');
                        this.handleSync();
                    }
                });
            },
            () => {
                this.showErrorMessage();
            }
        );
    }

    handleSync(): void {
        this.geoService.handleImport({ userEmail: this.authService.userName }).subscribe(
            () => {
                this.pageLoading = false;
            },
            () => {
                this.showErrorMessage();
            }
        );
    }

    showErrorMessage(): void {
        this.pageLoading = false;
        this.toastr.error(
            environment.error_messages.could_not_fetch_data.message,
            environment.error_messages.could_not_fetch_data.title
        );
    }
}
