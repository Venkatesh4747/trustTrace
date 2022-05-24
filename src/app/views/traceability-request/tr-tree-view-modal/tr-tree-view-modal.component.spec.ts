import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrTreeViewModalComponent } from './tr-tree-view-modal.component';

describe('TrTreeViewModalComponent', () => {
    let component: TrTreeViewModalComponent;
    let fixture: ComponentFixture<TrTreeViewModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TrTreeViewModalComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TrTreeViewModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
