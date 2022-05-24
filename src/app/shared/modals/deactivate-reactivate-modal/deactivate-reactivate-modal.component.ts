import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductsService } from '../../../views/products/products.service';
import { UtilsService } from '../../utils/utils.service';
import { FormControl } from '@angular/forms';
import { OperationTypeEnum, ScoreDeactivateTypeEnum } from './deactivate-reactivate-modal.const';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
import { CommonServices } from '../../commonServices/common.service';
import { ScoreModel } from './deactivate-reactivate-modal.model';
import { FunctionRunAsConfig } from 'aws-sdk/clients/greengrass';
@Component({
    selector: 'app-deactivate-reactivate-modal',
    templateUrl: './deactivate-reactivate-modal.component.html',
    styleUrls: ['./deactivate-reactivate-modal.component.scss']
})
export class DeactivateReactivateModalComponent implements OnInit {
    fullPageSpinner: boolean;
    scoreDeactivateType: number;
    message: string;
    description: string;

    OperationTypeEnum = OperationTypeEnum;
    ScoreDeactivateTypeEnum = ScoreDeactivateTypeEnum;

    get cdnImage(): (iconName: string) => string {
        return this.utilService.getcdnImage.bind(this.utilService);
    }

    scoreDeactivateSelectedValue: FormControl = new FormControl(null);
    scoreDeactivateSelectedType: FormControl = new FormControl(null);

    constructor(
        private dialogRef: MatDialogRef<DeactivateReactivateModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ScoreModel,
        private productService: ProductsService,
        private utilService: UtilsService,
        private toastr: CustomToastrService,
        private commonServices: CommonServices
    ) {}

    ngOnInit(): void {
        if (
            this.data.primaryBtn === OperationTypeEnum.REACTIVATE &&
            (this.data.scoreReActivateType === ScoreDeactivateTypeEnum.HIDE_SCORE ||
                this.data.scoreReActivateType === ScoreDeactivateTypeEnum.PRODUCT)
        ) {
            this.scoreDeactivateType = this.data.scoreReActivateType;
            this.setMessageAndDescription();
        }
    }

    setConfirmationMessage(): void {
        if (this.data.primaryBtn === OperationTypeEnum.DEACTIVATE) {
            this.deactivateConfirmationMessage();
        } else {
            this.reActivateConfirmationMessage();
        }
    }

    deactivateConfirmationMessage(): void {
        if (
            this.scoreDeactivateSelectedType.value ||
            this.scoreDeactivateSelectedValue.value == ScoreDeactivateTypeEnum.HIDE_SCORE
        ) {
            if (
                this.scoreDeactivateSelectedValue.value === ScoreDeactivateTypeEnum.NOT_PART_OF_SD &&
                this.scoreDeactivateSelectedType.value
            ) {
                this.scoreDeactivateType = this.scoreDeactivateSelectedType.value;
            } else {
                this.scoreDeactivateType = this.scoreDeactivateSelectedValue.value;
            }
            this.setMessageAndDescription();
            if (
                this.scoreDeactivateType === ScoreDeactivateTypeEnum.BRAND ||
                this.scoreDeactivateType === ScoreDeactivateTypeEnum.SUPPLIER
            ) {
                this.getProductCount();
            }
        }
    }

    getProductCount(): void {
        this.fullPageSpinner = true;
        this.productService.getProductsCount(this.data.productId, this.scoreDeactivateType.toString()).subscribe(
            data => {
                this.fullPageSpinner = false;
                this.description = `${this.description} ${data.productCount} ${this.commonServices.getTranslation(
                    'products'
                )}`;
            },
            () => {
                this.fullPageSpinner = false;
                this.toastr.error(
                    `Unable to get product count for this product ${this.scoreDeactivateSelectedType.value}`,
                    'Server Error'
                );
            }
        );
    }

    setMessageAndDescription(): void {
        this.message = this.data.message.find(message => message.id === this.scoreDeactivateType).value;

        this.description = `${this.commonServices.getTranslation(
            this.data.description.find(description => description.id === this.scoreDeactivateType).value
        )}`;
    }

    reActivateConfirmationMessage(): void {
        this.scoreDeactivateType = this.scoreDeactivateSelectedType.value;
        this.setMessageAndDescription();
        if (
            this.scoreDeactivateType === ScoreDeactivateTypeEnum.SUPPLIER ||
            this.scoreDeactivateType === ScoreDeactivateTypeEnum.BRAND
        ) {
            this.getProductCount();
        }
    }

    onClick(operationType: string): void {
        this.dialogRef.close({
            operationType: operationType,
            scoreDeactivateType: this.scoreDeactivateType
        });
    }

    scoreDeactivateSelectedTypeValidation(): boolean {
        if (
            this.scoreDeactivateSelectedValue.value === ScoreDeactivateTypeEnum.NOT_PART_OF_SD ||
            this.data.scoreReActivateType === ScoreDeactivateTypeEnum.SUPPLIER ||
            this.data.scoreReActivateType === ScoreDeactivateTypeEnum.BRAND
        ) {
            return true;
        }
        return false;
    }

    messageAndDescriptionValidation(): boolean {
        if (
            this.scoreDeactivateSelectedValue.value == ScoreDeactivateTypeEnum.HIDE_SCORE ||
            this.scoreDeactivateSelectedType.value ||
            this.data.scoreReActivateType === ScoreDeactivateTypeEnum.HIDE_SCORE ||
            this.data.scoreReActivateType === ScoreDeactivateTypeEnum.PRODUCT
        ) {
            return true;
        }
        return false;
    }
}
