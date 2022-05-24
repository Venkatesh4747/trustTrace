import { Component, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment as env } from '../../../../environments/environment';

@Component({
    selector: 'app-tr-modal',
    templateUrl: './TRModal.component.html'
})
export class TRModalComponent {
    @ViewChild('TRModal', { static: true }) public TRModal: ModalDirective;
    @Input() modalData;
    public env = env;
    constructor() {}
    show() {
        this.TRModal.show();
    }
    hide() {
        this.TRModal.hide();
    }
}
