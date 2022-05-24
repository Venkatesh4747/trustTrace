import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTraceabilityComponent } from './product-traceability.component';

describe('ProductTraceabilityComponent', () => {
    let component: ProductTraceabilityComponent;
    let fixture: ComponentFixture<ProductTraceabilityComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProductTraceabilityComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductTraceabilityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
