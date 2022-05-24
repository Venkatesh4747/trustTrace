import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialDetailViewComponent } from './material-detail-view/material-detail-view.component';
import { MaterialsLiteComponent } from './materials-lite.component';

const routes: Routes = [
    {
        path: 'materials-lite',
        data: {
            breadcrumb: 'materials-lite'
        },
        component: MaterialsLiteComponent,
        children: [
            {
                path: ':materialId',
                component: MaterialDetailViewComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MaterialsLiteRoutingModule {}
