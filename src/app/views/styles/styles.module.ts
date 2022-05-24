import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CertificateManagerService } from '../../shared/components/certificate-manager/certificate-manager.service';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { CreateStyleComponent } from './create-style/create-style.component';
import { FabricCompositionComponent } from './fabric-composition/fabric-composition.component';
import { ProductColorComponent } from './product-color/product-color.component';
import { StyleBomComponent } from './style-bom/style-bom.component';
import { StyleCertificationsComponent } from './style-certifications/style-certifications.component';
import { StyleSpecificationsComponent } from './style-specifications/style-specifications.component';
import { StyleSupplyChainComponent } from './style-supply-chain/style-supply-chain.component';
import { StyleSustainabilityLabelsComponent } from './style-sustainability-labels/style-sustainability-labels.component';
import { StylesService } from './styles.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TruncateModule } from '@yellowspot/ng-truncate';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CarouselConfig, CarouselModule } from 'ngx-bootstrap/carousel';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SharedModule } from '../../shared/shared.module';
import { UtilsService } from '../../shared/utils/utils.service';
import { StylesViewComponent } from './styles-view/styles-view.component';
import { StylesComponent } from './styles.component';
import { StylesRoutingModule } from './styles-routing.module';
import { EvidencesAssociationComponent } from './styles-view/evidences-association/evidences-association.component';
import { OrdersAssociationComponent } from './styles-view/orders-association/orders-association.component';

@NgModule({
    imports: [
        CommonModule,
        InfiniteScrollModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        TooltipModule,
        SharedModule,
        BsDropdownModule,
        ButtonsModule,
        StylesRoutingModule,
        AngularMultiSelectModule,
        MatAutocompleteModule,
        MatInputModule,
        MatTableModule,
        MatRadioModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatExpansionModule,
        MatNativeDateModule,
        CarouselModule.forRoot(),
        MatTooltipModule,
        TruncateModule,
        MatTabsModule,
        MatProgressSpinnerModule
    ],
    exports: [
        MatTableModule,
        MatRadioModule,
        MatInputModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatExpansionModule,
        MatNativeDateModule,
        MatTooltipModule,
        MatTabsModule
    ],
    declarations: [
        StylesComponent,
        StylesViewComponent,
        CreateStyleComponent,
        StyleSpecificationsComponent,
        FabricCompositionComponent,
        ProductColorComponent,
        StyleCertificationsComponent,
        StyleSustainabilityLabelsComponent,
        StyleSupplyChainComponent,
        StyleBomComponent,
        ImageUploadComponent,
        OrdersAssociationComponent,
        EvidencesAssociationComponent
    ],
    providers: [
        StylesService,
        CertificateManagerService,
        UtilsService,
        { provide: CarouselConfig, useValue: { noPause: true } }
    ]
})
export class StylesModule {}
