export type SignUpMode = 'signUp' | 'brandUserSignUp';

export interface ISignUpTemplate {
    email: string;
    firstName: string;
    lastName: string;
    mode: SignUpMode;
    signUpCode: string;
    companyName?: string;
    companyId?: string;
}

export interface ISignUpPayload extends ISignUpTemplate {
    password: string;
}

export interface ISignUpConfig {
    status: string;
    errorCode?: any;
    message: string;
    data: Data;
}

interface Data {
    supplierName: string;
    supplierId: string;
    supplierEmail: string;
    brandId: string;
}
