import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CommonServices } from '../../shared/commonServices/common.service';
import { SharedModule } from '../../shared/shared.module';
import { ScopeCertificatesRoutingModule } from './scope-certificates-routing.module';
import { ScopeCertificatesComponent } from './scope-certificates.component';
import { ScopeCertificatesService } from './scope-certificates.service';
import { UploadScopeCertificateComponent } from './upload-scope-certificate/upload-scope-certificate.component';
import { ScopeCertificateDetailViewComponent } from './scope-certificate-detail-view/scope-certificate-detail-view.component';

@NgModule({
    declarations: [ScopeCertificatesComponent, UploadScopeCertificateComponent, ScopeCertificateDetailViewComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        ScopeCertificatesRoutingModule,
        NgxExtendedPdfViewerModule
    ],
    providers: [ScopeCertificatesService, CommonServices],
    entryComponents: [UploadScopeCertificateComponent, ScopeCertificateDetailViewComponent]
})
export class ScopeCertificatesModule {}
