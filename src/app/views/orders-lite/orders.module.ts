import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { DragScrollModule } from 'ngx-drag-scroll';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../../shared/shared.module';
import { CertificatesListComponent } from './certificates-list/certificates-list.component';
import { InboundTransactionsComponent } from './inbound-transactions/inbound-transactions.component';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { OrdersService } from './orders.service';
import { OutboundTransactionsComponent } from './outbound-transactions/outbound-transactions.component';
import { ProductionTransactionsComponent } from './production-transactions/production-transactions.component';
import { RecordTransactionsComponent } from './record-transactions/record-transactions.component';
import { RepackagingTransactionsComponent } from './repackaging-transactions/repackaging-transactions.component';
import { UploadCertificatesComponent } from './upload-certificates/upload-certificates.component';
import { TransactionTreeComponent } from './transaction-tree/transaction-tree.component';
import { TransactionTreeNodeComponent } from './transaction-tree/transaction-tree-node/transaction-tree-node.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        SharedModule,
        OrdersRoutingModule,
        MatExpansionModule,
        MatRadioModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        InfiniteScrollModule,
        ZXingScannerModule,
        DragScrollModule,
        TooltipModule,
        MatProgressSpinnerModule,
        PopoverModule
    ],
    exports: [MatExpansionModule, MatRadioModule, MatProgressBarModule, InfiniteScrollModule],
    declarations: [
        OrdersComponent,
        RecordTransactionsComponent,
        InboundTransactionsComponent,
        RepackagingTransactionsComponent,
        ProductionTransactionsComponent,
        OutboundTransactionsComponent,
        UploadCertificatesComponent,
        CertificatesListComponent,
        TransactionTreeComponent,
        TransactionTreeNodeComponent
    ],
    providers: [OrdersService, { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'always' } }]
})
export class OrdersLiteModule {}
