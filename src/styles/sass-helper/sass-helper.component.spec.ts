import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SassHelperComponent } from './sass-helper.component';
describe('SassHelperComponent', () => {
    let component: SassHelperComponent;
    let fixture: ComponentFixture<SassHelperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SassHelperComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SassHelperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
