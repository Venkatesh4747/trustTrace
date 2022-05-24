import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PoDetailViewComponent } from './po-detail-view/po-detail-view.component';
import { PoManagementComponent } from './po-management.component';

const routes: Routes = [
    {
        path: 'po-management',
        data: {
            breadcrumb: 'po-management'
        },
        component: PoManagementComponent,
        children: [
            {
                path: ':poId/:styleId',
                component: PoDetailViewComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PoManagementRoutingModule {}
