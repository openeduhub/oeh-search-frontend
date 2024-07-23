import { SelectOption } from './swimlane/swimlane-settings-dialog/select-option';

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

export const widgetTypeOptions: SelectOption[] = [
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
    {
        value: 'wlo-user-configurable',
        viewValue: 'Inhalte-Teaser',
    },
];
