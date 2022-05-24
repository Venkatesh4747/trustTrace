import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTableViewComponent } from './entity-table-view.component';

describe('EntityTableViewComponent', () => {
    let component: EntityTableViewComponent;
    let fixture: ComponentFixture<EntityTableViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EntityTableViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntityTableViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
