import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsAndProgramsDetailComponent } from './labels-and-programs-detail.component';

describe('LabelsAndProgramsDetailComponent', () => {
    let component: LabelsAndProgramsDetailComponent;
    let fixture: ComponentFixture<LabelsAndProgramsDetailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LabelsAndProgramsDetailComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelsAndProgramsDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
