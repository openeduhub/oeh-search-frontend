import { Swimlane } from './swimlane';

export interface PageStructure {
    breadcrumbNodeId?: string;
    headerNodeId?: string;
    swimlanes: Swimlane[];
}
