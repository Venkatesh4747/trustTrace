import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceArticleComponent } from './evidence-article.component';

describe('EvidenceArticleComponent', () => {
    let component: EvidenceArticleComponent;
    let fixture: ComponentFixture<EvidenceArticleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EvidenceArticleComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EvidenceArticleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
