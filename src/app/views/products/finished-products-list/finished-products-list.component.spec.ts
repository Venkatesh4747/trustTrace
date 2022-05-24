import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishedProductsListComponent } from './finished-products-list.component';

describe('FinishedProductsListComponent', () => {
    let component: FinishedProductsListComponent;
    let fixture: ComponentFixture<FinishedProductsListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FinishedProductsListComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FinishedProductsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
