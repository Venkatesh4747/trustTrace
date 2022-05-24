import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacilitiesDetailsComponent } from './facilities-details/facilities-details.component';
import { FacilitiesProfileComponent } from './facilities-profile.component';
import { RoleGuardService } from '../../core/user/role-guard.service';
import { SubSupplierDetailsComponent } from '../suppliers/sub-supplier-details/sub-supplier-details.component';

const routes: Routes = [
    {
        path: 'facilities',
        data: {
            breadcrumb: 'Facilities'
        },
        component: FacilitiesProfileComponent,
        children: [
            {
                path: ':id',
                component: FacilitiesDetailsComponent,
                data: {
                    roles: ['SUPPLIER_FACILITY_READ']
                },
                canActivate: [RoleGuardService]
            },
            {
                path: ':facilityId/:companyId',
                component: SubSupplierDetailsComponent,
                data: {
                    roles: ['SUPPLIER_FACILITY_READ']
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
export class FacilitiesProfileRoutingModule {}
