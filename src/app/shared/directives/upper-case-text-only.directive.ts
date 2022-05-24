import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
@Directive({
    selector: '[appUpperCaseTextOnly]'
})
export class UpperCaseTextOnlyDirective {
    constructor(private controls: NgControl, private eleRef: ElementRef) {}

    @HostListener('input', ['$event'])
    public onInput(event: Event): void {
        let regEx = new RegExp(/[^A-Za-z\s]/g);
        const filteredValue = this.eleRef.nativeElement.value.replace(regEx, '');

        this.controls.control.setValue(filteredValue.toUpperCase());
    }
}
