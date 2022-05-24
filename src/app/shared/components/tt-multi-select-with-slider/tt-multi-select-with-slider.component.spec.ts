import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtMultiSelectWithSliderComponent } from './tt-multi-select-with-slider.component';

describe('TtMultiSelectWithSliderComponent', () => {
    let component: TtMultiSelectWithSliderComponent;
    let fixture: ComponentFixture<TtMultiSelectWithSliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtMultiSelectWithSliderComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtMultiSelectWithSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
