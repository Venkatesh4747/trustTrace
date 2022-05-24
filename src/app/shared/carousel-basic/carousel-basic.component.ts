import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-carousel-basic',
    templateUrl: './carousel-basic.component.html',
    styleUrls: ['./carousel-basic.component.scss']
})
export class CarouselBasicComponent implements OnInit {
    @Input() slides;

    myInterval = 2000;
    activeSlideIndex = 0;

    constructor() {}

    ngOnInit() {}
}
