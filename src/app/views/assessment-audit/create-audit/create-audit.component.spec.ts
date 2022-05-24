import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAuditComponent } from './create-audit.component';

describe('CreateAuditComponent', () => {
    let component: CreateAuditComponent;
    let fixture: ComponentFixture<CreateAuditComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CreateAuditComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateAuditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
