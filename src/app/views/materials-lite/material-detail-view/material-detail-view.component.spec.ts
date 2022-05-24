import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialDetailViewComponent } from './material-detail-view.component';

describe('MaterialDetailViewComponent', () => {
    let component: MaterialDetailViewComponent;
    let fixture: ComponentFixture<MaterialDetailViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MaterialDetailViewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MaterialDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
