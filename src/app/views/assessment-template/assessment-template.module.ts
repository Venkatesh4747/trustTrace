import { CommonModule, TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from '../../shared/shared.module';
import { AssessmentTemplateRoutingModule } from './assessment-template-routing.module';
import { AssessmentTemplateComponent } from './assessment-template.component';
import { AssessmentTemplateService } from './assessment-template.service';
import { AssessmentsService } from './assessments.service';
import { PreviewQuestionsComponent } from './preview-questions/preview-questions.component';
import { SurveyQuestionsComponent } from './survey-questions/survey-questions.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ModalModule,
        TooltipModule,
        BsDatepickerModule,
        Ng2SearchPipeModule,
        AssessmentTemplateRoutingModule,
        MatDatepickerModule,
        MatInputModule,
        MatFormFieldModule
    ],
    declarations: [AssessmentTemplateComponent, SurveyQuestionsComponent, PreviewQuestionsComponent],
    providers: [AssessmentTemplateService, AssessmentsService, TitleCasePipe]
})
export class AssessmentTemplateModule {}
