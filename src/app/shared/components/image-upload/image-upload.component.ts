import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
import { environment } from './../../../../environments/environment';
import { ImageUploadService } from './image-upload.service';

@Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
    @ViewChild('productImageInput', { static: true }) productImageInput;
    @Input('style') style;
    uploadingProductImage: boolean;
    uploadProductImageSub: any;

    constructor(private toastr: CustomToastrService, private imageUploadService: ImageUploadService) {}

    ngOnInit() {}

    invokeFileUpload() {
        this.productImageInput.nativeElement.click();
    }

    removeFile(imagesId, fileName) {
        this.uploadingProductImage = true;

        this.imageUploadService.removeFile(imagesId, fileName).subscribe(() => {
            this.toastr.success('Product Image has been updated', 'Success');
            const index = this.style.styleImageNames.indexOf(fileName, 0);
            if (index > -1) {
                this.style.styleImageNames.splice(index, 1);
            }
            this.uploadingProductImage = false;
        });
    }
    uploadImage(files) {
        this.uploadingProductImage = true;
        if (this.uploadProductImageSub) {
            this.uploadProductImageSub.unsubscribe();
        }
        if (files.length === 0) {
            return;
        }
        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        const fileSizeString = fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        const fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
        if (
            !fileExtension ||
            fileExtension === '' ||
            environment.config.allowedLogoFileExtensions.indexOf(fileExtension.toLowerCase()) === -1
        ) {
            this.toastr.error('Please use a supported file format: jpg, jpeg and png', 'Unsupported File Extension');
            this.uploadingProductImage = false;
            return;
        }
        if (fileSize > environment.config.maximumFileUploadSize) {
            this.toastr.error(
                'File size should be within ' +
                    environment.config.maximumFileUploadSize +
                    'MB. Chosen file is ' +
                    fileSizeString +
                    'MB',
                'File Size too large!'
            );
            this.uploadingProductImage = false;
            return;
        }
        this.imageUploadService.uploadFile(fileToUpload, this.style.imagesId).subscribe(response => {
            this.toastr.success('Product Image has been updated', 'Success');
            const data = response['data'];
            this.style.styleImageNames = data.fileName;
            this.style.imagesId = data.id;
            // this.styleImages = data.url+'?date='+new Date().getTime();
            this.uploadingProductImage = false;
            // }, failResponse => {
            //   this.toastr.error('Company logo could not be uploaded. Please try after some time.', 'Failed');
            //   this.uploadingProductImage = false;
            // });
        });
    }
}
