import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationProductListComponent } from './integration-product-list.component';

describe('IntegrationProductListComponent', () => {
    let component: IntegrationProductListComponent;
    let fixture: ComponentFixture<IntegrationProductListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [IntegrationProductListComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IntegrationProductListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
