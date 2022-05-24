import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtTableComponent } from './tt-table.component';

describe('TtTableComponent', () => {
    let component: TtTableComponent;
    let fixture: ComponentFixture<TtTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtTableComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
