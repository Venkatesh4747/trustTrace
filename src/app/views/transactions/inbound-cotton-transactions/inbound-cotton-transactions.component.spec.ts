import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundCottonTransactionsComponent } from './inbound-cotton-transactions.component';

describe('InboundCottonTransactionsComponent', () => {
    let component: InboundCottonTransactionsComponent;
    let fixture: ComponentFixture<InboundCottonTransactionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InboundCottonTransactionsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InboundCottonTransactionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
