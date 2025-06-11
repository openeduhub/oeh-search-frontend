import type { Node } from 'ngx-edu-sharing-api';
import { StatisticChart } from 'ngx-edu-sharing-wlo-pages';
import { SelectOption } from './types/select-option';

export const cdnLink: string =
    'https://cdn.jsdelivr.net/gh/openeduhub/oeh-search-frontend@feature/embedding/output/wlo-pages/20250124/';

export const defaultMds: string = 'mds_oeh';

export const defaultAiTextWidgetNodeId: string = '10d5ec39-907a-43f6-a024-344300e6a4c8';
export const defaultBreadcrumbWidgetNodeId: string = '5fa2c8a5-aa05-4828-a2c8-a5aa05d8281f';
export const defaultCollectionChipsNodeId: string = 'd43cfd0e-ce5a-4428-a3bb-2c37a155bf32';
export const defaultMediaRenderingNodeId: string = '23919818-2e20-415c-9198-182e20415ce7';
export const defaultTextWidgetNodeId: string = '34540708-5743-4259-9407-085743725957';
export const defaultTopicHeaderImageNodeId: string = 'f5e62bb7-6c84-4ede-a62b-b76c845ede88';
export const defaultTopicHeaderTextNodeId: string = '2340e5cf-4e9d-4b42-b6df-e64087be7961';
export const defaultTopicsColumnBrowserNodeId: string = '4f46b4cd-19df-4139-bbb1-bfc3aea08d39';
export const defaultUserConfigurableNodeId: string = '89653b20-516c-43a2-9042-382aef5ae087';

export const defaultParentPageConfigNodeId: string = '25e341e1-7058-4210-b0d3-838255884682';
export const defaultParentWidgetConfigNodeId: string = '80bb0eab-d64f-466b-94c6-2eccc4045c6b';
export const disciplineKey: string = 'ccm:taxonid';

export const eduSharingUrl: string = 'https://repository.staging.openeduhub.net/edu-sharing/';

export const initialLocaleString: string = 'de_DE';

export const initialTopicColor: string = '#032850';

export const ioType: string = 'ccm:io';

export const lrtBaseUrl: string =
    'https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/new_lrt/';
export const additionalLrtUrl: string =
    'https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/oehMetadatasets/';

export const lrtIdsWork: string[] = [];
export const lrtIdsEducationalOffer: string[] = [
    '03ab835b-c39c-48d1-b5af-7611de2f6464', // educational offer vocab
];
export const lrtIdsEvents: string[] = [
    '955590ae-5f06-4513-98e9-91dfa8d5a05e', // event meeting vocab
];
export const lrtIdsMaterials: string[] = [
    '1846d876-d8fd-476a-b540-b8ffd713fedb', // materials vocab
];
export const lrtIdsSources: string[] = [
    '3869b453-d3c1-4b34-8f25-9127e9d68766', // sources vocab
];
export const lrtIdsOrganizations: string[] = [
    '9aedab42-062c-4e11-aba4-f9accb1a9e9a', // organisations vocab
];
export const lrtIdsPeople: string[] = [
    'a59b2fb1-f22f-4521-a4ec-e2a101dce473', // people vocab
];
export const lrtIdsTools: string[] = [
    'cefccf75-cba3-427d-9a0f-35b4fedcbba1', // tools vocab
];
export const lrtIdsPrompts: string[] = [];
export const lrtIdsFieldsOfAction: string[] = [];
export const lrtIdsDidacticConcepts: string[] = [
    '0a79a1d0-583b-47ce-86a7-517ab352d796', // methods vocab
    '7381f17f-50a6-4ce1-b3a0-9d85a482eec0', // material lesson planning
];

export const mapType: string = 'ccm:map';
export const maxNumberOfStatisticItems: number = 8;

export const pageConfigAspect: string = 'ccm:page';

export const pageConfigPrefix: string = 'PAGE_';

export const pageConfigPropagateType: string = 'ccm:page_config_propagate';

export const pageConfigRefType: string = 'ccm:page_config_ref';

export const pageConfigType: string = 'ccm:page_config';

export const pageVariantConfigAspect: string = 'ccm:page_variant';

export const pageVariantConfigPrefix: string = 'PAGE_VARIANT_';

