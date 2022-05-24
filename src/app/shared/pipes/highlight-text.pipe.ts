import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'highlightText'
})
export class HighlightTextPipe implements PipeTransform {
    transform(value: string, args: string): any {
        if (args && value) {
            value = String(value); // make sure its a string
            const startIndex = value.toLowerCase().indexOf(args.toLowerCase());
            if (startIndex !== -1) {
                const endLength = args.length;
                const matchingString = value.substr(startIndex, endLength);
                return value.replace(
                    matchingString,
                    '<span class="highlight-search-text">' + matchingString + '</span>'
                );
            }
        }
        return value;
    }
}
