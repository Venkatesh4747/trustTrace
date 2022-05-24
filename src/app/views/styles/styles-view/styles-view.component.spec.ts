import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StylesViewComponent } from './styles-view.component';

describe('StylesViewComponent', () => {
    let component: StylesViewComponent;
    let fixture: ComponentFixture<StylesViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StylesViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StylesViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
