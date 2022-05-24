import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordTransactionsComponent } from './record-transactions.component';

describe('RecordTransactionsComponent', () => {
    let component: RecordTransactionsComponent;
    let fixture: ComponentFixture<RecordTransactionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RecordTransactionsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecordTransactionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
