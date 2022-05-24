import { Component, OnInit, Input, ViewChild, HostListener, ElementRef } from '@angular/core';

@Component({
    selector: 'app-tt-expansion-panel',
    templateUrl: './tt-expansion-panel.component.html',
    styleUrls: ['./tt-expansion-panel.component.scss']
})
export class TtExpansionPanelComponent implements OnInit {
    @Input() valueList;
    @ViewChild('insideElement', { static: true }) insideElement;

    expanded = false;
    expandedFalse = false;

    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
        const clickedInside = this.insideElement.nativeElement.contains(targetElement);
        if (!clickedInside && !(targetElement.id === 'view_more' || targetElement.id === 'view_less')) {
            this.expanded = false;
        }
    }

    constructor() {}

    ngOnInit() {}
}
