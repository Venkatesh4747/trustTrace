import { CreateTransactionsComponent } from './create-transactions/create-transactions.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionTreeComponent } from './transaction-tree/transaction-tree.component';
import { TransactionsComponent } from './transactions.component';
import { RoleGuardService } from './../../core/user/role-guard.service';

const routes: Routes = [
    {
        path: 'transactions',
        data: {
            breadcrumb: 'transactions',
            freshChatTags: ['fashion', 'transactions']
        },
        component: TransactionsComponent,
        children: [
            {
                path: 'record',
                component: CreateTransactionsComponent,
                canActivate: [RoleGuardService],
                data: {
                    roles: ['TRANSACTION_CREATE']
                }
            },
            {
                path: ':transaction_id/transaction-tree',
                component: TransactionTreeComponent,
                data: {
                    roles: ['TRANSACTION_READ']
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
export class TransactionsRoutingModule {}
