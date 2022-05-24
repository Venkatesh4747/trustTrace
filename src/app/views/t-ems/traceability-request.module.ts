import { ConfirmationModalComponent } from './evidence-collection/confirmation-modal/confirmation-modal.component';
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
import { TEmsService } from './t-ems.service';
import { TraceabilityRequestComponent } from './traceability-request.component';
import { EvidenceCollectionComponent } from './evidence-collection/evidence-collection.component';
import { EvidenceEntityComponent } from './evidence-collection/evidence-entity/evidence-entity.component';
import { EvidenceArticleComponent } from './evidence-collection/evidence-article/evidence-article.component';
import { EvidenceCollectionDetailViewComponent } from './evidence-collection-detail-view/evidence-collection-detail-view.component';
import { EvidenceEntityTableViewComponent } from './evidence-collection-detail-view/evidence-entity-table-view/evidence-entity-table-view.component';
import { EvidenceArticleTableViewComponent } from './evidence-collection-detail-view/evidence-article-table-view/evidence-article-table-view.component';
import { EvidenceCollectionSupplyChainComponent } from './evidence-collection-supply-chain/evidence-collection-supply-chain.component';

@NgModule({
    declarations: [
        TraceabilityRequestComponent,
        CreateTrComponent,
        TrListComponent,
        EvidenceCollectionComponent,
        EvidenceEntityComponent,
        EvidenceArticleComponent,
        EvidenceCollectionDetailViewComponent,
        EvidenceEntityTableViewComponent,
        EvidenceArticleTableViewComponent,
        EvidenceCollectionSupplyChainComponent,
        ConfirmationModalComponent
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
    providers: [TEmsService, UtilsService]
})
export class TraceabilityRequestModule {}
