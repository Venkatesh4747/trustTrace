import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtRadioGroupComponent } from './tt-radio-group.component';

describe('TtRadioGroupComponent', () => {
    let component: TtRadioGroupComponent;
    let fixture: ComponentFixture<TtRadioGroupComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtRadioGroupComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtRadioGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
