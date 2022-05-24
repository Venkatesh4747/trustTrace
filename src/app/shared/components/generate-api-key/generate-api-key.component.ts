import { GenerateApiKeyService, IGenerateApiKeyHttpResponse } from './generate-api-key.service';
import { Component, OnInit } from '@angular/core';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
import { UtilsService } from '../../utils/utils.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../modals/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-generate-api-key',
    templateUrl: './generate-api-key.component.html',
    styleUrls: ['./generate-api-key.component.scss']
})
export class GenerateApiKeyComponent implements OnInit {
    apiKey: string;

    isProcessing: boolean = false;

    constructor(
        private apikeyService: GenerateApiKeyService,
        private toasterService: CustomToastrService,
        private utilService: UtilsService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.getApiKey();
    }

    copyApiKeyText(inputElement: HTMLInputElement): void {
        this.utilService.copyText(inputElement);
        this.toasterService.success('Successfully copied API key to clipboard', 'Success');
    }

    private getApiKey(): void {
        this.setIsProcessing();
        this.apikeyService.getApiKey().subscribe(
            (response: IGenerateApiKeyHttpResponse) => {
                if (response.status === 'SUCCESS' && response.hasOwnProperty('data')) {
                    this.apiKey = response.data.apiKey;
                }

                this.setIsProcessing(false);
            },
            err => this.setIsProcessing(false)
        );
    }

    generateNewApiKey(): void {
        this.setIsProcessing();
        this.apikeyService.generateNewApiKey().subscribe(
            (response: IGenerateApiKeyHttpResponse) => {
                if (response.status === 'SUCCESS' && response.hasOwnProperty('data')) {
                    this.apiKey = response.data.apiKey;
                    this.toasterService.success('Successfully generated API key');
                } else {
                    this.toasterService.error(response.errors, 'Error');
                }

                this.setIsProcessing(false);
            },
            () => this.setIsProcessing(false)
        );
    }

    private deleteApiKey(): void {
        this.setIsProcessing();
        this.apikeyService.deleteApiKey().subscribe(
            (response: IGenerateApiKeyHttpResponse) => {
                if (response.status === 'SUCCESS') {
                    this.apiKey = '';
                    this.toasterService.success('Successfully revoked API key');
                } else {
                    this.toasterService.error(response.errors, 'Error');
                }

                this.setIsProcessing(false);
            },
            () => this.setIsProcessing(false)
        );
    }

    showConfirmationDialog(): void {
        const confirmRevoke = this.dialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Revoke Key',
                msg:
                    'Once the API key is revoked, all the applications using the old key will stop working. Are you sure you want to continue?',
                primaryButton: 'Cancel',
                secondaryButton: 'OK'
            }
        });

        confirmRevoke
            .afterClosed()
            .pipe(take(1))
            .subscribe(
                modalCloseResponse => {
                    if (modalCloseResponse === 'OK') this.deleteApiKey();
                },
                err => {
                    throw new Error('Error closing modal.');
                }
            );
    }

    private setIsProcessing(isSet = true): void {
        this.isProcessing = isSet;
    }
}
