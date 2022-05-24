import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CommonServices } from './../../../../shared/commonServices/common.service';
import { LocalizationService } from './../../../../shared/utils/localization.service';
import { MaterialLibraryService } from './../../material-library.service';
import { environment } from './../../../../../environments/environment';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-orders-association',
    templateUrl: './orders-association.component.html',
    styleUrls: ['./orders-association.component.scss']
})
export class OrdersAssociationComponent implements OnInit {
    @Input() id;
    @Output() handleSelection = new EventEmitter<any>();
    @Output() handleItemClick = new EventEmitter<any>();
    env = environment;

    pageLoading = true;
    isLoadingSupplyChain = false;
    materialOrdersAssociation = [];
    supplyChainOrders;
    supplyChainProduct = [];
    selectedRow;
    supplyChainDataSource;
    displayedOrdersDetails = ['date', 'po', '_id'];

    constructor(
        private mtrLibService: MaterialLibraryService,
        public localizationService: LocalizationService,
        public commonServices: CommonServices,
        private toastr: CustomToastrService
    ) {}

    ngOnInit() {
        this.getMaterialOrdersAssociation();
    }

    getMaterialOrdersAssociation() {
        this.mtrLibService.getMaterialOrdersAssociation(this.id).subscribe(
            response => {
                this.supplyChainOrders = response['product'];
                if (this.supplyChainOrders.length > 0) {
                    this.supplyChainDataSource = new MatTableDataSource(this.supplyChainOrders);
                    this.selectedRow = this.supplyChainOrders[0];
                    this.handleOrderSupplyChainFlow(this.selectedRow);
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

    handleOrderSupplyChainFlow(data) {
        this.handleSelection.emit(data);
    }

    selectRow(row) {
        this.selectedRow = row;
    }

    getDetailedSupplyChain(data) {
        // For not allowing parent click to be triggered
        event.stopPropagation();
        this.handleItemClick.emit(data);
    }
}
