import { Pipe, PipeTransform } from '@angular/core';
import { orderBy } from 'lodash';

@Pipe({
    name: 'sortByFilter'
})
export class SortByFilterPipe implements PipeTransform {
    transform(value: any, field?: string): any {
        if (field) {
            return orderBy(value, [item => item[field].toLowerCase()]);
        } else {
            if (value && value.length > 0) {
                if (typeof value[0] === 'object') {
                    return orderBy(value);
                } else if (typeof value[0] === 'string') {
                    return orderBy(value, [item => item.toLowerCase()]);
                }
            } else {
                return value;
            }
        }
    }
}
