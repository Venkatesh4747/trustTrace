import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialLibraryViewComponent } from './material-library-view.component';

describe('MaterialLibraryViewComponent', () => {
    let component: MaterialLibraryViewComponent;
    let fixture: ComponentFixture<MaterialLibraryViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MaterialLibraryViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MaterialLibraryViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
