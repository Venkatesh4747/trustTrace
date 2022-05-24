import { Component, Input, OnInit } from '@angular/core';
import { ISupplierConflicts } from '../supplier.model';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-supplier-conflicts',
    templateUrl: './supplier-conflicts.component.html',
    styleUrls: ['./supplier-conflicts.component.scss']
})
export class SupplierConflictsComponent implements OnInit {
    @Input() suppliers: Array<ISupplierConflicts> = [];

    supplierConflicts: Array<ISupplierConflicts> = [];

    env = environment;

    ngOnInit(): void {
        this.supplierConflicts = this.suppliers;
    }

    /**
     * @method displayLocation
     * @param { supplier }
     */
    displayLocation(supplier: ISupplierConflicts): string | boolean {
        if (!(supplier.address.city || supplier.address.state || supplier.address.country)) {
            return false;
        }

        return `${supplier.address.city ? supplier.address.city + ', ' : ''}
        ${supplier.address.state ? supplier.address.state + ', ' : ''}
        ${supplier.address.country ? supplier.address.country : ''}`;
    }
}
