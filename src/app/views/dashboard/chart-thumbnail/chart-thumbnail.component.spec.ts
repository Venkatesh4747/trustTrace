import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartThumbnailComponent } from './chart-thumbnail.component';

describe('ChartThumbnailComponent', () => {
    let component: ChartThumbnailComponent;
    let fixture: ComponentFixture<ChartThumbnailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ChartThumbnailComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChartThumbnailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
