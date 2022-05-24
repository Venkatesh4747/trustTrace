import { Component, OnInit, Input } from '@angular/core';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

@Component({
    selector: 'app-ref-id',
    templateUrl: './api-reference-id.component.html',
    styleUrls: ['./api-reference-id.component.scss']
})
export class ReferenceIdComponent implements OnInit {
    @Input('apiReferenceId') referenceId: string;
    constructor(private toastr: CustomToastrService) {}

    ngOnInit() {}

    /**
     * @method copyUrl
     * @param inputElement
     */
    copyUrl(inputElement: any): void {
        inputElement.select();
        document.execCommand('copy');
        inputElement.setSelectionRange(0, 0);
        this.toastr.success('API key is copied to the clipboard');
    }
}
