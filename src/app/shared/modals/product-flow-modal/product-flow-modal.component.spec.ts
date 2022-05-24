import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFlowModalComponent } from './product-flow-modal.component';

describe('ProductFlowModalComponent', () => {
    let component: ProductFlowModalComponent;
    let fixture: ComponentFixture<ProductFlowModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProductFlowModalComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductFlowModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
