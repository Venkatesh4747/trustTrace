import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipCardComponent } from './chip-card.component';

describe('ChipCardComponent', () => {
    let component: ChipCardComponent;
    let fixture: ComponentFixture<ChipCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ChipCardComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChipCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
