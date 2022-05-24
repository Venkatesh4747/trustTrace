import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtDateFilterComponent } from './tt-date-filter.component';

describe('TtDateFilterComponent', () => {
    let component: TtDateFilterComponent;
    let fixture: ComponentFixture<TtDateFilterComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtDateFilterComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtDateFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
