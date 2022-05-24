import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterCriteriaItemsComponent } from './filter-criteria-items.component';

describe('FilterCriteriaItemsComponent', () => {
    let component: FilterCriteriaItemsComponent;
    let fixture: ComponentFixture<FilterCriteriaItemsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FilterCriteriaItemsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterCriteriaItemsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
