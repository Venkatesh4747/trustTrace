import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseManagementComponent } from './response-management.component';

describe('ResponseManagementComponent', () => {
    let component: ResponseManagementComponent;
    let fixture: ComponentFixture<ResponseManagementComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResponseManagementComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ResponseManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
