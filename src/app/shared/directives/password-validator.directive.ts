export interface IPasswordRules {
    message: string;
    isValid: boolean;
}

export type Icase = 'upper' | 'lower';

export const passwordRules: Array<IPasswordRules> = [
    {
        message: 'Only English Characters',
        isValid: false
    },
    {
        message: 'Minimum 8 characters',
        isValid: false
    },
    {
        message: 'Maximum 15 characters',
        isValid: false
    },
    {
        message: 'One capital letter A to Z',
        isValid: false
    },
    {
        message: 'One small letter a to z',
        isValid: false
    },
    {
        message: 'One number 0 to 9',
        isValid: false
    },
    {
        message: 'One special character from these: ! @ # $ % ^ & *',
        isValid: false
    },
    {
        message: 'Confirm password should match password',
        isValid: false
    }
];

import { Directive, Input, Output, EventEmitter, OnChanges, ElementRef, Renderer2, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonServices } from '../commonServices/common.service';

@Directive({
    selector: '[appPasswordValidator]'
})
export class PasswordValidatorDirective implements OnInit, OnChanges {
    @Input() password = '';
    @Input() confirmPassword = null;
    @Output() isValid = new EventEmitter<boolean>(false);
    constructedRules: Array<IPasswordRules>;

    constructor(private elementRef: ElementRef, private renderer: Renderer2, private commonService: CommonServices) {}

    ngOnInit() {
        // this.constructRules();
    }

    ngOnChanges() {
        this.constructRules();
        this.validateRules();
    }

    private async constructRules(): Promise<void> {
        this.constructedRules = JSON.parse(JSON.stringify(passwordRules));
        this.constructedRules = this.constructedRules.map(rule => {
            return {
                ...rule,
                message: this.commonService.getTranslation(rule.message)
            };
        });
        if (this.confirmPassword === null) {
            this.constructedRules.splice(this.constructedRules.length - 1, 1);
        }
    }

    private validateRules(): void {
        if (this.password === undefined || this.confirmPassword === undefined) {
            throw new Error('Please check password and confirm password values, it should not undefined');
        }
        this.constructedRules[0].isValid = this.charLocalization(this.password);
        this.constructedRules[1].isValid = this.charLength(this.password, 7);
        this.constructedRules[2].isValid = this.constructedRules[1].isValid && !this.charLength(this.password, 15);
        this.constructedRules[3].isValid = this.charCase(this.password, 'upper');
        this.constructedRules[4].isValid = this.charCase(this.password, 'lower');
        this.constructedRules[5].isValid = this.isContainNumeric(this.password);
        this.constructedRules[6].isValid = this.isContainSpecialChars(this.password);
        if (this.confirmPassword !== null) {
            this.constructedRules[7].isValid = this.passwordMatch(this.password, this.confirmPassword);
        }
        this.constructHTML();
    }

    private constructHTML(): void {
        const parentNode = document.createElement('div');
        const titleNode = document.createElement('h4');
        titleNode.className = 'password-rules--title';
        const titleContent = `<img src="${
            environment.IMG_URL
        }images/info.png" alt="info" style='margin-left:-5px'>${this.commonService.getTranslation('Password Rules')}`;
        titleNode.innerHTML = titleContent;
        parentNode.appendChild(titleNode);
        const contentNode = document.createElement('div');
        contentNode.className = 'password-rules--content';
        let contents = ` <ul class="list-unstyled">`;

        this.constructedRules.forEach(element => {
            contents += `<li><span class="fa ${
                element.isValid ? 'green fa-check' : 'red fa-times'
            }" style='width:14px'></span>${element.message}</li>`;
        });
        contents += `</ul>`;
        contentNode.innerHTML = contents;
        parentNode.appendChild(contentNode);
        this.elementRef.nativeElement.innerHTML = '';
        this.renderer.appendChild(this.elementRef.nativeElement, parentNode);
        this.validationStatus();
    }

    private validationStatus(): void {
        const status = this.constructedRules.every(obj => obj.isValid);
        this.isValid.emit(status);
    }

    private charLocalization(password: string): boolean {
        return this.charLength(password, 0) && /^[a-zA-Z0-9!@#$%^&*]*$/.test(password);
    }

    private charLength(password: string, lengthShouldBe: number): boolean {
        if (!password) {
            return false;
        }
        return password.length > lengthShouldBe;
    }

    private charCase(password: string, caseType: Icase = 'upper'): boolean {
        if (caseType === 'upper') {
            return this.charLength(password, 0) && /[A-Z]+/.test(password);
        } else {
            return this.charLength(password, 0) && /[a-z]+/.test(password);
        }
    }

    private isContainNumeric(password: string): boolean {
        return this.charLength(password, 0) && /[0-9]+/.test(password);
    }

    private isContainSpecialChars(password: string): boolean {
        return this.charLength(password, 0) && /[!@#$%^&*]+/.test(password) && this.charLocalization(password);
    }

    private passwordMatch(password: string, toMatch: string): boolean {
        return password === toMatch;
    }
}
