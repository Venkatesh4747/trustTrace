import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotOriginChartComponent } from './lot-origin-chart.component';

describe('LotOriginChartComponent', () => {
    let component: LotOriginChartComponent;
    let fixture: ComponentFixture<LotOriginChartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LotOriginChartComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LotOriginChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
