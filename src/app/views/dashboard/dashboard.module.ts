import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../../shared/shared.module';
import { ChartDetailComponent } from './chart-detail/chart-detail.component';
import { ChartThumbnailComponent } from './chart-thumbnail/chart-thumbnail.component';
import { ChartsComponent } from './charts/charts.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { StylesChartComponent } from './styles-chart/styles-chart.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        BsDropdownModule,
        ModalModule,
        CommonModule,
        TooltipModule,
        SharedModule,
        DashboardRoutingModule,
        TabsModule,
        MatTabsModule,
        MatGridListModule,
        MatMenuModule,
        FormsModule
    ],
    declarations: [
        DashboardComponent,
        ChartThumbnailComponent,
        StylesChartComponent,
        ChartDetailComponent,
        ChartsComponent
    ],
    providers: [DashboardService]
})
export class DashboardModule {}
