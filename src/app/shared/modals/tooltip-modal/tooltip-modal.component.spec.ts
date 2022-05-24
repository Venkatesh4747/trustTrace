import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipModalComponent } from './tooltip-modal.component';

describe('TooltipModalComponent', () => {
    let component: TooltipModalComponent;
    let fixture: ComponentFixture<TooltipModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TooltipModalComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TooltipModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
