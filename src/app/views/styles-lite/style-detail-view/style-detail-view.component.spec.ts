import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleDetailViewComponent } from './style-detail-view.component';

describe('StyleDetailViewComponent', () => {
    let component: StyleDetailViewComponent;
    let fixture: ComponentFixture<StyleDetailViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StyleDetailViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StyleDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
