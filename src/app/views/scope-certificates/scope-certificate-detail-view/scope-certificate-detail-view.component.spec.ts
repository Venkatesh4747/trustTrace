import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeCertificateDetailViewComponent } from './scope-certificate-detail-view.component';

describe('ScopeCertificateDetailViewComponent', () => {
    let component: ScopeCertificateDetailViewComponent;
    let fixture: ComponentFixture<ScopeCertificateDetailViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ScopeCertificateDetailViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScopeCertificateDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
