import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssessmentsReceivedComponent } from './assessments-received.component';
import { RoleGuardService } from '../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 'assessments-received',
        data: {
            breadcrumb: 'Assessments Received',
            freshChatTags: ['fashion', 'assessments']
        },
        component: AssessmentsReceivedComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssessmentsReceivedRoutingModule {}
