import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateManagerComponent } from './certificate-manager.component';

describe('CertificateManagerComponent', () => {
    let component: CertificateManagerComponent;
    let fixture: ComponentFixture<CertificateManagerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CertificateManagerComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CertificateManagerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
