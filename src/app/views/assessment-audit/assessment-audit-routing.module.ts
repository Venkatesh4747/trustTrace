import { UploadAuditComponent } from './upload-audit/upload-audit.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssessmentAuditComponent } from './assessment-audit.component';
import { CreateAuditComponent } from './create-audit/create-audit.component';
import { ViewAuditComponent } from './view-audit/view-audit.component';
import { RoleGuardService } from '../../core/user/role-guard.service';
const routes: Routes = [
    {
        path: 'assessment-audit',
        data: {
            breadcrumb: 'Assessment Audits',
            freshChatTags: ['fashion', 'audit']
        },
        component: AssessmentAuditComponent,
        children: [
            {
                path: 'record-audit',
                component: CreateAuditComponent,
                canActivate: [RoleGuardService],
                data: {
                    breadcrumb: 'Record Audit',
                    roles: ['AUDIT_CREATE']
                }
            },
            {
                path: 'upload-audit',
                component: UploadAuditComponent,
                canActivate: [RoleGuardService],
                data: {
                    breadcrumb: 'Upload Audit',
                    roles: ['AUDIT_CREATE']
                }
            },
            {
                path: ':id',
                component: ViewAuditComponent,
                data: {
                    breadcrumb: 'View Audit',
                    roles: ['AUDIT_READ']
                },
                canActivate: [RoleGuardService]
            },
            {
                path: ':id/edit',
                component: ViewAuditComponent,
                canActivate: [RoleGuardService],
                data: {
                    breadcrumb: 'Edit Audit',
                    roles: ['AUDIT_UPDATE']
                }
            },
            {
                path: 'drafts',
                component: CreateAuditComponent,
                canActivate: [RoleGuardService],
                data: {
                    breadcrumb: 'Record Audit',
                    roles: ['AUDIT_CREATE']
                }
            }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssessmentAuditRoutingModule {}
