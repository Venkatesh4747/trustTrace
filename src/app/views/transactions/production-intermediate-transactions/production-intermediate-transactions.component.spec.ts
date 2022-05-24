import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionIntermediateTransactionsComponent } from './production-intermediate-transactions.component';

describe('ProductionIntermediateTransactionsComponent', () => {
    let component: ProductionIntermediateTransactionsComponent;
    let fixture: ComponentFixture<ProductionIntermediateTransactionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProductionIntermediateTransactionsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductionIntermediateTransactionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
