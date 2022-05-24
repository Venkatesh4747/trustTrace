import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { TruncateModule } from '@yellowspot/ng-truncate';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { SharedModule } from '../../shared/shared.module';
import { AssessmentAuditRoutingModule } from './assessment-audit-routing.module';
import { AssessmentAuditComponent } from './assessment-audit.component';
import { AssessmentAuditService } from './assessment-audit.service';
import { AuditDetailsComponent } from './audit-details/audit-details.component';
import { CreateAuditComponent } from './create-audit/create-audit.component';
import { RecordAuditComponent } from './record-audit/record-audit.component';
import { ViewAuditComponent } from './view-audit/view-audit.component';
import { UploadAuditComponent } from './upload-audit/upload-audit.component';
import { NonConformitiesListComponent } from './non-conformities/non-conformities-list/non-conformities-list.component';
import { NonConformitiesCreateComponent } from './non-conformities/non-conformities-create/non-conformities-create.component';
import { ViewAuditExtractedComponent } from './view-audit-extracted/view-audit-extracted.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
    exports: [
        MatFormFieldModule,
        MatStepperModule,
        MatInputModule,
        MatButtonModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatSelectModule,
        MatExpansionModule,
        MatRadioModule,
        InfiniteScrollModule
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        TooltipModule,
        BsDatepickerModule,
        Ng2SearchPipeModule,
        AssessmentAuditRoutingModule,
        MatFormFieldModule,
        MatStepperModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatInputModule,
        MatButtonModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatSelectModule,
        MatExpansionModule,
        MatRadioModule,
        InfiniteScrollModule,
        SatDatepickerModule,
        SatNativeDateModule,
        TruncateModule,
        ScrollToModule,
        NgxExtendedPdfViewerModule
    ],
    declarations: [
        AssessmentAuditComponent,
        RecordAuditComponent,
        AuditDetailsComponent,
        CreateAuditComponent,
        ViewAuditComponent,
        UploadAuditComponent,
        NonConformitiesListComponent,
        NonConformitiesCreateComponent,
        ViewAuditExtractedComponent
    ],
    providers: [AssessmentAuditService]
})
export class AssessmentAuditModule {}
