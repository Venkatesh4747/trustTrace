import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableEntityComponent } from './reusable-entity.component';

describe('ReusableEntityComponent', () => {
    let component: ReusableEntityComponent;
    let fixture: ComponentFixture<ReusableEntityComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ReusableEntityComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReusableEntityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
