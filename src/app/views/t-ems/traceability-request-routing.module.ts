import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateTrComponent } from './create-tr/create-tr.component';
import { EvidenceCollectionDetailViewComponent } from './evidence-collection-detail-view/evidence-collection-detail-view.component';
import { EvidenceCollectionSupplyChainComponent } from './evidence-collection-supply-chain/evidence-collection-supply-chain.component';
import { EvidenceCollectionComponent } from './evidence-collection/evidence-collection.component';
import { TrListComponent } from './tr-list/tr-list.component';
import { RoleGuardService } from './../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 't-ems',
        component: TrListComponent,
        children: [
            {
                path: 'product/create',
                component: CreateTrComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TEMS_CREATE']
                }
            },
            {
                path: 'product/evidencecollection/:trId',
                component: EvidenceCollectionDetailViewComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TEMS_READ']
                }
            },
            {
                path: 'product/evidencecollection/:trId/edit',
                component: EvidenceCollectionComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TEMS_UPDATE']
                }
            },
            {
                path: 'product/evidencecollection/:trId/supplychain',
                component: EvidenceCollectionSupplyChainComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TEMS_CREATE']
                }
            }
        ],
        data: { freshChatTags: ['fashion', 'tems'] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TraceabilityRequestRoutingModule {}
