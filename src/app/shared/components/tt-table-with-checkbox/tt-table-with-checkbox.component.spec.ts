import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtTableWithCheckboxComponent } from './tt-table-with-checkbox.component';

describe('TtTableWithCheckboxComponent', () => {
    let component: TtTableWithCheckboxComponent;
    let fixture: ComponentFixture<TtTableWithCheckboxComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtTableWithCheckboxComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtTableWithCheckboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
