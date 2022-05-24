import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'value-placeholder',
    template: `
        <div
            mat-button
            class="button-badge mat-button value-holder"
            (click)="onClicked()"
            matTooltip="{{ disabled ? (disabledMessage | translate) : '' }}"
            [ngClass]="{ isDisabled: disabled, isInValid: isInValid }"
        >
            <span *ngIf="displayValue">
                {{ displayValue | translate }}
            </span>
            <div class="mat-select-arrow-wrapper"><div class="mat-select-arrow"></div></div>
        </div>
    `,
    styles: [
        `
            .value-holder {
                color: #325992 !important;
                background-color: white;
                border: 1px solid #bababa;
                cursor: pointer;
                width: 150px;
                display: flex;
                transition: background-color 0.2s;
            }
            @media screen and (max-width: 1400px) {
                .value-holder {
                    width: 120px;
                }
            }
            @media screen and (max-width: 1300px) {
                .value-holder {
                    width: 135px;
                }
            }
            .value-holder:hover {
                background: #eceaea !important;
            }
            span {
                font-size: 14px;
                font-weight: normal;
                font-family: 'Source Sans Pro-Regular' !important;
                overflow: hidden;
                text-overflow: ellipsis;
                width: auto;
                min-width: 65px;
                max-width: 85px;
                margin-left: 15px;
            }

            .isDisabled {
                opacity: 0.8;
                cursor: not-allowed;
            }
            .isDisabled:hover {
                background: white !important;
            }
            .isInValid {
                border: 1px solid #ff6969 !important;
                border-radius: 4px;
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValuePlaceholderComponent {
    @Input() displayValue: string;
    @Input() isEditMode: boolean;
    @Input() disabled: boolean;
    @Input() disabledMessage: string;
    @Input() isInValid: boolean;
    @Output() valueClicked: EventEmitter<any> = new EventEmitter<any>();

    constructor() {}

    onClicked(): void {
        if (this.isEditMode && !this.disabled) {
            this.valueClicked.emit();
        }
    }
}
