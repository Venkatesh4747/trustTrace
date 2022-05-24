import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BomValidationFailureFlowComponent } from './bom-validation-failure-flow.component';

describe('BomValidationFailureFlowComponent', () => {
    let component: BomValidationFailureFlowComponent;
    let fixture: ComponentFixture<BomValidationFailureFlowComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BomValidationFailureFlowComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BomValidationFailureFlowComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
