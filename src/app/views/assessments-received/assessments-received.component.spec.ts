import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentsReceivedComponent } from './assessments-received.component';

describe('AssessmentsLaunchedComponent', () => {
    let component: AssessmentsReceivedComponent;
    let fixture: ComponentFixture<AssessmentsReceivedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AssessmentsReceivedComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AssessmentsReceivedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
