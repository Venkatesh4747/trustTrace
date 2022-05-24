import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { Size, Variant } from '../style.model';

@Component({
    selector: 'app-product-color',
    templateUrl: './product-color.component.html',
    styleUrls: ['./product-color.component.scss']
})
export class ProductColorComponent implements OnInit, AfterViewInit {
    @Input('settings') settings;
    @Input('style') style;

    size: Size = {
        size: '',
        fits: [],
        lengths: []
    };

    variant: Variant = {
        color: '',
        sizes: []
    };

    sizeAutoCompleteList = [];
    fitAutoCompleteList = [];
    lengthAutoCompleteList = [];

    sizeMap = {};
    fitMap = {};
    lengthMap = {};

    selectedFits = [];
    selectedLengths = [];
    sizeToLength = {};
    sizeToFit = {};

    constructor(private toastrService: CustomToastrService) {}

    ngOnInit() {
        this.initialize();
    }

    ngAfterViewInit() {}

    initializeStyle() {
        if (this.style.variants) {
            const colorToRemove = [];
            this.selectedFits = [];
            this.selectedLengths = [];
            for (let i = 0; i < this.style.variants.length; i++) {
                this.selectedFits.push([]);
                this.selectedLengths.push([]);

                if (this.style.variants[i].sizes) {
                    const sizeToRemove = [];
                    for (let j = 0; j < this.style.variants[i].sizes.length; j++) {
                        this.selectedFits[i].push([]);
                        this.selectedLengths[i].push([]);
                        const size = this.style.variants[i].sizes[j];

                        const sizeIndex = this.sizeAutoCompleteList
                            .map(function(item) {
                                return item.id;
                            })
                            .indexOf(size.size);
                        if (sizeIndex == -1) {
                            sizeToRemove.push(j);
                            this.updateFits(i, j);
                            this.updateLengths(i, j);
                            continue;
                        }

                        if (size.fits) {
                            size.fits.forEach(element => {
                                const fitIndex = this.sizeToFit[size.size].findIndex(x => x.id == element);
                                if (fitIndex > -1) {
                                    this.selectedFits[i][j].push({
                                        id: element,
                                        value: this.sizeToFit[size.size][fitIndex].value
                                    });
                                }
                            });
                        }
                        if (size.lengths) {
                            size.lengths.forEach(element => {
                                const lengthIndex = this.sizeToLength[size.size].findIndex(x => x.id == element);
                                if (lengthIndex > -1) {
                                    this.selectedLengths[i][j].push({
                                        id: element,
                                        value: this.sizeToLength[size.size][lengthIndex].value
                                    });
                                }
                            });
                        }
                    }
                    sizeToRemove.forEach(sizeIndexToDelete => {
                        this.style.variants[i].sizes[sizeIndexToDelete].size = '';
                    });
                }
                const colorIndex = this.settings.style.styleSettings.colors
                    .map(function(item) {
                        return item.id;
                    })
                    .indexOf(this.style.variants[i].color);
                if (colorIndex == -1) {
                    colorToRemove.push(i);
                }
            }
            colorToRemove.forEach(colorIndexToRemove => {
                this.style.variants[colorIndexToRemove].color = '';
            });
        }
    }

    initialize() {
        const tempSizeList = [];

        this.sizeAutoCompleteList = [];
        const productCategories = this.style.productCategories;
        if (productCategories) {
            productCategories.forEach(element => {
                const matchingGroup = this.getProductGroup(element.id, element.group);
                if (matchingGroup) {
                    if (matchingGroup.size) {
                        this.sizeAutoCompleteList = this.sizeAutoCompleteList.concat(matchingGroup.size);
                        matchingGroup.size.forEach(x => {
                            if (matchingGroup.length) {
                                this.sizeToLength[x.id] = matchingGroup.length;
                            } else {
                                this.sizeToLength[x.id] = [];
                            }

                            if (matchingGroup.fit) {
                                this.sizeToFit[x.id] = matchingGroup.fit;
                            } else {
                                this.sizeToFit[x.id] = [];
                            }
                        });
                    }
                }
            });

            this.sizeAutoCompleteList.filter(this.removeDuplicates);
            this.initializeStyle();
        }
    }

    getLengthAutoList(colorIndex, sizeIndex) {
        if (colorIndex > 0 && sizeIndex > 0) {
            const size = this.style.variants[colorIndex][sizeIndex];
            if (this.sizeToLength[size].length) {
                return this.sizeToLength[size];
            }
        }
        return [];
    }

    removeDuplicates(elem, index, self) {
        return index === self.indexOf(elem.id);
    }

    getProductGroup(category, group) {
        const productCategories = this.settings.style.styleSettings.productCategories;
        if (productCategories) {
            const matchingCategory = productCategories.findIndex(x => x.id === category);
            if (matchingCategory >= 0 && productCategories[matchingCategory].productGroups) {
                const groupindex = productCategories[matchingCategory].productGroups.findIndex(x => x.id === group);
                if (groupindex >= 0) {
                    return productCategories[matchingCategory].productGroups[groupindex];
                }
            }
        }
    }

    addMoreColor() {
        this.style.variants.unshift(JSON.parse(JSON.stringify(this.variant)));
        console.log('style',this.style.variants);
        console.log('style1',this.style.variants.unshift(JSON.parse(JSON.stringify(this.variant))));
        this.selectedFits.unshift([]);
        this.selectedLengths.unshift([]);
        this.addMoreSize(0);
    }

    addMoreSize(colorIndex: number) {
        this.style.variants[colorIndex].sizes.unshift(JSON.parse(JSON.stringify(this.size)));
        this.selectedFits[colorIndex].unshift([]);
        this.selectedLengths[colorIndex].unshift([]);
    }

    removeColor(index) {
        this.style.variants.splice(index, 1);
        this.selectedFits.splice(index, 1);
        this.selectedLengths.splice(index, 1);
    }

    removeSize(colorIndex, sizeIndex) {
        this.style.variants[colorIndex].sizes.splice(sizeIndex, 1);
        this.selectedFits[colorIndex].splice(sizeIndex, 1);
        this.selectedLengths[colorIndex].splice(sizeIndex, 1);
    }

    productGroupSelected(msg) {
        this.initialize();
    }

    updateList(list) {
        if (list) {
            const newList = [];
            for (let i = 0; i < list.length; i++) {
                newList.push(list[i].id);
            }
            return newList;
        }
    }

    updateFits(colorIndex, sizeIndex) {
        this.style.variants[colorIndex].sizes[sizeIndex].fits = this.updateList(
            this.selectedFits[colorIndex][sizeIndex]
        );
    }

    updateLengths(colorIndex, sizeIndex) {
        this.style.variants[colorIndex].sizes[sizeIndex].lengths = this.updateList(
            this.selectedLengths[colorIndex][sizeIndex]
        );
    }

    checkIfEmptyList() {
        if (this.sizeAutoCompleteList.length == 0) {
            this.toastrService.error('Size list is empty: Select a Product Group with size defined');
        }
    }
}
