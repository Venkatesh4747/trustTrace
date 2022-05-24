import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { CreateStyleService } from '../create-style/create-style.service';
import { Bom, MaterialComp, Quantity } from '../style.model';

@Component({
    selector: 'app-style-bom',
    templateUrl: './style-bom.component.html',
    styleUrls: ['./style-bom.component.scss']
})
export class StyleBomComponent implements OnInit {
    @Input('settings') settings;
    @Input() style;

    @Output() requireCreateML = new EventEmitter();

    qty: Quantity = {
        quantity: undefined,
        unit: ''
    };

    materialComp: MaterialComp = {
        id: '',
        value: 0
    };

    initialBom: Bom = {
        article: '',
        usedIn: [],
        qty: this.qty,
        areaOfUsage: ''
    };
    areaOfUsageValues = [];
    articleSearchList = [];
    colorMap = {};
    colorAutoCompleteList = [];
    selectedColors = [];
    constructor(private localeService: LocalizationService, private createStyleService: CreateStyleService) {}

    ngOnInit() {
        if (this.settings.style && this.settings.style.styleSettings && this.settings.style.styleSettings.colors) {
            const colorList = this.settings.style.styleSettings.colors;
            for (let i = 0; i < colorList.length; i++) {
                this.colorMap[colorList[i].id] = colorList[i].name;
            }
        }
        this.initializeStyle();
        this.areaOfUsage(this.style.productType);
    }

    initializeStyle() {
        if (this.style.bom) {
            this.style.bom.forEach((element, bomInd) => {
                if (!element.qty) {
                    element.qty = JSON.parse(JSON.stringify(this.qty));
                }
                const tempList = [];
                if (element.usedIn) {
                    const idToRemove = [];
                    element.usedIn.forEach((color, i) => {
                        const index = this.settings.style.styleSettings.colors.findIndex(x => x.id === color);
                        if (index === -1) {
                            idToRemove.push(i);
                        }
                        if (index > -1) {
                            tempList.push({
                                id: color,
                                value: this.colorMap[color]
                            });
                        }
                    });
                    idToRemove.forEach(ind => {
                        this.style.bom[bomInd].usedIn.splice(ind, 1);
                    });
                }
                this.selectedColors.push(tempList);
            });
            for (let i = 0; i < this.style.billOfMaterials.length; i++) {
                this.style.bom[i].article = this.style.billOfMaterials[i].article[0];
                this.colorAutoCompleteList[i] = this.style.bom[i].article.colors;
            }
        }
    }

    addMoreArticle() {
        this.articleSearchList = [];
        this.style.bom.unshift(JSON.parse(JSON.stringify(this.initialBom)));
        this.selectedColors.unshift([]);
        this.colorAutoCompleteList.unshift([]);
    }

    deleteBOM(index: number) {
        this.style.bom.splice(index, 1);
        this.selectedColors.splice(index, 1);
        this.colorAutoCompleteList.splice(index, 1);
    }

    updateColor(index) {
        if (this.selectedColors) {
            const colorList = [];
            for (let i = 0; i < this.selectedColors[index].length; i++) {
                colorList.push(this.selectedColors[index][i].id);
            }
            this.style.bom[index].usedIn = colorList;
        }
    }

    searchArticle(event, bomIndex) {
        if (event.key !== '' && event.keyCode !== 27 && event.keyCode !== 17 && event.keyCode !== 8) {
            const searchPayload = {};
            if (this.style.bom[bomIndex].article.length > 0) {
                searchPayload['freeHand'] = this.style.bom[bomIndex].article;
                this.createStyleService.searchFreeHandArticle(searchPayload).subscribe(response => {
                    this.articleSearchList = response['data'].searchResponse;
                    if (searchPayload['freeHand'].length >= 3 && this.articleSearchList.length == 0) {
                        this.requireCreateML.emit('create Material Library');
                    }
                });
            }
        }
    }

    getArticleName(item) {
        if (item != null && item.unique_search != null) {
            return item.unique_search;
        }
    }

    setColorAutoCompleteListForSeletedIndex(bomIndex) {
        this.selectedColors[bomIndex] = [];
        this.colorAutoCompleteList[bomIndex] = [];
        if (this.style.bom[bomIndex].article && this.style.bom[bomIndex].article.colors) {
            this.colorAutoCompleteList[bomIndex] = this.style.bom[bomIndex].article.colors;
        }
    }

    productTypeSelected(productType: string) {
        this.areaOfUsage(productType);
    }

    areaOfUsage(productType: string) {
        this.areaOfUsageValues = [];
        if (productType) {
            this.createStyleService.getByProductType(productType).subscribe(data => {
                this.areaOfUsageValues = JSON.parse(JSON.stringify(data));
            });
        }
    }
}
