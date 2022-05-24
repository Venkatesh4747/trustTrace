import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SupplierDashboardRoutingModule } from './supplier-dashboard-routing.module';
import { SupplierDashboardComponent } from './supplier-dashboard.component';
import { SupplierDashboardService } from './supplier-dashboard.service';

@NgModule({
    imports: [CommonModule, SharedModule, SupplierDashboardRoutingModule],
    declarations: [SupplierDashboardComponent],
    providers: [SupplierDashboardService]
})
export class SupplierDashboardModule {}
