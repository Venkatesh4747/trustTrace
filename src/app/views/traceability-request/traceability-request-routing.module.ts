import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateTrSupplyChainComponent } from './create-tr-supply-chain/create-tr-supply-chain.component';
import { CreateTrComponent } from './create-tr/create-tr.component';
import { EditTrSupplyChainComponent } from './edit-tr-supply-chain/edit-tr-supply-chain.component';
import { ReusableSupplyChainComponent } from './reusable-supply-chain/reusable-supply-chain.component';
import { TrDetailViewComponent } from './tr-detail-view/tr-detail-view.component';
import { TrListComponent } from './tr-list/tr-list.component';
import { TrTreeViewComponent } from './tr-tree-view/tr-tree-view.component';
import { RoleGuardService } from './../../core/user/role-guard.service';
import { ConfirmationGuard } from './../../shared/guards/confirmation.guard';

const routes: Routes = [
    {
        path: 't-trace',
        component: TrListComponent,
        children: [
            {
                path: 'product/create',
                component: CreateTrComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TTRACE_CREATE']
                }
            },
            {
                path: 'product/supplychain/:trId',
                component: TrDetailViewComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TTRACE_READ']
                }
            },
            {
                path: 'product/supplychain/:trId/tree',
                component: TrTreeViewComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TTRACE_READ']
                }
            },
            {
                path: 'product/supplychain/:trId/create',
                component: CreateTrSupplyChainComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TTRACE_CREATE']
                }
            },
            {
                path: 'product/supplychain/:trId/edit',
                component: EditTrSupplyChainComponent,
                canActivate: [RoleGuardService],
                canDeactivate: [ConfirmationGuard],
                data: {
                    roles: ['TTRACE_UPDATE']
                }
            },
            {
                path: 'product/supplychain/:trId/reusable',
                component: ReusableSupplyChainComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TTRACE_CREATE']
                }
            }
        ],
        data: { freshChatTags: ['fashion', 't-trace'] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TraceabilityRequestRoutingModule {}
