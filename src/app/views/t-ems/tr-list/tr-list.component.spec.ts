import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrListComponent } from './tr-list.component';

describe('TrListComponent', () => {
    let component: TrListComponent;
    let fixture: ComponentFixture<TrListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TrListComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TrListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
