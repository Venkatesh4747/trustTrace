import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsAndProgramsComponent } from './labels-and-programs.component';

describe('LabelsAndProgramsComponent', () => {
    let component: LabelsAndProgramsComponent;
    let fixture: ComponentFixture<LabelsAndProgramsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LabelsAndProgramsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelsAndProgramsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
