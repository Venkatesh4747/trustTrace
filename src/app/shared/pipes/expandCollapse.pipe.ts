import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'expandCollapse'
})
export class ExpandCollapse implements PipeTransform {
    transform(items: any[], filter: any): any[] {
        let searchResult;
        let searchText = '';
        const filterKeys = Object.keys(filter);
        if (!items) {
            return [];
        }
        return items.filter(item => {
            searchResult = false;
            let charts = item.items;
            charts.forEach(chart => {
                filterKeys.forEach(keyName => {
                    if (typeof filter[keyName] === 'object') {
                        const itemObj = chart[keyName];
                        const filterObj = filter[keyName];
                        const filterKeysObj = Object.keys(filterObj);
                        if (Array.isArray(itemObj)) {
                            return itemObj.filter(it => {
                                filterKeysObj.forEach(key => {
                                    searchText = filterObj[key].toLowerCase();
                                    if (searchText === '') {
                                        searchResult = charts;
                                    } else if (!searchResult && !!it[key]) {
                                        searchResult = it[key].toLowerCase().includes(searchText);
                                    }
                                });
                            });
                        } else {
                            return filterKeysObj.forEach(key => {
                                searchText = filterObj[key].toLowerCase();
                                if (searchText === '') {
                                    searchResult = charts;
                                } else if (!searchResult && !!itemObj[key]) {
                                    searchResult = itemObj[key].toLowerCase().includes(searchText);
                                }
                            });
                        }
                    } else {
                        searchText = filter[keyName].toLowerCase();
                        if (searchText === '') {
                            searchResult = charts;
                        } else if (!searchResult) {
                            if (!!chart[keyName]) {
                                searchResult = chart[keyName].toLowerCase().includes(searchText);
                            }
                        }
                    }
                });
            });
            return searchResult;
        });
    }
}
