import { GridTile } from './grid-tile';

export interface Swimlane {
    uuid: string;
    type?: string;
    heading?: string;
    description?: string;
    gridType?: string;
    grid?: GridTile[];
    backgroundColor?: string;
}
