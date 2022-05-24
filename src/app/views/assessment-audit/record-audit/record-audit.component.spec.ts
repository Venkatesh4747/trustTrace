import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordAuditComponent } from './record-audit.component';

describe('RecordAuditComponent', () => {
    let component: RecordAuditComponent;
    let fixture: ComponentFixture<RecordAuditComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RecordAuditComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecordAuditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
