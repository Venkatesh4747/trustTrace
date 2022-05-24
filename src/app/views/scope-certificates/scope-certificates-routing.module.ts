import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScopeCertificateDetailViewComponent } from './scope-certificate-detail-view/scope-certificate-detail-view.component';
import { ScopeCertificatesComponent } from './scope-certificates.component';

const routes: Routes = [
    {
        path: 'scope-certificates',
        data: {
            breadcrumb: 'scope-certificates'
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: ScopeCertificatesComponent
            },
            {
                path: ':id/view',
                component: ScopeCertificateDetailViewComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ScopeCertificatesRoutingModule {}
