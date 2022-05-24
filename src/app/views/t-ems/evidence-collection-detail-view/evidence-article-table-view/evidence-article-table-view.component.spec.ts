import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceArticleTableViewComponent } from './evidence-article-table-view.component';

describe('EvidenceArticleTableViewComponent', () => {
    let component: EvidenceArticleTableViewComponent;
    let fixture: ComponentFixture<EvidenceArticleTableViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EvidenceArticleTableViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EvidenceArticleTableViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
