import { Swimlane } from '../swimlane';

export interface NodeConfig {
    prompt?: string;
    templateWidgetId?: string;
    swimlanes?: Swimlane[];
}
