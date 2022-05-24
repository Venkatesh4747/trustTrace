import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardService } from '../../core/user/role-guard.service';
import { AdminComponent } from './admin.component';

const routes: Routes = [
    {
        path: 'admin',
        canActivate: [RoleGuardService],
        data: {
            breadcrumb: 'Admin',
            roles: ['ADMIN_ARCHIVE', 'ADMIN_CREATE', 'ADMIN_READ', 'ADMIN_UPDATE']
        },
        component: AdminComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {}
