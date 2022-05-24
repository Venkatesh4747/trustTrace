import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SharedModule } from '../../shared/shared.module';
import { CommonServices } from './../../shared/commonServices/common.service';
import { PoManagementRoutingModule } from './po-management-routing.module';
import { PoManagementComponent } from './po-management.component';
import { PoManagementService } from './po-management.service';
import { PoDetailViewComponent } from './po-detail-view/po-detail-view.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    declarations: [PoManagementComponent, PoDetailViewComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        PoManagementRoutingModule,
        PopoverModule,
        TooltipModule,
        MatTabsModule
    ],
    exports: [MatTabsModule],
    providers: [PoManagementService, CommonServices],
    entryComponents: []
})
export class PoManagementModule {}
