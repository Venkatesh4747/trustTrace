import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtExpansionListMenuComponent } from './tt-expansion-list-menu.component';

describe('TtExpansionListMenuComponent', () => {
    let component: TtExpansionListMenuComponent;
    let fixture: ComponentFixture<TtExpansionListMenuComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtExpansionListMenuComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtExpansionListMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
