import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrTreeViewComponent } from './tr-tree-view.component';

describe('TrTreeViewComponent', () => {
    let component: TrTreeViewComponent;
    let fixture: ComponentFixture<TrTreeViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TrTreeViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TrTreeViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
