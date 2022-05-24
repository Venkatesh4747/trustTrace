import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TestAutomationService {
    constructor() {}

    normalizeAttributeValue(stringValue: string) {
        return stringValue.replace(/ /g, '-');
    }
}
