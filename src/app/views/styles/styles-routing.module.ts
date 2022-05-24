import { RoleGuardService } from './../../core/user/role-guard.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateStyleComponent } from './create-style/create-style.component';
import { StylesViewComponent } from './styles-view/styles-view.component';
import { StylesComponent } from './styles.component';

const routes: Routes = [
    {
        path: 'styles',
        component: StylesComponent,
        data: {
            breadcrumb: 'Styles',
            freshChatTags: ['fashion', 'styles', 'suppliers']
        },
        children: [
            {
                path: 'create',
                component: CreateStyleComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['STYLE_CREATE']
                }
            },
            {
                path: ':styleId',
                component: StylesViewComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['STYLE_READ']
                }
            },
            {
                path: ':styleId/:mode',
                component: CreateStyleComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['STYLE_UPDATE']
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StylesRoutingModule {}
