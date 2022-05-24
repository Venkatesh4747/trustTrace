import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeCertificatesComponent } from './scope-certificates.component';

describe('ScopeCertificatesComponent', () => {
    let component: ScopeCertificatesComponent;
    let fixture: ComponentFixture<ScopeCertificatesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ScopeCertificatesComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScopeCertificatesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
