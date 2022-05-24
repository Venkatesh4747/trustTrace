import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'app-img',
    templateUrl: './img.component.html',
    styleUrls: ['./img.component.scss']
})
export class ImgComponent implements OnChanges {
    @Input() public src: string;
    @Input() public default: string;
    @Input() public alt: string;
    public cached = false;
    public loaded = false;
    public error = false;

    private lastSrc: string;

    constructor() {}

    public ngOnChanges() {
        if (this.src !== this.lastSrc) {
            this.lastSrc = this.src;
            this.loaded = false;
            this.error = false;
            this.cached = this.isCached(this.src);
        }

        if (!this.src) {
            this.error = true;
        }
    }

    public onLoad() {
        this.loaded = true;
    }

    public onError() {
        this.error = true;
    }

    private isCached(url: string): boolean {
        if (!url) {
            return false;
        }

        const image = new Image();
        image.src = url;
        const complete = image.complete;

        return complete;
    }
}
