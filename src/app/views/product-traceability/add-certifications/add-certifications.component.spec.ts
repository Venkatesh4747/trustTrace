import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCertificationsComponent } from './add-certifications.component';

describe('AddCertificationsComponent', () => {
    let component: AddCertificationsComponent;
    let fixture: ComponentFixture<AddCertificationsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddCertificationsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AddCertificationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
