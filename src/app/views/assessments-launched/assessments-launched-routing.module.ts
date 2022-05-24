import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssessmentsLaunchedComponent } from './assessments-launched.component';
import { RoleGuardService } from '../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 'assessments-launched',
        data: {
            breadcrumb: 'Assessments Launched',
            freshChatTags: ['fashion', 'assessments']
        },
        component: AssessmentsLaunchedComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssessmentsLaunchedRoutingModule {}
