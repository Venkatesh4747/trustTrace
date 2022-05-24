import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SupplierDashboardComponent } from './supplier-dashboard.component';

const routes: Routes = [
    {
        path: 'supplier-dashboard',
        data: {
            breadcrumb: 'supplier-dashboard'
        },
        component: SupplierDashboardComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SupplierDashboardRoutingModule {}
