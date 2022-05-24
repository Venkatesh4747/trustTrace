import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PopoverModule } from 'ngx-bootstrap/popover';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { DataCollectionComponent } from './tasks/data-collection/data-collection.component';
import { ProductListComponent } from './tasks/product-list/product-list.component';
import { ProductTemplateComponent } from './tasks/product-list/product/product-template/product-template.component';
import { ProductComponent } from './tasks/product-list/product/product.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ConfirmationGuard } from '../../shared/guards/confirmation.guard';
import { SharedModule } from '../../shared/shared.module';
import { FinishedProductsListComponent } from './finished-products-list/finished-products-list.component';
import { FinishedProductsComponent } from './finished-products-list/finished-products/finished-products.component';
import { LabelsAndProgramsDetailComponent } from './labels-and-programs/labels-and-programs-detail/labels-and-programs-detail.component';
import { LabelsAndProgramsListComponent } from './labels-and-programs/labels-and-programs-list/labels-and-programs-list.component';
import { LabelsAndProgramsComponent } from './labels-and-programs/labels-and-programs.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductsService } from './products.service';
import { SimulationComponent } from './simulation/simulation.component';
import { ProductsEffects } from './store/products.effects';
import { productReducer } from './store/store';
import { ValuePlaceholderComponent } from './tasks/product-list/product/value-placeholder/value-placeholder.component';
import { ProductTasksComponent } from './tasks/tasks.component';
import { IntegrationComponent } from './integration/integration.component';
import { IntegrationProductListComponent } from './integration/integration-product-list/integration-product-list.component';
import { IntegrationProductDetailComponent } from './integration/integration-product-detail/integration-product-detail.component';

@NgModule({
    declarations: [
        ProductsComponent,
        DataCollectionComponent,
        ProductListComponent,
        ProductComponent,
        ProductTemplateComponent,
        FinishedProductsListComponent,
        FinishedProductsComponent,
        ProductDetailComponent,
        ValuePlaceholderComponent,
        ProductTasksComponent,
        SimulationComponent,
        LabelsAndProgramsDetailComponent,
        LabelsAndProgramsListComponent,
        LabelsAndProgramsComponent,
        IntegrationComponent,
        IntegrationProductListComponent,
        IntegrationProductDetailComponent
    ],
    imports: [
        CommonModule,
        ProductsRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot(productReducer),
        EffectsModule.forRoot([ProductsEffects]),
        MatProgressSpinnerModule,
        InfiniteScrollModule,
        PopoverModule,
        MatMenuModule
    ],
    providers: [ProductsService, ConfirmationGuard]
})
export class ProductsModule {}
