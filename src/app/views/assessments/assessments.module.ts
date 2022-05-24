import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { SharedModule } from '../../shared/shared.module';
import { AssessmentAuditModule } from '../assessment-audit/assessment-audit.module';
import { AssessmentTemplateModule } from '../assessment-template/assessment-template.module';
import { AssessmentsLaunchedModule } from '../assessments-launched/assessments-launched.module';
import { AssessmentsReceivedModule } from '../assessments-received/assessments-received.module';
import { AssessmentsRoutingModule } from './assessments-routing.module';
import { AssessmentsComponent } from './assessments.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ModalModule,
        TooltipModule,
        SharedModule,
        BsDropdownModule,
        AssessmentsRoutingModule,
        AssessmentsLaunchedModule,
        AssessmentsReceivedModule,
        AssessmentTemplateModule,
        AssessmentAuditModule,
        AngularMultiSelectModule
    ],
    declarations: [AssessmentsComponent],
    providers: []
})
export class AssessmentsModule {}
