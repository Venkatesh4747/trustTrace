import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardService } from '../../core/user/role-guard.service';
import { IntegrationLogsComponent } from './integration-logs.component';

const routes: Routes = [
    {
        path: 'integration-logs',
        canActivate: [RoleGuardService],
        data: {
            breadcrumb: 'integration-logs',
            roles: ['INTEGRATION_LOG_READ']
        },
        component: IntegrationLogsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IntegrationLogsRoutingModule {}
