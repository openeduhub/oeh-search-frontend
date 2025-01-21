import { SelectOption } from './swimlane/swimlane-settings-dialog/select-option';
import type { Node } from 'ngx-edu-sharing-api';

export const defaultLrt: string = 'ccm:oeh_lrt';

export const defaultMds: string = 'mds_oeh';

export const defaultAiTextWidgetNodeId: string = '10d5ec39-907a-43f6-a024-344300e6a4c8';
export const defaultCollectionChipsNodeId: string = 'd43cfd0e-ce5a-4428-a3bb-2c37a155bf32';
export const defaultTopicsColumnBrowserNodeId: string = '4f46b4cd-19df-4139-bbb1-bfc3aea08d39';
export const defaultTopicTextNodeId: string = '2340e5cf-4e9d-4b42-b6df-e64087be7961';
export const defaultUserConfigurableNodeId: string = '89653b20-516c-43a2-9042-382aef5ae087';

export const initialLocaleString: string = 'de_DE';

export const initialTopicColor: string = '#032850';

export const ioType: string = 'ccm:io';

export const lrtBaseUrl: string =
    'https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/new_lrt/';

export const lrtIdsEvents: string[] = [
    '03ab835b-c39c-48d1-b5af-7611de2f6464', // educational offer vocab
    '955590ae-5f06-4513-98e9-91dfa8d5a05e', // event meeting vocab
];

export const lrtIdsLessonPlanning: string[] = [
    '7381f17f-50a6-4ce1-b3a0-9d85a482eec0', // methods vocab
    '0a79a1d0-583b-47ce-86a7-517ab352d796', // lesson planning vocab
];

export const lrtIdsMedia: string[] = [
    'a6d1ac52-c557-4151-bc6f-0d99b0b96fb9', // images vocab
    '7a6e9608-2554-4981-95dc-47ab9ba924de', // video vocab
    'ec2682af-08a9-4ab1-a324-9dca5151e99f', // audio vocab
    '4665caac-99d7-4da3-b9fb-498d8ece034f', // interactive vocab
];

export const lrtIdsPracticeMaterials: string[] = [
    'cd625d33-5d7b-4a86-a54a-9a897ded729f', // questionnaire vocab
    '588efe4f-976f-48eb-84aa-8bcb45679f85', // learning materials vocab
];

export const lrtIdsSources: string[] = [
    '3869b453-d3c1-4b34-8f25-9127e9d68766', // sources vocab
];

export const lrtIdsTools: string[] = [
    'cefccf75-cba3-427d-9a0f-35b4fedcbba1', // tools vocab
];

export const mapType: string = 'ccm:map';

export const pageConfigAspect: string = 'ccm:page';

export const pageConfigPrefix: string = 'PAGE_';

export const pageConfigPropagateType: string = 'ccm:page_config_propagate';

export const pageConfigRefType: string = 'ccm:page_config_ref';

export const pageConfigType: string = 'ccm:page_config';

export const pageVariantConfigAspect: string = 'ccm:page_variant';

export const pageVariantConfigPrefix: string = 'PAGE_VARIANT_';

export const pageVariantConfigType: string = 'ccm:page_variant_config';

export const pageVariantIsTemplateType: string = 'ccm:page_variant_is_template';

export const parentPageConfigNodeId: string = '25e341e1-7058-4210-b0d3-838255884682';

export const parentWidgetConfigNodeId: string = '80bb0eab-d64f-466b-94c6-2eccc4045c6b';

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

export const swimlaneGridOptions: SelectOption[] = [
    {
        icon: 'rectangle',
        value: 'one_column',
        viewValue: 'Eine Spalte',
    },
    {
        svgIcon: 'two_columns',
        value: 'two_columns',
        viewValue: 'Zwei Spalten',
    },
    {
        icon: 'view_column',
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
        icon: 'rectangle',
        value: 'container',
        viewValue: 'Bereichselement',
    },
    {
        icon: 'storage',
        value: 'accordion',
        viewValue: 'Akkordeonelement',
    },
    {
        icon: 'anchor',
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
        value: 'wlo-ai-text-widget',
        viewValue: 'KI-Widget',
    },
];

export const workspaceSpacesStorePrefix: string = 'workspace://SpacesStore/';
