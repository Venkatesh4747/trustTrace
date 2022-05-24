import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepackagingTransactionsComponent } from './repackaging-transactions.component';

describe('RepackagingTransactionsComponent', () => {
    let component: RepackagingTransactionsComponent;
    let fixture: ComponentFixture<RepackagingTransactionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RepackagingTransactionsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RepackagingTransactionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
