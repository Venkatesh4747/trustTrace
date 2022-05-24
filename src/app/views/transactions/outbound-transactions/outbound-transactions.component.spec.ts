import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundTransactionsComponent } from './outbound-transactions.component';

describe('OutboundTransactionsComponent', () => {
    let component: OutboundTransactionsComponent;
    let fixture: ComponentFixture<OutboundTransactionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OutboundTransactionsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OutboundTransactionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
