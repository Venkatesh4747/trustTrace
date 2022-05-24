import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment as env } from '../../../../environments/environment';
import { SuppliersService } from '../../../views/suppliers/suppliers.service';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
@Component({
    selector: 'app-add-supplier',
    templateUrl: './add-supplier.component.html'
})
export class AddSupplierModalComponent {
    @ViewChild('addSupplierModal', { static: true }) public addSupplierModal: ModalDirective;

    newSupplier = {
        name: '',
        email: ''
    };
    public env = env;
    associatingSupplierProcessing: boolean;
    ANALYTICS_EVENT_PAGE = 'Add New Supplier - Send Sign up Link';
    ANALYTICS_ORIGIN_PAGE = 'Supplier';
    constructor(
        private toastr: CustomToastrService,
        private supplierService: SuppliersService,
        private analyticsService: AnalyticsService
    ) {}

    show() {
        this.resetNewSupplier();
        this.addSupplierModal.show();
    }

    hide() {
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_PAGE + 'Cancel#Clicked', {
            Origin: this.ANALYTICS_ORIGIN_PAGE,
            Action: 'Cancel button clicked'
        });
        this.addSupplierModal.hide();
    }

    resetNewSupplier() {
        this.newSupplier.name = '';
        this.newSupplier.email = '';
    }

    associateSupplier() {
        if (!this.newSupplier.name) {
            this.toastr.info('Please fill supplier name', 'Required Field');
            return;
        }

        if (!this.newSupplier.email) {
            this.toastr.info('Please fill supplier email', 'Required Field');
            return;
        }

        const payload = {
            name: this.newSupplier.name,
            email: this.newSupplier.email
        };
        this.associatingSupplierProcessing = true;
        this.supplierService.associateSupplier(payload).subscribe(
            response => {
                this.toastr.success('Registration link sent to supplier', 'Success');
                this.analyticsService.trackEvent(`${this.ANALYTICS_EVENT_PAGE} Send#Clicked`, {
                    Origin: this.ANALYTICS_ORIGIN_PAGE,
                    Action: 'Send button clicked',
                    'Supplier Name': this.newSupplier.name,
                    'Supplier Email': this.newSupplier.email
                });
                this.associatingSupplierProcessing = false;
                this.addSupplierModal.hide();
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                    this.associatingSupplierProcessing = false;
                    this.addSupplierModal.hide();
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                    this.associatingSupplierProcessing = false;
                }
            }
        );
    }
}
