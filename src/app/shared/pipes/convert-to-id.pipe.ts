import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'convertToId'
})
export class ConvertToIdPipe implements PipeTransform {
    transform(value: any): any {
        return value
            .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }
}
