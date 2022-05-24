import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvidenceComponent } from './evidence.component';

const routes: Routes = [
    {
        path: 'evidence',
        data: {
            breadcrumb: 'evidence'
        },
        component: EvidenceComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EvidenceRoutingModule {}
