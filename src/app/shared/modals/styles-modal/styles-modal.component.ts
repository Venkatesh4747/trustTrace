import { Component, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment as env } from '../../../../environments/environment';
import { UtilsService } from '../../utils/utils.service';

@Component({
    selector: 'app-styles-modal',
    templateUrl: './styles-modal.component.html',
    styleUrls: ['./styles-modal.component.scss']
})
export class StylesModalComponent {
    @ViewChild('stylesModal', { static: true }) public stylesModal: ModalDirective;
    @Input() styleInfo;
    @Input() vpIcons;
    public env = env;
    constructor(private utilsService: UtilsService) {}

    show() {
        this.stylesModal.show();
    }

    hide() {
        this.stylesModal.hide();
    }

    convertToPercentage(inputValue) {
        return this.utilsService.convertRatioToPercentage(inputValue);
    }
}
