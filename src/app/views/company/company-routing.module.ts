import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssociateComponent } from './associate/associate.component';
import { CompanyComponent } from './company.component';
import { EditFacilityComponent } from './edit-facility/edit-facility.component';
import { ProfileComponent } from './profile/profile.component';
import { SignupComponent } from './signup/signup.component';
import { CreateFacilityComponent } from './create-facility/create-facility.component';
import { CertificateManagerComponent } from './../../shared/components/certificate-manager/certificate-manager.component';

const routes: Routes = [
    {
        path: 'company',
        data: {
            breadcrumb: 'company'
        },
        component: CompanyComponent,
        children: [
            {
                path: 'profile',
                component: ProfileComponent,
                data: {
                    breadcrumb: 'Profile',
                    freshChatTags: ['fashion', 'profile']
                }
            },
            {
                path: 'associate',
                component: AssociateComponent,
                data: {
                    breadcrumb: 'Associate'
                }
            },
            {
                path: 'create-facility',
                component: CreateFacilityComponent,
                data: {
                    breadcrumb: 'Create Facility',
                    freshChatTags: ['fashion', 'profile', 'facility']
                }
            },
            {
                path: 'edit-facility/:id',
                component: EditFacilityComponent,
                data: { breadcrumb: 'Edit Facility' },
                children: [
                    {
                        path: 'edit-certificate/:id',
                        component: CertificateManagerComponent,
                        data: {
                            breadcrumb: 'Certificate Manager'
                        }
                    }
                ]
            }
        ]
    },
    {
        path: 'signup',
        data: {
            breadcrumb: 'Signup'
        },
        component: SignupComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CompanyRoutingModule {}
