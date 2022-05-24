import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { PurchaseOrdersRoutingModule } from './purchase-orders-routing.module';
import { PurchaseOrdersComponent } from './purchase-orders.component';

@NgModule({
    imports: [CommonModule, PurchaseOrdersRoutingModule, SharedModule],
    declarations: [PurchaseOrdersComponent]
})
export class PurchaseOrdersModule {}
