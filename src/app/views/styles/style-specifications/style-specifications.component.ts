import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { ProductCategory } from '../style.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-style-specifications',
    templateUrl: './style-specifications.component.html',
    styleUrls: ['./style-specifications.component.scss']
})
export class StyleSpecificationsComponent implements OnInit, AfterViewInit {
    @Output() productGroupChanged = new EventEmitter();
    @Output() productTypeChanged = new EventEmitter();

    @Input('settings') settings;
    @Input('style') style;
    @Input('mode') mode = 'edit';

    productGroups = [];
    parameters = {
        key: 'id',
        value: 'value',
        selectedKey: 'id'
    };

    optionalParams = {
        key: 'id',
        value: 'groupName',
        selectedKey: 'id'
    };

    productType: any;

    showPopUp = false;

    isRequired: true;

    constructor(
        private localeService: LocalizationService,
        private productGroupChangeDialog: MatDialog,
        private productTypeChangedDialog: MatDialog
    ) {}

    ngOnInit() {
        this.productType = this.style.productType;
        console.log('5565656',this.style);

        if (this.style.season) {
            const indexToRemove = this.settings.style.styleSettings.seasons.findIndex(x => this.style.season === x.id);
            if (indexToRemove === -1) {
                this.style.season = '';
            }
        }
        if (this.style.recurringType) {
            const indexToRemove = this.settings.style.styleSettings.recurringTypes.findIndex(
                x => this.style.recurringType === x.id
            );
            if (indexToRemove === -1) {
                this.style.recurringType = '';
            }
        }
        this.initializeStyle();
    }

    ngAfterViewInit() {}

    initializeStyle() {
        if (this.style.productCategories) {
            const itemsToRemove = [];
            for (let i = 0; i < this.style.productCategories.length; i++) {
                const indexToRemove = this.settings.style.styleSettings.productCategories
                    .map(function(item) {
                        return item.id;
                    })
                    .indexOf(this.style.productCategories[i].id);
                if (indexToRemove === -1) {
                    itemsToRemove.push(i);
                } else {
                    this.productGroups[this.style.productCategories[i].id] = this.style.productCategories[i].group;
                }
            }

            itemsToRemove.forEach(x => {
                this.style.productCategories.splice(x, 1);
            });
            this.productGroupChanged.emit('Product Group Changed');
        }
        this.settings.style.styleSettings.productCategories.forEach(category => {
            category.productGroups.push({ id: 'NA', groupName: 'Not Applicable' });
        });
    }

    confirmProductGroupChange(category, event) {
        this.productGroups[category] = event.id;
        const productCategoryIndex = this.getProductCategoryIndex(category);
        if (this.style.variants && productCategoryIndex > -1) {
            const productGroupChange = this.productGroupChangeDialog.open(ConfirmDialogComponent, {
                width: '500px',
                data: {
                    title: 'Warning!',
                    msg:
                        'Changing this Product Group will affect the Size, Fit and Length entered for this Style. Do you wish to continue?',
                    primaryButton: 'Yes',
                    secondaryButton: 'No',
                    showClose: false
                }
            });

            productGroupChange.afterClosed().subscribe(response => {
                if (response) {
                    const responseArray = response.split(',');
                    if (responseArray[0] === 'Yes') {
                        this.setProductGroup(category);
                    } else if (responseArray[0] === 'No') {
                        this.productGroups[category] = this.style.productCategories[productCategoryIndex].group;
                    }
                }
            });
        } else {
            this.setProductGroup(category);
        }
    }
    productTypeChange() {
        setTimeout(() => {
            this.confirmProductTypeChange();
        });
    }
    confirmProductTypeChange() {
        if (this.productType) {
            this.showPopUp = true;
        }
        if (this.showPopUp) {
            const productTypeChange = this.productTypeChangedDialog.open(ConfirmDialogComponent, {
                width: '500px',
                data: {
                    title: 'Warning!',
                    msg:
                        'Changing this Product Type will affect the Area of Usage entered for this Style. Do you wish to continue?',
                    primaryButton: 'Yes',
                    secondaryButton: 'No',
                    showClose: false
                }
            });
            productTypeChange
                .afterClosed()
                .pipe(take(1))
                .subscribe(response => {
                    if (response) {
                        const responseArray = response.split(',');
                        if (responseArray[0] === 'Yes') {
                            this.productTypeChanged.emit(this.style.productType);
                            this.style.bom.forEach(element => {
                                element.areaOfUsage = '';
                            });
                            this.productType = this.style.productType;
                        } else if (responseArray[0] === 'No') {
                            this.style.productType = this.productType;
                        }
                    }
                });
        } else {
            this.showPopUp = true;
            this.productTypeChanged.emit(this.style.productType);
        }
    }

    setProductGroup(category) {
        if (!category) {
            return;
        }
        const group = this.productGroups[category];
        const indexToRemove = this.getProductCategoryIndex(category);
        if (indexToRemove > -1) {
            this.style.productCategories.splice(indexToRemove, 1);
        }
        if (group && group !== 'NA') {
            const productCategory: ProductCategory = {
                id: category,
                group: group
            };
            this.style.productCategories.push(productCategory);
        }

        this.productGroupChanged.emit('Product Group Selected');
    }

    getProductCategoryIndex(categoryToSearch) {
        return this.style.productCategories
            .map(function(item) {
                return item.id;
            })
            .indexOf(categoryToSearch);
    }
}
