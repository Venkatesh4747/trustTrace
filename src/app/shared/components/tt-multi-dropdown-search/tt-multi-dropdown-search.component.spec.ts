import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TTMultiDropdownSearchComponent } from './tt-multi-dropdown-search.component';

describe('TTMultiDropdownSearchComponent', () => {
    let component: TTMultiDropdownSearchComponent;
    let fixture: ComponentFixture<TTMultiDropdownSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TTMultiDropdownSearchComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TTMultiDropdownSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
