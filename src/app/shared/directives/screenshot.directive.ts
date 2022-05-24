import { Directive, ElementRef, Input, Renderer2, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import html2canvas from 'html2canvas';
import { Subscription } from 'rxjs';
import { CustomToastrService } from '../commonServices/custom-toastr.service';

@Directive({
    selector: '[appScreenshot]'
})
export class ScreenshotDirective implements OnChanges, OnDestroy {
    @Input() screenShotEvent: EventEmitter<any>;
    @Input() fileName: string;
    @Input() scrollWidth: number;
    @Input() scrollHeight: number;
    @Output() doneWithScreenShot: EventEmitter<boolean> = new EventEmitter();
    eventSubscription$: Subscription;

    constructor(private el: ElementRef, private renderer: Renderer2, private toastr: CustomToastrService) {}

    ngOnChanges(): void {
        if (!this.screenShotEvent || this.eventSubscription$) return;

        this.eventSubscription$ = this.screenShotEvent.subscribe(this.screenShotHandler.bind(this));
    }

    async screenShotHandler(): Promise<void> {
        try {
            const canvas = await this.getCanvas(this.el);
            const anchor = this.renderer.createElement('a');
            anchor.href = canvas.toDataURL('image/jpeg');
            anchor.download = this.fileName + '.jpeg';
            anchor.click();
            this.toastr.success('The image has been downloaded successfully.', 'Success');
        } catch (e) {
            this.toastr.error('Error in processing the request. Please try again after sometime.', 'Failed');
        } finally {
            const oneChildParent = this.el.nativeElement.querySelectorAll('.one-child-container');

            if (oneChildParent && oneChildParent.length) {
                for (let nodeItem of oneChildParent) {
                    nodeItem.classList.remove('one-child-screenshot'); //fix for alignment in screenshot
                }
            }
        }
    }

    async getCanvas(element: ElementRef): Promise<HTMLCanvasElement> {
        const windowWidth = window.innerWidth + window.outerWidth;
        const windowHeight = window.innerHeight + window.outerHeight;
        const oneChildParent = this.el.nativeElement.querySelectorAll('.one-child-container');

        if (oneChildParent && oneChildParent.length) {
            for (let nodeItem of oneChildParent) {
                nodeItem.classList.add('one-child-screenshot'); //fix for alignment in screenshot
            }
        }

        this.scrollWidth = this.scrollWidth && this.scrollWidth > windowWidth ? this.scrollWidth : windowWidth;
        this.scrollHeight = this.scrollHeight && this.scrollHeight > windowHeight ? this.scrollHeight : windowHeight;

        return html2canvas(element.nativeElement, {
            width: this.scrollWidth,
            height: this.scrollHeight,
            windowHeight: windowHeight,
            windowWidth: windowWidth
        });
    }

    ngOnDestroy(): void {
        if (this.eventSubscription$) this.eventSubscription$.unsubscribe();
    }
}
