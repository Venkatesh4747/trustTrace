import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LaunchedComponent } from './launched/launched.component';
import { ProductTraceabilityComponent } from './product-traceability.component';
import { ReceivedComponent } from './received/received.component';

const routes: Routes = [
    {
        path: 'product-traceability',
        data: {
            breadcrumb: 'Product Traceability'
        },
        component: ProductTraceabilityComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'launched'
            },
            {
                path: 'launched',
                component: LaunchedComponent,
                data: {
                    breadcrumb: 'Launched'
                }
            },
            {
                path: 'received',
                component: ReceivedComponent,
                data: {
                    breadcrumb: 'Received'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductTraceabilityRoutingModule {}
