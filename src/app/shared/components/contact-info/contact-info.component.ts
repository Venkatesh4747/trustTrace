import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UtilsService } from '../../utils/utils.service';
import { FormControl, FormGroupDirective, NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { validation } from '../../const-values';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

export class ContactInfoMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid);
    }
}

@Component({
    selector: 'app-contact-info',
    templateUrl: './contact-info.component.html',
    styleUrls: ['./contact-info.component.scss']
})
export class ContactInfoComponent implements OnInit {
    @Input() contact;
    @Input() formMode;
    @Input() showEditIcon = true;
    @Output() contactValueChange = new EventEmitter<Object>();
    contactInfoForm: FormGroup;
    contactData = {
        contactEmail: '',
        contactMobile: '',
        contactPersonName: ''
    };

    editContactInfo;
    constructor(
        private formBuilder: FormBuilder,
        private utilService: UtilsService,
        private toastr: CustomToastrService
    ) {}

    get cdnImage() {
        return this.utilService.getcdnImage.bind(this.utilService);
    }

    ngOnInit() {
        this.contactInfoForm = this.formBuilder.group({
            email: new FormControl('', [Validators.required, Validators.pattern(validation.emailPattern)]),
            name: new FormControl('', [Validators.required]),
            phoneNumber: new FormControl('', [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$')])
        });
        this.editContactInfo = this.formMode;
    }

    saveContactForm() {
        if (this.validateContactInfo() && this.contactInfoForm.valid) {
            this.contactValueChange.emit(this.contactData);
            this.showContactInfoBlock();
        } else {
            this.toastr.error('Please fix field errors');
        }
    }

    public showSaveContactForm() {
        if (this.contact) {
            this.contactData.contactEmail = this.contact.email;
            this.contactData.contactPersonName = this.contact.name;
            this.contactData.contactMobile = this.contact.phoneNumber;
        }
        this.editContactInfo = true;
    }

    showContactInfoBlock() {
        this.contactData = {
            contactEmail: '',
            contactMobile: '',
            contactPersonName: ''
        };
        this.editContactInfo = false;
    }

    validateContactInfo() {
        if (!this.contactData.contactPersonName) {
            this.toastr.error('Please enter name', 'Required Field - name');
            return;
        }

        if (!this.contactData.contactEmail) {
            this.toastr.error('Please enter contact email', 'Required Field - Email');
            return;
        }
        return true;
    }
    matcher = new ContactInfoMatcher();
}
