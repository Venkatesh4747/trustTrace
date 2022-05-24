import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TTDropdownSearchComponent } from './tt-dropdown-search.component';

describe('TTDropdownSearchComponent', () => {
    let component: TTDropdownSearchComponent;
    let fixture: ComponentFixture<TTDropdownSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TTDropdownSearchComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TTDropdownSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
