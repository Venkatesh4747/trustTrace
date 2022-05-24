import { UtilsService } from './../../../shared/utils/utils.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { TraceabilityRequestService } from './../traceability-request.service';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
    selector: 'app-tr-tree-view-modal',
    templateUrl: './tr-tree-view-modal.component.html',
    styleUrls: ['./tr-tree-view-modal.component.scss']
})
export class TrTreeViewModalComponent implements OnInit {
    trId: string;
    supplyChainData: any;
    pageLoading = false;

    constructor(
        private trs: TraceabilityRequestService,
        public localizationService: LocalizationService,
        private dialogRef: MatDialogRef<TrTreeViewModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public utilService: UtilsService
    ) {}

    ngOnInit() {
        this.trId = this.data.trId;
        this.pageLoading = true;
        this.trs.getSupplyChainData(this.trId).subscribe(response => {
            const data = response['data'];
            this.localizationService.addToMasterData(data['masterData']);
            this.supplyChainData = Object.assign({}, JSON.parse(JSON.stringify(data['supplyChain'])));
            this.pageLoading = false;
        });
    }

    actionDone() {
        this.dialogRef.close();
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
