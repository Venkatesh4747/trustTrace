import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuicksightDashboardComponent } from './quicksight-dashboard/quicksight-dashboard.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'analytics',
        component: QuicksightDashboardComponent
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'maps',
        loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule)
    },
    {
        path: 'reports',
        loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)
    },
    {
        path: 'orders',
        loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule)
    },
    {
        path: 'orders-lite',
        loadChildren: () => import('./orders-lite/orders.module').then(m => m.OrdersLiteModule)
    },
    {
        path: 'assessments',
        loadChildren: () => import('./assessments/assessments.module').then(m => m.AssessmentsModule)
    },
    {
        path: 't-trace',
        loadChildren: () =>
            import('./traceability-request/traceability-request.module').then(m => m.TraceabilityRequestModule)
    },
    {
        path: 't-ems',
        loadChildren: () => import('./t-ems/traceability-request.module').then(m => m.TraceabilityRequestModule)
    },
    {
        path: 'product-traceability',
        loadChildren: () =>
            import('./product-traceability/product-traceability.module').then(m => m.ProductTraceabilityModule)
    },
    {
        path: 'task-manager',
        loadChildren: () => import('./task-manager/task-manager.module').then(m => m.TaskManagerModule)
    },
    {
        path: 'styles',
        loadChildren: () => import('./styles/styles.module').then(m => m.StylesModule)
    },
    {
        path: 'suppliers',
        loadChildren: () => import('./suppliers/suppliers.module').then(m => m.SuppliersModule)
    },
    {
        path: 'supplier-dashboard',
        loadChildren: () =>
            import('./supplier-dashboard/supplier-dashboard.module').then(m => m.SupplierDashboardModule)
    },
    {
        path: 'facilities',
        loadChildren: () =>
            import('./facilities-profile/facilities-profile.module').then(m => m.FacilitiesProfileModule)
    },
    {
        path: 'page-not-found',
        loadChildren: () => import('./page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)
    },
    {
        path: 'user',
        loadChildren: () => import('./user/user.module').then(m => m.UserModule)
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
    },
    {
        path: 'material-library',
        loadChildren: () => import('./material-library/material-library.module').then(m => m.MaterialLibraryModule)
    },
    {
        path: 'products',
        loadChildren: () => import('./products/products.module').then(m => m.ProductsModule)
    },
    {
        path: 'transactions',
        loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsModule)
    },
    {
        path: 'po-management',
        loadChildren: () => import('./po-management/po-management.module').then(m => m.PoManagementModule)
    },
    {
        path: 'materials-lite',
        loadChildren: () => import('./materials-lite/materials-lite.module').then(m => m.MaterialsLiteModule)
    },
    {
        path: 'bom-lite',
        loadChildren: () => import('./bom-lite/bom-lite.module').then(m => m.BomLiteModule)
    },
    {
        path: 'styles-lite',
        loadChildren: () => import('./styles-lite/styles-lite.module').then(m => m.StylesLiteModule)
    },
    {
        path: 'integration-logs',
        loadChildren: () => import('./integration-logs/integration-logs.module').then(m => m.IntegrationLogsModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ViewsRoutingModule {}
