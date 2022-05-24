import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'getFieldLabel'
})
export class GetFieldLabelPipe implements PipeTransform {
    transform(value: string, ...args: string[]): string {
        const [key] = args;
        return value.includes(key) ? value.replace(key, '') : value;
    }
}
