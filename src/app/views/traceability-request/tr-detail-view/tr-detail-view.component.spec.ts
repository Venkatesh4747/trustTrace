import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrDetailViewComponent } from './tr-detail-view.component';

describe('TrDetailViewComponent', () => {
    let component: TrDetailViewComponent;
    let fixture: ComponentFixture<TrDetailViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TrDetailViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TrDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
