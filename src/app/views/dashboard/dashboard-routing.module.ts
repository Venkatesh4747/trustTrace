import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardService } from './../../core/user/role-guard.service';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
    {
        path: 'dashboard',
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'chart-detail',
                component: DashboardComponent
            }
        ],
        data: { freshChatTags: ['fashion', 'maps'] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule {}
