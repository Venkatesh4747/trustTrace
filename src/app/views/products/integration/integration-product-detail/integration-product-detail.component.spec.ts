import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationProductDetailComponent } from './integration-product-detail.component';

describe('IntegrationProductDetailComponent', () => {
    let component: IntegrationProductDetailComponent;
    let fixture: ComponentFixture<IntegrationProductDetailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [IntegrationProductDetailComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IntegrationProductDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
