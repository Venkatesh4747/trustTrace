import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScApprovalModalComponent } from './sc-approval-modal.component';

describe('ScApprovalModalComponent', () => {
    let component: ScApprovalModalComponent;
    let fixture: ComponentFixture<ScApprovalModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ScApprovalModalComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScApprovalModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
