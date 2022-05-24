import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScApprovalFlowComponent } from './sc-approval-flow.component';

describe('ScApprovalFlowComponent', () => {
    let component: ScApprovalFlowComponent;
    let fixture: ComponentFixture<ScApprovalFlowComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ScApprovalFlowComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScApprovalFlowComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
