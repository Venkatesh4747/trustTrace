import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { RecordTransactionsComponent } from './record-transactions/record-transactions.component';
import { TransactionTreeComponent } from './transaction-tree/transaction-tree.component';
import { RoleGuardService } from './../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 'orders',
        data: {
            breadcrumb: 'orders'
        },
        component: OrdersComponent,
        children: [
            {
                path: 'record',
                component: RecordTransactionsComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['ORDER_CREATE']
                }
            },
            {
                path: ':transaction_id/transaction-tree',
                component: TransactionTreeComponent,
                data: {
                    roles: ['ORDER_READ']
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
export class OrdersRoutingModule {}
