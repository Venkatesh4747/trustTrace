import { Component, ViewEncapsulation } from '@angular/core';

export const PREFIX = '--';

@Component({
    selector: 'app-sass-helper',
    template: '<div></div>',
    styleUrls: ['./sass-helper.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SassHelperComponent {
    constructor() {}

    readProperty(name: string): string {
        const bodyStyles = window.getComputedStyle(document.body);
        return bodyStyles.getPropertyValue(PREFIX + name);
    }
}
