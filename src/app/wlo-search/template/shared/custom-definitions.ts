import type { Node } from 'ngx-edu-sharing-api';
import { StatisticChart } from 'ngx-edu-sharing-wlo-pages';
import { SelectOption } from './types/select-option';

export const cdnLink: string =
    'https://cdn.jsdelivr.net/gh/openeduhub/oeh-search-frontend@feature/embedding/output/wlo-pages/20250124/';

export const defaultMds: string = 'mds_oeh';

// currently used default config IDs (for AI prompts)
export const defaultAiConfigId: string = 'topic_page_ai_default';
export const defaultAiChatCompletionConfigId: string = 'topic_page_ai_chat_completion';
export const defaultAiImageCreateConfigId: string = 'topic_page_ai_create_image';
export const defaultAiClearCacheConfigId: string = 'topic_page_ai_clear_cache';
export const defaultAiTextWidgetConfigId: string = 'topic_page_ai_text_widget';
export const defaultTopicHeaderDescriptionConfigId: string =
    'topic_page_ai_topic_header_description';
export const defaultTopicHeaderImageConfigId: string = 'topic_page_ai_topic_header_image';
export const defaultTopicHeaderTextConfigId: string = 'topic_page_ai_topic_header_text';
export const defaultUserConfigurableConfigId: string = 'topic_page_ai_user_configurable';

export const disciplineKey: string = 'ccm:taxonid';

export const eduSharingUrlDev: string = 'https://repository.staging.openeduhub.net/edu-sharing/';
export const eduSharingUrlProd: string = 'https://suche.wirlernenonline.de/edu-sharing/';

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

export const pageConfigPropagateRefType: string = 'ccm:page_config_propagate_ref';

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
        return (
            window.location.origin +
            '/edu-sharing/components/topic-pages?collectionId=' +
            collectionId
        );
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

export const titleKey: string = 'cclom:title';

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
        value: 'wlo-iframe-widget',
        viewValue: 'IFRAME_WIDGET',
    },
    {
        value: 'wlo-ai-text-widget',
        viewValue: 'AI_TEXT_WIDGET',
    },
];

export const workspaceSpacesStorePrefix: string = 'workspace://SpacesStore/';
