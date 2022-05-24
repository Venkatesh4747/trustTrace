import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from '../../shared/shared.module';
import { ResponseManagementModule } from '../response-management/response-management.module';
import { AssessmentsReceivedRoutingModule } from './assessments-received-routing.module';
import { AssessmentsReceivedComponent } from './assessments-received.component';
import { AssessmentsService } from './assessments.service';
import { PreviewQuestionsComponent } from './preview-questions/preview-questions.component';
import { SurveyQuestionsComponent } from './survey-questions/survey-questions.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
    imports: [
        FormsModule,
        SharedModule,
        TabsModule,
        ModalModule,
        TooltipModule,
        BsDropdownModule,
        CommonModule,
        AssessmentsReceivedRoutingModule,
        Ng2SearchPipeModule,
        ResponseManagementModule,
        ScrollToModule
    ],
    declarations: [AssessmentsReceivedComponent, SurveyQuestionsComponent, PreviewQuestionsComponent],
    providers: [AssessmentsService]
})
export class AssessmentsReceivedModule {}
