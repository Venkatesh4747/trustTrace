import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { icon, Marker } from 'leaflet';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { DragScrollModule } from 'ngx-drag-scroll';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './core';
import { AnalyticsService } from './core/analytics/analytics.service';
import { SupportChatService } from './core/support-chat/support-chat.service';
import { RoleGuardService } from './core/user/role-guard.service';
import { TokenInterceptor } from './core/user/token.interceptor';
import { SharedModule } from './shared/shared.module';
import { CertificateUploadService } from './views/uploads/certificate/cert-upload.service';
import { ViewsModule } from './views/views.module';
import { NgxPrintModule } from 'ngx-print';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { MatSelectModule } from '@angular/material/select';
import { TourMatMenuModule } from 'ngx-tour-md-menu';
import { NotificationService } from './core/notifications/notifications.service';
import { ReleaseUpdateComponent } from './core/notifications/release-update/release-update.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [AppComponent, ReleaseUpdateComponent],
    imports: [
        DragScrollModule,
        TabsModule.forRoot(),
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        TypeaheadModule.forRoot(),
        AngularMultiSelectModule,
        BsDatepickerModule.forRoot(),
        ToastrModule.forRoot({
            timeOut: 3000,
            positionClass: 'toast-top-center',
            preventDuplicates: true,
            progressBar: true
        }),
        ScrollToModule.forRoot(),
        Ng2SearchPipeModule,
        FormsModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        ViewsModule,
        AppRoutingModule,
        SharedModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatChipsModule,
        MatIconModule,
        MatTooltipModule,
        ZXingScannerModule,
        NgxPrintModule,
        NgxQRCodeModule,
        MatSelectModule,
        TourMatMenuModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        ProgressbarModule.forRoot()
    ],
    exports: [
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule
    ],
    providers: [
        CertificateUploadService,
        AuthService,
        AnalyticsService,
        SupportChatService,
        RoleGuardService,
        NotificationService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
