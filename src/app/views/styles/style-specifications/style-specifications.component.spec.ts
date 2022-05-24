import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleSpecificationsComponent } from './style-specifications.component';

describe('StyleSpecificationsComponent', () => {
    let component: StyleSpecificationsComponent;
    let fixture: ComponentFixture<StyleSpecificationsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StyleSpecificationsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StyleSpecificationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
