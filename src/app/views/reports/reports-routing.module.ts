import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenerateReportComponent } from './generate-report/generate-report.component';
import { ReportsComponent } from './reports.component';

const routes: Routes = [
    {
        path: 'reports',
        data: {
            breadcrumb: 'reports',
            freshChatTags: ['fashion', 'reports']
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: ReportsComponent
            },
            {
                path: 'record',
                component: GenerateReportComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule {}
