import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CommonServices } from '../../shared/commonServices/common.service';
import { SharedModule } from '../../shared/shared.module';
import { BomLiteRoutingModule } from './bom-lite-routing.module';
import { BomLiteComponent } from './bom-lite.component';
import { BomLiteService } from './bom-lite.service';
import { BomDetailViewComponent } from './bom-detail-view/bom-detail-view.component';

@NgModule({
    declarations: [BomLiteComponent, BomDetailViewComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        BomLiteRoutingModule,
        PopoverModule,
        TooltipModule,
        MatTabsModule
    ],
    providers: [BomLiteService, CommonServices],
    entryComponents: []
})
export class BomLiteModule {}
