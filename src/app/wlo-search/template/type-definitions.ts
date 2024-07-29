import { WidgetConfig } from './swimlane/grid-widget/widget-config';
import { SelectOption } from './swimlane/swimlane-settings-dialog/select-option';

export const currentlySupportedWidgetTypes: string[] = [
    'wlo-ai-text-widget',
    'wlo-collection-chips',
    'wlo-user-configurable',
];

export const currentlySupportedWidgetTypesWithConfig: string[] = ['wlo-user-configurable'];

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

export const typeOptions: SelectOption[] = [
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
