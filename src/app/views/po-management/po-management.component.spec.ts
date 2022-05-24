import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoManagementComponent } from './po-management.component';

describe('PoManagementComponent', () => {
    let component: PoManagementComponent;
    let fixture: ComponentFixture<PoManagementComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PoManagementComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PoManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
