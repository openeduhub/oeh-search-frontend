import type { Node } from 'ngx-edu-sharing-api';
import { StatisticChart } from 'ngx-edu-sharing-wlo-pages';
import { SelectOption } from './types/select-option';

export const actionItems = {
    editMode: 'Seite bearbeiten',
    previewMode: 'Zurück zur Vorschau',
};

export const cdnLink: string =
    'https://cdn.jsdelivr.net/gh/openeduhub/oeh-search-frontend@feature/embedding/output/wlo-pages/20250124/';

export const defaultIconPath: string = 'assets/wlo-search/icons/';

export const defaultMds: string = 'mds_oeh';

export const defaultAiConfigNodeId: string = '33a7ad8d-f6e8-4513-a7ad-8df6e8e51369';
export const defaultAiChatCompletionConfigNodeId: string = 'cdbb6b77-04e8-4b34-bb6b-7704e80b3462';
export const defaultAiImageCreateConfigNodeId: string = '90bd1548-623d-47b5-bd15-48623df7b51d';
export const defaultAiClearCacheConfigNodeId: string = '57d231d8-d1c8-4b39-9231-d8d1c89b3904';

export const defaultAiTextWidgetNodeId: string = '6ca74816-05ae-48ce-a748-1605aea8ceb4';
export const defaultBreadcrumbWidgetNodeId: string = '633932ae-98c2-4bf5-b932-ae98c2dbf5c9';
export const defaultCollectionChipsNodeId: string = 'a5abe6c8-fb9e-4cec-abe6-c8fb9e3cec9f';
export const defaultMediaRenderingNodeId: string = '1277b281-286f-4251-b7b2-81286fe25122';
export const defaultTextWidgetNodeId: string = 'ccbd79e3-abaf-494a-bd79-e3abafd94a9e';
export const defaultTopicHeaderImageNodeId: string = '139bf118-e20d-4165-9bf1-18e20d116542';
export const defaultTopicHeaderTextNodeId: string = '7fb1c824-9065-4924-b1c8-2490655924b3';
export const defaultTopicsColumnBrowserNodeId: string = 'd8959cc3-01ff-4136-959c-c301ff71360b';
export const defaultUserConfigurableNodeId: string = 'adebb9e5-0cc7-40a3-abb9-e50cc7f0a380';

export const defaultParentPageConfigNodeId: string = '26b39094-4a25-4958-b390-944a25e958fc';
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

export const menuItems = {
    feedback: 'Feedback',
    profiling: 'Profilierung',
    statistics: 'Statistiken',
    topicTree: 'Themenbaum',
};

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

// TODO: find better option for line breaks than <br>
export const statistics: StatisticChart[] = [
    new StatisticChart('Berufe', 'work', lrtIdsWork),
    new StatisticChart('Bildungs-<br>angebote', 'school', lrtIdsEducationalOffer),
    new StatisticChart('Veranstaltungen', 'theater_comedy', lrtIdsEvents),
    new StatisticChart('Materialien', 'menu_book', lrtIdsMaterials),
    new StatisticChart('Quellen', 'language', lrtIdsSources),
    new StatisticChart('Organisa-<br>tionen', 'domain', lrtIdsOrganizations, additionalLrtUrl),
    new StatisticChart('Personen', 'group', lrtIdsPeople, additionalLrtUrl),
    new StatisticChart('Tools', 'home_repair_service', lrtIdsTools),
    new StatisticChart('Prompts', 'terminal', lrtIdsPrompts),
    new StatisticChart('Handlungs-<br>felder', 'interests', lrtIdsFieldsOfAction),
    new StatisticChart('Didaktische<br>Konzepte', 'lightbulb', lrtIdsDidacticConcepts),
];

export const swimlaneGridOptions: SelectOption[] = [
    {
        svgIcon: 'one_column',
        value: 'one_column',
        viewValue: 'Eine Spalte',
    },
    {
        svgIcon: 'two_columns',
        value: 'two_columns',
        viewValue: 'Zwei Spalten',
    },
    {
        svgIcon: 'three_columns',
        value: 'three_columns',
        viewValue: 'Drei Spalten',
    },
    {
        svgIcon: 'left_side_panel',
        value: 'left_side_panel',
        viewValue: 'Linke Seitenleiste',
    },
    {
        svgIcon: 'right_side_panel',
        value: 'right_side_panel',
        viewValue: 'Rechte Seitenleiste',
    },
];

export const swimlaneTypeOptions: SelectOption[] = [
    {
        svgIcon: 'one_column',
        value: 'container',
        viewValue: 'Bereichselement',
    },
    {
        svgIcon: 'storage',
        value: 'accordion',
        viewValue: 'Akkordeonelement',
    },
    {
        svgIcon: 'anchor',
        value: 'anchor',
        viewValue: 'Ankermenü',
    },
];

export const widgetConfigAspect: string = 'ccm:widget';

export const widgetTypeOptions: SelectOption[] = [
    {
        value: 'wlo-collection-chips',
        viewValue: 'Navigationspillen',
    },
    {
        value: 'wlo-topics-column-browser',
        viewValue: 'Themenbaum (ausklappbar)',
    },
    {
        value: 'wlo-user-configurable',
        viewValue: 'Inhalte-Teaser',
    },
    {
        value: 'wlo-media-rendering',
        viewValue: 'Medien-Widget',
    },
    {
        value: 'wlo-text-widget',
        viewValue: 'Text-Widget',
    },
    {
        value: 'wlo-ai-text-widget',
        viewValue: 'KI-Widget',
    },
];

export const workspaceSpacesStorePrefix: string = 'workspace://SpacesStore/';
