import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateValidationStatusComponent } from './certificate-validation-status.component';

describe('CertificateValidationStatusComponent', () => {
    let component: CertificateValidationStatusComponent;
    let fixture: ComponentFixture<CertificateValidationStatusComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CertificateValidationStatusComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CertificateValidationStatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
