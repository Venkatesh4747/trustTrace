import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { PageNotFoundRoutingModule } from './page-not-found-routing.module';
import { PageNotFoundComponent } from './page-not-found.component';

@NgModule({
    imports: [CommonModule, PageNotFoundRoutingModule, SharedModule],
    declarations: [PageNotFoundComponent]
})
export class PageNotFoundModule {}
