import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BomLiteComponent } from './bom-lite.component';
import { BomDetailViewComponent } from './bom-detail-view/bom-detail-view.component';

const routes: Routes = [
    {
        path: 'bom-lite',
        data: {
            breadcrumb: 'bom-lite'
        },
        component: BomLiteComponent,
        children: [
            {
                path: ':bomId',
                component: BomDetailViewComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BomLiteRoutingModule {}
