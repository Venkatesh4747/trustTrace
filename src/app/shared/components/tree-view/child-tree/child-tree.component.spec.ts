import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildTreeComponent } from './child-tree.component';

describe('ChildTreeComponent', () => {
    let component: ChildTreeComponent;
    let fixture: ComponentFixture<ChildTreeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ChildTreeComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChildTreeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
