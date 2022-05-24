import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HandlingHttpErrorsService {
    public handleError(errorResponse: HttpErrorResponse): any {
        let errorMessage = '';
        if (errorResponse.error instanceof ErrorEvent) {
            errorMessage = errorResponse.error.message;
        } else {
            errorMessage = errorResponse.error.error.message;
        }
        return throwError(errorMessage || 'Server Error');
    }
}
