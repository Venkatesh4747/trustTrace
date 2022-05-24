import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilsService } from '../../utils/utils.service';
import { environment as env } from './../../../../environments/environment';
import { LocalizationService } from '../../utils/localization.service';

@Component({
    selector: 'app-supply-chain-flow',
    templateUrl: './supply-chain-flow.component.html',
    styleUrls: ['./supply-chain-flow.component.scss']
})
export class SupplyChainFlowComponent implements OnInit {
    public env = env;
    supplyChain;

    constructor(
        private dialogRef: MatDialogRef<SupplyChainFlowComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService,
        public localizationService: LocalizationService
    ) {}
    ngOnInit() {
        this.supplyChain = this.data.supplyChain;
    }

    getDate(dateString) {
        const dateParts = dateString.split('/');
        return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    }

    actionDone() {
        this.dialogRef.close();
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
