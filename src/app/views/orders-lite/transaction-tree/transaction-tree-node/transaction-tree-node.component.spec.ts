import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionTreeNodeComponent } from './transaction-tree-node.component';

describe('TransactionTreeNodeComponent', () => {
    let component: TransactionTreeNodeComponent;
    let fixture: ComponentFixture<TransactionTreeNodeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TransactionTreeNodeComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TransactionTreeNodeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
