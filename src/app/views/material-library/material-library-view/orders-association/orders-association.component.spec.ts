import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersAssociationComponent } from './orders-association.component';

describe('OrdersAssociationComponent', () => {
    let component: OrdersAssociationComponent;
    let fixture: ComponentFixture<OrdersAssociationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OrdersAssociationComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OrdersAssociationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
