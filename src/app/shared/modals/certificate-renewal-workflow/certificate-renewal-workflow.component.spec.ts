import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateRenewalWorkflowComponent } from './certificate-renewal-workflow.component';

describe('CertificateRenewalWorkflowComponent', () => {
    let component: CertificateRenewalWorkflowComponent;
    let fixture: ComponentFixture<CertificateRenewalWorkflowComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CertificateRenewalWorkflowComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CertificateRenewalWorkflowComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
