import { Pipe, PipeTransform } from '@angular/core';
import { uniqBy } from 'lodash';

@Pipe({
    name: 'uniqueFilter'
})
export class UniqueFilterPipe implements PipeTransform {
    transform(value: any, field: string): any {
        return uniqBy(value, field);
    }
}
