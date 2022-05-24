import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HiggModalComponent } from './higg-modal.component';

describe('HiggModalComponent', () => {
    let component: HiggModalComponent;
    let fixture: ComponentFixture<HiggModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HiggModalComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HiggModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
