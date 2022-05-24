import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadCertificatesComponent } from './upload-certificates.component';

describe('UploadCertificatesComponent', () => {
    let component: UploadCertificatesComponent;
    let fixture: ComponentFixture<UploadCertificatesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UploadCertificatesComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadCertificatesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
