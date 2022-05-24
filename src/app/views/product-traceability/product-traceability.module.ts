import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { CarouselConfig, CarouselModule } from 'ngx-bootstrap/carousel';
import { SharedModule } from '../../shared/shared.module';
import { UtilsService } from '../../shared/utils/utils.service';
import { AddCertificationsComponent } from './add-certifications/add-certifications.component';
import { AddCertificationsService } from './add-certifications/add-certifications.service';
import { AddShipmentDetailsComponent } from './add-shipment-details/add-shipment-details.component';
import { LaunchedComponent } from './launched/launched.component';
import { ProductTraceabilityRoutingModule } from './product-traceability-routing.module';
import { ProductTraceabilityComponent } from './product-traceability.component';
import { ProductTraceabilityService } from './product-traceability.service';
import { ReceivedComponent } from './received/received.component';
import { SurveyQuestionsComponent } from './received/survey-questions/survey-questions.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        TooltipModule,
        SharedModule,
        BsDropdownModule,
        ButtonsModule,
        ProductTraceabilityRoutingModule,
        AngularMultiSelectModule,
        MatAutocompleteModule,
        MatInputModule,
        MatTableModule,
        MatRadioModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatExpansionModule,
        MatNativeDateModule,
        CarouselModule.forRoot()
    ],
    exports: [
        MatTableModule,
        MatRadioModule,
        MatInputModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatExpansionModule,
        MatNativeDateModule
    ],
    declarations: [
        ProductTraceabilityComponent,
        LaunchedComponent,
        ReceivedComponent,
        SurveyQuestionsComponent,
        AddCertificationsComponent,
        AddShipmentDetailsComponent
    ],
    providers: [
        ProductTraceabilityService,
        UtilsService,
        AddCertificationsService,
        { provide: CarouselConfig, useValue: { noPause: true } }
    ]
})
export class ProductTraceabilityModule {}
