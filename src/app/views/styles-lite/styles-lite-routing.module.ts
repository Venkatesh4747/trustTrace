import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StylesLiteComponent } from './styles-lite.component';
import { StyleDetailViewComponent } from './style-detail-view/style-detail-view.component';

const routes: Routes = [
    {
        path: 'styles-lite',
        data: {
            breadcrumb: 'styles-lite'
        },
        component: StylesLiteComponent,
        children: [
            {
                path: ':styleId',
                component: StyleDetailViewComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StylesLiteRoutingModule {}
