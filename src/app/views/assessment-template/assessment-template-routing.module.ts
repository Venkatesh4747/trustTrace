import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssessmentTemplateComponent } from './assessment-template.component';
import { RoleGuardService } from '../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 'assessment-templates',
        data: {
            breadcrumb: 'Assessment Template',
            freshChatTags: ['fashion', 'assessments']
        },
        component: AssessmentTemplateComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssessmentTemplateRoutingModule {}
