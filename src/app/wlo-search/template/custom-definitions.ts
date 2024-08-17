import { SelectOption } from './swimlane/swimlane-settings-dialog/select-option';

export const defaultMds: string = 'mds_oeh';

export const defaultTopicTextNodeId: string = '2340e5cf-4e9d-4b42-b6df-e64087be7961';
export const defaultAiTextWidgetNodeId: string = '10d5ec39-907a-43f6-a024-344300e6a4c8';
export const defaultUserConfigurableNodeId: string = '89653b20-516c-43a2-9042-382aef5ae087';
export const defaultCollectionChipsNodeId: string = 'd43cfd0e-ce5a-4428-a3bb-2c37a155bf32';

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

export const initialTopicColor: string = '#182e5c';

export const ioType: string = 'ccm:io';

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

export const widgetConfigAspect: string = 'ccm:widget';

export const widgetConfigType: string = 'ccm:widget_config';

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

export const workspaceSpacesStorePrefix: string = 'workspace://SpacesStore/';
