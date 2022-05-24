import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardService } from '../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 'assessments',
        canActivate: [RoleGuardService],
        data: {
            breadcrumb: 'Assessments',
            roles: ['ASSESSMENT_ARCHIVE', 'ASSESSMENT_CREATE', 'ASSESSMENT_READ', 'ASSESSMENT_UPDATE']
        },
        redirectTo: 'assessments-launched'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssessmentsRoutingModule {}
