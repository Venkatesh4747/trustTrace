import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrandUserManagementComponent } from './brand-user-management/brand-user-management.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { ManageGroupComponent } from './manage-group/manage-group.component';
import { ProfileComponent } from './profile/profile.component';
import { CompanySettingsComponent } from './settings/company/company-settings.component';
import { SupplierUserManagementComponent } from './supplier-user-management/supplier-user-management.component';
import { UserComponent } from './user.component';
import { RoleGuardService } from '../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 'user',
        data: {
            breadcrumb: 'User'
        },
        component: UserComponent,
        children: [
            {
                path: '',
                redirectTo: '/user/profile',
                pathMatch: 'full'
            },
            {
                path: 'profile',
                data: {
                    breadcrumb: 'Profile',
                    freshChatTags: ['fashion', 'user']
                },
                component: ProfileComponent
            },
            {
                path: 'settings',
                data: {
                    breadcrumb: 'Settings',
                    freshChatTags: ['fashion', 'settings']
                },
                component: CompanySettingsComponent
            },
            {
                path: 'brand-user-management',
                data: {
                    breadcrumb: 'Brand User Management',
                    roles: ['UM_READ'],
                    freshChatTags: ['fashion', 'user']
                },
                canActivate: [RoleGuardService],
                component: BrandUserManagementComponent
            },
            {
                path: 'create-user',
                data: {
                    breadcrumb: 'Create-User',
                    roles: ['UM_CREATE'],
                    freshChatTags: ['fashion', 'user']
                },
                canActivate: [RoleGuardService],
                component: CreateUserComponent
            },
            {
                path: 'create-group',
                data: {
                    breadcrumb: 'Create-Group',
                    roles: ['UM_CREATE']
                },
                canActivate: [RoleGuardService],
                component: CreateGroupComponent
            },
            {
                path: 'manage-group/:groupId',
                data: {
                    breadcrumb: 'Manage-Group',
                    roles: ['UM_UPDATE']
                },
                canActivate: [RoleGuardService],
                component: ManageGroupComponent
            },
            {
                path: 'create-user/:userId/:mode',
                data: {
                    breadcrumb: 'Manage-User',
                    roles: ['UM_UPDATE']
                },
                canActivate: [RoleGuardService],
                component: CreateUserComponent
            },
            {
                path: 'supplier-user-management',
                data: {
                    breadcrumb: 'Supplier User Management'
                },
                component: SupplierUserManagementComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule {}
