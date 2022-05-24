import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundTransactionsComponent } from './inbound-transactions.component';

describe('InboundTransactionsComponent', () => {
    let component: InboundTransactionsComponent;
    let fixture: ComponentFixture<InboundTransactionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InboundTransactionsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InboundTransactionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
