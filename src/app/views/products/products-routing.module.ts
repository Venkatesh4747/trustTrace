import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardService } from '../../../app/core/user/role-guard.service';
import { ConfirmationGuard } from '../../shared/guards/confirmation.guard';
import { FinishedProductsListComponent } from './finished-products-list/finished-products-list.component';
import { FinishedProductsComponent } from './finished-products-list/finished-products/finished-products.component';
import { IntegrationComponent } from './integration/integration.component';
import { IntegrationProductListComponent } from './integration/integration-product-list/integration-product-list.component';
import { IntegrationProductDetailComponent } from './integration/integration-product-detail/integration-product-detail.component';
import { LabelsAndProgramsDetailComponent } from './labels-and-programs/labels-and-programs-detail/labels-and-programs-detail.component';
import { LabelsAndProgramsListComponent } from './labels-and-programs/labels-and-programs-list/labels-and-programs-list.component';
import { LabelsAndProgramsComponent } from './labels-and-programs/labels-and-programs.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductsComponent } from './products.component';
import { SimulationComponent } from './simulation/simulation.component';
import { DataCollectionComponent } from './tasks/data-collection/data-collection.component';
import { ProductTasksComponent } from './tasks/tasks.component';

const routes: Routes = [
    {
        path: 'products',
        data: {
            breadcrumb: 'Products'
        },
        component: ProductsComponent,
        children: [
            {
                path: 'finished',
                component: FinishedProductsListComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: FinishedProductsComponent
                    },
                    {
                        path: 'simulation',
                        component: SimulationComponent
                    },
                    {
                        path: ':id',
                        component: ProductDetailComponent
                    }
                ]
            },
            {
                path: 'tasks',
                component: ProductTasksComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: DataCollectionComponent
                    },
                    {
                        path: 'simulation',
                        component: SimulationComponent
                    },
                    {
                        path: ':id',
                        component: ProductDetailComponent
                    }
                ]
            },
            {
                path: 'labels',
                data: {
                    roles: ['LABELS_AND_PROGRAMS_READ']
                },
                canActivate: [RoleGuardService],
                component: LabelsAndProgramsComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        data: {
                            roles: ['LABELS_AND_PROGRAMS_READ']
                        },
                        canActivate: [RoleGuardService],
                        component: LabelsAndProgramsListComponent
                    },
                    {
                        path: 'create',
                        data: {
                            roles: ['LABELS_AND_PROGRAMS_CREATE']
                        },
                        canActivate: [RoleGuardService],
                        canDeactivate: [ConfirmationGuard],
                        component: LabelsAndProgramsDetailComponent
                    },
                    {
                        path: 'update/:labelId',
                        data: {
                            roles: ['LABELS_AND_PROGRAMS_UPDATE']
                        },
                        canActivate: [RoleGuardService],
                        canDeactivate: [ConfirmationGuard],
                        component: LabelsAndProgramsDetailComponent
                    }
                ]
            },
            {
                path: 'integration',
                data: {
                    roles: ['PRODUCT_INTEGRATION_READ']
                },
                canActivate: [RoleGuardService],
                component: IntegrationComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        data: {
                            roles: ['PRODUCT_INTEGRATION_READ']
                        },
                        canActivate: [RoleGuardService],
                        component: IntegrationProductListComponent
                    },
                    {
                        path: 'detail',
                        data: {
                            roles: ['PRODUCT_INTEGRATION_READ']
                        },
                        component: IntegrationProductDetailComponent
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductsRoutingModule {}
