import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment as env } from '../../../../environments/environment';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { ISignUpPayload, ISignUpTemplate } from './signup.model';
import { SignupService } from './signup.service';
import { validation } from '../../../shared/const-values';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

function matchingInputsValidator(firstKey: string, secondKey: string) {
    return (group: FormGroup): ValidationErrors | undefined => {
        if (group.controls[firstKey].value !== group.controls[secondKey].value) {
            return {
                missmatch: true
            };
        }
    };
}
@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
    toggleHideShow = {
        password: true,
        confirmPassword: true
    };

    passwordGood = false;

    signUpForm: FormGroup;
    formProcessing = false;

    params: any;
    public env = env;
    signupTemplate: ISignUpTemplate = {
        email: '',
        firstName: '',
        lastName: '',
        mode: null,
        signUpCode: '',
        companyId: '',
        companyName: ''
    };

    pageReady = false;
    invalidSignUpToken = null;

    showSignUpConfirmation = false;
    currentYear: number;

    constructor(
        private toastr: CustomToastrService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private auth: AuthService,
        private signupService: SignupService,
        private analyticsService: AnalyticsService,
        private formBuilder: FormBuilder,
        private multiIndustryService: MultiIndustryService
    ) {}

    ngOnInit() {
        this.currentYear = new Date().getFullYear();
        this.activatedRoute.queryParams.subscribe(params => {
            if (params.hasOwnProperty('target')) {
                this.handleTarget(params);
                return;
            }
            if (this.auth.loggedIn.value) {
                const menus = this.multiIndustryService.getMenus(this.auth.user.subscriptionType);
                let url = '/';
                if (menus && menus.default_landing) {
                    url = menus.default_landing;
                }
                this.router.navigate([url]).then(() => {
                    setTimeout(() => {
                        this.toastr.info('You are already logged in.', 'Redirected to home page');
                    }, 3000);
                });
                return;
            }
            if (params.hasOwnProperty('code') && params.hasOwnProperty('mode')) {
                this.params = params;
                this.constructTemplateData();
            } else {
                this.invalidSignUpToken = true;
            }
        });
    }

    constructTemplateData(): void {
        this.signupTemplate.mode = this.params.mode;
        this.signupTemplate.signUpCode = this.params.code;
        switch (this.signupTemplate.mode) {
            case 'brandUserSignUp':
                this.invalidSignUpToken = false; // Temp fix until user management API changes
                this.constructTemplateFromUrl();
                break;
            case 'signUp':
                this.constructTemplateFromAPI();
                break;
            default:
                this.invalidSignUpToken = true;
                break;
        }
    }

    constructTemplateFromAPI() {
        this.signupService.getSupplierSignUpConfig(this.signupTemplate.signUpCode).subscribe(
            config => {
                if (config.hasOwnProperty('status') && config.status === 'SUCCESS') {
                    this.signupTemplate.email = config.data.supplierEmail;
                    this.signupTemplate.companyName = config.data.supplierName;
                    this.signupTemplate.companyId = config.data.supplierId;
                    this.signupTemplate.signUpCode = config.data.brandId; // temp fix until API ready
                    this.invalidSignUpToken = false;
                    this.constructSignUpForm();
                } else {
                    this.invalidSignUpToken = true;
                }
            },
            error => {
                this.toastr.error('Internal server error');
            }
        );
    }

    constructTemplateFromUrl(): void {
        const requiredKeys = ['firstName', 'lastName', 'email', 'companyName'];

        const isValid = Object.keys(this.params).filter(ele => requiredKeys.includes(ele)).length === 4;

        if (isValid) {
            this.signupTemplate.email = this.params.email;
            this.signupTemplate.companyName = this.params.companyName.replace('+', ' ');
            this.signupTemplate.firstName = this.params.firstName;
            this.signupTemplate.lastName = this.params.lastName;
            this.constructSignUpForm();
        } else {
            this.invalidSignUpToken = true;
        }
    }

    constructSignUpForm(): void {
        this.signUpForm = this.formBuilder.group({
            firstName: [{ value: this.signupTemplate.firstName, disabled: false }, [Validators.required]],
            lastName: [{ value: this.signupTemplate.lastName, disabled: false }, [Validators.required]],
            email: [
                { value: this.signupTemplate.email, disabled: true },
                [Validators.required, Validators.pattern(validation.emailPattern)]
            ],
            companyName: [{ value: this.signupTemplate.companyName, disabled: true }, [Validators.required]],
            passwords: this.formBuilder.group(
                {
                    password: ['', Validators.required],
                    confirmPassword: ['', Validators.required]
                },
                { validator: matchingInputsValidator('password', 'confirmPassword') }
            ),
            acceptTerms: [null, Validators.required]
        });
        this.pageReady = true;
    }

    formControl(controlName: string) {
        return this.signUpForm.get(controlName);
    }

    hasError(validationType: string, formControl: string, group = 'parent'): boolean {
        if (group === 'parent') {
            return this.signUpForm.hasError(validationType, formControl);
        } else {
            return this.signUpForm.get(group).hasError(validationType, formControl);
        }
    }

    validate() {
        if (!this.passwordGood && !this.hasError('required', 'password', 'passwords')) {
            this.toastr.error('Password must meet Complexity Requirements');
            return false;
        }
        if (
            this.signUpForm.get('passwords').hasError('missmatch') &&
            !this.hasError('required', 'confirmPassword', 'passwords')
        ) {
            this.toastr.error('Your password and confirm password do not match');
            return false;
        }

        if (!this.signUpForm.valid) {
            this.toastr.error('Please fix the errors on the form');
            return false;
        }
        if (!this.signUpForm.value.acceptTerms) {
            this.toastr.error('Please fix the errors on the form');
            return false;
        }
        return true;
    }

    constructPayload(): ISignUpPayload {
        const payload: ISignUpPayload = {
            email: this.signupTemplate.email,
            firstName: this.signUpForm.value.firstName
                ? this.signUpForm.value.firstName
                : this.signupTemplate.firstName,
            lastName: this.signUpForm.value.lastName ? this.signUpForm.value.lastName : this.signupTemplate.lastName,
            password: btoa(this.signUpForm.value.passwords.password),
            signUpCode: this.signupTemplate.signUpCode,
            mode: this.signupTemplate.mode
        };
        if (this.signupTemplate.mode === 'brandUserSignUp') {
            payload.companyName = this.signupTemplate.companyName;
            payload.companyId = this.signupTemplate.signUpCode; // brand id
        } else {
            payload.companyId = this.signupTemplate.companyId; // supplier id
        }
        return payload;
    }
    onSignUp() {
        this.formProcessing = true;
        this.signUpForm.get('acceptTerms').markAsTouched();
        const payload: ISignUpPayload = this.constructPayload();
        if (this.validate()) {
            this.signupService.signup(payload).subscribe(
                response => {
                    this.formProcessing = false;
                    this.showSignUpConfirmation = true;
                    this.analyticsService.trackEvent('User Consent Saved');
                },
                failResponse => {
                    this.formProcessing = false;
                    this.toastr.error('Something went wrong. Please try after some time', 'Error!');
                }
            );
        } else {
            this.formProcessing = false;
        }
    }

    navigateToLogin() {
        this.router.navigate(['/']);
    }

    validatePassword(isValid: boolean): void {
        this.passwordGood = isValid;
    }

    handleTarget(params) {
        this.auth.associateCode = null;
        const match = 'company/associate';
        if (params.target.includes(match)) {
            this.auth.associateCode = params.target.split('=')[1] ? params.target.split('=')[1] : null;

            if (this.auth.loggedIn.value && this.auth.associateCode) {
                this.router
                    .navigate([match], { queryParams: { code: this.auth.associateCode } })
                    .then(() => (this.auth.associateCode = null));
            } else {
                this.router.navigate(['']);
            }
        } else {
            const menus = this.multiIndustryService.getMenus(this.auth.user.subscriptionType);
            let url = '/';
            if (menus && menus.default_landing) {
                url = menus.default_landing;
            }
            this.router.navigate([url]);
        }
    }
}
