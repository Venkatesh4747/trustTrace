import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgGridModule } from 'ag-grid-angular';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminService } from './admin.service';

import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { GeoApiComponent } from './geo-api/geo-api.component';
import { GeoService } from './geo-api/geoService.service';
import { StateComponent } from './geo-api/state/state.component';
import { StateService } from './geo-api/state/state.service';
import { StateDetailsComponent } from './geo-api/state/state-details/state-details.component';

import { CountryComponent } from './geo-api/country/country.component';
import { CityComponent } from './geo-api/city/city.component';
import { CountryService } from './geo-api/country/country.service';
import { CityDetailsComponent } from './geo-api/city/city-details/city-details.component';
import { CountryDetailsComponent } from './geo-api/country/country-details/country-details.component';
import { CityService } from './geo-api/city/city.service';
import { GeoApiUpdateComponent } from './geo-api/geo-api-update/geo-api-update.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
    imports: [
        CommonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        FormsModule,
        SharedModule,
        AdminRoutingModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatInputModule,
        BrowserModule,
        HttpClientModule,
        AgGridModule.withComponents([]),
        MatDialogModule,
        TooltipModule
    ],
    declarations: [
        AdminComponent,
        GeoApiComponent,
        StateComponent,
        StateDetailsComponent,
        CountryComponent,
        CityComponent,
        CityDetailsComponent,
        CountryDetailsComponent,
        GeoApiUpdateComponent
    ],
    providers: [AdminService, GeoService, StateService, CountryService, CityService]
})
export class AdminModule {}
