import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { IHiggModalConfigData } from '../../models/higg.model';
import { UtilsService } from '../../utils/utils.service';

@Component({
    selector: 'app-higg-modal',
    templateUrl: './higg-modal.component.html',
    styleUrls: ['./higg-modal.component.scss']
})
export class HiggModalComponent {
    env = environment;

    constructor(
        private dialogRef: MatDialogRef<HiggModalComponent>,
        @Inject(MAT_DIALOG_DATA) private data: { type: string },
        private utilService: UtilsService
    ) {}

    get replaceCamelCaseWithSpace(): (strValue: string) => string {
        return this.utilService.replaceCamelcaseWithSpace;
    }

    get modalConfigObj(): IHiggModalConfigData {
        return this.data;
    }

    closeHiggModal(actionName: string): void {
        this.dialogRef.close({ event: actionName });
    }
}
