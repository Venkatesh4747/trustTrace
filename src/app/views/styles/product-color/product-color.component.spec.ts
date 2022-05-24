import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductColorComponent } from './product-color.component';

describe('ProductColorComponent', () => {
    let component: ProductColorComponent;
    let fixture: ComponentFixture<ProductColorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProductColorComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductColorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
