import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'truncateText'
})
export class TruncateTextPipe implements PipeTransform {
    transform(value: string, length: number): any {
        const ellipses = '...';

        if (!value || value.length <= length) return value;

        return `${value.substr(0, length)}${ellipses}`;
    }
}
