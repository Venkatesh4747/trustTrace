import { Pipe, PipeTransform } from '@angular/core';
import { MultiIndustryService } from '../multi-industry-support/multi-industry.service';

@Pipe({
    name: 'industry',
    pure: true
})
export class IndustryLabelPipe implements PipeTransform {
    constructor(private multiIndustryService: MultiIndustryService) {}
    transform(value: string): string {
        if (this.multiIndustryService.labels && this.multiIndustryService.labels[value]) {
            return this.multiIndustryService.labels[value];
        } else {
            return value;
        }
    }
}
