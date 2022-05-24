import { Component, Input, OnInit } from '@angular/core';
import { LocalizationService } from '../../../shared/utils/localization.service';
import {
    ISupplierListFormOptions,
    SupplierListTypes,
    ISupplier
} from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';

@Component({
    selector: 'app-style-supply-chain',
    templateUrl: './style-supply-chain.component.html',
    styleUrls: ['./style-supply-chain.component.scss']
})
export class StyleSupplyChainComponent implements OnInit {
    @Input('style') style: any;

    supplierListOptions: ISupplierListFormOptions = {
        controlType: 'chip-select',
        listOnlyThisSuppliers: [
            SupplierListTypes.not_invited_supplier,
            SupplierListTypes.accepted_supplier,
            SupplierListTypes.unAccepted_supplier
        ],
        acceptOnlyListedValues: true,
        isRequired: true,
        tooltipPosition: 'right',
        valueChangesFire: 'from-option',
        requiredSymbolRemove: true
    };

    constructor(public localeService: LocalizationService) {}

    ngOnInit() {
        this.initializeStyleValues();
    }

    initializeStyleValues() {
        if (this.style.supplyChain && this.style.supplyChain.length > 0) {
            const id = [];
            this.style.supplyChain.forEach(element => {
                // todo optimize this loop if its not needed
                if (element.suppliers) {
                    for (let i = 0; i < element.suppliers.length; i++) {
                        id.push({ id: element.suppliers[i].id });
                    }
                }
            });
            this.supplierListOptions.selectedItem = id;
        }
    }

    suppliersChanged(productType: string, index: number, $event: ISupplier[]): void {
        if ($event) {
            let suppliersList = [];
            suppliersList = $event.map(supplier => {
                return { id: supplier.supplier_id };
            });
            if (this.style.supplyChain.length === 0) {
                this.style.supplyChain.push({});
            }
            this.style.supplyChain[index].productType = productType;
            this.style.supplyChain[index].suppliers = suppliersList;
        }
    }
}
