import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoDetailViewComponent } from './po-detail-view.component';

describe('PoDetailViewComponent', () => {
    let component: PoDetailViewComponent;
    let fixture: ComponentFixture<PoDetailViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PoDetailViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PoDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
