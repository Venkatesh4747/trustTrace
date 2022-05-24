import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SharedModule } from '../../shared/shared.module';
import { CommonServices } from './../../shared/commonServices/common.service';
import { RecordTransactionsComponent } from './record-transactions/record-transactions.component';
import { SubmitErrorPopupComponent } from './submit-error-popup/submit-error-popup.component';
import { TransactionTreeNodeComponent } from './transaction-tree/transaction-tree-node/transaction-tree-node.component';
import { TransactionTreeComponent } from './transaction-tree/transaction-tree.component';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions.component';
import { TransactionsService } from './transactions.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CreateTransactionsComponent } from './create-transactions/create-transactions.component';
import { OutboundTransactionsComponent } from './outbound-transactions/outbound-transactions.component';
import { ProductionTransactionsComponent } from './production-transactions/production-transactions.component';
import { InboundTransactionsComponent } from './inbound-transactions/inbound-transactions.component';
import { InboundCottonTransactionsComponent } from './inbound-cotton-transactions/inbound-cotton-transactions.component';
import { ProductionIntermediateTransactionsComponent } from './production-intermediate-transactions/production-intermediate-transactions.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

@NgModule({
    declarations: [
        TransactionsComponent,
        RecordTransactionsComponent,
        TransactionTreeComponent,
        TransactionTreeNodeComponent,
        SubmitErrorPopupComponent,
        CreateTransactionsComponent,
        InboundTransactionsComponent,
        OutboundTransactionsComponent,
        ProductionTransactionsComponent,
        InboundCottonTransactionsComponent,
        ProductionIntermediateTransactionsComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        TransactionsRoutingModule,
        PopoverModule,
        TooltipModule,
        MatProgressSpinnerModule
    ],
    providers: [
        TransactionsService,
        CommonServices,
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { float: 'always' } }
    ],
    entryComponents: [SubmitErrorPopupComponent]
})
export class TransactionsModule {}
