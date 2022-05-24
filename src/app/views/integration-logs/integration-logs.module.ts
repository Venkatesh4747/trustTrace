import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SharedModule } from '../../shared/shared.module';
import { CommonServices } from './../../shared/commonServices/common.service';
import { IntegrationLogsRoutingModule } from './integration-logs-routing.module';
import { IntegrationLogsComponent } from './integration-logs.component';
import { IntegrationLogsService } from './integration-logs.service';

@NgModule({
    declarations: [IntegrationLogsComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        IntegrationLogsRoutingModule,
        PopoverModule,
        TooltipModule
    ],
    providers: [IntegrationLogsService, CommonServices],
    entryComponents: []
})
export class IntegrationLogsModule {}
