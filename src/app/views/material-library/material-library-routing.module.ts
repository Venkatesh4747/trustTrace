import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialLibraryViewComponent } from './material-library-view/material-library-view.component';

import { CreateMaterialsComponent } from './create-materials/create-materials.component';
import { MaterialLibraryComponent } from './material-library.component';
import { RoleGuardService } from '../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 'material-library',
        data: {
            breadcrumb: 'Material Library',
            freshChatTags: ['fashion', 'materials']
        },
        component: MaterialLibraryComponent,
        children: [
            {
                path: 'create',
                component: CreateMaterialsComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['ML_CREATE']
                }
            },
            {
                path: ':materialId',
                component: MaterialLibraryViewComponent,
                data: {
                    roles: ['ML_READ']
                },
                canActivate: [RoleGuardService]
            },
            {
                path: ':materialId/:mode',
                component: CreateMaterialsComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['ML_UPDATE']
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MaterialLibraryRoutingModule {}
