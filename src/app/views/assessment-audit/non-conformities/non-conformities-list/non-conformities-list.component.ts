import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { INonConformities, NcMode, IupdateModel, IsubCategories, IsubNCData } from './non-conformities-list.model';

@Component({
    selector: 'app-non-conformities-list',
    templateUrl: './non-conformities-list.component.html',
    styleUrls: ['./non-conformities-list.component.scss']
})
export class NonConformitiesListComponent implements OnInit {
    @Input() nonConformities: Array<INonConformities> = [];
    @Input() ncMode: NcMode = 'view';
    @Output() updateNcEvent: EventEmitter<IupdateModel> = new EventEmitter();

    env: any;

    constructor() {
        this.env = environment;
    }

    ngOnInit() {}

    onEdit(mainIndex: number, subIndex: number, ncIndex: number): void {
        this.updateNcEvent.emit({ mainIndex, subIndex, ncIndex, type: 'update' });
    }
    onDelete(mainIndex: number, subIndex: number, ncIndex: number): void {
        this.updateNcEvent.emit({ mainIndex, subIndex, ncIndex, type: 'delete' });
    }
    onAddress(mainIndex: number, subIndex: number, ncIndex: number): void {
        this.updateNcEvent.emit({ mainIndex, subIndex, ncIndex, type: 'address' });
    }

    oncategoryStatus(category: INonConformities): boolean {
        if (category.subCategories.length === 0) {
            return false;
        }
        return this.onSubCategoryStatus(category.subCategories);
    }

    onSubCategoryStatus(subCategories: Array<IsubCategories>): boolean {
        const status = subCategories.some(data => this.onNcdataStatus(data));
        return status;
    }

    onNcdataStatus(subCategory: IsubCategories): boolean {
        let status = subCategory.subNCData.some(data => data.status !== 'DELETED');
        return status;
    }

    getLengthNC(category: any | INonConformities): number {
        return (
            category.subCategories.reduce((accumulator: number, currentValue: IsubCategories) => {
                return accumulator + currentValue.subNCData.length;
            }, 0) - this.deletedNC(category)
        );
    }

    deletedNC(category): number {
        let count = 0;
        category.subCategories.forEach(sub => {
            sub.subNCData.forEach(nc => {
                count = count + (nc.status === 'DELETED' ? 1 : 0);
            });
        });

        return count;
    }

    getSubncLength(subNCData): number {
        return subNCData.reduce((ac, data) => (ac += data.status !== 'DELETED' ? 1 : 0), 0);
    }

    isAllSubNCDataAddressed(subCategory: IsubCategories): boolean {
        return subCategory.subNCData.every(data => data.status !== 'ACTIVE');
    }
}
