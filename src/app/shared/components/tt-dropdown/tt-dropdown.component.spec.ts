import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtDropdownComponent } from './tt-dropdown.component';

describe('TtDropdownComponent', () => {
    let component: TtDropdownComponent;
    let fixture: ComponentFixture<TtDropdownComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtDropdownComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtDropdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
