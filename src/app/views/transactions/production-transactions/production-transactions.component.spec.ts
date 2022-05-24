import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionTransactionsComponent } from './production-transactions.component';

describe('ProductionTransactionsComponent', () => {
    let component: ProductionTransactionsComponent;
    let fixture: ComponentFixture<ProductionTransactionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProductionTransactionsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductionTransactionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
