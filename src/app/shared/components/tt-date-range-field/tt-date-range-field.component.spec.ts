import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtDateRangeFieldComponent } from './tt-date-range-field.component';

describe('TtDateRangeFieldComponent', () => {
    let component: TtDateRangeFieldComponent;
    let fixture: ComponentFixture<TtDateRangeFieldComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtDateRangeFieldComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtDateRangeFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
