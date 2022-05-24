import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from '../../../../../environments/environment';
import { CommonServices } from '../../../../shared/commonServices/common.service';
import { LocalizationService } from '../../../../shared/utils/localization.service';
import { TEmsService } from '../../../t-ems/t-ems.service';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-evidences-association',
    templateUrl: './evidences-association.component.html',
    styleUrls: ['./evidences-association.component.scss']
})
export class EvidencesAssociationComponent implements OnInit {
    @Input() id;
    @Input() entity;
    @Output() handleSelection = new EventEmitter<any>();
    @Output() handleItemClick = new EventEmitter<any>();
    env = environment;

    pageLoading = true;
    isLoadingSupplyChain = false;
    materialOrdersAssociation = [];
    evidences;
    supplyChainProduct = [];
    selectedRow;
    evidenceDataSource;
    displayedEvidenceDetails = ['last_modified', 'po', 'provided_by'];

    constructor(
        public localizationService: LocalizationService,
        public commonServices: CommonServices,
        private toastr: CustomToastrService,
        public temsService: TEmsService
    ) {}

    ngOnInit() {
        this.getEvidences();
    }

    getEvidences() {
        this.temsService.getEvidences(this.entity, this.id).subscribe(
            response => {
                this.evidences = response['data'];
                console.log(this.evidences);
                if (this.evidences.length > 0) {
                    this.evidenceDataSource = new MatTableDataSource(this.evidences);
                    this.selectedRow = this.evidences[0];
                    this.showRelevantEvidences(this.selectedRow);
                }
                this.pageLoading = false;
            },
            () => {
                this.pageLoading = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    showRelevantEvidences(data) {
        this.handleSelection.emit(data);
    }

    selectRow(row) {
        this.selectedRow = row;
    }
}
