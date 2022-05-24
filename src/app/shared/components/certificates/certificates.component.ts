import { Component, Input } from '@angular/core';
import { Certification, MasterData } from '../../../views/suppliers/sub-supplier-details/sub-supplier-profile.model';
import { environment } from '../../../../environments/environment';
import { UtilsService } from '../../utils/utils.service';
import { CertificateManagerService } from '../certificate-manager/certificate-manager.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-certificates',
    templateUrl: './certificates.component.html',
    styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent {
    @Input() standards: Certification[];
    @Input() masterStandards: MasterData[];
    env = environment;

    get getStandardImageUrl(): (typeId: string) => string {
        return this.utilService.getStandardImageUrl.bind(this.utilService);
    }

    get downloadFile(): (certificateId: string, fileUrl: string) => Subscription {
        return this.certificateManagerService.downloadFile.bind(this.certificateManagerService);
    }

    constructor(private utilService: UtilsService, private certificateManagerService: CertificateManagerService) {}

    getCertificateNameById(certificateType: string): string {
        const cert = this.masterStandards.filter(certificate => certificate.id === certificateType);
        return cert && cert.length ? cert[0].value : 'Certificate Not Found';
    }
}
