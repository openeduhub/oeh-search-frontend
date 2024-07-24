import { WidgetConfig } from './grid-widget/widget-config';

export interface GridTile {
    uuid: string;
    item: string;
    classNames?: string;
    cols?: number;
    rows?: number;
    config?: WidgetConfig;
}
