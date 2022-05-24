import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseOrdersComponent } from './purchase-orders.component';

const routes: Routes = [
    {
        path: 'purchase-orders',
        data: {
            breadcrumb: 'Purchase Orders'
        },
        component: PurchaseOrdersComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PurchaseOrdersRoutingModule {}
