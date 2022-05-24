import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

enum IconType {
    FONT_AWESOME,
    IMAGE
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tt-button',
    templateUrl: './tt-button.component.html',
    styleUrls: ['./tt-button.component.scss']
})
export class TtButtonComponent implements OnInit {
    @Input() btnText = '';
    @Input() btnClass = '';
    @Input() btnType = 'primary'; // 'primary', 'secondary', 'back', 'action'
    @Input() btnIcon = '';
    @Input() toBeDisabled = false;
    @Input() type = 'button';
    @Output() handleClick = new EventEmitter();

    ICON_TYPE = IconType;
    iconType: IconType;

    constructor() {}

    ngOnInit() {
        if (this.btnIcon && this.btnIcon.indexOf('fa-') >= 0) {
            this.iconType = IconType.FONT_AWESOME;
        } else {
            this.iconType = IconType.IMAGE;
        }
    }

    onBtnClick() {
        if (this.handleClick) {
            this.handleClick.emit();
        }
    }
}
