import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTrComponent } from './create-tr.component';

describe('CreateTrComponent', () => {
    let component: CreateTrComponent;
    let fixture: ComponentFixture<CreateTrComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CreateTrComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateTrComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
