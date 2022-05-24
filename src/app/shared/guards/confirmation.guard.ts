import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';

@Injectable()
export class ConfirmationGuard implements CanDeactivate<Observable<boolean>> {
    constructor(private dialog: MatDialog) {}

    canDeactivate(component: any): Observable<boolean> {
        if (component.isNavigateCheck) {
            const confirmationDialog = this.dialog.open(ConfirmDialogComponent, {
                width: '420px',
                data: {
                    title: 'Cancel Changes?',
                    msg: 'Are you sure you want to cancel? The existing information on this page will not be saved',
                    primaryButton: 'Cancel',
                    secondaryButton: 'Confirm',
                    class: 'bg-red-btn-delete-modal-dialog-block',
                    showClose: false
                }
            });
            return confirmationDialog.afterClosed().pipe(
                take(1),
                map(result => {
                    return result && result === 'Confirm';
                })
            );
        } else {
            return of(true);
        }
    }
}
