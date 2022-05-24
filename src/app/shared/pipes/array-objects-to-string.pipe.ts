import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'arrayObjectsToString',
    pure: true
})
export class ArrayObjectsToStringPipe implements PipeTransform {
    transform(values: any, ...args: any[]): any {
        const [masterData, matchKey, extractKey] = args;
        let finalString = '';
        if (!masterData) {
            return '';
        }
        if (typeof values === 'string') {
            const match = masterData.find(d => d[matchKey] === values);
            return match ? match[extractKey] : '';
        }
        if (!values || values?.length === 0) {
            return finalString;
        }
        return masterData.reduce((acc: string, data: any) => {
            if (data[matchKey] && values.includes(data[matchKey])) {
                acc = acc === '' ? data[extractKey] : `${acc},${data[extractKey]}`;
            }
            return acc;
        }, '');
    }
}
