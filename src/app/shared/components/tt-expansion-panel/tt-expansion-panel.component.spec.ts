import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtExpansionPanelComponent } from './tt-expansion-panel.component';

describe('TtExpansionPanelComponent', () => {
    let component: TtExpansionPanelComponent;
    let fixture: ComponentFixture<TtExpansionPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtExpansionPanelComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtExpansionPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
