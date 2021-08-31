import { Pipe, PipeTransform } from '@angular/core';
import { ResultNode } from '../edu-sharing/edu-sharing.service';

enum CommonLicenseKey {
    CC_BY = 'CC_BY',
    CC_BY_SA = 'CC_BY_SA',
    CC_0 = 'CC_0',
    PDM = 'PDM',
    COPYRIGHT_FREE = 'COPYRIGHT_FREE',
}

@Pipe({
    name: 'isOer',
})
export class IsOerPipe implements PipeTransform {
    private readonly sufficientValues: Array<{ property: string; terms: string[] }> = [
        {
            property: 'ccm:commonlicense_key',
            terms: [
                CommonLicenseKey.CC_0,
                CommonLicenseKey.CC_BY,
                CommonLicenseKey.CC_BY_SA,
                CommonLicenseKey.PDM,
            ],
        },
        {
            property: 'ccm:license_oer',
            terms: ['http://w3id.org/openeduhub/vocabs/oer/0'],
        },
    ];

    transform(node: ResultNode): unknown {
        return this.sufficientValues.some((sufficientValue) =>
            node.properties[sufficientValue.property]?.some((term) =>
                sufficientValue.terms.includes(term),
            ),
        );
    }
}
