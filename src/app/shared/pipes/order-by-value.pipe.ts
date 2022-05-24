import { Pipe, PipeTransform } from '@angular/core';
import { orderBy } from 'lodash';

@Pipe({
    name: 'orderByValue'
})
export class orderByValuePipe implements PipeTransform {
    transform(value: any, field: string, sortOrder: boolean | 'desc' | 'asc' = 'asc'): any {
        return orderBy(value, field, sortOrder);
    }
}
