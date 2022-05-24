import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotOriginChartTraverserComponent } from './lot-origin-chart-traverser.component';

describe('LotOriginChartTraverserComponent', () => {
    let component: LotOriginChartTraverserComponent;
    let fixture: ComponentFixture<LotOriginChartTraverserComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LotOriginChartTraverserComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LotOriginChartTraverserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
