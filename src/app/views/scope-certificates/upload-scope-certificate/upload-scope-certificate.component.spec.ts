import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadScopeCertificateComponent } from './upload-scope-certificate.component';

describe('UploadScopeCertificateComponent', () => {
    let component: UploadScopeCertificateComponent;
    let fixture: ComponentFixture<UploadScopeCertificateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UploadScopeCertificateComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadScopeCertificateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
