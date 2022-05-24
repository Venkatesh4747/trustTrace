import { Directive, SkipSelf, OnDestroy, Optional } from '@angular/core';
import { FormGroupDirective, FormControlDirective } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[formSubmittedSync]'
})
export class FormSubmittedSyncDirective implements OnDestroy {
    subscription: Subscription;
    constructor(
        @SkipSelf() @Optional() private parentFormGroupDirective: FormGroupDirective,
        private formControlDirective: FormControlDirective
    ) {
        if (this.parentFormGroupDirective) {
            this.subscription = this.parentFormGroupDirective.ngSubmit.asObservable().subscribe(() => {
                this.formControlDirective.control.setValue(this.formControlDirective.value);
            });
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
