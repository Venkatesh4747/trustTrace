import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
    transform(value, args: string[]): any {
        const keys = [];
        for (const key in value) {
            if (value.hasOwnProperty(key) && key !== 'total') {
                keys.push({ key: key, value: value[key] });
            }
        }
        return keys;
    }
}
