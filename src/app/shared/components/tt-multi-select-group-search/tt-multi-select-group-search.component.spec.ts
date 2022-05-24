import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtMultiSelectGroupSearchComponent } from './tt-multi-select-group-search.component';

describe('TtMultiSelectGroupSearchComponent', () => {
    let component: TtMultiSelectGroupSearchComponent;
    let fixture: ComponentFixture<TtMultiSelectGroupSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtMultiSelectGroupSearchComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtMultiSelectGroupSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
