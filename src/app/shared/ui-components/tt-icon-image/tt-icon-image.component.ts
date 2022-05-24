import { Component, OnInit, Input } from '@angular/core';
import { GroupStatus } from '../../../views/products/template.model';

@Component({
    selector: 'app-tt-icon-image',
    templateUrl: './tt-icon-image.component.html',
    styleUrls: ['./tt-icon-image.component.scss']
})
export class TtIconImageComponent implements OnInit {
    @Input() status: GroupStatus = null;

    constructor() {}

    ngOnInit() {}
}
