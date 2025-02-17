import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleBomComponent } from './style-bom.component';

describe('StyleBomComponent', () => {
    let component: StyleBomComponent;
    let fixture: ComponentFixture<StyleBomComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StyleBomComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StyleBomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
