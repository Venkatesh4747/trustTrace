import { TaskManagerModule } from './task-manager/task-manager.module';
import { OrdersLiteModule } from './orders-lite/orders.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProvideParentForm } from './../shared/directives/provide-parent-form.directive';
import { FacilitiesProfileModule } from './facilities-profile/facilities-profile.module';
import { StylesModule } from './styles/styles.module';

import { DragScrollModule } from 'ngx-drag-scroll';
import { SharedModule } from '../shared/shared.module';
import { AdminModule } from './admin/admin.module';
import { AssessmentAuditModule } from './assessment-audit/assessment-audit.module';
import { AssessmentTemplateModule } from './assessment-template/assessment-template.module';
import { AssessmentsLaunchedModule } from './assessments-launched/assessments-launched.module';
import { AssessmentsReceivedModule } from './assessments-received/assessments-received.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { AuthModule } from './auth/auth.module';
import { CompanyComponent } from './company/company.component';
import { CompanyModule } from './company/company.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FacilitiesService } from './facilities/facilities.service';
import { MapsModule } from './maps/maps.module';
import { MaterialLibraryModule } from './material-library/material-library.module';
import { OrdersModule } from './orders/orders.module';
import { PageNotFoundModule } from './page-not-found/page-not-found.module';
import { ProductTraceabilityModule } from './product-traceability/product-traceability.module';
import { SupplierDashboardModule } from './supplier-dashboard/supplier-dashboard.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { TraceabilityRequestModule as TEMSTraceabilityRequestModule } from './t-ems/traceability-request.module';
import { TraceabilityRequestModule } from './traceability-request/traceability-request.module';
import { UserModule } from './user/user.module';
import { ViewsRoutingModule } from './views-routing.module';
import { QuicksightDashboardComponent } from './quicksight-dashboard/quicksight-dashboard.component';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EvidenceModule } from './evidence/evidence.module';
import { PoManagementModule } from './po-management/po-management.module';
import { ReportsModule } from './reports/reports.module';
import { ScopeCertificatesModule } from './scope-certificates/scope-certificates.module';
import { MaterialsLiteModule } from './materials-lite/materials-lite.module';
import { BomLiteModule } from './bom-lite/bom-lite.module';
import { StylesLiteModule } from './styles-lite/styles-lite.module';
import { IntegrationLogsModule } from './integration-logs/integration-logs.module';

@NgModule({
    imports: [
        CommonModule,
        PageNotFoundModule,
        AssessmentsLaunchedModule,
        AssessmentsReceivedModule,
        DashboardModule,
        MapsModule,
        ReportsModule,
        OrdersModule,
        OrdersLiteModule,
        TransactionsModule,
        EvidenceModule,
        PoManagementModule,
        MaterialsLiteModule,
        BomLiteModule,
        StylesLiteModule,
        ScopeCertificatesModule,
        ProductTraceabilityModule,
        TraceabilityRequestModule,
        TEMSTraceabilityRequestModule,
        AssessmentsModule,
        AssessmentTemplateModule,
        AssessmentAuditModule,
        SuppliersModule,
        SupplierDashboardModule,
        ProductsModule,
        IntegrationLogsModule,
        AuthModule,
        UserModule,
        CompanyModule,
        AdminModule,
        MaterialLibraryModule,
        TaskManagerModule,
        StylesModule,
        FacilitiesProfileModule,
        ViewsRoutingModule,
        DragScrollModule,
        SharedModule
    ],
    declarations: [CompanyComponent, ProvideParentForm, QuicksightDashboardComponent],
    providers: [FacilitiesService]
})
export class ViewsModule {}
