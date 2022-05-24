import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StylesChartComponent } from './styles-chart.component';

describe('StylesChartComponent', () => {
    let component: StylesChartComponent;
    let fixture: ComponentFixture<StylesChartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StylesChartComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StylesChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
