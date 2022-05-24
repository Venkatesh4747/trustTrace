import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPaginationComponent } from './card-pagination.component';

describe('CardPaginationComponent', () => {
    let component: CardPaginationComponent;
    let fixture: ComponentFixture<CardPaginationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CardPaginationComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardPaginationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
