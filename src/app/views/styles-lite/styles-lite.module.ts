import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CommonServices } from '../../shared/commonServices/common.service';
import { SharedModule } from '../../shared/shared.module';
import { StylesLiteRoutingModule } from './styles-lite-routing.module';
import { StylesLiteComponent } from './styles-lite.component';
import { StylesLiteService } from './styles-lite.service';
import { StyleDetailViewComponent } from './style-detail-view/style-detail-view.component';

@NgModule({
    declarations: [StylesLiteComponent, StyleDetailViewComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        StylesLiteRoutingModule,
        PopoverModule,
        TooltipModule,
        MatTabsModule
    ],
    providers: [StylesLiteService, CommonServices],
    entryComponents: []
})
export class StylesLiteModule {}
