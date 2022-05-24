import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateValidatorComponent } from './certificate-validator.component';

describe('CertificateValidatorComponent', () => {
    let component: CertificateValidatorComponent;
    let fixture: ComponentFixture<CertificateValidatorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CertificateValidatorComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CertificateValidatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
