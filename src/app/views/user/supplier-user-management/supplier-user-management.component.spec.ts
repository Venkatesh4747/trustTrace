import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierUserManagementComponent } from './supplier-user-management.component';

describe('SupplierUserManagementComponent', () => {
    let component: SupplierUserManagementComponent;
    let fixture: ComponentFixture<SupplierUserManagementComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SupplierUserManagementComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SupplierUserManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
