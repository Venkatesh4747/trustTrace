import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'searchFilter'
})
export class SearchFilter implements PipeTransform {
    transform(items: any[], filter: any): any[] {
        let searchResult;
        let searchText = '';
        const filterKeys = Object.keys(filter);
        if (!items) {
            return [];
        }
        return items.filter(item => {
            searchResult = false;
            filterKeys.forEach(keyName => {
                if (typeof filter[keyName] === 'object') {
                    const itemObj = item[keyName];
                    const filterObj = filter[keyName];
                    const filterKeysObj = Object.keys(filterObj);
                    if (Array.isArray(itemObj)) {
                        return itemObj.filter(it => {
                            filterKeysObj.forEach(key => {
                                searchText = filterObj[key].toLowerCase();
                                if (searchText === '') {
                                    searchResult = items;
                                } else if (!searchResult) {
                                    if (!!it[key]) {
                                        searchResult = it[key].toLowerCase().includes(searchText);
                                    }
                                }
                            });
                        });
                    } else {
                        return filterKeysObj.forEach(key => {
                            searchText = filterObj[key].toLowerCase();
                            if (searchText === '') {
                                searchResult = items;
                            } else if (!searchResult) {
                                if (!!itemObj[key]) {
                                    searchResult = itemObj[key].toLowerCase().includes(searchText);
                                }
                            }
                        });
                    }
                } else {
                    searchText = filter[keyName].toLowerCase();
                    if (searchText === '') {
                        searchResult = items;
                    } else if (!searchResult) {
                        if (!!item[keyName]) {
                            searchResult = item[keyName].toLowerCase().includes(searchText);
                        }
                    }
                }
            });
            return searchResult;
        });
    }
}
