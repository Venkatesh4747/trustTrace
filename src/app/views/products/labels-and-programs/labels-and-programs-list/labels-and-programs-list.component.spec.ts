import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsAndProgramsListComponent } from './labels-and-programs-list.component';

describe('LabelsAndProgramsListComponent', () => {
    let component: LabelsAndProgramsListComponent;
    let fixture: ComponentFixture<LabelsAndProgramsListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LabelsAndProgramsListComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelsAndProgramsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
