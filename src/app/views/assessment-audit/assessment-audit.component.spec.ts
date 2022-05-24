import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentAuditComponent } from './assessment-audit.component';

describe('AssessmentAuditComponent', () => {
    let component: AssessmentAuditComponent;
    let fixture: ComponentFixture<AssessmentAuditComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AssessmentAuditComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AssessmentAuditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
