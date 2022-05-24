import { MatDialog } from '@angular/material/dialog';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment as env } from './../../../../../environments/environment';
import { TrTreeViewModalComponent } from '../../tr-tree-view-modal/tr-tree-view-modal.component';
import { UtilsService } from '../../../../shared/utils/utils.service';

@Component({
    selector: 'app-reusable-entity',
    templateUrl: './reusable-entity.component.html',
    styleUrls: ['./reusable-entity.component.scss']
})
export class ReusableEntityComponent implements OnInit {
    bsModalRef: BsModalRef;

    public env = env;
    @Input() items;
    @Input() trId;

    @Output() selectAllIndirectEvent = new EventEmitter();

    selectedSupplyChains = {};
    itemExpanded = {};
    materialSelected = {};

    constructor(public dialog: MatDialog, private utilService: UtilsService) {}

    ngOnInit() {}

    viewSupplyChainFlow(id) {
        this.dialog.open(TrTreeViewModalComponent, {
            width: '700px',
            height: '90vh',
            data: {
                trId: id
            }
        });
    }

    materialSelectionChanged(materialId) {
        if (this.materialSelected[materialId]) {
            this.itemExpanded[materialId] = true;
            this.selectedSupplyChains[materialId] = this.items[materialId][0]['id'];

            if (
                this.selectedSupplyChains &&
                this.items &&
                Object.keys(this.selectedSupplyChains).length === Object.keys(this.items).length
            ) {
                this.selectAllIndirectEvent.emit({ value: true });
            }
        } else {
            this.itemExpanded[materialId] = false;
            delete this.selectedSupplyChains[materialId];
            this.selectAllIndirectEvent.emit({ value: false });
        }
    }

    toggleItemExpansion(materialId) {
        this.itemExpanded[materialId] = !this.itemExpanded[materialId];
    }

    selectAllClicked(value) {
        if (value) {
            this.selectAllMaterials();
        } else {
            this.materialSelected = {};
            this.itemExpanded = {};
            this.selectedSupplyChains = {};
        }
    }

    selectAllMaterials() {
        if (this.items) {
            Object.keys(this.items).forEach(key => {
                if (!this.materialSelected[key]) {
                    this.materialSelected[key] = true;
                    this.materialSelectionChanged(key);
                }
            });
        }
    }

    supplyChainSelectedEvent(materialId) {
        this.materialSelected[materialId] = true;
        if (
            this.selectedSupplyChains &&
            this.items &&
            Object.keys(this.selectedSupplyChains).length === Object.keys(this.items).length
        ) {
            this.selectAllIndirectEvent.emit({ value: true });
        }
    }

    getReusedMaterialsWithSupplyChains() {
        // let finalSelectedSupplyChains = {};
        // if (this.materialSelected) {
        //     Object.keys(this.materialSelected).forEach(material => {
        //         if (this.materialSelected[material]) {
        //             finalSelectedSupplyChains[material] = this.selectedSupplyChains[material];
        //         }
        //     });
        // }
        // return finalSelectedSupplyChains;
        return this.selectedSupplyChains;
    }
}
