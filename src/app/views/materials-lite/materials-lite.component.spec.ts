import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialsLiteComponent } from './materials-lite.component';

describe('MaterialsLiteComponent', () => {
    let component: MaterialsLiteComponent;
    let fixture: ComponentFixture<MaterialsLiteComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MaterialsLiteComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MaterialsLiteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
