import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandUserManagementComponent } from './brand-user-management.component';

describe('ManagementComponent', () => {
    let component: BrandUserManagementComponent;
    let fixture: ComponentFixture<BrandUserManagementComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BrandUserManagementComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BrandUserManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
