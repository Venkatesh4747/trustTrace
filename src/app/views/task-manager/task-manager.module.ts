import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CommonServices } from '../../shared/commonServices/common.service';
import { SharedModule } from '../../shared/shared.module';
import { TaskManagerRoutingModule } from './task-manager-routing.module';
import { TaskManagerComponent } from './task-manager.component';
import { TaskManagerService } from './task-manager.service';
import { TcApprovalFlowComponent } from './tc-approval-flow/tc-approval-flow.component';
import { ScApprovalModalComponent } from './sc-approval-modal/sc-approval-modal.component';
import { ScApprovalFlowComponent } from './sc-approval-flow/sc-approval-flow.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { EvidenceService } from '../evidence/evidence.service';
import { BomValidationFailureFlowComponent } from './bom-validation-failure-flow/bom-validation-failure-flow.component';

@NgModule({
    declarations: [
        TaskManagerComponent,
        TcApprovalFlowComponent,
        ScApprovalModalComponent,
        ScApprovalFlowComponent,
        BomValidationFailureFlowComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        TaskManagerRoutingModule,
        NgxExtendedPdfViewerModule,
        PopoverModule
    ],
    providers: [TaskManagerService, CommonServices, EvidenceService],
    entryComponents: [
        TcApprovalFlowComponent,
        ScApprovalModalComponent,
        ScApprovalFlowComponent,
        BomValidationFailureFlowComponent
    ]
})
export class TaskManagerModule {}
