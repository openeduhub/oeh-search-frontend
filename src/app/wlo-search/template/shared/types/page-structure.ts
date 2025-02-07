import { Swimlane } from './swimlane';

export interface PageStructure {
    headerNodeId?: string;
    swimlanes: Swimlane[];
}
