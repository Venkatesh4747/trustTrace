import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectAndSearchComponent } from './multi-select-and-search.component';

describe('MultiSelectAndSearchComponent', () => {
    let component: MultiSelectAndSearchComponent;
    let fixture: ComponentFixture<MultiSelectAndSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MultiSelectAndSearchComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MultiSelectAndSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
