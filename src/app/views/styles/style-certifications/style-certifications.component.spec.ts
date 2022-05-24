import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleCertificationsComponent } from './style-certifications.component';

describe('StyleCertificationsComponent', () => {
    let component: StyleCertificationsComponent;
    let fixture: ComponentFixture<StyleCertificationsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StyleCertificationsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StyleCertificationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
