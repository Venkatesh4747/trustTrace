import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplierDetailsComponent } from './supplier-details/supplier-details.component';
import { SuppliersListComponent } from './suppliers-list/suppliers-list.component';
import { SuppliersComponent } from './suppliers.component';
import { RoleGuardService } from '../../core/user/role-guard.service';
import { SubSupplierDetailsComponent } from './sub-supplier-details/sub-supplier-details.component';

const routes: Routes = [
    {
        path: 'suppliers',
        data: {
            breadcrumb: 'Suppliers',
            freshChatTags: ['fashion', 'styles', 'suppliers']
        },
        component: SuppliersComponent,
        children: [
            {
                path: '',
                component: SuppliersListComponent
            },
            {
                path: ':id',
                component: SupplierDetailsComponent,
                data: {
                    roles: ['SUPPLIER_READ']
                },
                canActivate: [RoleGuardService]
            },
            {
                path: ':supplierId/:supplierCompanyId',
                component: SubSupplierDetailsComponent,
                data: {
                    roles: ['SUPPLIER_READ']
                },
                canActivate: [RoleGuardService]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SuppliersRoutingModule {}
