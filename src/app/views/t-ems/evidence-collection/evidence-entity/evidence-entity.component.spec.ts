import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceEntityComponent } from './evidence-entity.component';

describe('EvidenceEntityComponent', () => {
    let component: EvidenceEntityComponent;
    let fixture: ComponentFixture<EvidenceEntityComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EvidenceEntityComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EvidenceEntityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
