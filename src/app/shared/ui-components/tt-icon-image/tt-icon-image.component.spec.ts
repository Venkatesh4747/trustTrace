import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtIconImageComponent } from './tt-icon-image.component';

describe('TtIconImageComponent', () => {
    let component: TtIconImageComponent;
    let fixture: ComponentFixture<TtIconImageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TtIconImageComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TtIconImageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
