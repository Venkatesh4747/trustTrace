import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { RecordTransactionsComponent } from './record-transactions/record-transactions.component';
import { TransactionTreeComponent } from './transaction-tree/transaction-tree.component';

const routes: Routes = [
    {
        path: 'orders-lite',
        data: {
            breadcrumb: 'orders-lite'
        },
        component: OrdersComponent,
        children: [
            {
                path: 'record',
                component: RecordTransactionsComponent
            },
            {
                path: ':transaction_id/transaction-tree',
                component: TransactionTreeComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrdersRoutingModule {}