export const pageVariantConfigType: string = 'ccm:page_variant_config';

export const pageVariantIsTemplateType: string = 'ccm:page_variant_is_template';

export const profilingFilterbarDimensionKeys: string[] = [
    'virtual:profiling_widget_intention',
    'virtual:profiling_widget_education_level',
];

export const reportProblemItemKey: string = 'latestReport';

export const retrieveCustomUrl = (node: Node): string => {
    const collectionId = node.properties?.['sys:node-uuid']?.[0];
    if (collectionId) {
        // take into account potential sub-paths, e.g., due to language switch
        const pathNameArray: string[] = window.location.pathname.split('/');
        // example pathNameArray = [ "", "search", "de", "template" ]
        let suffix: string = '';
        if (pathNameArray.length > 2) {
            pathNameArray.forEach((subPath: string, index: number): void => {
                if (index > 0 && !['', 'template'].includes(subPath)) {
                    suffix += '/' + subPath;
                }
            });
        }
        return window.location.origin + suffix + '/template?collectionId=' + collectionId;
    }
    return '';
};

export const statistics: StatisticChart[] = [
    new StatisticChart('WORK', 'work', lrtIdsWork),
    new StatisticChart('EDUCATIONAL_OFFERS', 'school', lrtIdsEducationalOffer),
    new StatisticChart('EVENTS', 'svg-theatre', lrtIdsEvents),
    new StatisticChart('MATERIALS', 'svg-material', lrtIdsMaterials),
    new StatisticChart('SOURCES', 'language', lrtIdsSources),
    new StatisticChart('ORGANIZATIONS', 'domain', lrtIdsOrganizations, additionalLrtUrl),
    new StatisticChart('PEOPLE', 'group', lrtIdsPeople, additionalLrtUrl),
    new StatisticChart('TOOLS', 'svg-tools', lrtIdsTools),
    new StatisticChart('PROMPTS', 'svg-prompts', lrtIdsPrompts),
    new StatisticChart('FIELDS_OF_ACTION', 'lightbulb_outline', lrtIdsFieldsOfAction),
    new StatisticChart('DIDACTIC_CONCEPTS', 'svg-route', lrtIdsDidacticConcepts),
];

export const swimlaneGridOptions: SelectOption[] = [
    {
        icon: 'svg-one_column',
        value: 'one_column',
        viewValue: 'ONE_COLUMN',
    },
    {
        icon: 'svg-two_columns',
        value: 'two_columns',
        viewValue: 'TWO_COLUMNS',
    },
    {
        icon: 'svg-three_columns',
        value: 'three_columns',
        viewValue: 'THREE_COLUMNS',
    },
    {
        icon: 'svg-left_side_panel',
        value: 'left_side_panel',
        viewValue: 'LEFT_SIDE_PANEL',
    },
    {
        icon: 'svg-right_side_panel',
        value: 'right_side_panel',
        viewValue: 'RIGHT_SIDE_PANEL',
    },
];

export const swimlaneTypeOptions: SelectOption[] = [
    {
        icon: 'svg-one_column',
        value: 'container',
        viewValue: 'CONTAINER_ELEMENT',
    },
    {
        icon: 'svg-storage',
        value: 'accordion',
        viewValue: 'ACCORDION_ELEMENT',
    },
    {
        icon: 'svg-anchor',
        value: 'anchor',
        viewValue: 'ANCHOR_MENU',
    },
];

export const widgetConfigAspect: string = 'ccm:widget';

export const widgetTypeOptions: SelectOption[] = [
    {
        value: 'wlo-collection-chips',
        viewValue: 'COLLECTION_CHIPS',
    },
    {
        value: 'wlo-topics-column-browser',
        viewValue: 'TOPICS_COLUMN_BROWSER',
    },
    {
        value: 'wlo-user-configurable',
        viewValue: 'USER_CONFIGURABLE',
    },
    {
        value: 'wlo-media-rendering',
        viewValue: 'MEDIA_RENDERING',
    },
    {
        value: 'wlo-text-widget',
        viewValue: 'TEXT_WIDGET',
    },
    {
        value: 'wlo-ai-text-widget',
        viewValue: 'AI_TEXT_WIDGET',
    },
];

export const workspaceSpacesStorePrefix: string = 'workspace://SpacesStore/';
