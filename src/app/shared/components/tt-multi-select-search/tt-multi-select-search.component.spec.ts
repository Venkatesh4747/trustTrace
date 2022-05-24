import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TTMultiSelectSearchComponent } from './tt-multi-select-search.component';

describe('TtMultiSelectSearchComponent', () => {
    let component: TTMultiSelectSearchComponent;
    let fixture: ComponentFixture<TTMultiSelectSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TTMultiSelectSearchComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TTMultiSelectSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
