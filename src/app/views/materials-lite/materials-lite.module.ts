import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CommonServices } from '../../shared/commonServices/common.service';
import { SharedModule } from '../../shared/shared.module';
import { MaterialDetailViewComponent } from './material-detail-view/material-detail-view.component';
import { MaterialsLiteRoutingModule } from './materials-lite-routing.module';
import { MaterialsLiteComponent } from './materials-lite.component';
import { MaterialsLiteService } from './materials-lite.service';

@NgModule({
    declarations: [MaterialsLiteComponent, MaterialDetailViewComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        MaterialsLiteRoutingModule,
        PopoverModule,
        TooltipModule,
        MatTabsModule
    ],
    providers: [MaterialsLiteService, CommonServices],
    entryComponents: []
})
export class MaterialsLiteModule {}
