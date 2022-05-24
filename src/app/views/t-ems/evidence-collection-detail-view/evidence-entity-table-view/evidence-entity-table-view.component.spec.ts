import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceEntityTableViewComponent } from './evidence-entity-table-view.component';

describe('EvidenceEntityTableViewComponent', () => {
    let component: EvidenceEntityTableViewComponent;
    let fixture: ComponentFixture<EvidenceEntityTableViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EvidenceEntityTableViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EvidenceEntityTableViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
