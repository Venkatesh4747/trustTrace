import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';

@Component({
    selector: 'app-tt-expansion-list-menu',
    templateUrl: './tt-expansion-list-menu.component.html',
    styleUrls: ['./tt-expansion-list-menu.component.scss']
})
export class TtExpansionListMenuComponent implements OnInit {
    constructor() {}
    @Input() menuList;
    @ViewChild('expansionElement', { static: true }) expansionElement;
    expansion = false;

    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
        const clickedElement = this.expansionElement.nativeElement.contains(targetElement);
        if (!clickedElement && !(targetElement.id === 'expansion-icon')) {
            this.expansion = false;
        }
    }
    ngOnInit() {}
}
