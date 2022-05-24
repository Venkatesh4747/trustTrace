import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadCertificateListComponent } from './upload-certificate-list.component';

describe('UploadCertificateListComponent', () => {
    let component: UploadCertificateListComponent;
    let fixture: ComponentFixture<UploadCertificateListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UploadCertificateListComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadCertificateListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
