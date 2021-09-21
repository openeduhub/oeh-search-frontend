import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../config.service';
import { Collection, ResultNode } from '../edu-sharing/edu-sharing.service';
import { collectionHasType } from './in-collection-with-type.pipe';

export interface IdentifiedValue {
    id: string;
    displayName: string;
}

@Pipe({
    name: 'nodeProperty',
})
export class NodePropertyPipe implements PipeTransform {
    private readonly propertyMappings = {
        title: (node: ResultNode) =>
            node.properties['cclom:title']?.[0] || node.properties['cm:name']?.[0],
        description: (node: ResultNode) => node.properties['cclom:general_description']?.[0],
        author: (node: ResultNode) => this.getAuthor(node),
        url: (node: ResultNode) => node.properties['ccm:wwwurl']?.[0] ?? node.content.url,
        source: (node: ResultNode) => this.zipDisplayNames(node, 'ccm:replicationsource')?.[0],
        sourceUrl: (node: ResultNode) => 'http://example.org/TODO',
        license: (node: ResultNode) => this.getLicense(node),
        mimeType: (node: ResultNode) => node.mediatype,
        isExternal: (node: ResultNode) => !!node.properties['ccm:wwwurl'],
        duration: (node: ResultNode) => this.parseInt(node.properties['cclom:duration']?.[0]),
        language: (node: ResultNode) => node.properties['cclom:general_language'],
        learningResourceType: (node: ResultNode) =>
            this.aggregateProperty(node, 'ccm:educationallearningresourcetype'),
        discipline: (node: ResultNode) => this.aggregateProperty(node, 'ccm:taxonid'),
        educationalContext: (node: ResultNode) =>
            this.aggregateProperty(node, 'ccm:educationalcontext'),
        widget: (node: ResultNode) => this.aggregateProperty(node, 'ccm:oeh_widgets'),
        conditionsOfAccess: (node: ResultNode) =>
            this.aggregateProperty(node, 'ccm:conditionsOfAccess')?.[0],
        price: (node: ResultNode) => this.aggregateProperty(node, 'ccm:price')?.[0],
        containsAdvertisement: (node: ResultNode) =>
            this.aggregateProperty(node, 'ccm:containsAdvertisement')?.[0],
    };

    private readonly licenseDisplayNames = {
        de: {
            NONE: 'Keine oder unbekannte Lizenz',
            MULTI: 'Unterschiedliche Lizenzen',
            COPYRIGHT_FREE: 'Copyright, freier Zugang',
            COPYRIGHT_LIiCENSE: 'Copyright, lizenzpflichtig',
            SCHULFUNK: 'Schulfunk (§47 UrhG)',
            UNTERRICHTS_UND_LEHRMEDIEN: '§60b Unterrichts- und Lehrmedien',
            CC_0: 'CC-0',
            PDM: 'PDM',
            CC_BY: 'CC-BY',
            CC_BY_SA: 'CC-BY-SA',
            CC_BY_NC: 'CC-BY-NC',
            CC_BY_ND: 'CC-BY-ND',
            CC_BY_NC_SA: 'CC-BY-NC-SA',
            CC_BY_NC_ND: 'CC-BY-NC-ND',
            CUSTOM: 'Andere Lizenz',
        },
        en: {
            NONE: 'No or unknown license',
            MULTI: 'Multiple licenses',
            COPYRIGHT_FREE: 'Copyright, free access',
            COPYRIGHT_LICENSE: 'Copyright, subject to licensing',
            SCHULFUNK: 'German educational radio/television license (§47 UrhG)',
            UNTERRICHTS_UND_LEHRMEDIEN: '§60b Unterrichts- und Lehrmedien',
            CC_0: 'CC-0',
            PDM: 'PDM',
            CC_BY: 'CC-BY',
            CC_BY_SA: 'CC-BY-SA',
            CC_BY_NC: 'CC-BY-NC',
            CC_BY_ND: 'CC-BY-ND',
            CC_BY_NC_SA: 'CC-BY-NC-SA',
            CC_BY_NC_ND: 'CC-BY-NC-ND',
            CUSTOM: 'Custom license',
        },
    }[this.config.getLanguage()];

    constructor(private config: ConfigService) {}

    transform<P extends keyof NodePropertyPipe['propertyMappings']>(
        node: ResultNode,
        property: P,
    ): ReturnType<NodePropertyPipe['propertyMappings'][P]> {
        return this.propertyMappings[property](node) as ReturnType<
            NodePropertyPipe['propertyMappings'][P]
        >;
    }

    private zipDisplayNames(node: ResultNode | Collection, property: string): IdentifiedValue[] {
        return node.properties[property]?.map((id, index) => ({
            id,
            displayName: node.properties[property + '_DISPLAYNAME'][index],
        }));
    }

    private aggregateProperty(
        node: ResultNode,
        property: string,
        zipDisplayNames = this.zipDisplayNames,
    ): IdentifiedValue[] | null {
        const values = [
            ...(zipDisplayNames(node, property) ?? []),
            ...node.usedInCollections
                .filter((collection) => collectionHasType(collection, 'EDITORIAL'))
                .flatMap((collection) => zipDisplayNames(collection, property) ?? []),
        ];
        if (values.length > 0) {
            return this.removeDuplicates(values, (lhs, rhs) => lhs.id === rhs.id);
        } else {
            return null;
        }
    }

    private getAuthor(node: ResultNode): string {
        const freetextAuthor = node.properties['ccm:author_freetext']?.[0];
        if (freetextAuthor) {
            return freetextAuthor;
        } else {
            return node.properties['ccm:lifecyclecontributer_author']
                ?.map((author) => this.parseVCard(author, 'FN'))
                ?.join(', ');
        }
    }

    private getLicense(node: ResultNode): IdentifiedValue {
        return this.aggregateProperty(
            node,
            'ccm:commonlicense_key',
            this.zipLicenseDisplayNames.bind(this),
        )?.[0];
    }

    private zipLicenseDisplayNames(
        node: ResultNode | Collection,
        property: string,
    ): IdentifiedValue[] {
        return node.properties[property]?.map((licenseKey) => ({
            id: licenseKey,
            displayName: this.getLicenseDisplayName(node, licenseKey),
        }));
    }

    private getLicenseDisplayName(node: ResultNode, licenseKey: string): string {
        const customLicenseString = node.properties['cclom:rights_description']?.[0];
        if (!licenseKey) {
            return undefined;
        } else if (licenseKey === 'CUSTOM' && customLicenseString) {
            return customLicenseString;
        } else if (this.licenseDisplayNames?.[licenseKey]) {
            return this.licenseDisplayNames[licenseKey];
        } else {
            return licenseKey;
        }
    }

    private parseVCard(vCard: string, attribute: string): string {
        return vCard
            .split('\n')
            .find((line) => line.startsWith(attribute + ':'))
            ?.slice(attribute.length + 1)
            ?.trim();
    }

    private parseInt(s: string): number | undefined {
        const result = parseInt(s, 10);
        if (isNaN(result)) {
            return undefined;
        } else {
            return result;
        }
    }

    private removeDuplicates<T>(array: T[], isEqual: (lhs: T, rhs: T) => boolean): T[] {
        return array.filter(
            (element, index) => !array.slice(0, index).some((e) => isEqual(element, e)),
        );
    }
}
