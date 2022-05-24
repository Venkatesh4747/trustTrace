import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtDateRangeFieldWithMaxDaysComponent } from './tt-date-range-field-with-max-days.component';

describe('TtDateRangeFieldWithMaxDaysComponent', () => {
    let component: TtDateRangeFieldWithMaxDaysComponent;
    let fixture: ComponentFixture<TtDateRangeFieldWithMaxDaysComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtDateRangeFieldWithMaxDaysComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtDateRangeFieldWithMaxDaysComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
