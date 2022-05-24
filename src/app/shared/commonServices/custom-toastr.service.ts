import { Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { CommonServices } from './common.service';

@Injectable()
export class CustomToastrService {
    constructor(private toastrService: ToastrService, private commonService: CommonServices) {}

    success(message: string, title?: string, override?: Partial<IndividualConfig>): void {
        this.toastrService.success(
            this.commonService.getTranslation(message),
            this.commonService.getTranslation(title),
            override
        );
    }

    error(message: string, title?: string, override?: Partial<IndividualConfig>): void {
        this.toastrService.error(
            this.commonService.getTranslation(message),
            this.commonService.getTranslation(title),
            override
        );
    }

    warning(message: string, title?: string, override?: Partial<IndividualConfig>): void {
        this.toastrService.warning(
            this.commonService.getTranslation(message),
            this.commonService.getTranslation(title),
            override
        );
    }

    info(message: string, title?: string, override?: Partial<IndividualConfig>): void {
        this.toastrService.info(
            this.commonService.getTranslation(message),
            this.commonService.getTranslation(title),
            override
        );
    }

    show(message: string, title?: string, override?: Partial<IndividualConfig>, type?: string): void {
        this.toastrService.show(
            this.commonService.getTranslation(message),
            this.commonService.getTranslation(title),
            override,
            type
        );
    }

    clear(toastId?: number): void {
        toastId === undefined ? this.toastrService.clear() : this.toastrService.clear(toastId);
    }

    remove(toastId: number): void {
        this.toastrService.remove(toastId);
    }

    findDuplicate(message: string, resetOnDuplicate: boolean, countDuplicates: boolean): void {
        this.toastrService.findDuplicate(this.commonService.getTranslation(message), resetOnDuplicate, countDuplicates);
    }
}
