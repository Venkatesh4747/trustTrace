import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtMultiSelectAutoCompleteComponent } from './tt-multi-select-auto-complete.component';

describe('TtMultiSelectAutoCompleteComponent', () => {
    let component: TtMultiSelectAutoCompleteComponent;
    let fixture: ComponentFixture<TtMultiSelectAutoCompleteComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtMultiSelectAutoCompleteComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtMultiSelectAutoCompleteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
