import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { MapsRoutingModule } from './maps-routing.module';
import { MapsComponent } from './maps.component';
import { MapsService } from './maps.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        BsDropdownModule,
        ModalModule,
        CommonModule,
        TooltipModule,
        SharedModule,
        MapsRoutingModule,
        MatSlideToggleModule,
        FormsModule
    ],
    declarations: [MapsComponent],
    providers: [MapsService]
})
export class MapsModule {}
