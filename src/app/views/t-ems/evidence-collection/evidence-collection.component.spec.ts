import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceCollectionComponent } from './evidence-collection.component';

describe('EvidenceCollectionComponent', () => {
    let component: EvidenceCollectionComponent;
    let fixture: ComponentFixture<EvidenceCollectionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EvidenceCollectionComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EvidenceCollectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
