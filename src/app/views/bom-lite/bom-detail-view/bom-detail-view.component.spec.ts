import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BomDetailViewComponent } from './bom-detail-view.component';

describe('ViewComponent', () => {
    let component: BomDetailViewComponent;
    let fixture: ComponentFixture<BomDetailViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BomDetailViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BomDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
