import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapsComponent } from './maps.component';
import { RoleGuardService } from './../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 'maps',
        data: {
            breadcrumb: 'Map',
            freshChatTags: ['fashion', 'charts']
        },
        component: MapsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MapsRoutingModule {}
