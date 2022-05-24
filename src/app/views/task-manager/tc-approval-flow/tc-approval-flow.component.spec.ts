import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TcApprovalFlowComponent } from './tc-approval-flow.component';

describe('TcApprovalFlowComponent', () => {
    let component: TcApprovalFlowComponent;
    let fixture: ComponentFixture<TcApprovalFlowComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TcApprovalFlowComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TcApprovalFlowComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
