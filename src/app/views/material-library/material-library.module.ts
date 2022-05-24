import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../../shared/shared.module';

import { CreateMaterialsComponent } from './create-materials/create-materials.component';
import { MaterialLibraryRoutingModule } from './material-library-routing.module';
import { EvidencesAssociationComponent } from './material-library-view/evidences-association/evidences-association.component';
import { MaterialLibraryViewComponent } from './material-library-view/material-library-view.component';
import { MaterialLibraryComponent } from './material-library.component';
import { MaterialLibraryService } from './material-library.service';
import { OrdersAssociationComponent } from './material-library-view/orders-association/orders-association.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
    imports: [
        BsDropdownModule,
        ModalModule,
        CommonModule,
        FormsModule,
        TooltipModule,
        SharedModule,
        MaterialLibraryRoutingModule,
        MatExpansionModule,
        MatRadioModule,
        InfiniteScrollModule,
        MatTableModule,
        MatTooltipModule,
        MatTabsModule,
        MatProgressSpinnerModule
    ],
    exports: [MatExpansionModule, MatRadioModule, MatTableModule, MatTooltipModule, MatTabsModule],
    declarations: [
        MaterialLibraryComponent,
        CreateMaterialsComponent,
        MaterialLibraryViewComponent,
        OrdersAssociationComponent,
        EvidencesAssociationComponent
    ],
    providers: [MaterialLibraryService]
})
export class MaterialLibraryModule {}
