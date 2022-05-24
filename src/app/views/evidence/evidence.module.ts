import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SharedModule } from '../../shared/shared.module';
import { CommonServices } from './../../shared/commonServices/common.service';
import { EvidenceRoutingModule } from './evidence-routing.module';
import { EvidenceComponent } from './evidence.component';
import { EvidenceService } from './evidence.service';
import { UploadEvidenceComponent } from './upload-evidence/upload-evidence.component';

@NgModule({
    declarations: [EvidenceComponent, UploadEvidenceComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        EvidenceRoutingModule,
        NgxExtendedPdfViewerModule
    ],
    providers: [EvidenceService, CommonServices],
    entryComponents: [UploadEvidenceComponent]
})
export class EvidenceModule {}
