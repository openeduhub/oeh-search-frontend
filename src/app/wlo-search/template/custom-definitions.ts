import { WidgetConfig } from './swimlane/grid-widget/widget-config';
import { SelectOption } from './swimlane/swimlane-settings-dialog/select-option';
import { Swimlane } from './swimlane/swimlane';
import { v4 as uuidv4 } from 'uuid';

export const collectionPrefix: string = 'COLLECTION_';

export const configHints: Map<string, string> = new Map<string, string>([
    ['headline', 'The headline of the content teaser, which is later extended by the topic name.'],
    ['layout', 'The layout of the content teaser, e.g., carousel.'],
    ['description', 'The description used by the content teaser.'],
    ['searchMode', 'The search mode used by the content teaser, e.g, collection or ngsearchword.'],
    [
        'searchText',
        'The search text used by the content teaser, which is later extended by the topic name.',
    ],
    [
        'chosenColor',
        'Optional background color used by the content teaser, which defaults to the swimlane background.',
    ],
    [
        'collectionId',
        'Optional collectionId used by the content teaser, which defaults to the collectionID of the page.',
    ],
]);

export const currentlySupportedWidgetTypes: string[] = [
    'wlo-ai-text-widget',
    'wlo-collection-chips',
    'wlo-user-configurable',
];

export const currentlySupportedWidgetTypesWithConfig: string[] = ['wlo-user-configurable'];

export const default_mds: string = 'mds_oeh';

export const gridTypeOptions: SelectOption[] = [
    {
        value: 'noGutter',
        viewValue: 'Kein Abstand zwischen Elementen',
    },
    {
        value: 'smallGutter',
        viewValue: 'Kleiner Abstand zwischen Elementen',
    },
    {
        value: 'mediumGutter',
        viewValue: 'Mittlerer Abstand zwischen Elementen',
    },
    {
        value: 'largeGutter',
        viewValue: 'Großer Abstand zwischen Elementen',
    },
];

export const initialLocaleString: string = 'de_DE';

export const initialSwimlanes: Swimlane[] = [
    {
        uuid: uuidv4(),
        type: 'collapse',
        heading: 'Durchstöbere hier unsere Lehrplanthemen',
        description: 'Example text?',
        grid: [
            {
                uuid: uuidv4(),
                item: 'wlo-collection-chips',
                cols: 3,
                rows: 1,
            },
        ],
    },
    {
        uuid: uuidv4(),
        type: 'spacer',
    },
    {
        uuid: uuidv4(),
        type: 'jumbotron',
        grid: [
            {
                uuid: uuidv4(),
                item: 'wlo-user-configurable',
                classNames: 'job-widget',
                cols: 3,
                rows: 1,
                config: {
                    headline: 'Berufsprofile',
                    layout: 'carousel',
                    searchMode: 'collection',
                },
            },
        ],
        backgroundColor: '#FFF9EB',
    },
    {
        uuid: uuidv4(),
        type: 'spacer',
    },
    {
        uuid: uuidv4(),
        type: 'jumbotron',
        grid: [
            {
                uuid: uuidv4(),
                item: 'wlo-ai-text-widget',
                cols: 3,
                rows: 1,
            },
        ],
        backgroundColor: '#BEDADE',
    },
];

export const initialTopicColor: string = '#182e5c';

export const ioType: string = 'ccm:io';

export const mapType: string = 'ccm:map';

export const pageConfigPropagateType: string = 'ccm:page_config_propagate';

export const pageConfigRefType: string = 'ccm:page_config_ref';

export const pageConfigType: string = 'ccm:page_config';

export const parentWidgetConfigNodeId: string = '80bb0eab-d64f-466b-94c6-2eccc4045c6b';

export const providedSelectDimensionKeys: string[] = [
    'virtual:ai_text_widget_intendedenduserrole',
    'virtual:ai_text_widget_target_language',
];

export const swimlaneTypeOptions: SelectOption[] = [
    {
        value: 'collapse',
        viewValue: 'Accordion',
    },
    {
        value: 'container',
        viewValue: 'Einfacher Wrapper',
    },
    {
        value: 'jumbotron',
        viewValue: 'Wrapper mit Padding',
    },
    {
        value: 'text',
        viewValue: 'Text-Inhalt',
    },
];

export const topicPrompt: string = 'Gib eine kurze Einleitung in das Thema $THEMA$.';

export const topicTemplateWidgetId: string = 'headerPrompt';

export const widgetConfigAspect: string = 'ccm:widget';

export const widgetConfigType: string = 'ccm:widget_config';

export const widgetConfigTypes: Array<keyof WidgetConfig> = [
    'headline',
    'layout',
    'description',
    'searchMode',
    'searchText',
    'chosenColor',
    'collectionId',
];

export const widgetPrefix: string = 'WIDGET_';

export const widgetTypeOptions: SelectOption[] = [
    {
        value: 'wlo-user-configurable',
        viewValue: 'Inhalte-Teaser',
    },
    {
        value: 'wlo-ai-text-widget',
        viewValue: 'KI-Widget',
    },
    {
        value: 'wlo-card',
        viewValue: 'Karte',
    },
    {
        value: 'wlo-collection-chips',
        viewValue: 'Themenbaum',
    },
    {
        value: 'wlo-image',
        viewValue: 'Bild',
    },
    {
        value: 'wlo-text',
        viewValue: 'Text',
    },
];
