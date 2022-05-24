import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierConflictsComponent } from './supplier-conflicts.component';

describe('SupplierConflictsComponent', () => {
    let component: SupplierConflictsComponent;
    let fixture: ComponentFixture<SupplierConflictsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SupplierConflictsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SupplierConflictsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
