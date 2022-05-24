import { Pipe, PipeTransform } from '@angular/core';
import { User } from './user.model';

@Pipe({
    name: 'usersSorting'
})
export class UsersSortingPipe implements PipeTransform {
    transform(Users: Array<User>, args?: any): any {
        let finalData: Array<User> = [];
        finalData = JSON.parse(JSON.stringify(Users));
        finalData.sort((a, b) => {
            return a.status < b.status ? -1 : 1;
        });
        return finalData;
    }
}
