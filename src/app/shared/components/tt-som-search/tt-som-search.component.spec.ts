import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtStyleSearchComponent } from './tt-som-search.component';

describe('TtStyleSearchComponent', () => {
    let component: TtStyleSearchComponent;
    let fixture: ComponentFixture<TtStyleSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtStyleSearchComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtStyleSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
