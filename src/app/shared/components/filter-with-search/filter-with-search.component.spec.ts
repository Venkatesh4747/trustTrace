import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterWithSearchComponent } from './filter-with-search.component';

describe('FilterWithSearchComponent', () => {
    let component: FilterWithSearchComponent;
    let fixture: ComponentFixture<FilterWithSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FilterWithSearchComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterWithSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
