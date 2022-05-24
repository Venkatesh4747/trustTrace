import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAuditExtractedComponent } from './view-audit-extracted.component';

describe('ViewAuditExtractedComponent', () => {
    let component: ViewAuditExtractedComponent;
    let fixture: ComponentFixture<ViewAuditExtractedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ViewAuditExtractedComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ViewAuditExtractedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
