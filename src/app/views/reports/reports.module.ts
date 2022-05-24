import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonServices } from '../../shared/commonServices/common.service';
import { SharedModule } from '../../shared/shared.module';
import { GenerateReportComponent } from './generate-report/generate-report.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ReportsService } from './reports.service';

@NgModule({
    declarations: [ReportsComponent, GenerateReportComponent],
    imports: [FormsModule, ReactiveFormsModule, CommonModule, SharedModule, ReportsRoutingModule, MatTabsModule],
    exports: [MatTabsModule],
    providers: [ReportsService, CommonServices]
})
export class ReportsModule {}
