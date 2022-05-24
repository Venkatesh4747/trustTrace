import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceCollectionDetailViewComponent } from './evidence-collection-detail-view.component';

describe('EvidenceCollectionDetailViewComponent', () => {
    let component: EvidenceCollectionDetailViewComponent;
    let fixture: ComponentFixture<EvidenceCollectionDetailViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EvidenceCollectionDetailViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EvidenceCollectionDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
