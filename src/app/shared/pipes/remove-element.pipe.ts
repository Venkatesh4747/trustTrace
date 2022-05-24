import { Pipe, PipeTransform } from '@angular/core';
import { without } from 'lodash';

@Pipe({
    name: 'removeElementInArray'
})
export class RemoveElementInArrayPipe implements PipeTransform {
    transform(value: any, element: string): any {
        return without(value, element);
    }
}
