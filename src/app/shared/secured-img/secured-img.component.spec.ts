import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SecuredImgComponent } from './secured-img.component';

describe('SecuredImgComponent', () => {
    let component: SecuredImgComponent;
    let fixture: ComponentFixture<SecuredImgComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SecuredImgComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SecuredImgComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
