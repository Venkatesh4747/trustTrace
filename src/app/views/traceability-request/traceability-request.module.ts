import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedModule } from './../../shared/shared.module';
import { UtilsService } from './../../shared/utils/utils.service';

import { CreateTrComponent } from './create-tr/create-tr.component';
import { TrListComponent } from './tr-list/tr-list.component';
import { TraceabilityRequestRoutingModule } from './traceability-request-routing.module';
import { TraceabilityRequestService } from './traceability-request.service';
import { TraceabilityRequestComponent } from './traceability-request.component';
import { CreateTrSupplyChainComponent } from './create-tr-supply-chain/create-tr-supply-chain.component';
import { CreateEntityComponent } from './create-tr-supply-chain/create-entity/create-entity.component';
import { CreateArticleComponent } from './create-tr-supply-chain/create-article/create-article.component';
import { TrTreeViewComponent } from './tr-tree-view/tr-tree-view.component';
import { TrDetailViewComponent } from './tr-detail-view/tr-detail-view.component';
import { EntityTableViewComponent } from './tr-detail-view/entity-table-view/entity-table-view.component';
import { EntityArticleRowComponent } from './tr-detail-view/entity-article-row/entity-article-row.component';
import { EditTrSupplyChainComponent } from './edit-tr-supply-chain/edit-tr-supply-chain.component';
import { EditEntityComponent } from './edit-tr-supply-chain/edit-entity/edit-entity.component';
import { EditArticleComponent } from './edit-tr-supply-chain/edit-article/edit-article.component';
import { ReusableSupplyChainComponent } from './reusable-supply-chain/reusable-supply-chain.component';
import { ReusableEntityComponent } from './reusable-supply-chain/reusable-entity/reusable-entity.component';
import { TrTreeViewModalComponent } from './tr-tree-view-modal/tr-tree-view-modal.component';
import { ConfirmationGuard } from '../../shared/guards/confirmation.guard';

@NgModule({
    declarations: [
        TraceabilityRequestComponent,
        CreateTrComponent,
        TrListComponent,
        CreateTrSupplyChainComponent,
        CreateEntityComponent,
        CreateArticleComponent,
        TrTreeViewComponent,
        TrDetailViewComponent,
        EntityTableViewComponent,
        EntityArticleRowComponent,
        EditTrSupplyChainComponent,
        EditEntityComponent,
        EditArticleComponent,
        ReusableSupplyChainComponent,
        ReusableEntityComponent,
        TrTreeViewModalComponent
    ],
    imports: [
        CommonModule,
        InfiniteScrollModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        TraceabilityRequestRoutingModule,
        MatFormFieldModule,
        MatInputModule,
        MatSlideToggleModule,
        MatMenuModule,
        MatSliderModule,
        MatExpansionModule,
        MatCheckboxModule,
        TooltipModule,
        MatTooltipModule
    ],
    exports: [
        MatFormFieldModule,
        MatInputModule,
        MatSlideToggleModule,
        MatMenuModule,
        MatSliderModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatTooltipModule
    ],
    providers: [TraceabilityRequestService, UtilsService, ConfirmationGuard]
})
export class TraceabilityRequestModule {}
