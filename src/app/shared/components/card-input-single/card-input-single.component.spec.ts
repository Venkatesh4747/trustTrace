import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardInputSingleComponent } from './card-input-single.component';

describe('CardInputSingleComponent', () => {
    let component: CardInputSingleComponent;
    let fixture: ComponentFixture<CardInputSingleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CardInputSingleComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardInputSingleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
