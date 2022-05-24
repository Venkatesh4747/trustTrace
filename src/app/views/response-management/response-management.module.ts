import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';
import { ResponseManagementComponent } from './response-management.component';
import { ResponseManagementService } from './response-management.service';

@NgModule({
    imports: [CommonModule, SharedModule, BrowserModule, FormsModule],
    declarations: [ResponseManagementComponent],
    providers: [ResponseManagementService],
    exports: [ResponseManagementComponent]
})
export class ResponseManagementModule {}
