import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StylesLiteComponent } from './styles-lite.component';

describe('StylesLiteComponent', () => {
    let component: StylesLiteComponent;
    let fixture: ComponentFixture<StylesLiteComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StylesLiteComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StylesLiteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
