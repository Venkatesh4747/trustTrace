import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentsLaunchedComponent } from './assessments-launched.component';

describe('AssessmentsLaunchedComponent', () => {
    let component: AssessmentsLaunchedComponent;
    let fixture: ComponentFixture<AssessmentsLaunchedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AssessmentsLaunchedComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AssessmentsLaunchedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
