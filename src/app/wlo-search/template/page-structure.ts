import { Swimlane } from './swimlane/swimlane';

export interface PageStructure {
    headerNodeId?: string;
    swimlanes: Swimlane[];
}
