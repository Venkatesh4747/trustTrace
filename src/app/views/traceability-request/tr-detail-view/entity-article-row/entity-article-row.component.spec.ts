import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityArticleRowComponent } from './entity-article-row.component';

describe('EntityArticleRowComponent', () => {
    let component: EntityArticleRowComponent;
    let fixture: ComponentFixture<EntityArticleRowComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EntityArticleRowComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntityArticleRowComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
